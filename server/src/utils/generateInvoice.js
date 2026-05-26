// src/services/invoiceNumber.service.js
const generateInvoiceNumber = async (userId) => {
  const now = new Date();
  const timestamp = now.getTime();
  const randomNum = Math.floor(Math.random() * 10000);
  const userIdShort = userId.slice(0, 8);

  // Format: INV-{userIdShort}-{timestamp}-{randomNum}
  return `INV-${userIdShort}-${timestamp}-${String(randomNum).padStart(4, '0')}`;
};

module.exports = {
  generateInvoiceNumber,
};
