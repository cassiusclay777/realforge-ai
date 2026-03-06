const { Queue } = require('bullmq');
const { redis } = require('./lib/redis');
const { v4: uuidv4 } = require('uuid');

async function addTestJob() {
  const queue = new Queue('image-process', { connection: redis });
  
  // Použijeme existující listing s statusem NEW
  const listingId = '66f1c12f-2a39-4578-80a3-0e3d0b0e75ef';
  
  console.log(`Přidávám job pro listing ${listingId}...`);
  
  const job = await queue.add('process_zip', { 
    listingId, 
    zipUrl: 'http://example.com/test.zip' 
  }, { 
    jobId: uuidv4() 
  });
  
  console.log(`Job přidán s ID: ${job.id}`);
  console.log('Job data:', job.data);
  
  await queue.close();
  process.exit(0);
}

addTestJob().catch(err => {
  console.error('Chyba:', err);
  process.exit(1);
});