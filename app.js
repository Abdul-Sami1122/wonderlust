// Check if project is is devolpment phase then use dotenv and if it deployed than use NODE_ENV variable
if (!process.env.NODE_ENV != "production") {
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
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

// Importing Express Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Creating connection to data base

const dbUrl = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}
// Calling a main function of Data Base

main()
  .then(() => {
    console.log("Connection established");
  })
  .catch(() => {
    console.log("Connection Failed");
  });
// Set and Use variables

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
// Set value to override requests
app.use(methodOverride("_method"));
// Middleware to parse JSON bodies
app.use(express.json());

// Defining the engine for EJS Mate.
app.engine("ejs", ejsMate);
// Defining ath for the static files
app.use(express.static(path.join(__dirname, "/public")));
// Mongo Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
// Error Handling for session store
store.on("error", () => {
  console.log("Error in MOngo Session Store:", err);
});

// Defining Sessions option
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveunintialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Using sessions
app.use(session(sessionOptions));

// Using flash
app.use(flash());

// Defining a passport middlewares
app.use(passport.initialize());
// To define a user in a single session
app.use(passport.session());
// used to authenticate every request and user
passport.use(new LocalStrategy(User.authenticate()));
// User related info storing in a session is called serialization
passport.serializeUser(User.serializeUser());
// removing user info from sesson after closing session is called deserialization
passport.deserializeUser(User.deserializeUser());
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// Google Authorization
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists by googleId
        let existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) return done(null, existingUser);

        // Generate a unique username by adding last 5 chars of Google ID
        const uniqueUsername = `${profile.displayName.replace(
          /\s+/g,
          "_"
        )}_${profile.id.slice(-5)}`;

        // Create new user
        const newUser = new User({
          username: uniqueUsername,
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "NoEmail",
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error("Error creating Google user:", err);
        return done(err, null);
      }
    }
  )
);

// Defining middleware for flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});
// Google route login
const authRouter = require("./routes/auth.js");
app.use("/", authRouter);

// Using Routes which we import
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Privacy and Terms
app.get("/privacy", async (req, res, next) => {
  res.render("Privacy");
});

// Custom Error Handling middleware for Backend

app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("Error.ejs", { err });
});

// Defining Port number
app.listen(8080, () => {
  console.log("Server runs at port number 8080.");
});
