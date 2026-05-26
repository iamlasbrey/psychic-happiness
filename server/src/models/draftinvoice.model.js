// src/models/draftinvoice.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class DraftInvoice extends Model {}

DraftInvoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customerName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    subTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    rawMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending_confirmation', 'confirmed', 'rejected'),
      allowNull: false,
      defaultValue: 'pending_confirmation',
    },
  },
  {
    sequelize,
    modelName: 'DraftInvoice',
    tableName: 'draft_invoices',
    timestamps: true,
    paranoid: true,
  },
);

module.exports = DraftInvoice;
