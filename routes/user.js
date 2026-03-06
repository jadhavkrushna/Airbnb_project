const express = require("express");
const router = express.Router();
const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");
const multer = require("multer");
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

// Signup routes
router.get("/signup", userController.renderSignupForm);
router.post("/signup", wrapAsync(userController.signup));

// Login routes
router.get("/login", userController.renderLoginForm);
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  userController.login
);

// Logout route
router.get("/logout", userController.logout);

// Profile routes
router.get("/profile", isLoggedIn, wrapAsync(userController.renderProfile));
router.put(
  "/profile",
  isLoggedIn,
  upload.single("profileImage"),
  wrapAsync(userController.updateProfile)
);

module.exports = router;
