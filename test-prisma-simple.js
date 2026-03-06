// Simple test to check if Prisma Client works
const { PrismaClient } = require('@prisma/client');

async function test() {
  console.log('Testing Prisma Client...');
  
  try {
    // Create Prisma client
    const prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    
    console.log('Prisma client created');
    console.log('prisma object keys:', Object.keys(prisma));
    console.log('prisma.user:', prisma.user);
    console.log('Type of prisma.user:', typeof prisma.user);
    
    if (prisma.user) {
      console.log('prisma.user has findUnique:', typeof prisma.user.findUnique);
      
      // Try to count users
      const count = await prisma.user.count();
      console.log('User count:', count);
    } else {
      console.log('ERROR: prisma.user is undefined!');
      console.log('Available properties on prisma:');
      for (const key of Object.keys(prisma)) {
        console.log(`  ${key}: ${typeof prisma[key]}`);
      }
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();