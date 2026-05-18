// src/services/whatsapp.service.js
const twilio = require('twilio');
const config = require('../config');
const { parseInvoiceFromAI } = require('./aiMessageParser.service');
const invoiceService = require('./invoice.service');
const { User } = require('../models');

const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

const handleIncomingMessage = async (from, messageBody) => {
  try {
    // Parse message
    const parseResult = await parseInvoiceFromAI(messageBody);

    if (!parseResult.success) {
      await sendWhatsAppMessage(from, parseResult.error);
      return;
    }

    const { data } = parseResult;

    // Find user by phone
    const user = await User.findOne({
      where: { phone: from.replace('whatsapp:', '').replace('whatsapp', '') },
    });

    if (!user) {
      await sendWhatsAppMessage(
        from,
        'Error: User not found. Please register first.',
      );
      return;
    }

    // Create invoice
    const invoice = await invoiceService.createInvoice(user.id, {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      subTotal: data.subTotal,
      items: data.items,
    });

    // Send confirmation
    await sendWhatsAppMessage(
      from,
      `Invoice Created!\nInvoice #: ${invoice.invoiceNumber}\nTotal: ₦${invoice.totalAmount.toFixed(2)}`,
    );
  } catch (error) {
    console.error('Error in handleIncomingMessage:', error);
    await sendWhatsAppMessage(
      from,
      'Error creating invoice. Please try again.',
    );
  }
};

const sendWhatsAppMessage = async (to, message) => {
  try {
    await client.messages.create({
      from: config.TWILIO_WHATSAPP_NUMBER,
      to,
      body: message,
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

module.exports = {
  handleIncomingMessage,
  sendWhatsAppMessage,
};
