const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig");

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listings");

const upload = multer({ storage });

// Index route - GET /listings
router.get("/", wrapAsync(listingController.index));

// Search route - GET /listings/search
router.get("/search", wrapAsync(listingController.searchListings));

// New route - GET /listings/new
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show route - GET /listings/:id
router.get("/:id", wrapAsync(listingController.showListing));

// Create route - POST /listings
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

// Edit route - GET /listings/:id/edit
router.get(
  "/:id/edit",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(listingController.renderEditForm)
);

// Update route - PUT /listings/:id
router.put(
  "/:id",
  isLoggedIn,
  wrapAsync(isOwner),
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// Delete route - DELETE /listings/:id
router.delete(
  "/:id",
  isLoggedIn,
  wrapAsync(isOwner),
  wrapAsync(listingController.deleteListing)
);

module.exports = router;
