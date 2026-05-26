const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const invoiceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 invoice per minute per user
  keyGenerator: (req, res) => {
    return req.user?.id || req.body?.userId || 'anonymous';
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { userId: req.user?.id });
    res.status(429).json({
      success: false,
      error: 'Too many invoices. Please wait 1 minute before creating another.',
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

module.exports = {
  invoiceLimiter,
};
