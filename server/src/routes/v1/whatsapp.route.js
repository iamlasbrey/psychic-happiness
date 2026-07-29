// src/routes/v1/whatsapp.route.js
const express = require('express');
const {
  receiveMessage,
  verifyWebhook,
} = require('../../controllers/whatsapp.controller');
const { webhookLimiter } = require('../../middleware/rateLimiter'); // ✅ ADD THIS
const { validateTwilioRequest } = require('../../middleware/twilioValidator');

const router = express.Router();

router.post(
  '/webhook',
  webhookLimiter, // ✅ Limit by sender phone FIRST
  validateTwilioRequest, // Then validate Twilio signature
  receiveMessage, // Finally, handle the message
);

// GET /whatsapp/webhook - Twilio verification
router.get('/webhook', verifyWebhook);

module.exports = router;
