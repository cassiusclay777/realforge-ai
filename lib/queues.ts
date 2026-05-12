import { Queue, Worker } from 'bullmq';
import type { Redis as IORedis } from 'ioredis';
import { redis } from './redis';

// Workaround pro konflikt typů mezi ioredis a bullmq
// Použijeme type assertion, protože obě knihovny mají kompatibilní API
function handleBullMQError(err: Error, label: string) {
  if (err.message?.includes('Redis version')) {
    console.error(`❌ ${label}: ${err.message}`);
    console.error('   Stop any local Redis on port 6379, then run: docker-compose up -d redis');
  }
}

export const imageProcessQueue = new Queue('image-process', {
  connection: redis as unknown as IORedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
imageProcessQueue.on('error', (err) => handleBullMQError(err, 'image-process queue'));

export const imageProcessDeepSeekQueue = new Queue('image-process-deepseek', {
  connection: redis as unknown as IORedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
imageProcessDeepSeekQueue.on('error', (err) => handleBullMQError(err, 'image-process-deepseek queue'));

console.log('✅ BullMQ queues initialized (image-process, image-process-deepseek)');

// Create workers that will process jobs
let worker: Worker | null = null;
let deepseekWorker: Worker | null = null;

// Funkce getQueue pro kompatibilitu s workers/image-process.ts
// Vrací objekt s metodou process, která vytvoří worker
export function getQueue(queueName: string) {
  if (queueName === 'image-process') {
    return {
      process: (handler: (job: any) => Promise<void>) => {
        if (worker) {
          worker.close();
        }
        worker = new Worker(queueName, handler, {
          connection: redis as unknown as IORedis,
          concurrency: 5,
        });

        worker.on('completed', (job) => {
          console.log(`🎉 Job ${job.id} has completed!`);
        });

        worker.on('failed', (job, err) => {
          console.error(`💥 Job ${job?.id} failed with error:`, err);
        });

        worker.on('error', (err) => handleBullMQError(err, 'image-process worker'));
        
        console.log('✅ Worker created and waiting for jobs...');
        return worker;
      },
      add: imageProcessQueue.add.bind(imageProcessQueue),
    };
  }
  
  if (queueName === 'image-process-deepseek') {
    return {
      process: (handler: (job: any) => Promise<void>) => {
        if (deepseekWorker) {
          deepseekWorker.close();
        }
        deepseekWorker = new Worker(queueName, handler, {
          connection: redis as unknown as IORedis,
          concurrency: 2,
        });

        deepseekWorker.on('completed', (job) => {
          console.log(`🎉 DeepSeek job ${job.id} has completed!`);
        });

        deepseekWorker.on('failed', (job, err) => {
          console.error(`💥 DeepSeek job ${job?.id} failed with error:`, err);
        });

        deepseekWorker.on('error', (err) => handleBullMQError(err, 'image-process-deepseek worker'));
        
        console.log('✅ DeepSeek worker created and waiting for jobs...');
        return deepseekWorker;
      },
      add: imageProcessDeepSeekQueue.add.bind(imageProcessDeepSeekQueue),
    };
  }
  
  throw new Error(`Queue ${queueName} not found`);
}

export default {
  imageProcessQueue,
  imageProcessDeepSeekQueue,
  getQueue,
};
