// src/services/aiMessageParser.service.js
const axios = require('axios');
const config = require('../config');
const { callWithFallback } = require('../utils/openrouter.util');
const { mockparseInvoiceFromAI } = require('../utils/mock.parser');

const AI_MODE = config.AI_MODE || 'openrouter'; // 'mock' | 'ollama' | 'openrouter'

console.log(`AI_MODE set to "${AI_MODE}"`); // Log the mode for debugging

// UPDATED: OpenRouter configuration
const OPENROUTER_API_URL =
  config.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = config.OPENROUTER_MODEL || 'qwen/qwen-turbo';

// ADDED: Headers for OpenRouter
const OPENROUTER_HEADERS = {
  Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
  'HTTP-Referer': config.AI_APP_URL || 'https://invoice-bot.com',
  'X-Title': config.AI_APP_NAME || 'Turbo Octo Tax',
  'Content-Type': 'application/json',
};

// UNCHANGED: Validation function
const validateInvoiceData = (data) => {
  const errors = [];

  if (!data.customerPhone?.trim()) errors.push('customerPhone required');
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items required');
  } else {
    data.items.forEach((item, i) => {
      if (!item.description?.trim())
        errors.push(`items[${i}].description required`);
      if (item.quantity <= 0) errors.push(`items[${i}].quantity > 0`);
      if (item.unitPrice <= 0) errors.push(`items[${i}].unitPrice > 0`);
    });
  }
  if (data.subTotal <= 0) errors.push('subTotal > 0');

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
  };
};

const parseInvoiceFromAI = async (messageBody) => {
  try {
    if (!config.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }

    if (!messageBody || typeof messageBody !== 'string') {
      return {
        success: false,
        error: 'messageBody must be a non-empty string',
      };
    }

    // Build messages for AI
    const messages = [
      {
        role: 'system',
        content:
          'Extract invoice data from WhatsApp message. Return ONLY valid JSON.',
      },
      {
        role: 'user',
        content: `Parse this WhatsApp message and extract invoice data.

Message: "${messageBody}"

Return JSON:
{
  "customerName": "string or null",
  "customerPhone": "string +234XXXXXXXXXX",
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "amount": number
    }
  ],
  "subTotal": number
}

If invalid, return: { "error": "error message" }`,
      },
    ];

    // ADD THIS: Mode switch (uses your existing mock util)
    let content;

    if (AI_MODE === 'mock') {
      const mockResult = await mockparseInvoiceFromAI(messageBody);
      // Return early with mock result (bypasses API + parsing)
      return mockResult;
    }

    if (AI_MODE === 'ollama') {
      // Use local Ollama endpoint
      content = await callWithFallback(
        'http://localhost:11434/v1/chat/completions',
        { 'Content-Type': 'application/json' },
        messages,
        'qwen2.5:1.5b', // Local model name
      );
    }

    // Default: OpenRouter (your existing logic)
    if (AI_MODE === 'openrouter' || !content) {
      content = await callWithFallback(
        OPENROUTER_API_URL,
        OPENROUTER_HEADERS,
        messages,
        OPENROUTER_MODEL,
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Handle markdown-wrapped JSON
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
      }
    }

    // Handle AI-level errors
    if (parsed?.error) {
      return { success: false, error: parsed.error };
    }

    // Validate data structure
    const validation = validateInvoiceData(parsed);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join('; ')}`,
      };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error('OpenRouter Parser error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Better error handling
    if (error.response?.status === 401) {
      return { success: false, error: 'Invalid OpenRouter API key' };
    }
    if (error.response?.status === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }
    if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'Request timeout. Please try again.' };
    }

    return {
      success: false,
      error: `Parser error: ${error.message}`,
    };
  }
};

module.exports = {
  parseInvoiceFromAI,
  validateInvoiceData,
};
