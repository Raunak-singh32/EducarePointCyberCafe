const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  printType: { type: String, default: '' },
  paperSize: { type: String, default: 'A4' },
  pages: { type: Number, default: 1 },
  pageRange: { type: String, default: '1' },
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
  
  // pickupTime is optional (e.g. for delivery orders)
  pickupTime: { type: String, default: '' },
  
  deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  address: { type: String, default: '' },
  
  paymentMethod: { 
    type: String, 
    enum: ['upi', 'cod'], 
    default: 'cod' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  paymentScreenshot: { type: String, default: '' },
  
  notes: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'ready', 'completed', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index 1: Find all orders by a customer's phone number, newest first
// ESR: customerPhone = Equality, createdAt = Sort
orderSchema.index({ customerPhone: 1, createdAt: -1 });

// Index 2: Filter orders by status, newest first (admin dashboard)
// ESR: status = Equality, createdAt = Sort
orderSchema.index({ status: 1, createdAt: -1 });

// Index 3: General sort by newest (order listing page)
orderSchema.index({ createdAt: -1 });

// Index 4: TTL index - auto-deletes orders 30 days after marked delivered/completed
orderSchema.index({ deliveredAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Order', orderSchema);
