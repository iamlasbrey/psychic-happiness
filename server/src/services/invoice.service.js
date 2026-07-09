const { Invoice, InvoiceLineItem, Customer, AuditLog } = require('../models');
const { Op } = require('sequelize');
const { generateInvoiceNumber } = require('./../utils/generateInvoice');
const logger = require('../config/logger');
const Sequelize = require('sequelize');
const { withTimeout, isTimeoutError } = require('../utils/timeoutUtil');
const DB_QUERY_TIMEOUT = 30000;

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
      description,
      items,
    } = invoiceData;

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
        // ✅ CHANGED: Wrap with timeout
        customer = await withTimeout(
          Customer.findOne({
            where: { userId, customerPhone },
          }),
          DB_QUERY_TIMEOUT,
          'Find customer by phone',
        );
      }

      if (!customer) {
        // ✅ CHANGED: Wrap with timeout
        customer = await withTimeout(
          Customer.create({
            userId,
            name: customerName || 'One-time Customer',
            customerPhone: customerPhone,
            type: 'individual',
          }),
          DB_QUERY_TIMEOUT,
          'Create customer',
        );
      }

      resolvedCustomerId = customer.id;
      resolvedCustomer = customer;
    }

    let invoiceNumber = providedInvoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(userId);
    }

    // ✅ CHANGED: Wrap with timeout
    const existingInvoice = await withTimeout(
      Invoice.findOne({
        where: { userId, invoiceNumber },
      }),
      DB_QUERY_TIMEOUT,
      'Check existing invoice',
    );

    if (existingInvoice) {
      const error = new Error('Invoice number already exists for this user');
      error.statusCode = 400;
      throw error;
    }

    // ✅ CHANGED: Wrap with timeout
    const invoice = await withTimeout(
      Invoice.create({
        userId,
        customerId: resolvedCustomerId,
        customerName: customerName || resolvedCustomer?.name,
        customerPhone: customerPhone || resolvedCustomer?.customerPhone,
        invoiceNumber,
        description: invoiceDescription,
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
      }),
      DB_QUERY_TIMEOUT,
      'Create invoice',
    );

    // Create line items
    if (items && Array.isArray(items) && items.length > 0) {
      const { InvoiceLineItem } = require('../models');

      // ✅ CHANGED: Wrap with timeout
      await withTimeout(
        InvoiceLineItem.bulkCreate(
          items.map((item) => ({
            invoiceId: invoice.id,
            userId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        ),
        DB_QUERY_TIMEOUT,
        'Bulk create line items',
      );

      logger.info('Line items created', { count: items.length });
    }

    // ✅ CHANGED: Wrap with timeout
    await withTimeout(
      AuditLog.create({
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
      }),
      DB_QUERY_TIMEOUT,
      'Create audit log',
    );

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

    // ✅ Optimized search logic for MySQL
    if (q && q.trim()) {
      const searchTerm = q.trim();

      // Fast path 1: Exact invoice number match (uses index)
      if (/^INV-/.test(searchTerm)) {
        const exact = await Invoice.findOne({
          where: { userId, invoiceNumber: searchTerm },
          attributes: ['id'],
        });
        if (exact) {
          where.id = exact.id; // Bypass LIKE entirely
        }
      }

      // Fast path 2: Numeric search → likely phone or amount
      if (/^\d+$/.test(searchTerm)) {
        where[Op.or] = [
          { customerPhone: searchTerm }, // Exact match, uses index if available
          { totalAmount: searchTerm }, // If searching by amount
        ];
      }

      // Fallback: LIKE search (still slow, but filtered by userId)
      if (!where.id && !where[Op.or]) {
        where[Op.or] = [
          { invoiceNumber: { [Op.like]: `%${searchTerm}%` } },
          { customerName: { [Op.like]: `%${searchTerm}%` } },
          // Skip customerPhone LIKE if rarely searched
        ];
      }
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

    // ✅ CHANGED: Wrap with timeout
    const { count, rows } = await withTimeout(
      Invoice.findAndCountAll({
        where,
        include: ['customer'],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      }),
      DB_QUERY_TIMEOUT,
      'List invoices',
    );

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
    logger.error('Invoice list error:', {
      error: error.message,
    });
    throw error;
  }
};

const getInvoiceById = async (userId, invoiceId) => {
  try {
    logger.debug('Getting invoice', { userId, invoiceId });

    // ✅ CHANGED: Wrap with timeout
    const invoice = await withTimeout(
      Invoice.findOne({
        where: { id: invoiceId, userId },
        include: ['customer', 'lineItems', 'auditTrail'],
      }),
      DB_QUERY_TIMEOUT,
      'Get invoice by ID',
    );

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

    // ✅ CHANGED: Wrap with timeout
    const invoice = await withTimeout(
      Invoice.findOne({
        where: { id: invoiceId, userId },
      }),
      DB_QUERY_TIMEOUT,
      'Find invoice for update',
    );

    if (!invoice) {
      logger.warn('Invoice not found for update', { userId, invoiceId });
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

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

    const changes = {};
    Object.keys(updates).forEach((key) => {
      if (before[key] !== after[key]) {
        changes[key] = { before: before[key], after: after[key] };
      }
    });

    // ✅ CHANGED: Wrap with timeout
    await withTimeout(
      AuditLog.create({
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
      }),
      DB_QUERY_TIMEOUT,
      'Create update audit log',
    );

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

    // ✅ CHANGED: Wrap with timeout
    const invoice = await withTimeout(
      Invoice.findOne({
        where: { id: invoiceId, userId },
      }),
      DB_QUERY_TIMEOUT,
      'Find invoice for delete',
    );

    if (!invoice) {
      logger.warn('Invoice not found for delete', { userId, invoiceId });
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    await invoice.destroy();

    // ✅ CHANGED: Wrap with timeout
    await withTimeout(
      AuditLog.create({
        userId,
        entityType: 'invoice',
        entityId: invoiceId,
        action: 'delete',
        status: 'success',
      }),
      DB_QUERY_TIMEOUT,
      'Create delete audit log',
    );

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
    // ✅ CHANGED: Wrap with timeout
    const invoice = await withTimeout(
      Invoice.findOne({
        where: { id: invoiceId, userId },
      }),
      DB_QUERY_TIMEOUT,
      'Find invoice for FIRS submission',
    );

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    invoice.lastFirsAttempt = new Date();
    invoice.firsRetryCount += 1;
    invoice.firsStatus = 'submitted';
    await invoice.save();

    // TODO: Call actual FIRS API here

    // ✅ CHANGED: Wrap with timeout
    await withTimeout(
      AuditLog.create({
        userId,
        entityType: 'invoice',
        entityId: invoiceId,
        action: 'firs_submit',
        status: 'success',
        metadata: {
          retryCount: invoice.firsRetryCount,
        },
      }),
      DB_QUERY_TIMEOUT,
      'Create FIRS submission audit log',
    );

    return invoice;
  } catch (error) {
    logger.error('Failed to submit invoice to FIRS', {
      userId,
      invoiceId,
      error: error.message,
    });

    try {
      // ✅ CHANGED: Wrap with timeout
      await withTimeout(
        AuditLog.create({
          userId,
          entityType: 'invoice',
          entityId: invoiceId,
          action: 'firs_submit',
          status: 'failed',
          errorMessage: error.message,
        }),
        DB_QUERY_TIMEOUT,
        'Create FIRS submission failure log',
      );
    } catch (auditError) {
      logger.error('Failed to log FIRS submission error', {
        userId,
        invoiceId,
        error: auditError.message,
      });
    }

    throw error;
  }
};

const recordPayment = async (userId, invoiceId, amount, method) => {
  try {
    // ✅ CHANGED: Wrap with timeout
    const invoice = await withTimeout(
      Invoice.findOne({
        where: { id: invoiceId, userId },
      }),
      DB_QUERY_TIMEOUT,
      'Find invoice for payment',
    );

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

    // ✅ CHANGED: Wrap with timeout
    await withTimeout(
      AuditLog.create({
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
      }),
      DB_QUERY_TIMEOUT,
      'Create payment audit log',
    );

    return invoice;
  } catch (error) {
    logger.error('Record payment error:', {
      userId,
      invoiceId,
      error: error.message,
    });
    throw error;
  }
};

const getInvoiceStats = async (userId) => {
  try {
    logger.debug('Fetching invoice stats', { userId });

    const now = new Date();
    // ✅ Use UTC consistently to avoid timezone drift
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
    );
    const startOfLastMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );
    const endOfLastMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
    );

    // ✅ Use Sequelize.where + Sequelize.fn for safe parameterized queries
    const result = await withTimeout(
      Invoice.findOne({
        where: { userId },
        attributes: [
          // Total invoices
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalInvoices'],

          // Pending amount: SUM where paymentStatus = 'unpaid'
          [
            Sequelize.fn(
              'SUM',
              Sequelize.fn(
                'IF',
                Sequelize.where(Sequelize.col('paymentStatus'), 'unpaid'),
                Sequelize.col('totalAmount'),
                0,
              ),
            ),
            'pendingAmount',
          ],

          // Paid this month: SUM where paid AND paidAt in range
          [
            Sequelize.fn(
              'SUM',
              Sequelize.fn(
                'IF',
                Sequelize.and(
                  Sequelize.where(Sequelize.col('paymentStatus'), 'paid'),
                  Sequelize.where(Sequelize.col('paidAt'), '>=', startOfMonth),
                  Sequelize.where(Sequelize.col('paidAt'), '<=', endOfMonth),
                ),
                Sequelize.col('totalAmount'),
                0,
              ),
            ),
            'paidThisMonth',
          ],

          // Count this month: COUNT where createdAt in range
          [
            Sequelize.fn(
              'COUNT',
              Sequelize.fn(
                'IF',
                Sequelize.and(
                  Sequelize.where(
                    Sequelize.col('createdAt'),
                    '>=',
                    startOfMonth,
                  ),
                  Sequelize.where(Sequelize.col('createdAt'), '<=', endOfMonth),
                ),
                1,
                null,
              ),
            ),
            'thisMonthCount',
          ],

          // Count last month: COUNT where createdAt in range
          [
            Sequelize.fn(
              'COUNT',
              Sequelize.fn(
                'IF',
                Sequelize.and(
                  Sequelize.where(
                    Sequelize.col('createdAt'),
                    '>=',
                    startOfLastMonth,
                  ),
                  Sequelize.where(
                    Sequelize.col('createdAt'),
                    '<=',
                    endOfLastMonth,
                  ),
                ),
                1,
                null,
              ),
            ),
            'lastMonthCount',
          ],
        ],
        raw: true,
      }),
      DB_QUERY_TIMEOUT, // ✅ Use tiered timeout
      'Invoice stats aggregation',
    );

    const data = result || {};

    // ✅ Defensive coercion + rounding
    const totalInvoices = Number(data.totalInvoices) || 0;
    const pendingAmount = parseFloat(
      (Number(data.pendingAmount) || 0).toFixed(2),
    );
    const paidThisMonth = parseFloat(
      (Number(data.paidThisMonth) || 0).toFixed(2),
    );
    const thisMonthCount = Number(data.thisMonthCount) || 0;
    const lastMonthCount = Number(data.lastMonthCount) || 0;

    // ✅ Safe growth calculation
    const growthPercentage =
      lastMonthCount === 0
        ? thisMonthCount > 0
          ? 100
          : 0
        : parseFloat(
            (
              ((thisMonthCount - lastMonthCount) / lastMonthCount) *
              100
            ).toFixed(1),
          );

    logger.info('Invoice stats retrieved', {
      userId,
      totalInvoices,
      pendingAmount,
      paidThisMonth,
      growthPercentage,
    });

    return {
      totalInvoices,
      pendingAmount,
      paidThisMonth,
      growthPercentage,
    };
  } catch (error) {
    // ✅ Distinguish timeout vs genuine error
    if (isTimeoutError(error)) {
      logger.warn('Stats query timed out (retryable)', {
        userId,
        operation: error.operationName,
        timeoutMs: error.timeoutMs,
      });
    } else {
      logger.error('Error fetching invoice stats', {
        userId,
        error: error.original?.sqlMessage || error.message,
        stack: error.stack,
      });
    }
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
  getInvoiceStats,
};
