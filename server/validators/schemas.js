const Joi = require('joi');

const schemas = {

    register: Joi.object({
        name:     Joi.string().min(2).max(50).required(),
        email:    Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        whatsapp: Joi.string().pattern(/^\d{10}$/).required()
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
        customerName:  Joi.string().min(2).max(50).required(),
        customerPhone: Joi.string().pattern(/^\d{10}$/).required()
                         .messages({ 'string.pattern.base': 'Phone must be a 10-digit number' }),
        deliveryType:  Joi.string().valid('pickup', 'delivery').required(),
        pickupTime:    Joi.string().when('deliveryType', {
                           is: 'pickup', then: Joi.required(), otherwise: Joi.optional()
                       }),
        address:       Joi.string().when('deliveryType', {
                           is: 'delivery', then: Joi.required(), otherwise: Joi.allow('').optional()
                       }),
        paymentMethod: Joi.string().valid('upi', 'cod').required(),
        paymentStatus: Joi.string().valid('pending', 'paid', 'failed').optional(),
        items:         Joi.array().items(
                           Joi.object({
                               itemId:   Joi.string().optional(),
                               name:     Joi.string().required(),
                               price:    Joi.number().min(0).required(),
                               quantity: Joi.number().integer().min(1).required()
                           })
                       ).optional(),
        notes:         Joi.string().max(500).allow('').optional(),
        fileUrl:       Joi.string().uri().allow('').optional(),
        fileName:      Joi.string().allow('').optional(),
        printType:     Joi.string().allow('').optional(),
        paperSize:     Joi.string().allow('').optional(),
        pages:         Joi.number().optional(),
        copies:        Joi.number().optional(),
        pageRange:     Joi.string().allow('').optional()
    }),

    createProduct: Joi.object({
        name:          Joi.string().min(2).max(100).required(),
        category:      Joi.string().required(),
        price:         Joi.number().min(0).required(),
        subcategory:   Joi.string().allow('').optional(),
        description:   Joi.string().max(500).allow('').optional(),
        costPrice:     Joi.number().min(0).optional(),
        quantity:      Joi.number().integer().min(0).optional(),
        image:         Joi.string().allow('').optional(),
        showQuantity:  Joi.boolean().optional(),
        lowStockAlert: Joi.number().integer().min(0).optional(),
        popular:       Joi.boolean().optional(),
        isNew:         Joi.boolean().optional(),
        stockStatus:   Joi.string().valid('in-stock', 'low-stock', 'out-of-stock').optional()
    }),

    updateOrderStatus: Joi.object({
        status: Joi.string()
                   .valid('pending', 'processing', 'ready', 'delivered', 'cancelled')
                   .required()
    }),

    verifyPayment: Joi.object({
        paymentStatus: Joi.string().valid('paid', 'failed').required()
    })
};

module.exports = schemas;