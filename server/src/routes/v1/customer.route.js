// src/routes/v1/customer.route.js
const express = require('express');
const {
  customerCreateSchema,
  customerUpdateSchema,
} = require('../../validators/customer.validator');
const { authenticate } = require('../../middleware/auth.middleware');
const validateRequest = require('../../middleware/validateRequest');
const customerController = require('../../controllers/customer.controller');

const router = express.Router();

// POST /customers - Create customer
router.post(
  '/',
  authenticate,
  validateRequest(customerCreateSchema),
  customerController.create,
);

// GET /customers - List all customers
router.get('/', authenticate, customerController.list);

// GET /customers/:id - Get single customer
router.get('/:id', authenticate, customerController.getById);

// PUT /customers/:id - Update customer
router.put(
  '/:id',
  authenticate,
  validateRequest(customerUpdateSchema),
  customerController.update,
);

// DELETE /customers/:id - Delete customer
router.delete('/:id', authenticate, customerController.delete);

module.exports = router;
