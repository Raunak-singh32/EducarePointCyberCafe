const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const redis = require('../config/redis');

// GET all products (public) — with pagination, filtering, sorting
router.get('/', catchAsync(async (req, res, next) => {
    const { category, search, sort } = req.query;

    // Pagination params — defaults: page 1, 12 products per page
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;

    const noFilters = !category && !search && !sort && page === 1;

    // Cache only the first page with no filters
    if (noFilters) {
        const cached = await redis.get('products:all');
        if (cached) {
            return res.json({ success: true, fromCache: true, ...JSON.parse(cached) });
        }
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
        sku:             p.sku,
        isPopular:       p.isPopular,
        isNew:           p.isNew
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

    // Cache only first page with no filters
    if (noFilters) {
        await redis.setex('products:all', 300, JSON.stringify(responseData));
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
            sku:             product.sku
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
        quantity:      quantity || 0,
        image,
        showQuantity:  showQuantity || false,
        lowStockAlert: lowStockAlert || 5
    });

    await product.save();
    await redis.del('products:all'); // invalidate cache on write

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

    await redis.del('products:all'); // invalidate cache on write

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

    await redis.del('products:all'); // invalidate cache on write

    res.json({ success: true, message: 'Product deleted successfully' });
}));

module.exports = router;