const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

// store the JWT token
token: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;

