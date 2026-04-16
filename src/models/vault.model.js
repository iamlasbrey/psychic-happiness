// src/models/vault.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Vault extends Model {}

Vault.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },

    // Each vault entry is one "secret" the user wants to leave behind
    label: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'User-facing name e.g. "Bitcoin wallet", "Bank account details"',
    },
    category: {
      type: DataTypes.ENUM(
        'crypto',
        'banking',
        'password',
        'document',
        'message',
        'property',
        'insurance',
        'other',
      ),
      allowNull: false,
      defaultValue: 'other',
    },

    // The actual sensitive content — AES-256 encrypted at rest
    encryptedData: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'AES-256-GCM encrypted JSON blob of the asset details',
    },
    encryptionIv: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'Initialization vector used for AES encryption',
    },
    encryptionTag: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'GCM auth tag for tamper detection',
    },

    // Metadata (not encrypted — used for display/filtering)
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional plain-text hint visible to user only (not sensitive)',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    accessCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'How many times beneficiary has accessed this entry',
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Vault',
    tableName: 'vaults',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      where: { isActive: true },
    },
    scopes: {
      byCrypto: { where: { category: 'crypto' } },
      byUser: (userId) => ({ where: { userId } }),
    },
  },
);

module.exports = Vault;
