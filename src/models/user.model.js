const { DataTypes, Model, Op } = require('sequelize');
const { sequelize } = require('../config/db');

class User extends Model {
  toJSON() {
    const values = super.toJSON();
    delete values.password;
    delete values.paystackSecretKey;
    delete values.flutterwaveSecretKey;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [2, 100],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    onboardingCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    whatsappNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        is: /^(\+234|0)[789]\d{9}$/,
      },
    },
    businessName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 150],
      },
    },
    tin: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    cacNumber: {
      type: DataTypes.STRING(30),
      allowNull: true,
      unique: true,
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    businessPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^(\+234|0)[789]\d{9}$/,
      },
    },
    preferredPaymentMethod: {
      type: DataTypes.ENUM('cash', 'bank_transfer', 'online'),
      allowNull: false,
      defaultValue: 'cash',
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^\d{10}$/,
      },
    },
    accountName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    paystackPublicKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paystackSecretKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    flutterwavePublicKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    flutterwaveSecretKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('free', 'basic', 'pro'),
      allowNull: false,
      defaultValue: 'free',
    },
    subscriptionExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    invoicesGeneratedThisMonth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalInvoicesGenerated: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    firsProviderApiKey: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      where: { isActive: true },
    },
    scopes: {
      withInactive: { where: {} },
      admins: { where: { role: 'admin' } },
      activeSubscribers: {
        where: {
          subscriptionExpiresAt: { [Op.gt]: new Date() },
        },
      },
    },
    indexes: [
      { unique: true, fields: ['whatsappNumber'] },
      { unique: true, fields: ['tin'] },
      { unique: true, fields: ['cacNumber'] },
      { fields: ['businessName'] },
      { fields: ['email'] },
      { fields: ['googleId'] },
    ],
  },
);

module.exports = User;
