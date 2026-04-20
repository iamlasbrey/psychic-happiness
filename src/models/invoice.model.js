// src/models/invoice.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Invoice extends Model {}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: 'idx_user_invoice_number',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
    },

    // Core Invoice Info
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: 'idx_user_invoice_number',
    },
    firsIRN: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'FIRS Invoice Reference Number',
    },
    qrCodeUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    firsStatus: {
      type: DataTypes.ENUM('pending', 'submitted', 'validated', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    firsErrorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error details from FIRS API if validation failed',
    },
    lastFirsAttempt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time we tried to validate with FIRS',
    },
    firsRetryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    // Amount Breakdown (Important for FIRS)
    subTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    vatAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    // Payment Information
    paymentMeansCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '10', // 10 = Cash (FIRS standard)
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'online'),
      allowNull: false,
      defaultValue: 'cash',
    },
    paymentLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      allowNull: false,
      defaultValue: 'unpaid',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When payment was confirmed',
    },

    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'invoiceNumber'],
        name: 'idx_user_invoice_number',
      },
    ],
  },
);

module.exports = Invoice;
