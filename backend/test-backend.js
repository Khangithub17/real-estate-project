const axios = require('axios');

async function testBackend() {
    try {
        console.log('🧪 Testing Backend API Endpoints...\n');

        // Test 1: Basic server health
        console.log('1. Testing server health...');
        try {
            const healthCheck = await axios.get('http://localhost:5000/api/projects');
            console.log('✅ Server is running and responding');
        } catch (error) {
            console.log('❌ Server not responding:', error.message);
            return;
        }

        // Test 2: Test admin login
        console.log('\n2. Testing admin login...');
        try {
            const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'admin@realestate.com',
                password: 'admin123'
            });
            
            if (loginResponse.data.success) {
                console.log('✅ Admin login successful!');
                console.log('Token received:', loginResponse.data.data.token ? 'Yes' : 'No');
                console.log('User role:', loginResponse.data.data.user.role);
            } else {
                console.log('❌ Login failed:', loginResponse.data.message);
            }
        } catch (error) {
            console.log('❌ Login request failed:', error.message);
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Response:', error.response.data);
            }
        }

        // Test 3: Test projects endpoint
        console.log('\n3. Testing projects endpoint...');
        try {
            const projectsResponse = await axios.get('http://localhost:5000/api/projects');
            console.log('✅ Projects endpoint working');
            console.log('Projects found:', projectsResponse.data.data?.projects?.length || 0);
        } catch (error) {
            console.log('❌ Projects endpoint failed:', error.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run tests
testBackend();
