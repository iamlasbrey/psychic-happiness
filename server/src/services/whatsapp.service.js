// src/services/whatsapp.service.js
const twilio = require('twilio');
const config = require('../config');
const { parseInvoiceFromAI } = require('./aiMessageParser.service');
const invoiceService = require('./invoice.service');
const { User, DraftInvoice, Invoice } = require('../models');
const cacheManager = require('../utils/cacheManager');
const draftService = require('./draftInvoice.service');
const logger = require('../config/logger');
const { sanitizeWhatsAppMessage } = require('../utils/sanitizer');
const { Op } = require('sequelize');
const pdfService = require('./pdf.service'); // ✅ ADDED: PDF import

const QUOTA_EXCEEDED_MSG = (limit) =>
  `Daily invoice limit (${limit}) reached. Please try again tomorrow.`;
const DAILY_INVOICE_LIMIT = 10;

const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

const checkUserDailyQuota = async (userId) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const count = await Invoice.count({
      where: {
        userId,
        createdAt: { [Op.gte]: today },
      },
    });

    logger.debug('Daily quota check', {
      userId,
      invoiceCount: count,
      limit: DAILY_INVOICE_LIMIT,
    });

    if (count >= DAILY_INVOICE_LIMIT) {
      logger.warn('Daily quota exceeded', { userId, count });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error checking daily quota', {
      userId,
      error: error.message,
    });
    return true;
  }
};

const handleIncomingMessage = async (from, messageBody) => {
  try {
    messageBody = sanitizeWhatsAppMessage(messageBody);

    logger.info('Incoming WhatsApp message', { from, messageBody });
    if (messageBody.toUpperCase() === 'CONFIRM') {
      await handleConfirmation(from);
      return;
    }

    if (messageBody.toUpperCase() === 'REJECT') {
      await handleRejection(from);
      return;
    }

    const cachedResult = cacheManager.getCachedResult(messageBody);
    if (cachedResult) {
      const { data } = cachedResult;
      console.log('Using cached AI result for message:', data);
      await sendWhatsAppMessage(
        from,
        `Invoice Created!\nInvoice #: ${data?.invoiceNumber}\nTotal: ₦${data?.totalAmount.toFixed(2)}`,
      );
      return;
    }

    const phoneNumber = from.replace('whatsapp:', '').replace('whatsapp', '');
    const user = await User.findOne({
      where: { phone: phoneNumber },
    });

    if (!user) {
      await sendWhatsAppMessage(
        from,
        'Error: User not found. Please register first.',
      );
      return;
    }

    const hasQuota = await checkUserDailyQuota(user.id);
    if (!hasQuota) {
      logger.warn('User exceeded daily quota', { userId: user.id });
      await sendWhatsAppMessage(from, QUOTA_EXCEEDED_MSG(DAILY_INVOICE_LIMIT));
      return;
    }

    const parseResult = await parseInvoiceFromAI(messageBody);

    if (!parseResult.success && parseResult.error === 'not_invoice') {
      await sendWhatsAppMessage(
        from,
        '📩 Please send a valid invoice/receipt (items + total) to continue.',
      );
      return;
    }

    if (!parseResult.success) {
      await sendWhatsAppMessage(from, parseResult.error);
      return;
    }

    const { data } = parseResult;

    const draft = await draftService.createDraft(user.id, data, messageBody);

    const confirmationText = `
    📋 **DRAFT INVOICE**
    Customer: ${data.customerName || 'Unknown'}
    Phone: ${data.customerPhone}
    Items:
    ${data.items.map((item) => `• ${item.description} x${item.quantity} @ ₦${item.unitPrice.toLocaleString()} = ₦${item.amount.toLocaleString()}`).join('\n')}

    Subtotal: ₦${data.subTotal.toLocaleString()}

    Reply with:
    ✅ CONFIRM - to create invoice
    ❌ REJECT - to cancel`;

    await sendWhatsAppMessage(from, confirmationText);

    cacheManager.setCachedResult(messageBody, {
      draftId: draft.id,
      draft,
    });
  } catch (error) {
    logger.error('Error in handleIncomingMessage', {
      error: error.message,
      stack: error.stack,
    });
    console.error('Error in handleIncomingMessage:', error);
    await sendWhatsAppMessage(
      from,
      'Error creating invoice. Please try again.',
    );
  }
};

