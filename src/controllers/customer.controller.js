const beneficiaryService = require('../services/beneficiary.service');
const logger = require('../utils/logger');

const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body, req.user.id);

    return res.status(201).json({
      success: true,
      message: 'Beneficiary created',
      data: beneficiary,
    });
  } catch (err) {
    logger.error('createBeneficiary error', { err });
    next(err);
  }
};

module.exports = {
  createCustomer,
};
