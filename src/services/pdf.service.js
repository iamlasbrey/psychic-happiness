// src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { Invoice, InvoiceLineItem } = require('../models');

const generateInvoicePdf = async (userId, invoiceId) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
      include: ['customer', 'lineItems'],
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    doc.registerFont('Helvetica', 'Helvetica');

    const pdfPath = path.join(
      __dirname,
      '../../uploads/invoices',
      `${invoice.invoiceNumber}.pdf`,
    );

    // Ensure directory exists
    const dir = path.dirname(pdfPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', 50, 50);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice #: ${invoice.invoiceNumber}`, 50, 80);
    doc.text(`Issue Date: ${invoice.issueDate}`);
    doc.text(`Due Date: ${invoice.dueDate}`);

    // Customer info
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 150);
    doc.fontSize(10).font('Helvetica');
    doc.text(`${invoice.customerName}`);
    doc.text(`${invoice.customerPhone}`);
    doc.text(`${invoice.customerEmail || 'N/A'}`);

    // QR Code
    if (invoice.qrCodeUrl) {
      const qrCode = await QRCode.toDataURL(invoice.qrCodeUrl);
      doc.image(qrCode, 400, 150, { width: 100 });
    }

    // Line items table
    doc.fontSize(12).font('Helvetica-Bold').text('Line Items', 50, 250);
    let yPos = 280;

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, yPos);
    doc.text('Qty', 250, yPos);
    doc.text('Unit Price', 300, yPos);
    doc.text('Amount', 400, yPos);

    yPos += 20;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 10;

    // Table rows
    invoice.lineItems.forEach((item) => {
      doc.text(item.description, 50, yPos);
      doc.text(item.quantity.toString(), 250, yPos);
      doc.text(`${parseFloat(item.unitPrice).toFixed(2)}`, 300, yPos);
      doc.text(`${parseFloat(item.amount).toFixed(2)}`, 400, yPos);
      yPos += 15;
    });

    yPos += 10;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 20;

    // Totals
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Subtotal:', 350, yPos);
    doc.text(`${parseFloat(invoice.subTotal).toFixed(2)}`, 450, yPos);
    yPos += 15;
    doc.text('VAT (7.5%):', 350, yPos);
    doc.text(`${parseFloat(invoice.vatAmount).toFixed(2)}`, 450, yPos);
    yPos += 15;
    doc.fontSize(12).text('Total:', 350, yPos);
    doc.text(`${parseFloat(invoice.totalAmount).toFixed(2)}`, 450, yPos);

    // Footer
    doc
      .fontSize(8)
      .text('Thank you for your business!', 50, 750, { align: 'center' });
    doc.text(`FIRS IRN: ${invoice.firsIRN || 'Pending'}`, 50, 770, {
      align: 'center',
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve(pdfPath);
      });
      stream.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateInvoicePdf,
};
