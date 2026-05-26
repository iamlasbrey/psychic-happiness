const logger = require('../config/logger');

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Remove SQL injection attempts
  let sanitized = input
    .replace(/('|"|`)/g, '') // Remove quotes
    .replace(/(;|--|\/\*|\*\/)/g, '') // Remove SQL delimiters
    .replace(
      /\b(OR|AND|UNION|SELECT|FROM|DROP|INSERT|UPDATE|DELETE|WHERE)\b/gi,
      '',
    ); // Remove SQL keywords

  if (sanitized !== input) {
    logger.warn('Suspicious input detected and sanitized', {
      original: input.substring(0, 50),
      sanitized: sanitized.substring(0, 50),
    });
  }

  return sanitized.trim();
};

const sanitizeWhatsAppMessage = (messageBody) => {
  return sanitizeInput(messageBody);
};

module.exports = {
  sanitizeInput,
  sanitizeWhatsAppMessage,
};
