// src/services/aiMessageParser.service.js
const axios = require('axios');
const config = require('../config');
const { callWithFallback } = require('../utils/openrouter.util');

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

  // Required fields only
  if (!data.customerName || typeof data.customerName !== 'string') {
    errors.push('customerName required');
  }
  if (!data.customerPhone || typeof data.customerPhone !== 'string') {
    errors.push('customerPhone required');
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items required (min 1)');
  } else {
    data.items.forEach((item, i) => {
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`items[${i}].quantity invalid`);
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
        errors.push(`items[${i}].unitPrice invalid`);
      }
    });
  }

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
          'You are a precise invoice data extractor. Return ONLY valid JSON. No markdown, no explanations.',
      },
      {
        role: 'user',
        content: `Parse this WhatsApp invoice message and extract structured data for invoice creation.

Message: "${messageBody}"

Return JSON with ONLY these fields:
{
  "customerName": "string",
  "customerPhone": "string in format +234XXXXXXXXXX",
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "amount": number (quantity * unitPrice)
    }
  ],
  "subTotal": number (sum of all item amounts),
  "vatAmount": number (7.5% of subTotal),
  "totalAmount": number (subTotal + vatAmount)
}

If parsing fails, return: { "error": "error message" }`,
      },
    ];

    // Call util with fallback and retry logic
    const content = await callWithFallback(
      OPENROUTER_API_URL,
      OPENROUTER_HEADERS,
      messages,
      OPENROUTER_MODEL,
    );

    // Parse JSON response
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
