#!/usr/bin/env node

const { exec } = require('child_process');
const axios = require('axios');
const path = require('path');

// Configuration
const CONFIG = {
    BACKEND_URL: 'http://localhost:5000',
    FRONTEND_URL: 'http://localhost:3000',
    API_BASE: 'http://localhost:5000/api',
    ADMIN_CREDENTIALS: {
        email: 'admin@realestate.com',
        password: 'admin123'
    }
};

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkServerStatus(url, name) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        log(`✅ ${name} server is running (Status: ${response.status})`, 'green');
        return true;
    } catch (error) {
        log(`❌ ${name} server is not responding`, 'red');
        return false;
    }
}

async function testAPIEndpoints() {
    log('\n🧪 Testing API Endpoints...', 'cyan');
    
    try {
        // Test Login
        log('1️⃣ Testing admin login...', 'blue');
        const loginResponse = await axios.post(`${CONFIG.API_BASE}/auth/login`, CONFIG.ADMIN_CREDENTIALS);
        
        if (loginResponse.data.success) {
            log(`✅ Login successful - User: ${loginResponse.data.data.user.email}`, 'green');
            const token = loginResponse.data.data.token;
            const authHeaders = { Authorization: `Bearer ${token}` };
            
            // Test Projects
            log('2️⃣ Testing projects endpoint...', 'blue');
            const projectsResponse = await axios.get(`${CONFIG.API_BASE}/projects`);
            log(`✅ Projects endpoint working - Found ${projectsResponse.data.data?.projects?.length || 0} projects`, 'green');
            
            // Test Jobs
            log('3️⃣ Testing jobs endpoint...', 'blue');
            const jobsResponse = await axios.get(`${CONFIG.API_BASE}/jobs`);
            log(`✅ Jobs endpoint working - Found ${jobsResponse.data.data?.jobs?.length || 0} jobs`, 'green');
            
            // Test Blogs
            log('4️⃣ Testing blogs endpoint...', 'blue');
            const blogsResponse = await axios.get(`${CONFIG.API_BASE}/blogs`);
            log(`✅ Blogs endpoint working - Found ${blogsResponse.data.data?.blogs?.length || 0} blogs`, 'green');
            
            // Test User Profile
            log('5️⃣ Testing user profile...', 'blue');
            const profileResponse = await axios.get(`${CONFIG.API_BASE}/auth/me`, { headers: authHeaders });
            log(`✅ Profile endpoint working - User: ${profileResponse.data.data.user.email}`, 'green');
            
            return true;
        } else {
            log(`❌ Login failed: ${loginResponse.data.message}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ API test failed: ${error.message}`, 'red');
        if (error.response) {
            log(`   Status: ${error.response.status}`, 'red');
            log(`   URL: ${error.config.url}`, 'red');
        }
        return false;
    }
}

async function runDiagnostics() {
    log('🔍 Running Real Estate Project Diagnostics...', 'magenta');
    log('=' * 50, 'magenta');
    
    // Check if servers are running
    log('\n📡 Checking Server Status...', 'cyan');
    const backendRunning = await checkServerStatus(`${CONFIG.BACKEND_URL}/api/auth/login`, 'Backend');
    const frontendRunning = await checkServerStatus(CONFIG.FRONTEND_URL, 'Frontend');
    
    if (!backendRunning) {
        log('\n🚨 Backend server is not running!', 'red');
        log('💡 Start backend server with: cd backend && npm run dev', 'yellow');
        return false;
    }
    
    if (!frontendRunning) {
        log('\n⚠️  Frontend server is not running!', 'yellow');
        log('💡 Start frontend server with: cd frontend && npm start', 'yellow');
    }
    
    // Test API endpoints
    const apiWorking = await testAPIEndpoints();
    
    if (!apiWorking) {
        log('\n🚨 API endpoints are not working properly!', 'red');
        log('💡 Try seeding admin user with: cd backend && npm run seed-admin', 'yellow');
        return false;
    }
    
    // Summary
    log('\n🎉 DIAGNOSTICS COMPLETE!', 'green');
    log('=' * 50, 'green');
    
    if (backendRunning && apiWorking) {
        log('✅ Backend: Fully operational', 'green');
        log('✅ API: All endpoints working', 'green');
        log('✅ Authentication: Working correctly', 'green');
        log('✅ Database: Connected and responsive', 'green');
        
        if (frontendRunning) {
            log('✅ Frontend: Running successfully', 'green');
            log('\n🎯 READY TO GO!', 'green');
            log(`🌐 Visit: ${CONFIG.FRONTEND_URL}/admin/login`, 'cyan');
            log(`📧 Email: ${CONFIG.ADMIN_CREDENTIALS.email}`, 'cyan');
            log(`🔑 Password: ${CONFIG.ADMIN_CREDENTIALS.password}`, 'cyan');
        } else {
            log('⚠️  Frontend: Not running (optional for API testing)', 'yellow');
            log('💡 Start frontend with: cd frontend && npm start', 'yellow');
        }
    } else {
        log('❌ System not ready - see errors above', 'red');
    }
    
    return true;
}

// Run diagnostics
runDiagnostics().catch(error => {
    log(`🚨 Diagnostics failed: ${error.message}`, 'red');
    process.exit(1);
});
