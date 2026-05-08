const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  arena: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arena',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);