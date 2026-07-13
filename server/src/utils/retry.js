const logger = require('../config/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, maxAttempts = 4, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isTransient = isTransientError(error);

      if (!isTransient || attempt === maxAttempts) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(
        `WhatsApp send retry ${attempt}/${maxAttempts} in ${delay}ms`,
        { error: error.message },
      );
      await sleep(delay);
    }
  }
  throw lastError;
};

const isTransientError = (error) => {
  const msg = error.message?.toLowerCase() || '';
  return (
    msg.includes('rate limit') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    error.code === 429
  );
};

module.exports = { withRetry };
