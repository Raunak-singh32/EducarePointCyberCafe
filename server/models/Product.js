const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    category: {
  type: String,
  enum: [
    "pens",
    "copies",
    "art-supplies",
    "stationery",
    "craft",
    "sports",
    "utility",
    "furniture"
  ]
},
    subcategory: { 
        type: String,
        trim: true 
    },
    description: { 
        type: String,
        trim: true 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    costPrice: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    quantity: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
    image: { 
        type: String, 
        default: '' 
    },
    sku: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    showQuantity: { 
        type: Boolean, 
        default: false 
    },
    isPopular: { 
        type: Boolean, 
        default: false 
    },
    isNew: { 
        type: Boolean, 
        default: false 
    },
    lowStockAlert: { 
        type: Number, 
        default: 5,
        min: 0 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.quantity <= 0) return 'out-of-stock';
    if (this.quantity <= this.lowStockAlert) return 'low-stock';
    return 'in-stock';
});

// Virtual for display quantity
productSchema.virtual('displayQuantity').get(function() {
    if (this.showQuantity) return this.quantity;
    return this.quantity > 0 ? 'Available' : 'Out of Stock';
});

module.exports = mongoose.model('Product', productSchema);
