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

redis.on('ready', async () => {
  try {
    const info = await redis.info('server');
    const match = info.match(/redis_version:(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      const [major, minor, patch] = [Number(match[1]), Number(match[2]), Number(match[3])];
      if (major < 5) {
        console.error(`❌ Redis ${major}.${minor}.${patch} is too old — BullMQ requires Redis >= 5.0.0`);
        console.error('   Stop any local Redis service running on port 6379, then run:');
        console.error('   docker-compose up -d redis');
        return;
      }
    }
  } catch {
    // version check failed — BullMQ will surface the error itself
  }
  console.log('✅ Redis connected for BullMQ');
});

redis.on('error', () => {
  if (!redisErrorLogged) {
    redisErrorLogged = true;
    console.error('❌ Redis unavailable. Run: docker-compose up -d redis');
  }
});

export default redis;
