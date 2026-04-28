// src/utils/openrouter.util.js
const axios = require('axios');
const config = require('../config');

const callWithFallback = async (
  apiUrl,
  headers,
  messages,
  primaryModel,
  retries = 2,
) => {
  // Validate API key exists
  if (!headers.Authorization || !headers.Authorization.includes('Bearer')) {
    throw new Error('OpenRouter API key not configured');
  }

  const fallbackModel = config.OPENROUTER_FALLBACK_MODEL || 'qwen/qwen-flash';
  const models = [primaryModel, fallbackModel].filter(Boolean);

  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          apiUrl,
          {
            model,
            messages,
            temperature: 0.1,
            // REMOVED: response_format - not all models support it
          },
          {
            headers,
            timeout: 60000, // INCREASED: from 30s to 60s
          },
        );

        // Validate response structure
        if (!response.data?.choices?.[0]?.message?.content) {
          throw new Error('Invalid API response structure');
        }

        return response.data.choices[0].message.content;
      } catch (err) {
        const isLastAttempt = attempt === retries;
        const isLastModel = model === models[models.length - 1];

        console.warn(
          `[OpenRouter] Model "${model}" attempt ${attempt + 1}/${retries + 1} failed:`,
          err.message,
        );

        // ADDED: Exponential backoff between retries
        if (!isLastAttempt) {
          const delayMs = 1000 * Math.pow(2, attempt);
          console.log(`[OpenRouter] Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // If all retries exhausted for this model and not last model, try next
        if (!isLastModel) {
          console.log(
            `[OpenRouter] Switching to fallback model: ${fallbackModel}`,
          );
          break; // Break inner loop, continue outer loop
        }

        // Last model, last attempt - throw error
        throw err;
      }
    }
  }

  throw new Error('All model attempts failed after retries');
};

module.exports = { callWithFallback };
