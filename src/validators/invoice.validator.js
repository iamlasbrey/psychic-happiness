// src/schemas/invoice.schema.js
const Joi = require('joi');

const invoiceCreateSchema = Joi.object({
  customerId: Joi.string().uuid().optional(),
  invoiceNumber: Joi.string().max(50).optional().messages({
    'string.max': 'Invoice number cannot exceed 50 characters',
  }),
  issueDate: Joi.date().optional().messages({
    'any.required': 'Issue date is required',
  }),
  dueDate: Joi.date().optional(),
  subTotal: Joi.number().positive().precision(2).required(),
  totalAmount: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'Total amount must be greater than 0',
    'any.required': 'Total amount is required',
  }),
  customerName: Joi.string().max(150).optional(),
  customerPhone: Joi.string()
    .pattern(/^(\+234|0)[789]\d{9}$/)
    .optional()
    .when('customerId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(), // ✅ Phone required if no customerId
    }),
  customerEmail: Joi.string().email().optional(),
  paymentMethod: Joi.string()
    .valid('cash', 'bank_transfer', 'online')
    .optional()
    .default('cash'),
  paymentMeansCode: Joi.string().max(10).optional().default('10'),
  paymentLink: Joi.string().uri().optional(),
  notes: Joi.string().optional(),
});

const invoiceUpdateSchema = Joi.object({
  customerId: Joi.string().uuid().optional(),
  dueDate: Joi.date().optional(),
  paymentMethod: Joi.string()
    .valid('cash', 'bank_transfer', 'online')
    .optional(),
  paymentLink: Joi.string().uri().optional(),
  paymentStatus: Joi.string().valid('unpaid', 'paid').optional(),
  notes: Joi.string().optional(),
}).min(1);

const invoiceFilterSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'submitted', 'validated', 'failed')
    .optional(),
  paymentStatus: Joi.string().valid('unpaid', 'paid').optional(),
  customerId: Joi.string().uuid().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().min(1).optional().default(1),
  limit: Joi.number().min(1).max(100).optional().default(10),
});

module.exports = {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceFilterSchema,
};
