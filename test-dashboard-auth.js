const http = require('http');

async function testDashboardWithAuth() {
  console.log('=== Testing Dashboard Access with Authentication ===\n');
  
  // 1. First login to get session
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
    console.log(`   Cookies received: ${cookies.length > 0 ? 'Yes' : 'No'}\n`);
    
    if (cookies.length === 0) {
      console.log('   ERROR: No session cookies received');
      return;
    }

    // 2. Try to access dashboard with cookies
    console.log('2. Accessing dashboard with session cookies...');
    const dashboardReq = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/dashboard',
      method: 'GET',
      headers: {
        'Cookie': cookies.join('; ')
      }
    }, (dashboardRes) => {
      console.log(`   Dashboard status: ${dashboardRes.statusCode}`);
      
      let responseData = '';
      dashboardRes.on('data', (chunk) => {
        responseData += chunk;
      });
      
      dashboardRes.on('end', () => {
        if (dashboardRes.statusCode === 200) {
          console.log('   ✓ SUCCESS: Dashboard accessible with authentication');
          // Check if it's the dashboard page (has some expected content)
          if (responseData.includes('Vítejte zpět') || responseData.includes('Dashboard')) {
            console.log('   ✓ Dashboard page content loaded correctly');
          } else {
            console.log('   ⚠ Warning: Dashboard page might have different content');
          }
        } else if (dashboardRes.statusCode === 307 || dashboardRes.statusCode === 302) {
          console.log('   ✗ FAIL: Redirected to login (authentication failed)');
          console.log(`   Redirect location: ${dashboardRes.headers.location}`);
        } else if (dashboardRes.statusCode === 500) {
          console.log('   ✗ FAIL: Server error (check server logs)');
          // Try to get error details
          try {
            const error = JSON.parse(responseData);
            console.log(`   Error details: ${JSON.stringify(error)}`);
          } catch (e) {
            console.log(`   Raw response: ${responseData.substring(0, 200)}...`);
          }
        }
        
        console.log('\n=== Test Complete ===');
      });
    });

    dashboardReq.on('error', (error) => {
      console.error('   Request error:', error);
    });

    dashboardReq.end();
  });

  loginReq.on('error', (error) => {
    console.error('   Login request error:', error);
  });

  loginReq.write(loginData);
  loginReq.end();
}

testDashboardWithAuth();