// src/models/index.js
const User = require('./user.model');
const Customer = require('./customer.model');
const Invoice = require('./invoice.model');

// ─── Define Associations ────────────────────────────────────────────────

// === User Associations ===
User.hasMany(Customer, {
  foreignKey: 'userId',
  as: 'customers', // A business owner can have many customers
  onDelete: 'CASCADE',
});

User.hasMany(Invoice, {
  foreignKey: 'userId',
  as: 'invoices', // A business owner can have many invoices
  onDelete: 'CASCADE',
});

// === Customer Associations ===
Customer.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner', // Each customer belongs to one business owner
});

Customer.hasMany(Invoice, {
  foreignKey: 'customerId',
  as: 'invoices', // One customer can have multiple invoices
});

// === Invoice Associations ===
Invoice.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner', // Each invoice belongs to one business owner
});

Invoice.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer', // Each invoice can be linked to a saved customer
  allowNull: true,
});

// Optional: If you later add InvoiceItem (line items), you can add here
// User.hasMany(InvoiceItem, { foreignKey: 'userId', as: 'invoiceItems' });
// Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
// InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// ─── Export All Models ─────────────────────────────────────────────────

module.exports = {
  User,
  Customer,
  Invoice,
  // Add more models here as you create them (e.g. InvoiceItem later)
};
