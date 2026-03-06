import { prisma } from './lib/prisma.js';

async function check() {
  const listingId = '62b899ba-9723-48ca-aa56-8e011003d1a4';
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { media: true, aiResults: true }
  });
  console.log('Listing status:', listing?.status);
  console.log('Media count:', listing?.media.length);
  console.log('AI result exists:', !!listing?.aiResults);
  console.log('AI headline:', listing?.aiResults?.headline);
  await prisma.$disconnect();
}

check().catch(console.error);