const mongoose = require("mongoose");
const { ARENA_SPORTS } = require("../constants/sports");

const courtSchema = new mongoose.Schema(
  {
    arena: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arena",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    /** Per-court sport (e.g. multi-sport venue). Falls back to arena.sport in APIs when unset. */
    sport: {
      type: String,
      enum: [...ARENA_SPORTS],
      required: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    /** Listed on venue for players vs hidden (Discover / listings may respect this). */
    visible: {
      type: Boolean,
      default: true,
    },
    /** Player booking eligibility; maintenance / unavailable block new bookings. */
    status: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courtSchema.index({ arena: 1, sortOrder: 1 });

module.exports = mongoose.model("Court", courtSchema);
