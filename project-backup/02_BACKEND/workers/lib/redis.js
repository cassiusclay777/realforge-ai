"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
// MVP: simulace Redis připojení pro BullMQ
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redis = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
});
exports.redis.on('connect', () => {
    console.log('✅ Redis connected for BullMQ');
});
exports.redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});
exports.default = exports.redis;
