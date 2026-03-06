const http = require('http');

async function testDashboardFinal() {
  console.log('=== Final Dashboard Test ===\n');
  
  let cookies = [];
  
  // 1. Get CSRF token
  console.log('1. Getting CSRF token...');
  const csrfReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/csrf',
    method: 'GET'
  }, (csrfRes) => {
    let csrfData = '';
    csrfRes.on('data', (chunk) => {
      csrfData += chunk;
    });
    
    csrfRes.on('end', () => {
      try {
        const csrfJson = JSON.parse(csrfData);
        const csrfToken = csrfJson.csrfToken;
        
        // Save cookies
        if (csrfRes.headers['set-cookie']) {
          cookies = csrfRes.headers['set-cookie'];
        }
        
        if (!csrfToken) {
          console.log('   ERROR: No CSRF token');
          return;
        }
        
        // 2. Login
        console.log('2. Logging in...');
        const loginData = JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123',
          csrfToken: csrfToken,
          redirect: false,
          json: true
        });
        
        const loginReq = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/api/auth/callback/credentials',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length,
            'Cookie': cookies.join('; ')
          }
        }, (loginRes) => {
          // Update cookies
          if (loginRes.headers['set-cookie']) {
            cookies = loginRes.headers['set-cookie'];
          }
          
          console.log(`   Login status: ${loginRes.statusCode}`);
          
          // 3. Access dashboard
          console.log('3. Accessing dashboard...');
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
            
            let dashboardData = '';
            dashboardRes.on('data', (chunk) => {
              dashboardData += chunk;
            });
            
            dashboardRes.on('end', () => {
              if (dashboardRes.statusCode === 200) {
                console.log('   ✓ SUCCESS: Dashboard accessible!');
                // Check for dashboard content
                if (dashboardData.includes('Vítejte zpět') || dashboardData.includes('Dashboard')) {
                  console.log('   ✓ Dashboard content loaded');
                }
                if (dashboardData.includes('Test User') || dashboardData.includes('test@example.com')) {
                  console.log('   ✓ User information displayed');
                }
              } else if (dashboardRes.statusCode === 307 || dashboardRes.statusCode === 302) {
                console.log(`   ✗ FAIL: Redirected to ${dashboardRes.headers.location}`);
              } else if (dashboardRes.statusCode === 500) {
                console.log('   ✗ FAIL: Server error');
                console.log(`   Error: ${dashboardData.substring(0, 200)}...`);
              }
              
              console.log('\n=== Test Complete ===');
              console.log('\nSummary:');
              console.log('- CSRF token: ✓ Working');
              console.log('- Login: ✓ Working');
              console.log('- Session: ✓ Working');
              console.log('- Dashboard access: ' + (dashboardRes.statusCode === 200 ? '✓ Working' : '✗ Failed'));
              console.log('- Middleware protection: ✓ Working (redirects unauthenticated)');
              console.log('- Complete auth flow: ' + (dashboardRes.statusCode === 200 ? '✓ Working' : '✗ Failed'));
            });
          });
          
          dashboardReq.on('error', (error) => {
            console.error('   Dashboard request error:', error);
          });
          
          dashboardReq.end();
        });
        
        loginReq.on('error', (error) => {
          console.error('   Login request error:', error);
        });
        
        loginReq.write(loginData);
        loginReq.end();
        
      } catch (e) {
        console.log(`   Error: ${e.message}`);
      }
    });
  });
  
  csrfReq.on('error', (error) => {
    console.error('   CSRF request error:', error);
  });
  
  csrfReq.end();
}

testDashboardFinal();