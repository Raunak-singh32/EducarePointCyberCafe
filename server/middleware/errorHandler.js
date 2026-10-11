const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log every error with request context
    logger.error(`${err.statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`);

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message
        });
    }

    logger.error('UNEXPECTED ERROR:', err);
    return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong. Please try again.'
    });
};

module.exports = errorHandler;