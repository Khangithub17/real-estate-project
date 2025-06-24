const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test credentials
const credentials = {
    email: 'admin@realestate.com',
    password: 'admin123'
};

async function testAPI() {
    console.log('🧪 Testing Real Estate API Endpoints...\n');
    
    try {
        // Test 1: Login
        console.log('1️⃣ Testing Login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, credentials);
        
        if (loginResponse.data.success) {
            console.log('✅ Login successful');
            console.log(`👤 User: ${loginResponse.data.data.user.email}`);
            console.log(`🎯 Role: ${loginResponse.data.data.user.role}`);
            
            const token = loginResponse.data.data.token;
            const authHeaders = { Authorization: `Bearer ${token}` };
            
            // Test 2: Get Projects
            console.log('\n2️⃣ Testing Projects endpoint...');
            const projectsResponse = await axios.get(`${API_BASE}/projects`);
            console.log(`✅ Projects fetched: ${projectsResponse.data.data?.projects?.length || 0} items`);
            
            // Test 3: Get Jobs
            console.log('\n3️⃣ Testing Jobs endpoint...');
            const jobsResponse = await axios.get(`${API_BASE}/jobs`);
            console.log(`✅ Jobs fetched: ${jobsResponse.data.data?.jobs?.length || 0} items`);
            
            // Test 4: Get Blogs
            console.log('\n4️⃣ Testing Blogs endpoint...');
            const blogsResponse = await axios.get(`${API_BASE}/blogs`);
            console.log(`✅ Blogs fetched: ${blogsResponse.data.data?.blogs?.length || 0} items`);
            
            // Test 5: Get User Profile
            console.log('\n5️⃣ Testing User profile...');
            const profileResponse = await axios.get(`${API_BASE}/auth/me`, { headers: authHeaders });
            console.log(`✅ Profile fetched: ${profileResponse.data.data.user.email}`);
            
            console.log('\n🎉 ALL TESTS PASSED! API is working correctly.');
            console.log('\n📋 Next Steps:');
            console.log('1. Start frontend server: cd frontend && npm start');
            console.log('2. Visit: http://localhost:3000/admin/login');
            console.log('3. Login with: admin@realestate.com / admin123');
            
        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ API Test Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Message: ${error.response.data?.message || error.response.statusText}`);
            console.error(`URL: ${error.config.url}`);
        } else if (error.request) {
            console.error('No response received. Is the server running?');
            console.error('Make sure backend server is running on http://localhost:5000');
        } else {
            console.error('Error:', error.message);
        }
        
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Ensure backend server is running: cd backend && npm run dev');
        console.log('2. Check MongoDB is running');
        console.log('3. Verify admin user exists: cd backend && npm run seed-admin');
    }
}

// Run the test
testAPI();
