const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    arena: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Arena",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

reviewSchema.index({ arena: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
