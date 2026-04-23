// src/routes/v1/invoice.route.js
const express = require('express');
const {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceFilterSchema,
} = require('../../validators/invoice.validator');
const validateRequest = require('../../middleware/validateRequest');
const { authenticate } = require('../../middleware/auth.middleware');
const invoiceController = require('../../controllers/invoice.controller');

const router = express.Router();

// # Page 1
// GET /api/v1/invoices?page=1&limit=10

// # Page 2
// GET /api/v1/invoices?page=2&limit=10

// # With filters
// GET /api/v1/invoices?page=1&limit=10&status=validated&paymentStatus=paid

// POST /invoices - Create invoice
router.post(
  '/',
  authenticate,
  validateRequest(invoiceCreateSchema),
  invoiceController.create,
);

// GET /invoices - List all invoices
router.get(
  '/',
  authenticate,
  validateRequest(invoiceFilterSchema, 'query'),
  invoiceController.list,
);

// GET /invoices/:id - Get single invoice
router.get('/:id', authenticate, invoiceController.getById);

// PUT /invoices/:id - Update invoice
router.put(
  '/:id',
  authenticate,
  validateRequest(invoiceUpdateSchema),
  invoiceController.update,
);

// DELETE /invoices/:id - Delete invoice
router.delete('/:id', authenticate, invoiceController.delete);

// POST /invoices/:id/firs - Submit to FIRS
router.post('/:id/firs', authenticate, invoiceController.submitToFirs);

// POST /invoices/:id/payment - Record payment
router.post(
  '/:id/payment',
  authenticate,
  validateRequest(
    require('../../validators/payment.schema').recordPaymentSchema,
  ),
  invoiceController.recordPayment,
);

module.exports = router;
