const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'khan@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: khan@gmail.com');
      console.log('Password: admin123');
      return;
    }    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'khan@gmail.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Login credentials:');
    console.log('Email: khan@gmail.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
createAdminUser();
