// src/middleware/errorHandler.js
const logger = require('../utils/logger');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Handle Sequelize Validation Errors specifically
  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError'
  ) {
    statusCode = 400;
    // Map the array of Sequelize errors to a clean object
    message = err.errors.reduce((acc, error) => {
      acc[error.path] = `${error.path} is invalid or missing.`;
      return acc;
    }, {});
  }

  // Determine response structure
  let responseBody = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message:
      statusCode >= 500 && config.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : message,
  };

  // Add stack trace in development
  if (config.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
