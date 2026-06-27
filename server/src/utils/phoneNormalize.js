const normalizePhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, '');

  // 2. Handle cases starting with '234'
  if (cleaned.startsWith('234')) {
    if (cleaned.length === 13) {
      return `+${cleaned}`;
    }
  }

  // 3. Handle cases starting with '0'
  if (cleaned.startsWith('0')) {
    return `+234${cleaned.substring(1)}`;
  }

  if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }

  // If it doesn't match standard formats, return the original or throw an error
  return `+${cleaned}`;
};

module.exports = { normalizePhoneNumber };
