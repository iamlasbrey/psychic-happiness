// src/schemas/invoicelineitem.schema.js
const Joi = require('joi');

const lineItemCreateSchema = Joi.object({
  description: Joi.string().max(200).required().messages({
    'any.required': 'Item description is required',
  }),
  quantity: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Quantity must be greater than 0',
    'any.required': 'Quantity is required',
  }),
  unitPrice: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Unit price must be greater than 0',
    'any.required': 'Unit price is required',
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
});

const lineItemUpdateSchema = Joi.object({
  description: Joi.string().max(200).optional(),
  quantity: Joi.number().positive().precision(2).optional(),
  unitPrice: Joi.number().positive().precision(2).optional(),
  amount: Joi.number().positive().precision(2).optional(),
}).min(1);

const invoiceLineItemsSchema = Joi.object({
  items: Joi.array().items(lineItemCreateSchema).min(1).required().messages({
    'array.min': 'Invoice must have at least one line item',
    'any.required': 'Items are required',
  }),
});

module.exports = {
  lineItemCreateSchema,
  lineItemUpdateSchema,
  invoiceLineItemsSchema,
};
