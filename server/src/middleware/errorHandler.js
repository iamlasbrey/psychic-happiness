// src/middleware/errorHandler.js
const logger = require('../utils/logger');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  // 1. DETERMINE STATUS
  // Use the error's status code or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // 2. DETERMINE JSON BODY
  let responseBody = {
    status: statusCode >= 500 ? 'error' : 'fail', // 'error' for 5xx, 'fail' for 4xx
    message: err.message,
  };

  // 3. LOG THE FULL ERROR (for you, the developer)
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 4. CLEANUP FOR PRODUCTION
  // In production, hide server-error details from the client
  if (config.NODE_ENV === 'production' && statusCode >= 500) {
    responseBody.message = 'Internal Server Error';
  }

  // In development, you can add the stack trace if you want
  if (config.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  // 5. SEND THE SEPARATE STATUS AND JSON
  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;