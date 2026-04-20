// src/models/auditlog.model.js
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AuditLog extends Model {}

AuditLog.init(
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
      index: true,
      comment: 'User who performed the action',
    },
    entityType: {
      type: DataTypes.ENUM(
        'invoice',
        'customer',
        'payment',
        'user',
        'settings',
      ),
      allowNull: false,
      comment: 'What entity was affected',
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID of the affected entity',
    },
    action: {
      type: DataTypes.ENUM(
        'create',
        'update',
        'delete',
        'restore',
        'view',
        'export',
        'firs_submit',
        'firs_retry',
        'payment_received',
      ),
      allowNull: false,
      comment: 'What action was performed',
    },
    changes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Object containing {field: {before, after}} for updates',
      example: { subTotal: { before: 50000, after: 55000 } },
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional context (IP, user agent, error details, etc)',
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'warning'),
      allowNull: false,
      defaultValue: 'success',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'If status is failed, what went wrong',
    },
    source: {
      type: DataTypes.ENUM('web', 'whatsapp', 'api', 'system'),
      allowNull: false,
      defaultValue: 'web',
      comment: 'Where the action came from',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IPv4 or IPv6 address',
    },
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    paranoid: false, // Never soft-delete audit logs
    updatedAt: false, // Audit logs should never be updated, only created
    indexes: [
      {
        fields: ['userId', 'createdAt'],
        name: 'idx_user_audit_timeline',
      },
      {
        fields: ['entityType', 'entityId'],
        name: 'idx_entity_audit',
      },
      {
        fields: ['action'],
        name: 'idx_audit_action',
      },
      {
        fields: ['createdAt'],
        name: 'idx_audit_date',
      },
    ],
  },
);

module.exports = AuditLog;
