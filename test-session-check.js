const http = require('http');

async function testSession() {
  console.log('=== Testing Session After Login ===\n');
  
  // 1. Login
  console.log('1. Logging in...');
  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123'
  });

  const loginReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  }, (loginRes) => {
    const cookies = loginRes.headers['set-cookie'] || [];
    console.log(`   Login status: ${loginRes.statusCode}`);
    console.log(`   Redirect: ${loginRes.headers.location || 'None'}`);
    console.log(`   Cookies: ${cookies.length}\n`);
    
    if (cookies.length === 0) {
      console.log('   ERROR: No cookies');
      return;
    }

    // 2. Check session endpoint
    console.log('2. Checking session endpoint...');
    const sessionReq = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/session',
      method: 'GET',
      headers: {
        'Cookie': cookies.join('; ')
      }
    }, (sessionRes) => {
      console.log(`   Session status: ${sessionRes.statusCode}`);
      
      let responseData = '';
      sessionRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      sessionRes.on('end', () => {
        try {
          const session = JSON.parse(responseData);
          console.log(`   Session data: ${JSON.stringify(session, null, 2)}`);
          console.log(`   User authenticated: ${!!session.user}`);
          if (session.user) {
            console.log(`   User email: ${session.user.email}`);
            console.log(`   User role: ${session.user.role}`);
          }
        } catch (e) {
          console.log(`   Could not parse session: ${responseData}`);
        }
        
        console.log('\n=== Test Complete ===');
      });
    });

    sessionReq.on('error', (error) => {
      console.error('   Session request error:', error);
    });

    sessionReq.end();
  });

  loginReq.on('error', (error) => {
    console.error('   Login request error:', error);
  });

  loginReq.write(loginData);
  loginReq.end();
}

testSession();