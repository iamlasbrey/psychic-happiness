// src/controllers/whatsapp.controller.js
const { handleIncomingMessage } = require('../services/whatsapp.service');
const logger = require('../config/logger');
const { sanitizeWhatsAppMessage } = require('../utils/sanitizer');

const verifyWebhook = async (req, res) => {
  try {
    // Twilio sends hub.challenge in query for verification
    logger.debug('Webhook verification request');
    const hubChallenge = req.query['hub.challenge'];
    if (!hubChallenge) {
      logger.warn('Missing hub.challenge in verification request');
      return res.status(400).send('Invalid request');
    }
    logger.info('Webhook verified successfully');
    res.status(200).send(hubChallenge);
  } catch (error) {
    logger.error('Error verifying webhook', { error: error.message });
    res.status(400).send('Invalid request');
  }
};

const receiveMessage = async (req, res, next) => {
  try {
    const { From, Body } = req.body;
    const sanitizedBody = sanitizeWhatsAppMessage(Body);
    logger.info('Received WhatsApp message', {
      from: From,
      bodyLength: sanitizedBody?.length,
    });

    // Process the message asynchronously
    handleIncomingMessage(From, sanitizedBody).catch((err) => {
      logger.error('Error handling WhatsApp message', {
        from: From,
        error: err.message,
        stack: err.stack,
      });
    });

    // Always respond with 200 to Twilio immediately
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error receiving WhatsApp message', { error: error.message });
    next(error);
  }
};

module.exports = {
  verifyWebhook,
  receiveMessage,
};
