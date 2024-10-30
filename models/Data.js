const mongoose = require('mongoose');

// Define the schema for storing user data
const dataSchema = new mongoose.Schema({
  jwt: { type: String, required: true, unique: true },
  questionCount: { type: Number, default: 0 },
  history: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// Create and export the User model
const Data = mongoose.model('Data', dataSchema);

module.exports = Data;
