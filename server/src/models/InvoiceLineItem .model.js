// src/models/invoicelineitem.model.js
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
      allowNull: false,
      references: {
        model: 'invoices',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0,
      },
    },
  },
  {
    sequelize,
    modelName: 'InvoiceLineItem',
    tableName: 'invoice_line_items',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        fields: ['invoiceId'],
        name: 'idx_invoiceId',
      },
      {
        fields: ['userId'],
        name: 'idx_userId',
      },
    ],
  },
);

module.exports = InvoiceLineItem;
