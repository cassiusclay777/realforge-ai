import { prisma } from './lib/prisma.js';

async function check() {
  const listingId = 'defcb48b-9426-42d7-be6b-769c9006de76';
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { media: true, aiResults: true }
  });
  console.log('Listing status:', listing?.status);
  console.log('Media count:', listing?.media.length);
  console.log('AI result exists:', !!listing?.aiResults);
  await prisma.$disconnect();
}

check().catch(console.error);