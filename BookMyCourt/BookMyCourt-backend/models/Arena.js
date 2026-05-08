const mongoose = require('mongoose');
const { ARENA_SPORTS } = require('../constants/sports');

const arenaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sport: {
    type: String,
    required: true,
    enum: [...ARENA_SPORTS],
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  pricePerSlot: {
    type: Number,
    required: true
  },
  /** Hero image URL for listings / detail (optional). Exposed as `img` on GET /api/arenas/discover. */
  imageUrl: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Arena', arenaSchema);