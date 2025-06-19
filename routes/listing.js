const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer"); 
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage }); 





//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
   .route("/")
   //Index Route
   .get(wrapAsync(listingController.index))
   //Create Route
   .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing))
    
    
router
    .route("/:id")
    //Show Route
    .get( wrapAsync(listingController.showListing))
    //Update Route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync (listingController.updateListing))
    //Delete Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;