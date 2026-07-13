const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

// ── Helper: generate JWT token ──
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// ── Middleware: verify JWT ──
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token invalid or expired' });
    }
};

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, whatsapp, address } = req.body;

        // Validate required fields
        if (!name || !email || !password || !whatsapp) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password and WhatsApp number are required'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            whatsapp,
            address: address || ''
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No account found with this email'
            });
        }

        // Google-only user trying to use password
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account uses Google login. Please use Google to sign in.'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── GET /api/auth/me ── (protected)
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            whatsapp: req.user.whatsapp,
            address: req.user.address
        }
    });
});

// ── PUT /api/auth/update ── (protected)
router.put('/update', protect, async (req, res) => {
    try {
        const { name, whatsapp, address } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, whatsapp, address },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated!',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                whatsapp: user.whatsapp,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// const jwt = require('jsonwebtoken');
// const passport = require('passport');

// ── GET /api/auth/google ── Start Google OAuth
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ── GET /api/auth/google/callback ── Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
    (req, res) => {
        // Generate JWT for the Google user
        const token = generateToken(req.user._id);
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            whatsapp: req.user.whatsapp,
            address: req.user.address
        };

        // Redirect to frontend with token in URL
        res.redirect(`${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    }
);

module.exports = { router, protect };