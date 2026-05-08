const mongoose = require('mongoose');
const { isValidDailySlot } = require('../config/slotConfig');

/** Bookings with these statuses hold the slot (unique index + availability). Cancelled frees the slot. */
const SLOT_OCCUPYING_STATUSES = Object.freeze(['confirmed', 'completed']);

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  arena: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Arena',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    validate: {
      validator: isValidDailySlot,
      message: 'Time slot must match a configured daily slot label',
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  refundStatus: {
    type: String,
    enum: ["none", "pending", "completed"],
    default: "none",
  },
  cancelledAt: {
    type: Date,
  },
}, { timestamps: true });

const occupies = { status: { $in: [...SLOT_OCCUPYING_STATUSES] } };

bookingSchema.index(
  { arena: 1, date: 1, timeSlot: 1, court: 1 },
  {
    unique: true,
    partialFilterExpression: {
      ...occupies,
      court: { $type: "objectId" },
    },
  }
);

bookingSchema.index(
  { arena: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      ...occupies,
      $or: [{ court: null }, { court: { $exists: false } }],
    },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
Booking.SLOT_OCCUPYING_STATUSES = SLOT_OCCUPYING_STATUSES;
module.exports = Booking;