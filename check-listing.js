import { prisma } from './lib/prisma.js';

async function check() {
  const listing = await prisma.listing.findUnique({
    where: { id: 'ff310145-61fc-479e-87fd-9c867c9d1161' },
    include: { media: true }
  });
  console.log('Listing status:', listing?.status);
  console.log('Media count:', listing?.media.length);
  await prisma.$disconnect();
}

check().catch(console.error);