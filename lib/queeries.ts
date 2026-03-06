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

console.log('✅ BullMQ image-process queue initialized');

// Create a worker that will process jobs
let worker: Worker | null = null;

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
  throw new Error(`Queue ${queueName} not found`);
}

export default {
  imageProcessQueue,
  getQueue,
};
