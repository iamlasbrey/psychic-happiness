// src/schemas/payment.schema.js
const Joi = require('joi');

const recordPaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  method: Joi.string()
    .valid('cash', 'bank_transfer', 'online')
    .required()
    .messages({
      'any.required': 'Payment method is required',
    }),
});

module.exports = {
  recordPaymentSchema,
};
