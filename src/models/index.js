// src/models/index.js
const User = require('./user.model');
// const Vault = require('./vault.model');
// const Witness = require('./witness.model');
// const Beneficiary = require('./beneficiary.model');
// const CheckIn = require('./checkin.model');
// const AuditLog = require('./auditlog.model');

// ─── Associations ────────────────────────────────────────────────

// User → Vault entries (one user, many vault items)
// User.hasMany(Vault, { foreignKey: 'userId', as: 'vaultEntries' });
// Vault.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

// // User → Witnesses (one user, up to 2 witnesses enforced at app layer)
// User.hasMany(Witness, { foreignKey: 'userId', as: 'witnesses' });
// Witness.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// // User → Beneficiaries (one user, one or more beneficiaries)
// User.hasMany(Beneficiary, { foreignKey: 'userId', as: 'beneficiaries' });
// Beneficiary.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// // User → CheckIns (full history of ping attempts)
// User.hasMany(CheckIn, { foreignKey: 'userId', as: 'checkins' });
// CheckIn.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// // User → AuditLogs
// User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
// AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ─── Exports ─────────────────────────────────────────────────────

module.exports = {
  User,
  // Vault,
};
