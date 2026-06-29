// src/services/invoice.service.js
const { Invoice, InvoiceLineItem, Customer, AuditLog } = require('../models');
const { Op } = require('sequelize');
const { generateInvoiceNumber } = require('./../utils/generateInvoice');
const logger = require('../config/logger');
// src/services/invoice.service.js - createInvoice function

const createInvoice = async (userId, invoiceData) => {
  try {
    logger.info('Creating invoice', {
      userId,
      itemCount: invoiceData.items?.length || 0,
    });

    const {
      invoiceNumber: providedInvoiceNumber,
      customerPhone,
      customerName,
      customerId,
      dueDate,
      subTotal,
      paymentMethod,
      paymentLink,
      notes,
      description, // user-provided description (optional)
      items,
    } = invoiceData;

    // Build description from items if not provided
    const invoiceDescription =
      description ||
      (items && items.length > 0
        ? items
            .map((item) => item.description)
            .filter(Boolean)
            .join(', ')
        : null);

    const numSubTotal = parseFloat(subTotal);
    const VAT_RATE = 0.075;
    const vatAmount = parseFloat((numSubTotal * VAT_RATE).toFixed(2));
    const totalAmount = parseFloat((numSubTotal + vatAmount).toFixed(2));

    const issueDate = new Date().toISOString().split('T')[0];
    const resolvedDueDate = dueDate
      ? new Date(dueDate).toISOString().split('T')[0]
      : issueDate;

    let resolvedCustomerId = customerId;
    let resolvedCustomer = null;

    if (!customerId && (customerPhone || customerName)) {
      let customer = null;

      if (customerPhone) {
        customer = await Customer.findOne({
          where: { userId, customerPhone },
        });
      }

      if (!customer) {
        customer = await Customer.create({
          userId,
          name: customerName || 'One-time Customer',
          customerPhone: customerPhone,
          type: 'individual',
        });
      }

      resolvedCustomerId = customer.id;
      resolvedCustomer = customer;
    }

    let invoiceNumber = providedInvoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(userId);
    }

    const existingInvoice = await Invoice.findOne({
      where: { userId, invoiceNumber },
    });

    if (existingInvoice) {
      const error = new Error('Invoice number already exists for this user');
      error.statusCode = 400;
      throw error;
    }

    const invoice = await Invoice.create({
      userId,
      customerId: resolvedCustomerId,
      customerName: customerName || resolvedCustomer?.name,
      customerPhone: customerPhone || resolvedCustomer?.customerPhone,
      invoiceNumber,
      description: invoiceDescription, // ← now it's the text, not a number
      issueDate,
      dueDate: resolvedDueDate,
      subTotal,
      vatAmount,
      totalAmount,
      paymentMethod,
      paymentLink,
      notes,
      firsRetryCount: 0,
      firsStatus: 'pending',
    });

    // Create line items
    if (items && Array.isArray(items) && items.length > 0) {
      const { InvoiceLineItem } = require('../models');

      await InvoiceLineItem.bulkCreate(
        items.map((item) => ({
          invoiceId: invoice.id,
          userId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      );

      logger.info('Line items created', { count: items.length });
    }

    await AuditLog.create({
      userId,
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'create',
      status: 'success',
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.totalAmount,
        itemCount: items?.length || 0,
      },
    });

    logger.info('Invoice created successfully', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    });

    return invoice;
  } catch (error) {
    logger.error('Invoice creation error:', {
      error: error.original?.sqlMessage || error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const listInvoices = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, q } = options;
    const offset = (page - 1) * limit;

    const where = { userId };

    if (q && q.trim()) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${q}%` } }, // ✅ CHANGED: iLike → like
        { customerName: { [Op.like]: `%${q}%` } },
        { customerPhone: { [Op.like]: `%${q}%` } },
      ];
    }

    if (status) {
      where.firsStatus = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    logger.debug('Listing invoices', {
      userId,
      q,
      status,
      paymentStatus,
      page,
    });

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: ['customer'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    logger.info('Invoices retrieved', { userId, count, page, searchQuery: q });
    return {
      invoices: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

const getInvoiceById = async (userId, invoiceId) => {
  try {
    logger.debug('Getting invoice', { userId, invoiceId });
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
      include: ['customer', 'lineItems', 'auditTrail'],
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    return invoice;
  } catch (error) {
    logger.error('Failed to get invoice', {
      userId,
      invoiceId,
      error: error.message,
    });
    throw error;
  }
};

const updateInvoice = async (userId, invoiceId, updates) => {
  try {
    logger.info('Updating invoice', { userId, invoiceId });
    const restrictedFields = ['customerName', 'customerPhone', 'customerId'];
    const attemptedRestricted = restrictedFields.filter(
      (field) => field in updates,
    );

    if (attemptedRestricted.length > 0) {
      const error = new Error(
        `Cannot update customer details: ${attemptedRestricted.join(', ')}. Customer info is locked after invoice creation.`,
      );
      error.statusCode = 400;
      throw error;
    }

    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      logger.warn('Invoice not found for update', { userId, invoiceId });
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    // Don't allow updates if already validated with FIRS
    if (invoice.firsStatus === 'validated') {
      logger.warn('Attempted to update validated invoice', {
        userId,
        invoiceId,
      });
      const error = new Error(
        'Cannot update invoice that has been validated by FIRS',
      );
      error.statusCode = 400;
      throw error;
    }

    const before = invoice.toJSON();
    await invoice.update(updates);
    const after = invoice.toJSON();

    // Track changes
    const changes = {};
    Object.keys(updates).forEach((key) => {
      if (before[key] !== after[key]) {
        changes[key] = { before: before[key], after: after[key] };
      }
    });

    // Log to audit
    await AuditLog.create({
      userId,
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'update',
      changes,
      status: 'success',
      metadata: {
        restrictedFieldsAttempted:
          attemptedRestricted.length > 0 ? attemptedRestricted : null,
      },
    });
    logger.info('Invoice updated successfully', { userId, invoiceId });
    return invoice;
  } catch (error) {
    logger.error('Failed to update invoice', {
      userId,
      invoiceId,
      error: error.message,
    });
    throw error;
  }
};

const deleteInvoice = async (userId, invoiceId) => {
  try {
    logger.info('Deleting invoice', { userId, invoiceId });
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      logger.warn('Invoice not found for delete', { userId, invoiceId });
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    await invoice.destroy();

    // Log to audit
    await AuditLog.create({
      userId,
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'delete',
      status: 'success',
    });
    logger.info('Invoice deleted successfully', { userId, invoiceId });
  } catch (error) {
    logger.error('Failed to delete invoice', {
      userId,
      invoiceId,
      error: error.message,
    });
    throw error;
  }
};

const submitToFirs = async (userId, invoiceId) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    // Update attempt tracking
    invoice.lastFirsAttempt = new Date();
    invoice.firsRetryCount += 1;
    invoice.firsStatus = 'submitted';
    await invoice.save();

    // TODO: Call actual FIRS API here
    // const firsResponse = await callFirsApi(invoice);
    // invoice.firsIRN = firsResponse.irn;
    // invoice.qrCodeUrl = firsResponse.qrCode;
    // invoice.firsStatus = 'validated';
    // await invoice.save();

    // Log to audit
    await AuditLog.create({
      userId,
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'firs_submit',
      status: 'success',
      metadata: {
        retryCount: invoice.firsRetryCount,
      },
    });

    return invoice;
  } catch (error) {
    logger.error('Failed to submit invoice to FIRS', {
      userId,
      invoiceId,
      error: error.message,
    });
    // Log failed attempt
    await AuditLog.create({
      userId,
      entityType: 'invoice',
      entityId: invoiceId,
      action: 'firs_submit',
      status: 'failed',
      errorMessage: error.message,
    });

    throw error;
  }
};

const recordPayment = async (userId, invoiceId, amount, method) => {
  try {
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, userId },
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    if (amount <= 0) {
      const error = new Error('Payment amount must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    invoice.paymentStatus = 'paid';
    invoice.paidAt = new Date();
    await invoice.save();

    // Log to audit
    await AuditLog.create({
      userId,
      entityType: 'payment',
      entityId: invoiceId,
      action: 'payment_received',
      status: 'success',
      metadata: {
        amount,
        method,
        timestamp: new Date(),
      },
    });

    return invoice;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  submitToFirs,
  recordPayment,
};
