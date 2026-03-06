// MVP: simulace BullMQ queue pro image processing
import { Queue, Worker } from 'bullmq';
import { redis } from './redis';

// Workaround pro konflikt typů mezi ioredis a bullmq
// Použijeme type assertion, protože obě knihovny mají kompatibilní API
export const imageProcessQueue = new Queue('image-process', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const imageProcessDeepSeekQueue = new Queue('image-process-deepseek', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

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
          connection: redis as any,
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
          connection: redis as any,
          concurrency: 2, // Nižší concurrency kvůli API limitům
        });
        
        deepseekWorker.on('completed', (job) => {
          console.log(`🎉 DeepSeek job ${job.id} has completed!`);
        });
        
        deepseekWorker.on('failed', (job, err) => {
          console.error(`💥 DeepSeek job ${job?.id} failed with error:`, err);
        });
        
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
