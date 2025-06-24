const http = require('http');

const testLogin = () => {
    console.log('🧪 Testing Real Estate Login API...\n');
    
    const credentials = JSON.stringify({
        email: 'khan@gmail.com',
        password: 'admin123'
    });
    
    console.log('📧 Testing with credentials:', JSON.parse(credentials));
    
    // Test the correct API endpoint
    console.log('1️⃣ Testing CORRECT endpoint: http://localhost:5000/api/auth/login');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(credentials)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('✅ Response Status:', res.statusCode);
            try {
                const response = JSON.parse(data);
                console.log('📋 Response:', {
                    success: response.success,
                    user: response.data?.user?.email,
                    token: response.data?.token ? 'Token received' : 'No token'
                });
                
                if (res.statusCode === 200 && response.success) {
                    console.log('\n🎉 LOGIN API IS WORKING CORRECTLY!');
                    console.log('✅ The backend is properly configured');
                    console.log('✅ Admin user exists and authentication works');
                    console.log('\n🔧 If frontend still shows 404:');
                    console.log('1. Clear browser cache completely');
                    console.log('2. Restart frontend server');
                    console.log('3. Check browser console for API debug logs');
                } else {
                    console.log('\n❌ Login failed');
                }
            } catch (error) {
                console.log('❌ Invalid JSON response:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request failed:', error.message);
        console.log('💡 Make sure backend server is running on port 5000');
    });
    
    req.write(credentials);
    req.end();
};

// Wait a moment to make sure backend is running
setTimeout(testLogin, 1000);
