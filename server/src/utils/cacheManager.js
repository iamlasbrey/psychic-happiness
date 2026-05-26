const crypto = require('crypto');
const logger = require('../config/logger');
const { client, connect } = require('../config/redis');

const CACHE_TTL = 3600;
const CACHE_VERSION = process.env.CACHE_VERSION || 'v1';

const generateHash = (messageBody) => {
  return crypto
    .createHash('md5')
    .update(messageBody.trim() + CACHE_VERSION)
    .digest('hex');
};

const getCachedResult = async (messageBody) => {
  const hash = generateHash(messageBody);

  try {
    await connect();
    const cached = await client.get(`cache:${hash}`);

    if (cached) {
      logger.info('[Cache HIT]', { hash });
      return JSON.parse(cached);
    }

    logger.debug('[Cache MISS]', { hash });
    return null;
  } catch (error) {
    logger.error('Redis get error', { error: error.message });
    return null;
  }
};

const setCachedResult = async (messageBody, result) => {
  const hash = generateHash(messageBody);

  try {
    await connect();
    await client.set(`cache:${hash}`, JSON.stringify(result), {
      EX: CACHE_TTL,
    });
    logger.info('[Cache SET]', { hash });
  } catch (error) {
    logger.error('Redis set error', { error: error.message });
  }
};

const clearCache = async () => {
  try {
    await connect();
    await client.flushDb();
    logger.info('Cache cleared');
  } catch (error) {
    logger.error('Redis flush error', { error: error.message });
  }
};

module.exports = {
  getCachedResult,
  setCachedResult,
  clearCache,
};
