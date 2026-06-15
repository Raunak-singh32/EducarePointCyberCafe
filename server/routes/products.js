const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products (public - for users)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { isActive: true };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        const products = await Product.find(query).sort({ createdAt: -1 });
        
        // Format for public (hide sensitive data)
        const formattedProducts = products.map(p => ({
            _id: p._id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory,
            description: p.description,
            price: p.price,
            image: p.image,
            stockStatus: p.stockStatus,
            displayQuantity: p.displayQuantity,
            sku: p.sku,
            isPopular: p.isPopular,
            isNew: p.isNew
        }));
        
        res.json({ success: true, products: formattedProducts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ 
            success: true, 
            product: {
                _id: product._id,
                name: product.name,
                category: product.category,
                subcategory: product.subcategory,
                description: product.description,
                price: product.price,
                image: product.image,
                stockStatus: product.stockStatus,
                displayQuantity: product.displayQuantity,
                sku: product.sku
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST create product (admin only - add auth later)
router.post('/', async (req, res) => {
    try {
        const { name, category, subcategory, description, price, costPrice, quantity, image, showQuantity, lowStockAlert } = req.body;
        
        const product = new Product({
            name,
            category,
            subcategory,
            description,
            price,
            costPrice,
            quantity: quantity || 0,
            image,
            showQuantity: showQuantity || false,
            lowStockAlert: lowStockAlert || 5
        });
        
        await product.save();
        
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT update product (admin only)
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        updates.updatedAt = Date.now();
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE product (admin only - soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET low stock products (admin dashboard)
router.get('/admin/low-stock', async (req, res) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ['$quantity', '$lowStockAlert'] },
            isActive: true
        });
        
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;