// src/config/db.js
const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

// Create a new Sequelize instance
const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: 'mysql',
    logging: (msg) => logger.info(msg), // Use winston for logging SQL
  },
);

// Test the connection (exported so callers can invoke it explicitly)
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Successfully connected to the MySQL database via Sequelize.');
  } catch (error) {
    logger.error('Error connecting to MySQL database:', error);
    process.exit(1);
  }
};

// NOTE: we no longer call testDbConnection() here.  server.js is responsible
// for running the startup sequence and will invoke the function when needed.

// Export the sequelize instance and helper functions
module.exports = {
  sequelize,
  testDbConnection,
}; // allows destructuring in callers (e.g. { testDbConnection })
