// workers/image-process.ts  
import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const worker = new Worker("image-process", async (job) => {
  const { listingId } = job.data;
  console.log(`✅ Worker: Zpracování listingu ${listingId}...`);
  await new Promise(resolve => setTimeout(resolve, 3000));
  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "AKTIVNI" },
  });
  console.log(`✅ Worker: Listing ${listingId} je nyní AKTIVNI`);
}, {
  connection: redis as any,
  concurrency: 5,
});

worker.on('completed', (job) => {
  console.log(`🎉 Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 Job ${job?.id} failed with error:`, err);
});

console.log("✅ Worker: čeká na joby...");

export default worker;