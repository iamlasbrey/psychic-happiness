// src/models/customer.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Customer extends Model {}

Customer.init(
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
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 150],
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        customValidator(value) {
          if (!value) throw new Error('Phone number is required');
          if (!/^(0|234)[0-9]{10}$|^\+234[0-9]{10}$/.test(value)) {
            throw new Error(
              'Phone must be 09012345678, 2348012345678, or +2348012345678',
            );
          }
        },
      },
    },
    businessName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'For B2B customers, their business name',
    },
    businessRegistration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'TIN or CAC number if registered',
    },
    type: {
      type: DataTypes.ENUM('individual', 'business'),
      allowNull: false,
      defaultValue: 'individual',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isFrequent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    paranoid: false, // Usually no need to soft delete customers
  },
);

module.exports = Customer;
