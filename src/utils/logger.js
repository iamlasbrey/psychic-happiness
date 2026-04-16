// src/utils/logger.js
const winston = require('winston');
const config = require('../config'); // Import the config

const logger = winston.createLogger({
  // fallback level if none provided
  level: config.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [], // we'll add console transport below in non-prod
});

if (config.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

module.exports = logger;
