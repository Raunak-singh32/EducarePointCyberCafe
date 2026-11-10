const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const redis = require('../config/redis');

// Helper to safely invalidate redis cache
const invalidateProductCache = async () => {
    try {
        await redis.del('products:all');
    } catch (err) {
        console.error('Redis cache clear error:', err.message);
    }
};

// GET all products (public) — with filtering, sorting, and generous pagination
router.get('/', catchAsync(async (req, res, next) => {
    const { category, search, sort } = req.query;

    const page  = Math.max(1, parseInt(req.query.page) || 1);
    // If limit is 'all' or omitted, return up to 500 products so client-side catalog works completely
    const isAll = req.query.limit === 'all' || !req.query.limit;
    const limit = isAll ? 500 : Math.min(500, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const noFilters = !category && !search && !sort && page === 1 && isAll;

    // Cache when fetching default full catalog
    if (noFilters) {
        try {
            const cached = await redis.get('products:all');
            if (cached) {
                return res.json({ success: true, fromCache: true, ...JSON.parse(cached) });
            }
        } catch (_) {}
    }

    // Build query
    let query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    // Build sort
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price_asc')  sortOption = { price:  1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc')   sortOption = { name:   1 };
    if (sort === 'newest')     sortOption = { createdAt: -1 };

    // Run both queries in parallel — count + data
    const [totalProducts, products] = await Promise.all([
        Product.countDocuments(query),
        Product.find(query).sort(sortOption).skip(skip).limit(limit)
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    const formattedProducts = products.map(p => ({
        _id:             p._id,
        name:            p.name,
        category:        p.category,
        subcategory:     p.subcategory,
        description:     p.description,
        price:           p.price,
        image:           p.image,
        stockStatus:     p.stockStatus,
        displayQuantity: p.displayQuantity,
        quantity:        p.quantity,
        sku:             p.sku,
        isPopular:       Boolean(p.isPopular),
        isNew:           Boolean(p.isNew)
    }));

    const responseData = {
        products: formattedProducts,
        pagination: {
            currentPage:   page,
            totalPages,
            totalProducts,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };

    if (noFilters) {
        try {
            await redis.setex('products:all', 300, JSON.stringify(responseData));
        } catch (_) {}
    }

    res.json({ success: true, fromCache: false, ...responseData });
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
            _id:             product._id,
            name:            product.name,
            category:        product.category,
            subcategory:     product.subcategory,
            description:     product.description,
            price:           product.price,
            image:           product.image,
            stockStatus:     product.stockStatus,
            displayQuantity: product.displayQuantity,
            quantity:        product.quantity,
            sku:             product.sku,
            isPopular:       Boolean(product.isPopular),
            isNew:           Boolean(product.isNew)
        }
    });
}));

// POST create product (admin only)
router.post('/', auth, validate(schemas.createProduct), catchAsync(async (req, res, next) => {
    const { name, category, subcategory, description, price, costPrice,
            quantity, image, showQuantity, lowStockAlert } = req.body;

    if (!name || !category || price === undefined || price === null || price === '') {
        return next(new AppError('Name, category and price are required', 400));
    }

    const isPopular = req.body.isPopular !== undefined ? Boolean(req.body.isPopular) : Boolean(req.body.popular);
    const isNew = req.body.isNew !== undefined ? Boolean(req.body.isNew) : false;

    const product = new Product({
        name: String(name).trim(),
        category,
        subcategory: subcategory ? String(subcategory).trim() : '',
        description: description ? String(description).trim() : '',
        price: String(price).trim(),
        costPrice: costPrice ? String(costPrice).trim() : '0',
        quantity: Math.max(0, parseInt(quantity) || 0),
        image: image || '',
        showQuantity: Boolean(showQuantity),
        lowStockAlert: Math.max(0, parseInt(lowStockAlert) || 5),
        isPopular,
        isNew
    });

    await product.save();
    await invalidateProductCache();

    res.status(201).json({ success: true, product });
}));

// PUT update product (admin only)
router.put('/:id', auth, catchAsync(async (req, res, next) => {
    const updates = { ...req.body, updatedAt: Date.now() };

    if (updates.isPopular !== undefined) updates.isPopular = Boolean(updates.isPopular);
    if (updates.popular !== undefined) updates.isPopular = Boolean(updates.popular);
    if (updates.isNew !== undefined) updates.isNew = Boolean(updates.isNew);

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!product) return next(new AppError('Product not found', 404));

    await invalidateProductCache();

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

    await invalidateProductCache();

    res.json({ success: true, message: 'Product deleted successfully' });
}));

module.exports = router;
