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
      type: DataTypes.ENUM('pending', 'validated', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
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
      type: DataTypes.ENUM('unpaid', 'paid', 'overdue'),
      allowNull: false,
      defaultValue: 'unpaid',
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
    paranoid: true, // Allow soft delete of invoices if needed
  },
);

module.exports = Invoice;
