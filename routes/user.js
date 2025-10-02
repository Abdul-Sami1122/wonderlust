const express = require("express");
const router = express.Router();
const User =   require("../Models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares");
const userController = require("../controllers/user");


// Get request for signup && Post request to submit in DataBase
router.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signUp));

// Requests for login && Post request route for login
// Get request
router.route("/login")
.get(userController.renderLogInForm)
.post(saveRedirectUrl,
passport.authenticate("local", {failureRedirect: "/login",failureFlash: true},),
userController.login 
);

// Logout Get request

router.get("/logout",userController.logOut);

module.exports = router;