const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // ✅ ADD THIS IMPORT
const logger = require('../config/logger');

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.WEBHOOK_RATE_LIMIT_MAX || '10', 10),

  keyGenerator: (req) => {
    const phone = req.body?.from;

    if (phone) {
      return phone;
    }
    return ipKeyGenerator(req);
  },

  handler: (req, res) => {
    const phone = req.body?.from || 'unknown';
    logger.warn('Webhook rate limit exceeded', {
      phone,
      messageBody: req.body?.body?.slice(0, 50),
    });

    res.status(429).json({
      success: false,
      error: 'Too many messages. Please wait before sending another.',
      retryAfter: 60,
    });
  },

  skip: (req) => process.env.NODE_ENV !== 'production',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { webhookLimiter };
