const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    /** Display line for Discover (e.g. "Sat 14 Jun · 6pm"). */
    dateLabel: { type: String, trim: true },
    sportEmoji: { type: String, trim: true },
    spots: { type: Number, min: 0 },
    description: { type: String, trim: true },
    location: { type: String, trim: true },
    arena: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arena",
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "published",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
