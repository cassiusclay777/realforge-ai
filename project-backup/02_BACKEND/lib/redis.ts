// MVP: simulace Redis připojení pro BullMQ
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('✅ Redis connected for BullMQ');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
