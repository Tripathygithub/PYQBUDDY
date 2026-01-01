// You can add this temporarily to check
const User = require('./Models/User');
User.findOne({ id: '6b3417d8-1c7b-4a8c-8f9d-43c2080a46eb' })
  .then(user => console.log('User found:', user))
  .catch(err => console.log('Error:', err));