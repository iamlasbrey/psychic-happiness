// src/services/firs.service.js
const { Invoice, AuditLog } = require('../models');

const submitInvoiceToFirs = async (userId, invoiceId) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    invoice.lastFirsAttempt = new Date();
    invoice.firsRetryCount += 1;
    invoice.firsStatus = 'submitted';

    // ✅ Stub: Generate fake IRN and QR
    invoice.firsIRN = `${invoice.invoiceNumber}-${Date.now()}`;
    invoice.qrCodeUrl = `https://firs.fake/qr/${invoice.firsIRN}`;
    invoice.firsStatus = 'validated';

    await invoice.save();

    await AuditLog.create({
      userId,
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'firs_submit',
      status: 'success',
      metadata: {
        firsIRN: invoice.firsIRN,
        timestamp: new Date(),
      },
    });

    return invoice;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  submitInvoiceToFirs,
};
