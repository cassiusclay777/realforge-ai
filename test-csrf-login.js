const http = require('http');

async function testCsrfLogin() {
  console.log('=== Testing Login with CSRF Token ===\n');
  
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
        console.log(`   CSRF Token: ${csrfToken ? 'Received' : 'Not found'}`);
        
        // Save cookies from CSRF request
        if (csrfRes.headers['set-cookie']) {
          cookies = csrfRes.headers['set-cookie'];
          console.log(`   CSRF cookies: ${cookies.length}`);
        }
        
        if (!csrfToken) {
          console.log('   ERROR: No CSRF token');
          return;
        }
        
        // 2. Login with CSRF token
        console.log('\n2. Logging in with CSRF token...');
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
          console.log(`   Login status: ${loginRes.statusCode}`);
          console.log(`   Redirect: ${loginRes.headers.location || 'None'}`);
          
          // Update cookies
          if (loginRes.headers['set-cookie']) {
            cookies = loginRes.headers['set-cookie'];
            console.log(`   Login cookies: ${cookies.length}`);
          }
          
          let loginResponse = '';
          loginRes.on('data', (chunk) => {
            loginResponse += chunk;
          });
          
          loginRes.on('end', () => {
            try {
              const loginJson = JSON.parse(loginResponse);
              console.log(`   Login response: ${JSON.stringify(loginJson)}`);
            } catch (e) {
              console.log(`   Raw response: ${loginResponse}`);
            }
            
            // 3. Check session
            console.log('\n3. Checking session...');
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
              
              let sessionData = '';
              sessionRes.on('data', (chunk) => {
                sessionData += chunk;
              });
              
              sessionRes.on('end', () => {
                try {
                  const session = JSON.parse(sessionData);
                  console.log(`   Session: ${JSON.stringify(session, null, 2)}`);
                  console.log(`   User authenticated: ${!!session.user}`);
                } catch (e) {
                  console.log(`   Could not parse: ${sessionData}`);
                }
                
                console.log('\n=== Test Complete ===');
              });
            });
            
            sessionReq.on('error', (error) => {
              console.error('   Session request error:', error);
            });
            
            sessionReq.end();
          });
        });
        
        loginReq.on('error', (error) => {
          console.error('   Login request error:', error);
        });
        
        loginReq.write(loginData);
        loginReq.end();
        
      } catch (e) {
        console.log(`   Could not parse CSRF: ${csrfData}`);
      }
    });
  });
  
  csrfReq.on('error', (error) => {
    console.error('   CSRF request error:', error);
  });
  
  csrfReq.end();
}

testCsrfLogin();