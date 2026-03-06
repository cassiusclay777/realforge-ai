// Test the authorize function from lib/auth.ts
const bcrypt = require('bcryptjs');

async function testAuthorize() {
  console.log('Testing authorize function...');
  
  // Mock prisma
  const prisma = {
    user: {
      findUnique: async ({ where }) => {
        console.log('findUnique called with:', where);
        if (where.email === 'testuser@example.com') {
          return {
            id: 'test123456',
            email: 'testuser@example.com',
            name: 'Test User',
            password: '$2b$12$Ib/YsreIpemlhfbgXUVjh.AwdLXtshXb7yJ8kSowAnk1fHRYlI8Ze',
            role: 'USER',
          };
        }
        return null;
      },
    },
  };
  
  // Test credentials
  const credentials = {
    email: 'testuser@example.com',
    password: 'test123',
  };
  
  try {
    if (!credentials.email || !credentials.password) {
      throw new Error("Vyplňte email a heslo");
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    console.log('User found:', user);

    if (!user || !user.password) {
      throw new Error("Uživatel neexistuje nebo nemá nastavené heslo");
    }

    const isValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    console.log('Password valid:', isValid);

    if (!isValid) {
      throw new Error("Neplatné heslo");
    }

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    
    console.log('Authorize success:', result);
    return result;
    
  } catch (error) {
    console.error('Authorize error:', error.message);
    throw error;
  }
}

testAuthorize().catch(console.error);