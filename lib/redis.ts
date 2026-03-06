// Redis pro BullMQ – používá se v Next.js API (queues.ts)
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 300, 2000);
  },
  connectTimeout: 5000,
});

let redisErrorLogged = false;
redis.on('connect', () => {
  console.log('✅ Redis connected for BullMQ');
});
redis.on('error', () => {
  if (!redisErrorLogged) {
    redisErrorLogged = true;
    console.error('❌ Redis connection error. Start Redis: docker-compose up -d redis');
  }
});

export default redis;
