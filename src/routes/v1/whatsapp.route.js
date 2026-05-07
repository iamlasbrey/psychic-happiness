// src/routes/v1/whatsapp.route.js
const express = require('express');
const {
  receiveMessage,
  verifyWebhook,
} = require('../../controllers/whatsapp.controller');

const router = express.Router();

// POST /whatsapp/webhook - Receive WhatsApp messages from Twilio
router.post('/webhook', receiveMessage);

// GET /whatsapp/webhook - Twilio verification
router.get('/webhook', verifyWebhook);

module.exports = router;
