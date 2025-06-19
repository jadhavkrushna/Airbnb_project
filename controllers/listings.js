const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });


//index listing
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

//new form listing
module.exports.renderNewForm = (req, res) => {
    return res.render("listings/new.ejs");
};

//showListing
module.exports.showListing= async (req, res, next) => {
    let { id } = req.params;
const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: { path: "author" }
  })
  .populate("owner");
    if (!listing) {
      req.flash("error", "Listing does not Exist");
      return res.redirect("/listings"); // <-- Add return here
    } 
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  };

  //createListing
  module.exports.createListing =  async (req, res) => {
  //  let response = await geocodingClient
  //     .forwardGeocode({
  //       query: req.body.listing.location,
  //       limit: 1
  //     })
  //     .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename};
    // newListing.geometry = req.body.listing.geomery[0].location;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
  };

  //renderEditForm
module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }

    // Only try to modify the image URL if it exists
    let originalImageUrl = listing.image;
    if (originalImageUrl && typeof originalImageUrl === "string") {
       originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    } else if (originalImageUrl && originalImageUrl.url) {
        originalImageUrl = originalImageUrl.url.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit", { listing, originalImageUrl });
};
   //destroyListing
  module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!!!")
    res.redirect("/listings");
    
  }

  //update  
  module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
   let listing =  await Listing.findByIdAndUpdate(id, {...req.body.listing});
   if( typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
    }
    req.flash("success","Listing Updated Successfully");
    res.redirect(`/listings/${id}`);
  };