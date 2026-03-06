// Simple test to check if PrismaClient works
const { PrismaClient } = require('@prisma/client');

console.log('PrismaClient imported successfully');

// Check if we can create an instance
try {
  const prisma = new PrismaClient();
  console.log('PrismaClient instance created successfully');
  
  // Try to connect
  prisma.$connect()
    .then(() => {
      console.log('Connected to database');
      
      // Simple query to check if tables exist
      return prisma.$queryRaw`SELECT 1 as test`;
    })
    .then((result) => {
      console.log('Raw query successful:', result);
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('Disconnected successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during test:', error.message);
      console.error('Full error:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('Error creating PrismaClient:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}