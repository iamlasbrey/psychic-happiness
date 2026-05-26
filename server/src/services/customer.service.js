// src/controllers/customer.controller.js
const { Customer, User } = require('../models');

// Create customer
const create = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming auth middleware sets this

    const customer = await Customer.create({
      userId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// List all customers for a user
const list = async (req, res) => {
  try {
    const { userId } = req.user;

    const customers = await Customer.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single customer
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const customer = await Customer.findOne({
      where: { id, userId },
      include: ['invoices'],
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update customer
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const customer = await Customer.findOne({
      where: { id, userId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    await customer.update(req.body);

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete customer
const delete_customer = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const customer = await Customer.findOne({
      where: { id, userId },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  create,
  list,
  getById,
  update,
  delete: delete_customer,
};
