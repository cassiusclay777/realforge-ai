const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 12);
  console.log('Hashed password:', hash);
}

generateHash().catch(console.error);