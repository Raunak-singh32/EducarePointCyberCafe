const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const schemas  = require('../validators/schemas');

let productCache = null;
let cacheTime = null;
const CACHE_TTL = 5 * 60 * 1000;

// GET all products (public)
router.get('/', catchAsync(async (req, res, next) => {
    const { category, search } = req.query;
    const now = Date.now();
    const noFilters = !category && !search;

    if (noFilters && productCache && cacheTime && (now - cacheTime) < CACHE_TTL) {
        return res.json({ success: true, fromCache: true, products: productCache });
    }

    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query).sort({ createdAt: -1 });

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

    if (noFilters) {
        productCache = formattedProducts;
        cacheTime = now;
    }

    res.json({ success: true, products: formattedProducts });
}));

// GET low stock (admin) — BEFORE /:id to avoid route conflict
router.get('/admin/low-stock', auth, catchAsync(async (req, res, next) => {
    const products = await Product.find({
        $expr: { $lte: ['$quantity', '$lowStockAlert'] },
        isActive: true
    });
    res.json({ success: true, products });
}));

// GET single product (public)
router.get('/:id', catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found', 404));

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
}));

// POST create product (admin only)
router.post('/', auth, validate(schemas.createProduct), catchAsync(async (req, res, next) => {
    const { name, category, subcategory, description, price, costPrice,
            quantity, image, showQuantity, lowStockAlert } = req.body;

    if (!name || !category || !price) {
        return next(new AppError('Name, category and price are required', 400));
    }

    const product = new Product({
        name, category, subcategory, description, price, costPrice,
        quantity: quantity || 0,
        image,
        showQuantity: showQuantity || false,
        lowStockAlert: lowStockAlert || 5
    });

    await product.save();

    productCache = null;
    cacheTime = null;

    res.status(201).json({ success: true, product });
}));

// PUT update product (admin only)
router.put('/:id', auth, catchAsync(async (req, res, next) => {
    const updates = { ...req.body, updatedAt: Date.now() };

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!product) return next(new AppError('Product not found', 404));

    productCache = null;
    cacheTime = null;

    res.json({ success: true, product });
}));

// DELETE product — soft delete (admin only)
router.delete('/:id', auth, catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!product) return next(new AppError('Product not found', 404));

    productCache = null;
    cacheTime = null;

    res.json({ success: true, message: 'Product deleted successfully' });
}));

module.exports = router;