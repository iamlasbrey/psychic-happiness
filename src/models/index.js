// src/models/index.js
const User = require('./user.model');
const Customer = require('./customer.model');
const Invoice = require('./invoice.model');
const InvoiceLineItem = require('./InvoiceLineItem .model');
const AuditLog = require('./auditlog.model');

// ─── Define Associations ────────────────────────────────────────────────

// === User Associations ===
User.hasMany(Customer, {
  foreignKey: 'userId',
  as: 'customers',
  onDelete: 'CASCADE',
});

User.hasMany(Invoice, {
  foreignKey: 'userId',
  as: 'invoices',
  onDelete: 'CASCADE',
});

User.hasMany(InvoiceLineItem, {
  foreignKey: 'userId',
  as: 'invoiceLineItems',
  onDelete: 'CASCADE',
});

User.hasMany(AuditLog, {
  foreignKey: 'userId',
  as: 'auditLogs',
  onDelete: 'CASCADE',
});

// === Customer Associations ===
Customer.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
});

Customer.hasMany(Invoice, {
  foreignKey: 'customerId',
  as: 'invoices',
});

// === Invoice Associations ===
Invoice.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
});

Invoice.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
  allowNull: true,
});

Invoice.hasMany(InvoiceLineItem, {
  foreignKey: 'invoiceId',
  as: 'lineItems',
  onDelete: 'CASCADE',
});

Invoice.hasMany(AuditLog, {
  foreignKey: 'entityId',
  as: 'auditTrail',
  scope: { entityType: 'invoice' },
  constraints: false,
});

// === InvoiceLineItem Associations ===
InvoiceLineItem.belongsTo(Invoice, {
  foreignKey: 'invoiceId',
  as: 'invoice',
});

InvoiceLineItem.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
});

// === AuditLog Associations ===
AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'actor',
});

// ─── Export All Models ─────────────────────────────────────────────────

module.exports = {
  User,
  Customer,
  Invoice,
  InvoiceLineItem,
  AuditLog,
};
