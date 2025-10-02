const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const listing = require("../Models/listing");  
const Review = require("../Models/review");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middlewares");
const reviewController = require("../controllers/review");

// Reviews Requests from Show.js
// 1.Post request to add data
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// 2.Request from review to delete Data

router.delete("/:reviewid",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;