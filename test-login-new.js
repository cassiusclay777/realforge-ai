// Test login with newly registered user
async function testLogin() {
  console.log('Testing login with newly registered user...');
  
  // First get CSRF token
  const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
  const csrfData = await csrfResponse.json();
  console.log('CSRF Token:', csrfData.csrfToken);
  
  // Try to login
  const formData = new URLSearchParams();
  formData.append('csrfToken', csrfData.csrfToken);
  formData.append('email', 'testuser2@example.com');
  formData.append('password', 'test123456');
  formData.append('callbackUrl', '/dashboard');
  formData.append('json', 'true');
  
  const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });
  
  const loginData = await loginResponse.json();
  console.log('Login Status:', loginResponse.status);
  console.log('Login Response:', loginData);
  
  // Check session
  const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
  const sessionData = await sessionResponse.json();
  console.log('Session:', sessionData);
  
  return { status: loginResponse.status, data: loginData, session: sessionData };
}

testLogin().catch(console.error);