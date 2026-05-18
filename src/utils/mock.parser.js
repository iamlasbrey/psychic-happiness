// src/services/mockMessageParser.service.js

const mockResponses = {
  success: {
    customerName: 'Jack Bauer' || null, // Optional
    customerPhone: '+2348012345611',
    items: [
      {
        description: 'iPhone 15 Pro',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000,
      },
      {
        description: 'Phone Case',
        quantity: 2,
        unitPrice: 7500,
        amount: 15000,
      },
    ],
    subTotal: 65000,
  },
  fail: { success: false, error: 'Mock parsing failed' },
};

const mockparseInvoiceFromAI = async (messageBody) => {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 600));

  // Return fail if message is too short or contains "error"
  if (
    !messageBody ||
    messageBody.length < 5 ||
    messageBody.toLowerCase().includes('error')
  ) {
    return mockResponses.fail;
  }

  // Return success with mock data
  return { success: true, data: mockResponses.success };
};

module.exports = {
  mockparseInvoiceFromAI,
};
