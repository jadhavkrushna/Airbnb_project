const mongoose = require("mongoose");

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxLength: [500, "Comment cannot exceed 500 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
