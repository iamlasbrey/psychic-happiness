const Joi = require('joi');

/**
 * Creates an Express middleware function that validates the request body
 * against the provided Joi schema.
 *
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @returns {Function} Express middleware function.
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove properties not in schema
    });

    if (error) {
      // Create a single error message string
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join('; ');
      
      // Create an error object with a 400 status code
      const validationError = new Error(errorMessage);
      validationError.statusCode = 400; // Bad Request
      
      // Pass the error to the global error handler
      return next(validationError);
    }

    // Validation passed, attach validated data to req.body
    // (stripUnknown removes extra fields)
    req.body = value;
    next(); // Pass control to the next middleware (or controller)
  };
};

module.exports = validateRequest;