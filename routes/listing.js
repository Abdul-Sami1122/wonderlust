const express = require("express");
const router = express.Router({mergeParams: true});
const listing = require("../Models/listing");
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isOwner,validateListing} = require("../middlewares.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
// Require counrdinaliry and storage info
const {storage} = require("../cloudConfig.js")
// Defining path where uploaded files should save
const upload = multer({storage});


// Filter request handling
router.get("/trending",wrapAsync(listingController.trending));
router.get("/rooms",wrapAsync(listingController.rooms));
router.get("/iconic_cities",wrapAsync(listingController.iconic_cities));
router.get("/mountain",wrapAsync(listingController.mountain));
router.get("/castels",wrapAsync(listingController.castels));
router.get("/amazing_pools",wrapAsync(listingController.amazing_pools));
router.get("/camping",wrapAsync(listingController.camping));
router.get("/farms",wrapAsync(listingController.farms));
router.get("/arctic",wrapAsync(listingController.arctic));


// Search Bar Get request 
router.get("/search",wrapAsync(listingController.search));



 
// Index Route to show all data & New Route to handle Post request for creation route
router.route("/")
.get(wrapAsync(listingController.index))
 .post(isLoggedIn,
      validateListing,
      upload.single('listing[image]'),
      wrapAsync(listingController.createListing)
    );


// Create Route
// New Route to handle GET request
router.get("/newlisting",isLoggedIn,listingController.renderNewForm);

// Update Route 
// First Get request to handle request & Handle PUT request
router.route("/update/:id")
.get(isLoggedIn,wrapAsync(listingController.renderEditForm))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing));

// Delete Request Route

router.delete("/delete/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));
// Show Route 
router.get("/:id",wrapAsync(listingController.showListing));







module.exports = router;