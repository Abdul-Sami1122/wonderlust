// Check if project is in development phase then use dotenv and if it deployed than use NODE_ENV variable
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

// Importing Express Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Creating connection to database with better error handling
const dbUrl = process.env.ATLASDB_URL;

// Check if database URL exists
if (!dbUrl) {
  console.error("ATLASDB_URL environment variable is missing!");
  // Don't crash the app, but log the error
}

async function main() {
  try {
    if (dbUrl) {
      await mongoose.connect(dbUrl);
      console.log("MongoDB connection established");
    } else {
      console.log("No MongoDB URL provided, running without database");
    }
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Don't throw error, allow app to start without DB
  }
}

// Initialize database connection
main();

// Set and Use variables
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

// Defining the engine for EJS Mate.
app.engine("ejs", ejsMate);
// Defining path for the static files
app.use(express.static(path.join(__dirname, "/public")));

// Mongo Session Store - Only if DB URL exists
let store;
if (dbUrl) {
  store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SECRET || "fallback-secret-for-development"
    },
    touchAfter: 24 * 3600,
  });

  store.on("error", (err) => {
    console.log("Error in Mongo Session Store:", err);
  });
}

// Defining Sessions option with fallback
const sessionOptions = {
  store: store || undefined, // Use memory store if no MongoDB
  secret: process.env.SECRET || "fallback-secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Using sessions
app.use(session(sessionOptions));
app.use(flash());

// Defining a passport middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Defining middleware for flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    database: dbUrl ? "Configured" : "Not configured",
    timestamp: new Date().toISOString()
  });
});

// Using Routes which we import
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Privacy and Terms
app.get("/privacy", (req, res, next) => {
  res.render("Privacy");
});

// Root route
app.get("/", (req, res) => {
  res.render("listings/index");
});

// Correct 404 handler
app.all("/*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("Error.ejs", { err });
});

// Export for Vercel
module.exports = app;