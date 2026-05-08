const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: 254,
  },
  password: {
    type: String,
    required: true,
    maxlength: 128,
  },
  role: {
    type: String,
    enum: ["player", "owner", "admin"],
    default: "player",
  },
  disabled: {
    type: Boolean,
    default: false,
    index: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);