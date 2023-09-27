const mongoose = require('mongoose');

// MongoDB connection URL
const mongoDBUrl = 'mongodb://127.0.0.1:27017/admin';

mongoose.connect(mongoDBUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event 
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
