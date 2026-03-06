// Direct test of prisma.ts
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log('Testing prisma.ts directly...');
  
  // Import the prisma module
  const { prisma } = require('./lib/prisma.ts');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('Connection successful');
    
    // Test user creation
    const userData = {
      data: {
        email: 'direct-test@example.com',
        name: 'Direct Test User',
        password: 'testpassword123',
        role: 'USER'
      }
    };
    
    console.log('Creating user...');
    const user = await prisma.user.create(userData);
    console.log('User created:', user);
    
    // Test user lookup
    const foundUser = await prisma.user.findUnique({
      where: { email: 'direct-test@example.com' }
    });
    console.log('Found user:', foundUser);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test().catch(console.error);