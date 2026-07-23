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
            "pens", "copies", "art-supplies", "stationery",
            "craft", "sports", "utility", "furniture", "paper"
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
        type: String,
        required: true,
        trim: true
    },
    costPrice: { 
        type: String,
        default: '0'
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

productSchema.virtual('stockStatus').get(function() {
    if (this.quantity <= 0) return 'out-of-stock';
    if (this.quantity <= this.lowStockAlert) return 'low-stock';
    return 'in-stock';
});

productSchema.virtual('displayQuantity').get(function() {
    if (this.showQuantity) return this.quantity;
    return this.quantity > 0 ? 'Available' : 'Out of Stock';
});

module.exports = mongoose.model('Product', productSchema);