const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const redis = require('../config/redis');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Not authorized - no token', 401));
    }
    const token = authHeader.slice(7);
    let isBlacklisted;
    try {
        isBlacklisted = await redis.get(`blacklist:${token}`);
    } catch (_) {
        return next(new AppError('Authentication service unavailable', 503));
    }
    if (isBlacklisted) return next(new AppError('Token has been invalidated. Please login again.', 401));

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
        return next(new AppError('Token invalid or expired', 401));
    }
    if (decoded.role !== 'admin') return next(new AppError('Administrator access required', 403));
    req.admin = decoded;
    return next();
};


module.exports = auth;
