const express = require("express");
const passport = require("passport");
const router = express.Router();

// Start Google Authentication
router.get("/auth/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    req.flash("error", "Google authentication is not configured in local environment.");
    return res.redirect("/login");
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

// Google callback route
router.get("/auth/google/callback", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    req.flash("error", "Google authentication is not configured in local environment.");
    return res.redirect("/login");
  }
  passport.authenticate("google", {
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, () => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  });
});

module.exports = router;
