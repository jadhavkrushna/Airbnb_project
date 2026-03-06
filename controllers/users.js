const Listing = require("../models/listing.js");
const User = require("../models/user");
const passport = require("passport");
const ExpressError = require("../utils/ExpressError");

const userController = {
  // Render signup form
  renderSignupForm: (req, res) => {
    res.render("users/signup");
  },

  // Handle user signup
  signup: async (req, res, next) => {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      const newUser = new User({
        email,
        username,
        firstName,
        lastName,
      });

      const registeredUser = await User.register(newUser, password);

      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      });
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("/signup");
    }
  },

  // Render login form
  renderLoginForm: (req, res) => {
    res.render("users/login");
  },

  // Handle user login
  login: async (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  },

  // Handle user logout
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.flash("success", "Logged out successfully!");
      res.redirect("/listings");
    });
  },

  // Render profile page
  renderProfile: async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/profile", { user });
  },

  // Update profile
  updateProfile: async (req, res) => {
    const { firstName, lastName } = req.body;
    const user = await User.findById(req.user._id);

    user.firstName = firstName;
    user.lastName = lastName;

    if (req.file) {
      user.profileImage = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/listings");
  },
};

module.exports = userController;
