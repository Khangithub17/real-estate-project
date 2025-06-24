#!/usr/bin/env node

// Quick Login Test Script
const axios = require('axios');

const testLogin = async () => {
    console.log('🧪 Testing Real Estate Login API...\n');
    
    const credentials = {
        email: 'khan@gmail.com',
        password: 'admin123'
    };
    
    console.log('📧 Testing with credentials:', credentials);
    
    try {
        // Test the correct API endpoint
        console.log('1️⃣ Testing CORRECT endpoint: http://localhost:5000/api/auth/login');
        const correctResponse = await axios.post('http://localhost:5000/api/auth/login', credentials);
        console.log('✅ SUCCESS! Correct endpoint is working');
        console.log('📋 Response:', {
            success: correctResponse.data.success,
            user: correctResponse.data.data?.user?.email,
            token: correctResponse.data.data?.token ? 'Token received' : 'No token'
        });
        
    } catch (error) {
        if (error.response) {
            console.log('❌ FAILED at correct endpoint');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data?.message || error.response.statusText);
        } else {
            console.log('❌ Network error at correct endpoint:', error.message);
        }
    }
    
    try {
        // Test the incorrect endpoint (that browser is hitting)
        console.log('\n2️⃣ Testing INCORRECT endpoint: http://localhost:5000/auth/login');
        const incorrectResponse = await axios.post('http://localhost:5000/auth/login', credentials);
        console.log('🤔 Unexpected success at incorrect endpoint');
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Expected failure at incorrect endpoint');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data?.message || error.response.statusText);
            console.log('👉 This confirms the frontend is hitting the wrong URL!');
        } else {
            console.log('❌ Network error at incorrect endpoint:', error.message);
        }
    }
    
    console.log('\n🔧 SOLUTION:');
    console.log('The frontend must use: http://localhost:5000/api/auth/login');
    console.log('But it\'s currently using: http://localhost:5000/auth/login');
    console.log('\n💡 FIX: Clear browser cache and restart frontend server');
};

testLogin().catch(console.error);
