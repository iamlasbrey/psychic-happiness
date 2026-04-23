// src/schemas/customer.schema.js
const Joi = require('joi');

const customerCreateSchema = Joi.object({
  name: Joi.string().min(2).max(150).required().messages({
    'string.min': 'Customer name must be at least 2 characters',
    'string.max': 'Customer name cannot exceed 150 characters',
    'any.required': 'Customer name is required',
  }),
  phone: Joi.string()
    .pattern(/^(\+234|0)[789]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone must be a valid Nigerian number',
    }),
  email: Joi.string().email().optional(),
  address: Joi.string().optional(),
  businessName: Joi.string().max(150).optional(),
  businessRegistration: Joi.string().max(50).optional(),
  type: Joi.string()
    .valid('individual', 'business')
    .optional()
    .default('individual'),
  taxId: Joi.string().max(50).optional(),
  isFrequent: Joi.boolean().optional().default(false),
});

const customerUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  phone: Joi.string()
    .pattern(/^(\+234|0)[789]\d{9}$/)
    .optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().optional(),
  businessName: Joi.string().max(150).optional(),
  businessRegistration: Joi.string().max(50).optional(),
  type: Joi.string().valid('individual', 'business').optional(),
  taxId: Joi.string().max(50).optional(),
  isFrequent: Joi.boolean().optional(),
}).min(1);

module.exports = {
  customerCreateSchema,
  customerUpdateSchema,
};
