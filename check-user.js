require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/User');

const userId = '6b3417d8-1c7b-4a8c-8f9d-43c2080a46eb';
const email = 'soham@gmail.com';

console.log('Connecting to MongoDB...');
console.log('MONGO_URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✓ MongoDB Connected\n');
    
    // Check by ID
    console.log(`Searching for user by ID: ${userId}`);
    const userById = await User.findOne({ id: userId });
    
    if (userById) {
      console.log('✓ User found by ID:', {
        id: userById.id,
        email: userById.email,
        name: userById.name,
        role: userById.role,
        isActive: userById.isActive
      });
    } else {
      console.log('✗ User NOT found by ID');
    }
    
    console.log('\n---\n');
    
    // Check by email
    console.log(`Searching for user by email: ${email}`);
    const userByEmail = await User.findOne({ email: email });
    
    if (userByEmail) {
      console.log('✓ User found by email:', {
        id: userByEmail.id,
        email: userByEmail.email,
        name: userByEmail.name,
        role: userByEmail.role,
        isActive: userByEmail.isActive
      });
    } else {
      console.log('✗ User NOT found by email');
    }
    
    console.log('\n---\n');
    
    // List all users
    const allUsers = await User.find({}).select('id email name role isActive');
    console.log(`Total users in database: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('\nAll users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}\n`);
      });
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  });
