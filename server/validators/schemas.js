const Joi = require('joi');

const schemas = {

    register: Joi.object({
        name:     Joi.string().min(2).max(50).required(),
        email:    Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        whatsapp: Joi.string().pattern(/^\+?\d{10,13}$/).required()
                    .messages({ 'string.pattern.base': 'WhatsApp must be a 10-digit number' }),
        address:  Joi.string().max(200).allow('').optional()
    }),

    login: Joi.object({
        email:    Joi.string().email().required(),
        password: Joi.string().required()
    }),

    createOrder: Joi.object({
        serviceType:   Joi.string().valid('product-order', 'print', 'xerox', 'scan', 'lamination', 'binding').required(),
        totalPrice:    Joi.number().min(0).required(),
        customerName:  Joi.string().min(2).max(100).required(),
        customerPhone: Joi.string().pattern(/^\+?\d{10,13}$/).required()
                         .messages({ 'string.pattern.base': 'Phone must be a valid 10-digit number' }),
        deliveryType:  Joi.string().valid('pickup').required(),
        pickupTime:    Joi.string().allow('', null).optional(),
        address:       Joi.string().allow('', null).optional(),
        paymentMethod: Joi.string().valid('cod').required(),
        items:         Joi.array().max(100).items(
                           Joi.object({
                               itemId:   Joi.string().hex().length(24).required(),
                               name:     Joi.string().required(),
                               price:    Joi.number().min(0).required(),
                               quantity: Joi.number().integer().min(1).max(500).required()
                           })
                       ).optional(),
        notes:         Joi.string().max(500).allow('', null).optional(),
        fileUrl:       Joi.string().allow('', null).optional(),
        fileName:      Joi.string().allow('', null).optional(),
        printType:     Joi.string().valid('black-white', 'color', '').allow(null).optional(),
        paperSize:     Joi.string().valid('A4', 'A3', 'Legal', '').allow(null).optional(),
        pages:         Joi.number().integer().min(1).max(5000).optional(),
        copies:        Joi.number().integer().min(1).max(100).optional(),
        pageRange:     Joi.string().allow('', null).optional()
    }),

    createProduct: Joi.object({
        name:          Joi.string().min(2).max(100).required(),
        category:      Joi.string().valid(
                           'pens', 'copies', 'art-supplies', 'stationery',
                           'craft', 'sports', 'utility', 'furniture', 'paper'
                       ).required(),
        price:         Joi.alternatives().try(
                           Joi.number().min(0),
                           Joi.string().pattern(/^\s*(?:₹\s*)?\d+(?:\.\d{1,2})?(?:\s+per\s+\w+)?\s*$/i)
                       ).required(),
        subcategory:   Joi.string().allow('', null).optional(),
        description:   Joi.string().max(500).allow('', null).optional(),
        costPrice:     Joi.alternatives().try(Joi.number().min(0), Joi.string().pattern(/^\s*\d+(?:\.\d{1,2})?\s*$/)).optional(),
        quantity:      Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().pattern(/^\d+$/)).optional(),
        image:         Joi.string().allow('', null).optional(),
        showQuantity:  Joi.boolean().optional(),
        lowStockAlert: Joi.number().integer().min(0).optional(),
        popular:       Joi.boolean().optional(),
        isPopular:     Joi.boolean().optional(),
        isNew:         Joi.boolean().optional(),
        stockStatus:   Joi.string().valid('in-stock', 'low-stock', 'out-of-stock').optional()
    }).unknown(true),

    updateOrderStatus: Joi.object({
        status: Joi.string()
                   .valid('pending', 'processing', 'ready', 'completed', 'delivered', 'cancelled')
                   .required()
    }),

    verifyPayment: Joi.object({
        paymentStatus: Joi.string().valid('paid', 'failed', 'pending', 'refunded').required()
    })
};

module.exports = schemas;
