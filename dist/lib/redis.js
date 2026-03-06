"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
// MVP: simulace Redis připojení pro BullMQ
var ioredis_1 = require("ioredis");
var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redis = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
});
exports.redis.on('connect', function () {
    console.log('✅ Redis connected for BullMQ');
});
exports.redis.on('error', function (err) {
    console.error('❌ Redis connection error:', err);
});
exports.default = exports.redis;
