// Test Prisma with adapter
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function testPrismaWithAdapter() {
  console.log('Testing Prisma with PostgreSQL adapter...');
  
  try {
    // Create connection pool
    const connectionString = process.env.DATABASE_URL || 'postgresql://realforge:realforge_password@localhost:5432/realforge_ai';
    console.log('Connection string:', connectionString);
    
    const pool = new Pool({ 
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    // Create adapter
    const adapter = new PrismaPg(pool);
    console.log('Adapter created');
    
    // Create Prisma client with adapter
    const prisma = new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn'],
    });
    
    console.log('Prisma client created with adapter');
    
    // Test connection
    await prisma.$connect();
    console.log('✓ Prisma connected');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✓ User count: ${userCount}`);
    
    // Test if prisma.user exists
    console.log('prisma.user type:', typeof prisma.user);
    console.log('prisma.user.findUnique type:', typeof prisma.user?.findUnique);
    
    // Try to create a test user
    const testEmail = `test${Date.now()}@example.com`;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    console.log('Creating test user...');
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
      },
    });
    
    console.log(`✓ Test user created: ${newUser.email} (ID: ${newUser.id})`);
    
    // Clean up
    await prisma.user.delete({
      where: { id: newUser.id },
    });
    console.log('✓ Test user cleaned up');
    
    await prisma.$disconnect();
    console.log('✓ All tests passed');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Full error:', error);
    console.error('Error stack:', error.stack);
  }
}

testPrismaWithAdapter();