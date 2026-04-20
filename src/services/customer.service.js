const crypto = require('crypto');
const { Customer } = require('../models');

const createBeneficiary = async (
  userId,
  { name, email, phone, relationship, vaultAccessScope },
) => {
  return Customer.create({
    id: crypto.randomUUID(),
    userId,
    name,
    email,
    phone: phone || null,
    relationship: relationship || null,
    vaultAccessScope: vaultAccessScope || null,
  });
};

module.exports = {
  createCustomer,
};
