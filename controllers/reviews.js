const Review = require("../models/review.js"); 
const Listing = require("../models/listing.js"); 




//createReview
module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();
    listing.reviews.push(newReview._id); // Push only the review's ID
    await listing.save();
    req.flash("success", "New Review Was Created");
    res.redirect(`/listings/${listing._id}`);
  };
  
//destroyReview
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success"," Review Was Delete");
    res.redirect(`/listings/${id}`);
  };