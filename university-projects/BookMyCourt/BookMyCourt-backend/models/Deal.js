const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    arena: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arena",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", dealSchema);
