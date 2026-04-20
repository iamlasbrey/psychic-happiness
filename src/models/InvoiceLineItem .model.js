const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class InvoiceLineItem extends Model {}

InvoiceLineItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    invoiceId: {
      type: DataTypes.UUID,
      references: { model: 'invoices', key: 'id' },
    },
    description: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  },
  { sequelize, modelName: 'InvoiceLineItem', tableName: 'invoice_line_items' },
);
