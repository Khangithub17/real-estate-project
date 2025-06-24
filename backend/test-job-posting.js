#!/usr/bin/env node

// Job Posting Test Script
const http = require('http');

const testJobPosting = () => {
    console.log('🧪 Testing Job Posting API...\n');
    
    const jobData = {
        title: "Sales Manager",
        description: "A sales manager is responsible for leading a team of sales representatives and driving revenue growth for the company. They develop sales strategies, set targets, monitor performance, and provide coaching to team members. This role requires strong leadership skills, excellent communication abilities, and a deep understanding of sales processes and customer relationship management.",
        location: {
            city: "Vapi",
            state: "Gujarat",
            remote: false
        },
        department: "sales",
        employmentType: "full-time",
        experienceLevel: "senior-level",
        salary: {
            min: 10000,
            max: 79998,
            currency: "USD"
        },
        contactEmail: "abc@gmail.com",
        requirements: [], // Empty array - should be allowed now
        responsibilities: [], // Empty array - should be allowed now
        benefits: [],
        applicationDeadline: "2025-07-25",
        status: "active"
    };
    
    const postData = JSON.stringify(jobData);
    
    console.log('📧 Testing with job data:');
    console.log('Title:', jobData.title);
    console.log('Department:', jobData.department);
    console.log('Requirements:', jobData.requirements.length, 'items');
    console.log('Responsibilities:', jobData.responsibilities.length, 'items');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/jobs',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': 'Bearer YOUR_TOKEN_HERE' // You'd need to get this from login
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('\n✅ Response Status:', res.statusCode);
            try {
                const response = JSON.parse(data);
                
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log('🎉 JOB POSTING SUCCESSFUL!');
                    console.log('📋 Response:', {
                        success: response.success,
                        jobId: response.data?.job?._id || response.data?._id,
                        title: response.data?.job?.title || response.data?.title
                    });
                } else {
                    console.log('❌ Job posting failed');
                    console.log('Response:', response);
                    
                    if (response.errors) {
                        console.log('\n🔍 Validation Errors:');
                        response.errors.forEach(error => {
                            console.log(`   - ${error.path}: ${error.msg}`);
                        });
                    }
                }
            } catch (error) {
                console.log('❌ Invalid JSON response:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request failed:', error.message);
        console.log('💡 Make sure:');
        console.log('   1. Backend server is running on port 5000');
        console.log('   2. MongoDB is connected');
        console.log('   3. You have a valid auth token');
    });
    
    req.write(postData);
    req.end();
};

// Test without auth first to see validation
console.log('🔧 Testing Job Posting Validation (without auth)...');
testJobPosting();
