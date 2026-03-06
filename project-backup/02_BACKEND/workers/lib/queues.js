"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageProcessQueue = void 0;
exports.getQueue = getQueue;
// MVP: simulace BullMQ queue pro image processing
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
// Workaround pro konflikt typů mezi ioredis a bullmq
// Použijeme type assertion, protože obě knihovny mají kompatibilní API
exports.imageProcessQueue = new bullmq_1.Queue('image-process', {
    connection: redis_1.redis,
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
let worker = null;
// Funkce getQueue pro kompatibilitu s workers/image-process.ts
// Vrací objekt s metodou process, která vytvoří worker
function getQueue(queueName) {
    if (queueName === 'image-process') {
        return {
            process: (handler) => {
                if (worker) {
                    worker.close();
                }
                worker = new bullmq_1.Worker(queueName, handler, {
                    connection: redis_1.redis,
                    concurrency: 5,
                });
                worker.on('completed', (job) => {
                    console.log(`🎉 Job ${job.id} has completed!`);
                });
                worker.on('failed', (job, err) => {
                    console.error(`💥 Job ${job?.id} failed with error:`, err);
                });
                console.log('✅ Worker created and waiting for jobs...');
                return worker;
            },
            add: exports.imageProcessQueue.add.bind(exports.imageProcessQueue),
        };
    }
    throw new Error(`Queue ${queueName} not found`);
}
exports.default = {
    imageProcessQueue: exports.imageProcessQueue,
    getQueue,
};
