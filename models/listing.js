const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
   url: String,
   filename: String,
  },
  price: Number,
  location: String, 
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
// geometry: {
//   type: {
//     type: String,
//     enum: 'Point',
//     required: true
//   },
//   coordinates: { 
//     type: [Number],
//     required: true
//   }
// }
  
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing){
     await Review.deleteMany({_id : {$in: listing.reviews}});
  }
}); 

module.exports = mongoose.model("Listing", listingSchema);
