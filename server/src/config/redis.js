// src/utils/redis.client.js
const redis = require('redis');
const logger = require('./logger');
const config = require('./index');

// ✅ Redis Cloud: Use URL + TLS + reconnect strategy
const client = redis.createClient({
  url: config.REDIS_URL, // rediss://default:PASS@host:port
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('[Redis] Max reconnection attempts reached');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries * 50, 2000); // Exponential backoff, cap at 2s
    },
    connectTimeout: 10000, // 10s timeout
  },
});

client.on('error', (err) => {
  logger.error('Redis error', { error: err.message, code: err.code });
});

client.on('connect', () => {
  logger.info('Redis connected');
});

client.on('ready', () => {
  logger.info('Redis ready');
});

client.on('end', () => {
  logger.info('Redis connection ended');
});

// ✅ Explicit connect helper (required for redis@4+)
const connect = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

// ✅ Graceful shutdown helper
const disconnect = async () => {
  if (client.isOpen) {
    await client.quit();
    logger.info('Redis disconnected');
  }
};

// ✅ Export client + helpers
module.exports = {
  client,
  connect,
  disconnect,
};
