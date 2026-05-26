// src/services/invoiceValidator.service.js

const validateInvoiceMath = (data) => {
  const errors = [];

  //  Validate each item: qty × unitPrice == amount
  data.items.forEach((item, i) => {
    const calculated = parseFloat((item.quantity * item.unitPrice).toFixed(2));
    if (calculated !== item.amount) {
      errors.push(
        `items[${i}]: ${item.quantity} × ${item.unitPrice} = ${calculated}, not ${item.amount}`,
      );
    }

    // Check for negative values
    if (item.quantity < 0) {
      errors.push(`items[${i}].quantity cannot be negative`);
    }
    if (item.unitPrice < 0) {
      errors.push(`items[${i}].unitPrice cannot be negative`);
    }
    if (item.amount < 0) {
      errors.push(`items[${i}].amount cannot be negative`);
    }
  });

  // Validate subtotal matches sum of items
  const calculatedSubtotal = parseFloat(
    data.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2),
  );
  if (calculatedSubtotal !== data.subTotal) {
    errors.push(
      `subTotal mismatch: items sum to ${calculatedSubtotal}, not ${data.subTotal}`,
    );
  }

  // Normalize phone to +234 format
  let normalizedPhone = data.customerPhone?.trim();
  if (normalizedPhone) {
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+234' + normalizedPhone.slice(1);
    } else if (!normalizedPhone.startsWith('+234')) {
      errors.push(`customerPhone must start with +234 or 0`);
    }
    data.customerPhone = normalizedPhone;
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
    data, // Return cleaned data
  };
};

module.exports = {
  validateInvoiceMath,
};
