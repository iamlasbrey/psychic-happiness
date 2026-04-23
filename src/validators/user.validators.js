const Joi = require('joi');

// Define the schema for creating a user
const userCreateSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  name: Joi.string().min(2).required().messages({
    'string.min': 'Name must be at least 2 characters long.',
    'any.required': 'Name is required.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'any.required': 'Password is required.',
  }),
  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required()
    .messages({
      'string.pattern.base':
        'WhatsApp number must be between 10 and 15 digits.',
      'any.required': 'WhatsApp number is required.',
    }),
  businessName: Joi.string().min(2).required().messages({
    'string.min': 'Business name must be at least 2 characters long.',
    'any.required': 'Business name is required.',
  }),
  role: Joi.string().valid('user', 'admin').default('user').messages({
    'any.only': 'Role must be either "user" or "admin".',
  }),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'any.required': 'Password is required.',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().trim().messages({
    'string.empty': 'Refresh token cannot be empty',
    'any.required': 'Refresh token is required',
  }),
});

// Export only the schema
module.exports = {
  userCreateSchema,
  userLoginSchema,
  refreshTokenSchema,
};
