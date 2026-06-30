const logger = require('../config/logger');

const withTimeout = (promise, timeoutMs, operationName) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        const error = new Error(
          `${operationName} timed out after ${timeoutMs}ms`,
        );
        error.statusCode = 504;
        error.isTimeout = true;
        logger.warn('Operation timeout', { operationName, timeoutMs });
        reject(error);
      }, timeoutMs),
    ),
  ]);
};

module.exports = {
  withTimeout,
};
