require('dotenv').config();
const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjM0MTdkOC0xYzdiLTRhOGMtOGY5ZC00M2MyMDgwYTQ2ZWIiLCJlbWFpbCI6InNvaGFtQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzM1NzM1OTkxLCJleHAiOjE3MzU4MjIzOTF9.9cqJrKZVqZSEZKJLqPSJHRKTLEZBPYQxqJJLqPSJHRKT'; // Your actual token

const testEndpoint = async () => {
  try {
    console.log('Testing GET /api/v1/user/questions');
    console.log('Token:', token.substring(0, 50) + '...\n');
    
    const response = await axios.get('http://localhost:9235/api/v1/user/questions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✓ Success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('✗ Error Response:');
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
      console.log('\nHeaders:', error.response.headers);
    } else if (error.request) {
      console.log('✗ No response received');
      console.log('Error:', error.message);
    } else {
      console.log('✗ Error:', error.message);
    }
  }
};

testEndpoint();
