const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const validate = require('../middleware/validate');
const schemas  = require('../validators/schemas');



const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Customer auth middleware (different from admin middleware/auth.js)
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Not authorized', 401));
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return next(new AppError('User not found', 401));
        next();
    } catch (error) {
        return next(new AppError('Token invalid or expired', 401));
    }
};

// POST /api/auth/register
router.post('/register',validate(schemas.register), catchAsync(async (req, res, next) => {
    const { name, email, password, whatsapp, address } = req.body;

    if (!name || !email || !password || !whatsapp) {
        return next(new AppError('Name, email, password and WhatsApp number are required', 400));
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return next(new AppError('An account with this email already exists', 400));

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        whatsapp,
        address: address || ''
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: { _id: user._id, name: user.name, email: user.email, whatsapp: user.whatsapp, address: user.address }
    });
}));

// POST /api/auth/login
router.post('/login',validate(schemas.login), catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Email and password are required', 400));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new AppError('No account found with this email', 400));

    if (!user.password) {
        return next(new AppError('This account uses Google login. Please use Google to sign in.', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError('Incorrect password', 400));

    const token = generateToken(user._id);

    res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: { _id: user._id, name: user.name, email: user.email, whatsapp: user.whatsapp, address: user.address }
    });
}));

// GET /api/auth/me (protected)
router.get('/me', protect, (req, res) => {
    res.json({
        success: true,
        user: { _id: req.user._id, name: req.user.name, email: req.user.email, whatsapp: req.user.whatsapp, address: req.user.address }
    });
});

// PUT /api/auth/update (protected)
router.put('/update', protect, catchAsync(async (req, res, next) => {
    const { name, whatsapp, address } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, whatsapp, address },
        { new: true }
    ).select('-password');

    res.json({
        success: true,
        message: 'Profile updated!',
        user: { _id: user._id, name: user.name, email: user.email, whatsapp: user.whatsapp, address: user.address }
    });
}));

// Google OAuth — passport handles its own errors, no change needed
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
    (req, res) => {
        const token = generateToken(req.user._id);
        const user = { _id: req.user._id, name: req.user.name, email: req.user.email, whatsapp: req.user.whatsapp, address: req.user.address };
        res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    }
);

module.exports = { router, protect };