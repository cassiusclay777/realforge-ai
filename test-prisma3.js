// Test PrismaClient with explicit configuration
const { PrismaClient } = require('@prisma/client');

async function test() {
  try {
    console.log('Testing PrismaClient...');
    
    // Try to create PrismaClient with configuration from prisma.config.ts
    const prisma = new PrismaClient({
      // Prisma 7+ configuration
      adapter: {
        kind: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://realforge:realforge_password@localhost:5432/realforge_ai',
      },
      log: ['query', 'error', 'warn'],
    });

    console.log('PrismaClient created, testing connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('Connected to database');
    
    // Try a simple query
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test2@example.com',
        name: 'Test User 2',
        password: 'hashed',
      },
    });
    console.log(`Created test user: ${testUser.id}`);
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('Cleaned up test user');
    
    await prisma.$disconnect();
    console.log('Test passed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

test();