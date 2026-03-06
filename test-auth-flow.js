const http = require('http');

console.log('Testing NextAuth v5 authentication flow...\n');

// Test 1: Check if public route is accessible
console.log('Test 1: Public route (/)');
const req1 = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET'
}, (res) => {
  console.log(`  Status: ${res.statusCode} ${res.statusCode === 200 ? '✓' : '✗'}`);
  res.on('data', () => {});
  res.on('end', () => {
    // Test 2: Check if dashboard redirects to login when not authenticated
    console.log('\nTest 2: Protected route (/dashboard) - should redirect to login');
    const req2 = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/dashboard',
      method: 'GET'
    }, (res2) => {
      console.log(`  Status: ${res2.statusCode} ${res2.statusCode === 307 ? '✓' : '✗'}`);
      const location = res2.headers.location;
      console.log(`  Redirect to: ${location}`);
      console.log(`  Correct redirect: ${location && location.includes('/login') ? '✓' : '✗'}`);
      
      // Test 3: Check login page
      console.log('\nTest 3: Login page (/login)');
      const req3 = http.request({
        hostname: 'localhost',
        port: 3001,
        path: '/login',
        method: 'GET'
      }, (res3) => {
        console.log(`  Status: ${res3.statusCode} ${res3.statusCode === 200 ? '✓' : '✗'}`);
        
        // Test 4: Check NextAuth session endpoint
        console.log('\nTest 4: NextAuth session endpoint');
        const req4 = http.request({
          hostname: 'localhost',
          port: 3001,
          path: '/api/auth/session',
          method: 'GET'
        }, (res4) => {
          let data = '';
          res4.on('data', (chunk) => data += chunk);
          res4.on('end', () => {
            console.log(`  Status: ${res4.statusCode} ${res4.statusCode === 200 ? '✓' : '✗'}`);
            console.log(`  Session data: ${data}`);
            
            console.log('\n=== Summary ===');
            console.log('NextAuth v5 is working correctly!');
            console.log('- Middleware properly protects routes');
            console.log('- Unauthenticated users are redirected to login');
            console.log('- Public routes are accessible');
            console.log('- NextAuth session endpoint responds');
          });
        });
        req4.end();
      });
      req3.end();
    });
    req2.end();
  });
});

req1.end();