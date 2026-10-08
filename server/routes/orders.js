const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const multer = require('multer');
const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const schemas  = require('../validators/schemas');

// Memory storage — safe for Render (no disk writes)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
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

// POST /api/orders
router.post('/', validate(schemas.createOrder),catchAsync(async (req, res, next) => {
    const requiredFields = ['serviceType', 'totalPrice', 'customerName', 'customerPhone'];
    const missing = requiredFields.filter(f => !req.body[f]);
    if (missing.length > 0) return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));

    if (req.body.deliveryType === 'pickup' && !req.body.pickupTime) {
        return next(new AppError('Pickup time is required for pickup orders', 400));
    }
    if (req.body.deliveryType === 'delivery' && !req.body.address) {
        return next(new AppError('Delivery address is required for home delivery orders', 400));
    }

    const order = new Order({ ...req.body, updatedAt: Date.now() });
    await order.save();
    res.status(201).json({ success: true, order });
}));

// GET /api/orders (admin)
router.get('/', catchAsync(async (req, res, next) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
}));

// GET /api/orders/stats/today — BEFORE /:id
router.get('/stats/today', catchAsync(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.find({
        createdAt: { $gte: today, $lt: tomorrow },
        paymentStatus: 'paid',
        status: { $nin: ['cancelled'] }
    });

    const totalEarnings = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
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

// GET /api/orders/by-phone/:phone — BEFORE /:id
router.get('/by-phone/:phone', catchAsync(async (req, res, next) => {
    const { phone } = req.params;
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        return next(new AppError('Enter a valid 10-digit number', 400));
    }

    const orders = await Order.find({ customerPhone: phone })
        .sort({ createdAt: -1 })
        .select('serviceType printType copies totalPrice status paymentMethod paymentStatus deliveryType pickupTime address createdAt fileUrl fileName notes');

    res.json({ success: true, orders });
}));

// PUT /api/orders/:id
router.put('/:id', catchAsync(async (req, res, next) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status, updatedAt: Date.now() },
        { new: true }
    );
    if (!order) return next(new AppError('Order not found', 404));
    res.json({ success: true, order });
}));

// POST /api/orders/:id/payment-screenshot
router.post('/:id/payment-screenshot',validate(schemas.verifyPayment), upload.single('screenshot'), catchAsync(async (req, res, next) => {
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

// PUT /api/orders/:id/verify-payment
router.put('/:id/verify-payment', catchAsync(async (req, res, next) => {
    const { paymentStatus } = req.body;
    if (!['paid', 'failed'].includes(paymentStatus)) {
        return next(new AppError('paymentStatus must be "paid" or "failed"', 400));
    }

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            paymentStatus,
            status: paymentStatus === 'paid' ? 'pending' : 'cancelled',
            updatedAt: Date.now()
        },
        { new: true }
    );
    if (!order) return next(new AppError('Order not found', 404));

    res.json({
        success: true,
        order,
        message: paymentStatus === 'paid' ? 'Payment verified successfully' : 'Payment rejected'
    });
}));

module.exports = router;