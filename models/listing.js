const mongoose = require("mongoose");
const Review = require("./review");

const { Schema } = mongoose;

const ImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});

// Virtual for image thumbnail
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const ListingSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [100, "Title cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxLength: [1000, "Description cannot exceed 1000 characters"],
  },
  image: {
    type: ImageSchema,
    default: {
      url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      filename: "listingimage",
    },
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
  },
  country: {
    type: String,
    required: [true, "Country is required"],
    trim: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Virtual for average rating
ListingSchema.virtual("averageRating").get(function () {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }
  return 0;
});

// Post middleware to delete associated reviews when listing is deleted
ListingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Listing", ListingSchema);