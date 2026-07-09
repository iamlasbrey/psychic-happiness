// src/utils/timeoutUtil.js
const logger = require('../config/logger');

/**
 * Wraps a promise with a timeout that rejects if the operation exceeds the limit.
 * Automatically clears the timeout when the promise settles (prevents memory leaks).
 *
 * @param {Promise} promise - The promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} operationName - Human-readable name for logging
 * @returns {Promise} - Resolves/rejects with the original promise or timeout error
 */
const withTimeout = (promise, timeoutMs, operationName) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(
        `${operationName} timed out after ${timeoutMs}ms`,
      );
      error.name = 'TimeoutError';
      error.statusCode = 504; // Gateway Timeout
      error.isTimeout = true;
      error.operationName = operationName;
      error.timeoutMs = timeoutMs;

      logger.warn('Operation timeout', {
        operationName,
        timeoutMs,
        isRetryable: true,
      });

      reject(error);
    }, timeoutMs);
  });

  // Race the promise against the timeout, but clear timeout when original settles
  return Promise.race([
    promise.finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    }),
    timeoutPromise,
  ]);
};

/**
 * Helper to check if an error is a timeout (for retry logic)
 * @param {Error} error
 * @returns {boolean}
 */
const isTimeoutError = (error) => {
  return error?.isTimeout === true || error?.name === 'TimeoutError';
};

/**
 * Retry a promise with timeout + exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options
 * @param {number} options.timeoutMs - Timeout per attempt
 * @param {string} options.operationName - Name for logging
 * @param {number} options.maxRetries - Max retry attempts (default: 2)
 * @param {number} options.baseDelayMs - Base delay for backoff (default: 500)
 * @returns {Promise}
 */
const withRetry = async (
  operation,
  { timeoutMs, operationName, maxRetries = 2, baseDelayMs = 500 } = {},
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(
        operation(),
        timeoutMs,
        `${operationName}${attempt > 0 ? ` (attempt ${attempt + 1})` : ''}`,
      );
    } catch (error) {
      lastError = error;

      // Only retry on timeout errors
      if (!isTimeoutError(error) || attempt === maxRetries) {
        break;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const delay = baseDelayMs * Math.pow(2, attempt);
      logger.info('Retrying after timeout', {
        operationName,
        attempt: attempt + 1,
        maxRetries,
        delayMs: delay,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

module.exports = {
  withTimeout,
  isTimeoutError,
  withRetry,
};
