const Joi = require('joi');

// Define the schema for creating a user
const userCreateSchema = Joi.object({
  firstName: Joi.string().min(2).required().messages({
    'string.min': 'First name must be at least 2 characters long.',
    'any.required': 'First name is required.',
  }),
  lastName: Joi.string().min(2).required().messages({
    'string.min': 'Last name must be at least 2 characters long.',
    'any.required': 'Last name is required.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'any.required': 'Password is required.',
  }),
  phoneNumber: Joi.string()
    .trim() // Removes accidental whitespace
    // Regex: Optional '+234' or '234' or '0', followed by 7, 8, or 9, then 9 digits
    .pattern(/^(\+234|234|0)?[789]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base':
        'Phone number must be a valid Nigerian mobile format (e.g., 08012345678 or 2348012345678).',
      'any.required': 'Phone number is required.',
    }),
  businessName: Joi.string().min(2).required().messages({
    'string.min': 'Business name must be at least 2 characters long.',
    'any.required': 'Business name is required.',
  }),
  businessRegistrationNumber: Joi.string().optional(),
  tin: Joi.string().optional(),
  role: Joi.string().valid('user', 'admin').default('user').messages({
    'any.only': 'Role must be either "user" or "admin".',
  }),
});

const userLoginSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^(\+234|0)[789]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base':
        'WhatsApp number must be between 10 and 15 digits.',
      'any.required': 'WhatsApp number is required.',
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
