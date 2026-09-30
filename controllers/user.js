const User = require("../Models/user");
const listing = require("../Models/listing");
const Review = require("../Models/review");
const Booking = require("../Models/booking");

// Get request call back for signup
module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Post request call back to submit in DataBase
module.exports.signUp = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/signup");
    } else {
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", `Welcome to Wonderlust, ${registeredUser.username}!`);
        res.redirect("/listings");
      });
    }
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

// Requests for login Get request call back
module.exports.renderLogInForm = (req, res) => {
  res.render("users/login.ejs");
};

// Post request route call back for login
module.exports.login = async (req, res) => {
  let { username } = req.body;
  req.flash("success", `Welcome back to Wonderlust, ${username}!`);
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// Logout Get request call back
module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have successfully logged out.");
    res.redirect("/listings");
  });
};

// User Profile / Dashboard
module.exports.renderProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  const myListings = await listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
  const rawReviews = await Review.find({ author: req.user._id }).sort({ createdAt: -1 });
  const myBookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  // Map each review to its parent listing
  const reviewIds = rawReviews.map((r) => r._id);
  const listingsWithReviews = await listing
    .find({ reviews: { $in: reviewIds } })
    .select("title image location country reviews");

  const myReviews = rawReviews.map((rev) => {
    const parentListing = listingsWithReviews.find((l) =>
      l.reviews.some((rid) => rid.toString() === rev._id.toString())
    );
    return {
      ...rev.toObject(),
      listing: parentListing || null,
    };
  });

  res.render("users/profile.ejs", {
    user,
    myListings,
    myReviews,
    myBookings,
  });
};

// Toggle Listing in Wishlist
module.exports.toggleWishlist = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  const isSaved = user.wishlist.some((favId) => favId.toString() === id);

  if (isSaved) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: id } });
    if (req.xhr || req.headers.accept?.includes("json")) {
      return res.json({ saved: false, message: "Removed from wishlist" });
    }
    req.flash("success", "Removed from your Wishlist");
  } else {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: id } });
    if (req.xhr || req.headers.accept?.includes("json")) {
      return res.json({ saved: true, message: "Added to wishlist" });
    }
    req.flash("success", "Added to your Wishlist!");
  }

  res.redirect(req.get("referer") || "/listings");
};

// View Wishlist
module.exports.renderWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.render("users/wishlist.ejs", { wishlist: user.wishlist || [] });
};