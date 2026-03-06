const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function seedDemoUser() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@realforge.ai' },
    });
    
    if (existingUser) {
      console.log('Demo user already exists:', existingUser.email);
      return;
    }
    
    // Create demo user with hashed password "demo"
    const hashedPassword = await bcrypt.hash('demo', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@realforge.ai',
        password: hashedPassword,
        role: 'AGENT'
      },
    });
    
    console.log('✅ Demo user created successfully:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('\nYou can now login with:');
    console.log('   Email: demo@realforge.ai');
    console.log('   Password: demo');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

seedDemoUser();