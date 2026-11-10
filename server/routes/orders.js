const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const multer = require('multer');
const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const auth = require('../middleware/auth');
const Product = require('../models/Product');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadToCloudinary = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

// POST /api/orders - Supports both guest customers and authenticated users
router.post('/', validate(schemas.createOrder), catchAsync(async (req, res, next) => {
    const requiredFields = ['serviceType', 'totalPrice', 'customerName', 'customerPhone'];
    const missing = requiredFields.filter(f => !req.body[f]);
    if (missing.length > 0) return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));

    // Clean phone number (strip +91, dashes, spaces)
    const rawPhone = String(req.body.customerPhone).replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    if (cleanPhone.length !== 10) {
        return next(new AppError('Customer phone must be a valid 10-digit number', 400));
    }

    if (req.body.deliveryType === 'delivery' && !req.body.address?.trim()) {
        return next(new AppError('Delivery address is required for home delivery orders', 400));
    }

    let totalPrice = Number(req.body.totalPrice);
    
    // Validate items and recalculate / protect pricing
    if (req.body.items?.length) {
        const validItemIds = req.body.items.map(item => item.itemId).filter(Boolean);
        const products = await Product.find({
            _id: { $in: validItemIds },
            isActive: true
        });
        const productMap = new Map(products.map(product => [String(product._id), product]));

        const hasUnknownProduct = req.body.items.some(item => !item.itemId || !productMap.has(String(item.itemId)));
        if (hasUnknownProduct) return next(new AppError('One or more selected products are invalid or out of stock', 400));

        const itemsTotal = req.body.items.reduce((sum, item) => {
            const p = productMap.get(String(item.itemId));
            return sum + (Number(p.price) || 0) * (Number(item.quantity) || 1);
        }, 0);

        // If it's pure stationery retail cart order, enforce computed price
        if (req.body.serviceType === 'product-order') {
            totalPrice = itemsTotal + (req.body.deliveryType === 'delivery' ? 15 : 0);
        } else {
            // For print/cyber cafe services with stationery add-ons:
            // Ensure total includes at least the items total and delivery charge
            const minExpected = itemsTotal + (req.body.deliveryType === 'delivery' ? 15 : 0);
            if (totalPrice < minExpected) {
                return next(new AppError('Invalid order total price calculation', 400));
            }
        }

        // Atomically decrement stock count for ordered items
        for (const item of req.body.items) {
            if (item.itemId) {
                await Product.findByIdAndUpdate(item.itemId, {
                    $inc: { quantity: -Math.max(1, Number(item.quantity) || 1) }
                });
            }
        }
    }

    const orderData = {
        ...req.body,
        customerPhone: cleanPhone,
        totalPrice,
        pickupTime: req.body.pickupTime || '',
        address: req.body.address || '',
        updatedAt: Date.now()
    };

    const order = new Order(orderData);
    await order.save();
    res.status(201).json({ success: true, order });
}));

// GET /api/orders (admin only) — paginated with filtering
router.get('/', auth, catchAsync(async (req, res, next) => {
    const { status } = req.query;

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    let query = {};
    if (status && status !== 'all') query.status = status;

    if (req.query.from || req.query.to) {
        query.createdAt = {};
        if (req.query.from) query.createdAt.$gte = new Date(req.query.from);
        if (req.query.to)   query.createdAt.$lte = new Date(req.query.to);
    }

    const [totalOrders, orders] = await Promise.all([
        Order.countDocuments(query),
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
        success: true,
        orders,
        pagination: {
            currentPage:  page,
            totalPages,
            totalOrders,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
}));

// GET /api/orders/stats/today (admin only) — BEFORE /:id
router.get('/stats/today', auth, catchAsync(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
        createdAt: { $gte: today, $lt: tomorrow },
        paymentStatus: 'paid',
        status: { $nin: ['cancelled'] }
    });

    const totalEarnings = todayOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const pendingVerification = await Order.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow },
        paymentMethod: 'upi',
        paymentStatus: 'pending'
    });

    res.json({
        success: true,
        date: today.toISOString().split('T')[0],
        totalEarnings,
        totalOrders: todayOrders.length,
        pendingVerification,
        orders: todayOrders
    });
}));

// GET /api/orders/by-phone/:phone — Customer order tracking (Accessible with or without login)
router.get('/by-phone/:phone', catchAsync(async (req, res, next) => {
    const rawPhone = String(req.params.phone).replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;

    if (cleanPhone.length !== 10) {
        return next(new AppError('Please enter a valid 10-digit phone number', 400));
    }

    const orders = await Order.find({ customerPhone: cleanPhone })
        .sort({ createdAt: -1 })
        .select('serviceType printType paperSize pages pageRange copies items totalPrice status paymentMethod paymentStatus deliveryType pickupTime address createdAt fileUrl fileName notes');

    res.json({ success: true, orders });
}));

// PUT /api/orders/:id (admin status updates)
router.put('/:id', auth, validate(schemas.updateOrderStatus), catchAsync(async (req, res, next) => {
    const updates = { 
        status: req.body.status, 
        updatedAt: Date.now() 
    };

    // If marked completed or delivered, record deliveredAt for TTL 30-day auto-purge
    if (req.body.status === 'delivered' || req.body.status === 'completed') {
        updates.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    );
    if (!order) return next(new AppError('Order not found', 404));
    res.json({ success: true, order });
}));

// POST /api/orders/:id/payment-screenshot - Customer payment upload (Works with or without login)
router.post('/:id/payment-screenshot', upload.single('screenshot'), catchAsync(async (req, res, next) => {
    if (!req.file) return next(new AppError('No screenshot file uploaded', 400));

    const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'educare-payment-screenshots',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto'
    });

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { paymentScreenshot: result.secure_url, updatedAt: Date.now() },
        { new: true }
    );
    if (!order) return next(new AppError('Order not found', 404));

    res.json({ success: true, order, screenshotUrl: result.secure_url });
}));

// PUT /api/orders/:id/verify-payment (admin only)
router.put('/:id/verify-payment', auth, validate(schemas.verifyPayment), catchAsync(async (req, res, next) => {
    const { paymentStatus } = req.body;

    const updates = {
        paymentStatus,
        updatedAt: Date.now()
    };
    if (paymentStatus === 'paid') {
        updates.status = 'processing';
    } else if (paymentStatus === 'failed') {
        updates.status = 'cancelled';
    }

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
    );
    if (!order) return next(new AppError('Order not found', 404));

    res.json({
        success: true,
        order,
        message: paymentStatus === 'paid' ? 'Payment verified successfully' : 'Payment marked failed'
    });
}));

module.exports = router;
