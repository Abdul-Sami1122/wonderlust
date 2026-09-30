const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middlewares");
const bookingController = require("../controllers/booking");

// View user's bookings
router.get("/", isLoggedIn, wrapAsync(bookingController.myBookings));

// Create booking for listing id
router.post("/:id", isLoggedIn, wrapAsync(bookingController.createBooking));

// Cancel a booking
router.post("/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
