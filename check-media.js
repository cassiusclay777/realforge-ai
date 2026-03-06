import { prisma } from './lib/prisma.js';

async function check() {
  const media = await prisma.listingMedia.findMany({
    where: { listingId: 'ff310145-61fc-479e-87fd-9c867c9d1161' }
  });
  console.log('Media count:', media.length);
  console.log(media);
  await prisma.$disconnect();
}

check().catch(console.error);