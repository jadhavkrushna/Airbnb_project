const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;

const listingController = {
  // Get all listings
  index: async (req, res) => {
    const allListings = await Listing.find({})
      .populate("owner", "email")
      .sort({ createdAt: -1 });
    res.render("listings/index", { allListings });
  },

  // Render new listing form
  renderNewForm: (req, res) => {
    res.render("listings/new");
  },

  // Show individual listing
  showListing: async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author", select: "email" },
        options: { sort: { createdAt: -1 } },
      })
      .populate("owner", "email");

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing, mapToken });
  },

  // Create new listing
  createListing: async (req, res) => {
    const { listing } = req.body;

    // Geocode the location
    let geoData = null;
    try {
      if (mapToken) {
        const geocodingClient = mbxGeocoding({ accessToken: mapToken });
        geoData = await geocodingClient
          .forwardGeocode({
            query: listing.location,
            limit: 1,
          })
          .send();
      }
    } catch (err) {
      console.log("Geocoding error:", err.message);
    }

    if (!geoData || !geoData.body || !geoData.body.features || !geoData.body.features.length) {
      console.log("Location not found or Geocoding disabled. Using default geometry.");
    }

    const newListing = new Listing(listing);
    newListing.owner = req.user._id;

    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    if (geoData && geoData.body && geoData.body.features && geoData.body.features.length) {
      newListing.geometry = geoData.body.features[0].geometry;
    } else {
      newListing.geometry = {
        type: "Point",
        coordinates: [0, 0] // Default fallback coordinates
      };
    }

    await newListing.save();
    req.flash("success", "New listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
  },

  // Render edit form
  renderEditForm: async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    if (originalImageUrl) {
      originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit", { listing, originalImageUrl });
  },

  // Update listing
  updateListing: async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;

    // Optional: Only re-geocode if location changed or geometry is missing
    let geoData = null;
    try {
      if (mapToken) {
        const geocodingClient = mbxGeocoding({ accessToken: mapToken });
        geoData = await geocodingClient
          .forwardGeocode({
            query: listing.location,
            limit: 1,
          })
          .send();
      }
    } catch (err) {
      console.log("Geocoding update error:", err.message);
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, listing, {
      new: true,
      runValidators: true,
    });

    if (geoData && geoData.body && geoData.body.features && geoData.body.features.length) {
      updatedListing.geometry = geoData.body.features[0].geometry;
    }

    if (req.file) {
      updatedListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await updatedListing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
  },

  // Delete listing
  deleteListing: async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings");
  },

  // Search listings
  searchListings: async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.redirect("/listings");
    }

    const searchRegex = new RegExp(q, "i");
    const listings = await Listing.find({
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex },
        { description: searchRegex },
      ],
    }).populate("owner", "username");

    res.render("listings/search", { listings, query: q });
  },
};

module.exports = listingController;
