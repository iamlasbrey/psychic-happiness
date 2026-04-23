// src/services/invoiceNumber.service.js
const { Invoice } = require('../models');

const generateInvoiceNumber = async (userId) => {
  const now = new Date();
  const yearMonth = now.toISOString().slice(0, 7).replace('-', ''); // 202404

  // Find highest sequence for this user this month
  const lastInvoice = await Invoice.findOne({
    where: {
      userId,
      invoiceNumber: {
        [require('sequelize').Op.like]: `INV-${yearMonth}-%`,
      },
    },
    order: [['createdAt', 'DESC']],
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format: INV-202404-0001
  return `INV-${yearMonth}-${String(sequence).padStart(4, '0')}`;
};

module.exports = {
  generateInvoiceNumber,
};
