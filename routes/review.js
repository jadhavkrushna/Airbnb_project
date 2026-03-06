const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviews");

// Create review - POST /listings/:id/reviews
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete review - DELETE /listings/:id/reviews/:reviewId
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(isReviewAuthor),
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
