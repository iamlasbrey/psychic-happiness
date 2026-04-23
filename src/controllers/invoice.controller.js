// src/controllers/invoice.controller.js
const invoiceService = require('../services/invoice.service');

const create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await invoiceService.createInvoice(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, paymentStatus } = req.query;

    const result = await invoiceService.listInvoices(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      paymentStatus,
    });

    res.json({
      success: true,
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invoice = await invoiceService.getInvoiceById(userId, id);
    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const invoice = await invoiceService.updateInvoice(userId, id, req.body);
    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await invoiceService.deleteInvoice(userId, id);
    res.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const submitToFirs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await invoiceService.submitToFirs(userId, id);
    res.json({
      success: true,
      message: 'Invoice submitted to FIRS',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { amount, method } = req.body;

    const invoice = await invoiceService.recordPayment(
      userId,
      id,
      amount,
      method,
    );
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  delete: deleteInvoice,
  submitToFirs,
  recordPayment,
};
