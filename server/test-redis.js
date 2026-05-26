require('dotenv').config();
const redis = require('./src/config/redis');

(async () => {
  try {
    await redis.connect();
    await redis.client.set('health:check', 'ok', { EX: 10 });
    const val = await redis.client.get('health:check');
    console.log('✅ Redis healthy:', val);
    await redis.disconnect();
  } catch (err) {
    console.error('❌ Redis error:', err.message);
  }
  process.exit();
})();
