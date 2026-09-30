const Booking = require("../Models/booking");
const listing = require("../Models/listing");

// Create a new booking
module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const targetListing = await listing.findById(id);

  if (!targetListing) {
    req.flash("error", "Listing does not exist.");
    return res.redirect("/listings");
  }

  // Prevent host from booking their own listing
  if (targetListing.owner && targetListing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing!");
    return res.redirect(`/listings/${id}`);
  }

  const { checkIn, checkOut, guests } = req.body;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    req.flash("error", "Please provide valid check-in and check-out dates.");
    return res.redirect(`/listings/${id}`);
  }

  const diffTime = outDate.getTime() - inDate.getTime();
  const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalNights <= 0) {
    req.flash("error", "Check-out date must be after check-in date.");
    return res.redirect(`/listings/${id}`);
  }

  const guestCount = Math.max(1, Number(guests) || 1);
  const maxAllowed = targetListing.maxGuests || 4;
  if (guestCount > maxAllowed) {
    req.flash("error", `Guest limit exceeded! This property accommodates a maximum of ${maxAllowed} guest(s).`);
    return res.redirect(`/listings/${id}`);
  }

  const pricePerNight = targetListing.price;
  const basePrice = pricePerNight * totalNights;
  const tax = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + tax;

  const { paymentMethod = "cash", sandboxOutcome = "success", transactionId } = req.body;
  const validMethod = ["online", "cash"].includes(paymentMethod) ? paymentMethod : "cash";

  if (validMethod === "online") {
    if (sandboxOutcome === "insufficient_funds") {
      req.flash("error", "❌ Payment Failed: Insufficient balance in sandbox account. Payment was declined.");
      return res.redirect(`/listings/${id}`);
    } else if (sandboxOutcome === "card_declined") {
      req.flash("error", "❌ Payment Failed: Card declined by sandbox issuing bank. Transaction rejected.");
      return res.redirect(`/listings/${id}`);
    }
  }

  let statusOfPayment = "pending";
  let txnId = "CASH_ON_ARRIVAL";

  if (validMethod === "online") {
    statusOfPayment = "paid";
    txnId = transactionId || ("SB_TXN_" + Math.random().toString(36).substring(2, 9).toUpperCase());
  }

  const newBooking = new Booking({
    listing: targetListing._id,
    user: req.user._id,
    checkIn: inDate,
    checkOut: outDate,
    guests: guestCount,
    totalNights,
    pricePerNight,
    basePrice,
    tax,
    totalPrice,
    paymentMethod: validMethod,
    paymentStatus: statusOfPayment,
    transactionId: txnId,
    status: "confirmed",
  });

  await newBooking.save();
  if (validMethod === "online") {
    req.flash("success", `✅ Online Payment (Sandbox) Successful! Rs ${totalPrice.toLocaleString("en-IN")} processed. Txn ID: ${txnId}`);
  } else {
    req.flash("success", `✅ Reservation confirmed for ${totalNights} night(s)! Cash on arrival selected.`);
  }
  res.redirect("/bookings");
};

// View user's bookings
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: "listing",
      populate: {
        path: "owner",
      },
    })
    .sort({ createdAt: -1 });

  res.render("bookings/index.ejs", { bookings });
};

// Cancel a booking
module.exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate("listing");

  if (!booking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }

  const isGuest = booking.user.equals(req.user._id);
  const isHost = booking.listing && booking.listing.owner && booking.listing.owner.equals(req.user._id);

  if (!isGuest && !isHost) {
    req.flash("error", "You do not have permission to cancel this booking.");
    return res.redirect("/bookings");
  }

  booking.status = "cancelled";
  await booking.save();

  req.flash("success", "Booking has been cancelled.");
  res.redirect("/bookings");
};
