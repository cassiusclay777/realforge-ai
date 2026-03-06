const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking database connection and users...');
    
    // Test connection
    await prisma.$connect();
    console.log('✓ Database connected');
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
    
    // List first 5 users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });
    
    console.log('\nFirst 5 users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - Role: ${user.role}`);
      console.log(`   Password hash: ${user.password ? 'Yes' : 'No'}`);
    });
    
    // Check if bcrypt works
    const bcrypt = require('bcryptjs');
    const testPassword = 'test123';
    const hashed = await bcrypt.hash(testPassword, 12);
    console.log(`\n✓ Bcrypt test: Hash generated (${hashed.substring(0, 20)}...)`);
    
    const isValid = await bcrypt.compare(testPassword, hashed);
    console.log(`✓ Bcrypt compare test: ${isValid ? 'PASS' : 'FAIL'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();