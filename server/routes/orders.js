const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { cloudinary } = require('../config/cloudinary');

// POST /api/orders — Create Order
router.post('/', async (req, res) => {
  try {
    console.log('Order received:', req.body);
    
    // ── FIXED: Remove pickupTime from required fields ──
    const requiredFields = ['serviceType', 'totalPrice', 'customerName', 'customerPhone'];
    const missing = requiredFields.filter(f => !req.body[f]);
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }
    
    // ── NEW: Conditional validation ──
    if (req.body.deliveryType === 'pickup' && !req.body.pickupTime) {
      return res.status(400).json({
        success: false,
        message: 'Pickup time is required for pickup orders'
      });
    }
    
    if (req.body.deliveryType === 'delivery' && !req.body.address) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required for home delivery orders'
      });
    }
    
    const order = new Order({
      ...req.body,
      updatedAt: Date.now()
    });
    
    await order.save();
    res.status(201).json({ success: true, order });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders — Get All Orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id — Update Order Status
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { 
        status: req.body.status,
        updatedAt: Date.now()
      }, 
      { new: true }
    );
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── NEW: POST /api/orders/:id/payment-screenshot ──
router.post('/:id/payment-screenshot', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No screenshot file uploaded' 
      });
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'educare-payment-screenshots',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto'
    });
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentScreenshot: result.secure_url,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({ 
      success: true, 
      order,
      screenshotUrl: result.secure_url 
    });
    
  } catch (error) {
    console.error('Screenshot upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ── NEW: PUT /api/orders/:id/verify-payment ──
router.put('/:id/verify-payment', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!['paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'paymentStatus must be "paid" or "failed"'
      });
    }
    
    const newOrderStatus = paymentStatus === 'paid' ? 'pending' : 'cancelled';
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
        status: newOrderStatus,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({ 
      success: true, 
      order,
      message: paymentStatus === 'paid' 
        ? 'Payment verified successfully' 
        : 'Payment rejected'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET /api/orders/stats/today
router.get('/stats/today', async (req, res) => {
  try {
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
    const totalOrders = todayOrders.length;
    
    const pendingVerification = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      paymentMethod: 'upi',
      paymentStatus: 'pending'
    });
    
    res.json({
      success: true,
      date: today.toISOString().split('T')[0],
      totalEarnings,
      totalOrders,
      pendingVerification,
      orders: todayOrders
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// GET orders by phone number (for customers - no auth needed)
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit number' });
    }

    const orders = await Order.find({ customerPhone: phone })
      .sort({ createdAt: -1 })
      .select('serviceType printType copies totalPrice status paymentMethod paymentStatus deliveryType pickupTime address createdAt fileUrl fileName notes');

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;