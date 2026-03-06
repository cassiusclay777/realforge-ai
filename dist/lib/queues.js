"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageProcessQueue = void 0;
exports.getQueue = getQueue;
// MVP: simulace BullMQ queue pro image processing
var bullmq_1 = require("bullmq");
var redis_ts_1 = require("./redis.ts");
// Workaround pro konflikt typů mezi ioredis a bullmq
// Použijeme type assertion, protože obě knihovny mají kompatibilní API
exports.imageProcessQueue = new bullmq_1.Queue('image-process', {
    connection: redis_ts_1.redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});
console.log('✅ BullMQ image-process queue initialized');
// Create a worker that will process jobs
var worker = null;
// Funkce getQueue pro kompatibilitu s workers/image-process.ts
// Vrací objekt s metodou process, která vytvoří worker
function getQueue(queueName) {
    if (queueName === 'image-process') {
        return {
            process: function (handler) {
                if (worker) {
                    worker.close();
                }
                worker = new bullmq_1.Worker(queueName, handler, {
                    connection: redis_ts_1.redis,
                    concurrency: 5,
                });
                worker.on('completed', function (job) {
                    console.log("\uD83C\uDF89 Job ".concat(job.id, " has completed!"));
                });
                worker.on('failed', function (job, err) {
                    console.error("\uD83D\uDCA5 Job ".concat(job === null || job === void 0 ? void 0 : job.id, " failed with error:"), err);
                });
                console.log('✅ Worker created and waiting for jobs...');
                return worker;
            },
            add: exports.imageProcessQueue.add.bind(exports.imageProcessQueue),
        };
    }
    throw new Error("Queue ".concat(queueName, " not found"));
}
exports.default = {
    imageProcessQueue: exports.imageProcessQueue,
    getQueue: getQueue,
};
