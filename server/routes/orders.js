const express = require('express');
const mongoose = require('mongoose');
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
const redis = require('../config/redis');
const { parsePrice } = require('../utils/orderPricing');
const hasExpectedSignature = require('../utils/fileValidation');

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
    const missing = requiredFields.filter(f => req.body[f] === undefined || req.body[f] === null || req.body[f] === '');
    if (missing.length > 0) return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));

    // Clean phone number (strip +91, dashes, spaces)
    const rawPhone = String(req.body.customerPhone).replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;
    if (cleanPhone.length !== 10) {
        return next(new AppError('Customer phone must be a valid 10-digit number', 400));
    }

    if (req.body.fileUrl) {
        try {
            const fileUrl = new URL(req.body.fileUrl);
            if (fileUrl.protocol !== 'https:' || !/(^|\.)cloudinary\.com$/i.test(fileUrl.hostname)) throw new Error();
        } catch (_) {
            return next(new AppError('Invalid uploaded file URL', 400));
        }
    }

    const pages = Number(req.body.pages || 1);
    const copies = Number(req.body.copies || 1);
    const itemRows = req.body.items || [];
    if (req.body.serviceType === 'product-order' && itemRows.length === 0) {
        return next(new AppError('Add at least one product to the order', 400));
    }
    const productsById = new Map();
    if (itemRows.length) {
        const ids = [...new Set(itemRows.map(item => String(item.itemId)))];
        const found = await Product.find({ _id: { $in: ids }, isActive: true });
        for (const product of found) productsById.set(String(product._id), product);
        if (itemRows.some(item => !productsById.has(String(item.itemId)))) {
            return next(new AppError('One or more selected products are invalid', 400));
        }
    }
    const itemTotal = itemRows.reduce((sum, item) => {
        const product = productsById.get(String(item.itemId));
        const unitPrice = parsePrice(product.price);
        if (!Number.isFinite(unitPrice)) throw new AppError(`Product ${product.name} has an invalid price`, 400);
        return sum + unitPrice * item.quantity;
    }, 0);
    const totalPrice = itemTotal;

    const normalizedItems = itemRows.map(item => {
        const product = productsById.get(String(item.itemId));
        const unitPrice = parsePrice(product.price);
        if (!Number.isFinite(unitPrice)) throw new AppError(`Product ${product.name} has an invalid price`, 400);
        return { itemId: product._id, name: product.name, price: unitPrice, quantity: item.quantity };
    });
    const quantities = new Map();
    for (const item of normalizedItems) quantities.set(String(item.itemId), (quantities.get(String(item.itemId)) || 0) + item.quantity);
    const reserved = [];
    try {
        for (const [id, quantity] of quantities) {
            const product = await Product.findOneAndUpdate(
                { _id: id, isActive: true, quantity: { $gte: quantity } },
                { $inc: { quantity: -quantity } },
                { new: true }
            );
            if (!product) throw new AppError('One or more items no longer have enough stock', 409);
            reserved.push([id, quantity]);
        }
        if (reserved.length) await redis.del('products:all').catch(() => {});
    } catch (error) {
        await Promise.all(reserved.map(([id, quantity]) => Product.updateOne({ _id: id }, { $inc: { quantity } }).catch(() => {})));
        if (reserved.length) await redis.del('products:all').catch(() => {});
        return next(error);
    }

    const orderData = {
        serviceType: req.body.serviceType,
        printType: req.body.printType || '',
        paperSize: req.body.paperSize || 'A4',
        pages,
        pageRange: req.body.pageRange || '1',
        copies,
        items: normalizedItems,
        totalPrice,
        serviceCostPending: req.body.serviceType !== 'product-order',
        customerName: req.body.customerName,
        customerPhone: cleanPhone,
        deliveryType: req.body.deliveryType,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending',
        notes: req.body.notes || '',
        fileUrl: req.body.fileUrl || '',
        fileName: req.body.fileName || '',
        pickupTime: req.body.pickupTime || '',
        address: req.body.address || '',
        updatedAt: Date.now()
    };

    const order = new Order(orderData);
    try {
        await order.save();
    } catch (error) {
        await Promise.all(reserved.map(([id, quantity]) => Product.updateOne({ _id: id }, { $inc: { quantity } }).catch(() => {})));
        if (reserved.length) await redis.del('products:all').catch(() => {});
        return next(error);
    }
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

// Customer lookup requires both the phone and the order ID; private order data is omitted.
router.post('/lookup', catchAsync(async (req, res, next) => {
    const rawPhone = String(req.body.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length > 10 ? rawPhone.slice(-10) : rawPhone;

    if (cleanPhone.length !== 10) {
        return next(new AppError('Please enter a valid 10-digit phone number', 400));
    }

    if (!mongoose.isValidObjectId(req.body.orderId)) return next(new AppError('Please enter a valid order ID', 400));
    const order = await Order.findOne({ _id: req.body.orderId, customerPhone: cleanPhone })
        .select('serviceType printType paperSize pages pageRange copies items totalPrice serviceCostPending status paymentMethod paymentStatus deliveryType pickupTime createdAt');
    res.json({ success: true, orders: order ? [order] : [] });
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
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError('Invalid order ID', 400));
    const screenshotExtension = String(req.file.originalname).split('.').pop().toLowerCase();
    const allowedImageMimes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    if (!allowedImageMimes[screenshotExtension] || req.file.mimetype !== allowedImageMimes[screenshotExtension] || !hasExpectedSignature(screenshotExtension, req.file.buffer)) {
        return next(new AppError('Please upload a valid JPG, PNG, or WEBP screenshot', 400));
    }
    const phone = String(req.body.customerPhone || '').replace(/\D/g, '').slice(-10);
    if (phone.length !== 10) return next(new AppError('A valid customer phone number is required', 400));

    const existingOrder = await Order.findOne({ _id: req.params.id, customerPhone: phone, paymentMethod: 'upi', paymentStatus: 'pending' });
    if (!existingOrder) return next(new AppError('Order not found or payment proof is no longer accepted', 404));

    const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'educare-payment-screenshots',
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto'
    });

    const order = await Order.findOneAndUpdate(
        { _id: req.params.id, customerPhone: phone, paymentMethod: 'upi', paymentStatus: 'pending' },
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