const handleConfirmation = async (from) => {
  try {
    logger.info('Handling invoice confirmation', { from });
    const phoneNumber = from.replace('whatsapp:', '').replace('whatsapp', '');
    const user = await User.findOne({
      where: { phone: phoneNumber },
    });

    if (!user) {
      await sendWhatsAppMessage(from, 'User not found.');
      return;
    }

    const draft = await DraftInvoice.findOne({
      where: { userId: user.id, status: 'pending_confirmation' },
      order: [['createdAt', 'DESC']],
    });

    if (!draft) {
      await sendWhatsAppMessage(
        from,
        'No pending invoice to confirm. Send invoice details first.',
      );
      return;
    }

    await draftService.confirmDraft(user.id, draft.id);

    const invoice = await invoiceService.createInvoice(user.id, {
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      subTotal: draft.subTotal,
      items: draft.items,
    });

    logger.info('Invoice created, generating PDF', {
      userId: user.id,
      invoiceId: invoice.id,
    });

    // ✅ ADDED: Send "generating" message
    await sendWhatsAppMessage(
      from,
      `✅ Invoice Created!\nInvoice #: ${invoice?.invoiceNumber}\nTotal: ₦${invoice?.totalAmount.toLocaleString()}\n\n📄 Generating PDF...`,
    );

    // ✅ ADDED: Generate PDF asynchronously
    try {
      const pdfPath = await pdfService.generateInvoicePdf(user.id, invoice.id);

      // ✅ ADDED: Save PDF URL to invoice
      await invoice.update({
        pdfUrl: `/uploads/invoices/${invoice.invoiceNumber}.pdf`,
      });

      // ✅ ADDED: Send PDF link
      await sendWhatsAppMessage(
        from,
        `📥 PDF Ready!\nDownload: ${config.APP_URL || 'http://localhost:5000'}/api/v1/invoices/${invoice.id}/pdf`,
      );

      logger.info('PDF generated successfully', {
        userId: user.id,
        invoiceId: invoice.id,
      });
    } catch (pdfError) {
      logger.error('PDF generation failed', {
        userId: user.id,
        invoiceId: invoice.id,
        error: pdfError.message,
      });

      await sendWhatsAppMessage(
        from,
        `⚠️ Invoice created but PDF generation failed. Download later from your account.`,
      );
    }
  } catch (error) {
    logger.error('Error in handleConfirmation', {
      error: error.message,
      stack: error.stack,
    });
    console.error('Error in handleConfirmation:', error);
    await sendWhatsAppMessage(
      from,
      'Error confirming invoice. Please try again.',
    );
  }
};

const handleRejection = async (from) => {
  try {
    const phoneNumber = from.replace('whatsapp:', '').replace('whatsapp', '');
    const user = await User.findOne({
      where: { phone: phoneNumber },
    });

    if (!user) {
      await sendWhatsAppMessage(from, 'User not found.');
      return;
    }

    const draft = await DraftInvoice.findOne({
      where: { userId: user.id, status: 'pending_confirmation' },
      order: [['createdAt', 'DESC']],
    });

    if (!draft) {
      await sendWhatsAppMessage(from, 'No pending invoice to reject.');
      return;
    }

    await draftService.rejectDraft(user.id, draft.id);

    await sendWhatsAppMessage(
      from,
      'Invoice rejected. Send a new message to create another invoice.',
    );
  } catch (error) {
    logger.error('Error in handleRejection', {
      error: error.message,
      stack: error.stack,
    });
    console.error('Error in handleRejection:', error);
    await sendWhatsAppMessage(
      from,
      'Error rejecting invoice. Please try again.',
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
    logger.error('Error sending WhatsApp message', {
      error: error.message,
      stack: error.stack,
    });
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

module.exports = {
  handleIncomingMessage,
  sendWhatsAppMessage,
  QUOTA_EXCEEDED_MSG,
  DAILY_INVOICE_LIMIT,
};
