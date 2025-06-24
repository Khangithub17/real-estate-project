// Test script to verify admin login functionality
const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('🧪 Testing Admin Login...\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@realestate.com',
      password: 'admin123'
    });
    
    if (response.data.success) {
      console.log('✅ Login Test PASSED!');
      console.log('User:', response.data.data.user.email);
      console.log('Role:', response.data.data.user.role);
      console.log('Token received:', response.data.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login Test FAILED!');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Login Test ERROR!');
    console.log('Error:', error.response?.data?.message || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Make sure to start the backend server first:');
      console.log('cd backend && npm run dev');
    }
  }
};

// Run the test
testAdminLogin();
