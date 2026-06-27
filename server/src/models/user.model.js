// src/models/user.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^(\+234|0)[789]\d{9}$/,
      },
    },
    businessName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    businessRegistrationNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: 'compositeIndex',
    },
    tin: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: 'compositeIndex',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['phoneNumber'], name: 'idx_phoneNumber' },
      { fields: ['createdAt'], name: 'idx_createdAt' },
    ],
  },
);

module.exports = User;
