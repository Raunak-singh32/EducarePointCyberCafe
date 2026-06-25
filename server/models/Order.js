const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  printType: { type: String, default: '' },
  paperSize: { type: String, default: 'A4' },
 // pages: { type: Number, default: 1 },
  copies: { type: Number, default: 1 },
  items: [{
    itemId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  pickupTime: { type: String, required: true },
  notes: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'processing', 'ready', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);