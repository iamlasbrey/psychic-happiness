// src/controllers/whatsapp.controller.js
const { handleIncomingMessage } = require('../services/whatsapp.service');

const verifyWebhook = async (req, res) => {
  try {
    // Twilio sends hub.challenge in query for verification
    const hubChallenge = req.query['hub.challenge'];
    res.status(200).send(hubChallenge);
  } catch (error) {
    res.status(400).send('Invalid request');
  }
};

const receiveMessage = async (req, res, next) => {
  try {
    const { From, Body } = req.body;

    // Process the message asynchronously
    handleIncomingMessage(From, Body).catch((err) => {
      console.error('Error handling WhatsApp message:', err);
    });

    // Always respond with 200 to Twilio immediately
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyWebhook,
  receiveMessage,
};
