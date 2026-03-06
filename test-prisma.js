const { prisma } = require('./lib/prisma');

async function testPrisma() {
  try {
    console.log('Testing PrismaClient connection...');
    
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✓ Connected to database successfully');

    // Try to create a test user
    console.log('Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password_here',
      },
    });
    console.log('✓ Test user created:', testUser.id);

    // Try to query users
    const users = await prisma.user.findMany();
    console.log(`✓ Found ${users.length} users in database`);

    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('✓ Test user cleaned up');

    await prisma.$disconnect();
    console.log('✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testPrisma();
