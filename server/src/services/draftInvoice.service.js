// src/services/draftInvoice.service.js
const { DraftInvoice } = require('../models');
const logger = require('../config/logger');

const createDraft = async (userId, parsedData, originalMessage) => {
  try {
    logger.debug('Creating draft', {
      userId,
      itemCount: parsedData.items.length,
    });

    const draft = await DraftInvoice.create({
      userId,
      customerName: parsedData.customerName,
      customerPhone: parsedData.customerPhone,
      items: parsedData.items, // Store as JSON
      subTotal: parsedData.subTotal,
      rawMessage: originalMessage,
      status: 'pending_confirmation',
    });

    logger.info('Draft created', { draftId: draft.id, userId });
    return draft;
  } catch (error) {
    logger.error('Error creating draft', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const confirmDraft = async (userId, draftId) => {
  try {
    logger.debug('Confirming draft', { userId, draftId });
    const draft = await DraftInvoice.findOne({
      where: { id: draftId, userId, status: 'pending_confirmation' },
    });

    if (!draft) {
      const error = new Error('Draft not found or already confirmed');
      error.statusCode = 404;
      throw error;
    }

    draft.status = 'confirmed';
    await draft.save();

    return draft;
  } catch (error) {
    logger.error('Failed to confirm draft', {
      userId,
      draftId,
      error: error.message,
    });
    throw error;
  }
};

const rejectDraft = async (userId, draftId) => {
  try {
    logger.debug('Rejecting draft', { userId, draftId });
    const draft = await DraftInvoice.findOne({
      where: { id: draftId, userId, status: 'pending_confirmation' },
    });

    if (!draft) {
      logger.warn('Draft not found for rejection', { userId, draftId });
      const error = new Error('Draft not found');
      error.statusCode = 404;
      throw error;
    }

    draft.status = 'rejected';
    await draft.save();

    logger.info('Draft rejected', { draftId: draft.id });

    return draft;
  } catch (error) {
    logger.info('Draft rejected', { userId, draftId });
    throw error;
  }
};

module.exports = {
  createDraft,
  confirmDraft,
  rejectDraft,
};
