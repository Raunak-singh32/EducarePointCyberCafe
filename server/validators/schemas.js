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
        serviceType:   Joi.string().required(),
        totalPrice:    Joi.number().min(0).required(),
        customerName:  Joi.string().min(2).max(100).required(),
        customerPhone: Joi.string().pattern(/^\+?\d{10,13}$/).required()
                         .messages({ 'string.pattern.base': 'Phone must be a valid 10-digit number' }),
        deliveryType:  Joi.string().valid('pickup', 'delivery').required(),
        pickupTime:    Joi.string().allow('', null).optional(),
        address:       Joi.string().allow('', null).optional(),
        paymentMethod: Joi.string().valid('upi', 'cod').required(),
        paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
        items:         Joi.array().items(
                           Joi.object({
                               itemId:   Joi.string().allow('', null).optional(),
                               name:     Joi.string().required(),
                               price:    Joi.number().min(0).required(),
                               quantity: Joi.number().integer().min(1).required()
                           })
                       ).optional(),
        notes:         Joi.string().max(500).allow('', null).optional(),
        fileUrl:       Joi.string().allow('', null).optional(),
        fileName:      Joi.string().allow('', null).optional(),
        printType:     Joi.string().allow('', null).optional(),
        paperSize:     Joi.string().allow('', null).optional(),
        pages:         Joi.number().optional(),
        copies:        Joi.number().optional(),
        pageRange:     Joi.string().allow('', null).optional()
    }).unknown(true),

    createProduct: Joi.object({
        name:          Joi.string().min(2).max(100).required(),
        category:      Joi.string().valid(
                           'pens', 'copies', 'art-supplies', 'stationery',
                           'craft', 'sports', 'utility', 'furniture', 'paper'
                       ).required(),
        price:         Joi.alternatives().try(Joi.number().min(0), Joi.string()).required(),
        subcategory:   Joi.string().allow('', null).optional(),
        description:   Joi.string().max(500).allow('', null).optional(),
        costPrice:     Joi.alternatives().try(Joi.number().min(0), Joi.string()).optional(),
        quantity:      Joi.alternatives().try(Joi.number().integer().min(0), Joi.string()).optional(),
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
