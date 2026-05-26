// src/schemas/auditlog.schema.js
const Joi = require('joi');

const auditLogFilterSchema = Joi.object({
  entityType: Joi.string()
    .valid('invoice', 'customer', 'payment', 'user', 'settings')
    .optional(),
  action: Joi.string()
    .valid(
      'create',
      'update',
      'delete',
      'restore',
      'view',
      'export',
      'firs_submit',
      'firs_retry',
      'payment_received',
    )
    .optional(),
  status: Joi.string().valid('success', 'failed', 'warning').optional(),
  source: Joi.string().valid('web', 'whatsapp', 'api', 'system').optional(),
  entityId: Joi.string().uuid().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  page: Joi.number().min(1).optional().default(1),
  limit: Joi.number().min(1).max(100).optional().default(20),
});

module.exports = {
  auditLogFilterSchema,
};
