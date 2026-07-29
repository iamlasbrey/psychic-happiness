// server.js
const config = require('./src/config');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { testDbConnection } = require('./src/config/db');
const redis = require('./src/config/redis');

// `sequelize` instance is still usable via require('./src/config/db') if needed

const initializeRedis = async () => {
  try {
    await redis.connect();
    logger.info('Redis connected successfully.');
  } catch (err) {
    logger.error('[Redis] Startup failed:', err.message);
    // Optional: do not exit; cache operations can continue to fail safely.
  }
};

/**
 * Sync database models
 */
const syncDatabase = async () => {
  try {
    // await sequelize.sync({ alter: true }); // Sync all models defined via Sequelize
    logger.info('🔄 Database models synced successfully.');
  } catch (error) {
    logger.error('❌ Error syncing database models:', error);
    process.exit(1);
  }
};

/**
 * Start the express server
 */
const startServer = () => {
  app.listen(config.PORT, () => {
    logger.info(
      `🚀 Server running on port ${config.PORT} in ${config.NODE_ENV} mode`,
    );
  });
};

// --- Main Startup Sequence ---
const initializeApp = async () => {
  await testDbConnection(); // 1. Test DB connection
  await initializeRedis(); // 2. Initialize Redis connection once
  await syncDatabase(); // 3. Sync DB models
  startServer(); // 4. Start Express server
};

initializeApp(); // Run the startup sequence
