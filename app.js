if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const Message = require("./models/message");
const Conversation = require("./models/conversation");
const Listing = require("./models/listing");

// Import routes
const listingRoutes = require("./routes/listing");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 8080;

// Database configuration
const MONGO_URL =
  process.env.ATLASDB_URL ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/wanderlust";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET || "fallbacksecret",
  },
  touchAfter: 24 * 3600, // 24 hours
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});

const sessionConfig = {
  store,
  name: "wanderlust_session",
  secret: process.env.SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware for flash messages and user data
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

const { isLoggedIn } = require("./middleware");

// Routes
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// Placeholder routes for new features
// Messaging Routes
app.get("/messages", isLoggedIn, async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants")
    .populate("listing")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });
  res.render("users/messages", { conversations, activeConversation: null });
});

app.get("/messages/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants")
    .populate("listing")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  const activeConversation = await Conversation.findById(id)
    .populate("participants")
    .populate("listing");

  if (!activeConversation || !activeConversation.participants.some(p => p._id.equals(req.user._id))) {
    req.flash("error", "Conversation not found or access denied.");
    return res.redirect("/messages");
  }

  const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 });
  res.render("users/messages", { conversations, activeConversation, messages });
});

app.post("/messages/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const conversation = await Conversation.findById(id).populate("participants");
  if (!conversation || !conversation.participants.some(p => p._id.equals(req.user._id))) {
    return res.status(403).json({ success: false, error: "Access denied" });
  }

  // 1. Save the user's message
  const newMessage = new Message({
    conversation: id,
    sender: req.user._id,
    content,
  });
  await newMessage.save();

  // 2. Identify the "Host" (the other participant)
  const host = conversation.participants.find(p => !p._id.equals(req.user._id));

  // 3. Automated Host Response Logic
  if (host) {
    let replyContent = "Thanks for your message! I'll get back to you as soon as possible.";
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("hi") || lowerContent.includes("hello")) {
      replyContent = `Hello! Thank you for reaching out. How can I help you with your stay?`;
    } else if (lowerContent.includes("price") || lowerContent.includes("cost") || lowerContent.includes("discount")) {
      replyContent = "The daily rate is fixed as shown on the listing, but for stays longer than a week, I might be able to offer a small discount!";
    } else if (lowerContent.includes("location") || lowerContent.includes("where") || lowerContent.includes("address")) {
      replyContent = "The exact address will be shared once the booking is confirmed, but it's very centrally located and close to public transport!";
    } else if (lowerContent.includes("check-in") || lowerContent.includes("time") || lowerContent.includes("entry")) {
      replyContent = "Standard check-in is at 2:00 PM. If you need an earlier time, please let me know and I'll see what I can do.";
    } else if (lowerContent.includes("ok") || lowerContent.includes("thanks") || lowerContent.includes("thank you")) {
      replyContent = "You're very welcome! Let me know if you have any other questions.";
    }

    const hostReply = new Message({
      conversation: id,
      sender: host._id,
      content: replyContent,
      isAutomated: false // Sent as the host
    });

    await hostReply.save();
    conversation.lastMessage = hostReply._id;
  } else {
    conversation.lastMessage = newMessage._id;
  }

  conversation.updatedAt = Date.now();
  await conversation.save();

  res.redirect(`/messages/${id}`);
});

// Inquiry & Automated Messages
app.post("/listings/:id/inquiry", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Check for existing conversation for this listing between these users
  let conversation = await Conversation.findOne({
    listing: id,
    participants: { $all: [req.user._id, listing.owner._id] }
  });

  if (!conversation) {
    conversation = new Conversation({
      listing: id,
      participants: [req.user._id, listing.owner._id]
    });
    await conversation.save();
  }

  // 1. Send inquiry message
  const hostName = listing.owner.firstName || listing.owner.email.split('@')[0];
  const inquiryMessage = new Message({
    conversation: conversation._id,
    sender: req.user._id,
    content: `Hi ${hostName}, I'm interested in your place "${listing.title}". Is it available for my dates?`,
    isAutomated: false
  });

  await inquiryMessage.save();

  // 2. Automated Host Response
  const autoReply = new Message({
    conversation: conversation._id,
    sender: listing.owner._id,
    content: `Hello! Thank you for reaching out about "${listing.title}". I'd be happy to host you! The place is currently available for most dates. Would you like to proceed with booking?`,
    isAutomated: false
  });
  await autoReply.save();

  conversation.lastMessage = autoReply._id;
  conversation.updatedAt = Date.now();
  await conversation.save();

  req.flash("success", "Inquiry sent to host!");
  res.redirect(`/messages/${conversation._id}`);
});

// Simulated Booking Confirmation (Status Update)
app.post("/listings/:id/book-now", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");

  let conversation = await Conversation.findOne({
    listing: id,
    participants: { $all: [req.user._id, listing.owner._id] }
  });

  if (!conversation) {
    conversation = new Conversation({ listing: id, participants: [req.user._id, listing.owner._id] });
    await conversation.save();
  }

  const confirmMessage = new Message({
    conversation: conversation._id,
    sender: listing.owner._id,
    content: `Your reservation at "${listing.title}" has been confirmed! We look forward to hosting you.`,
    isAutomated: true
  });

  await confirmMessage.save();
  conversation.lastMessage = confirmMessage._id;
  conversation.updatedAt = Date.now();
  await conversation.save();

  req.flash("success", "Booking successful! Confirmation sent to Messages.");
  res.redirect(`/messages/${conversation._id}`);
});

app.get("/trips", isLoggedIn, (req, res) => {
  res.render("users/dashboard", { title: "Trips", message: "No upcoming trips booked yet." });
});

app.get("/saved", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: {
      path: "owner",
    },
  });
  res.render("users/wishlist", { wishlist: user.wishlist });
});

// Toggle Wishlist
app.post("/listings/:id/wishlist", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const index = user.wishlist.indexOf(id);

  if (index === -1) {
    user.wishlist.push(id);
    await user.save();
    return res.json({ success: true, added: true });
  } else {
    user.wishlist.splice(index, 1);
    await user.save();
    return res.json({ success: true, added: false });
  }
});

// Home route redirect
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;

  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  res.status(statusCode).render("error", {
    message,
    statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
