const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Create a PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL || 'postgresql://realforge:realforge_password@localhost:5432/realforge_ai';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function createTestUser() {
  try {
    console.log('Connecting to database...');
    
    // Test connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@realforge.ai' },
    });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('test1234', 12);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@realforge.ai',
        password: hashedPassword,
        role: 'USER'
      },
    });
    
    console.log('✅ Test user created successfully:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

createTestUser();
