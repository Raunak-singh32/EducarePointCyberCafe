const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST create order
router.post('/', async (req, res) => {
  try {
    // Log what we receive (for debugging)
    console.log('Order received:', req.body);
    
    // Check required fields
    const requiredFields = ['serviceType', 'totalPrice', 'customerName', 'customerPhone', 'pickupTime'];
    const missing = requiredFields.filter(f => !req.body[f]);
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }
    
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update status
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// GET today's earnings
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: { $in: ['ready', 'completed'] }
    });
    
    const totalEarnings = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = todayOrders.length;
    
    res.json({
      success: true,
      date: today.toISOString().split('T')[0],
      totalEarnings,
      totalOrders,
      orders: todayOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;