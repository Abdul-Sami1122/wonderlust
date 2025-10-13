const listing = require("../Models/listing.js");
const mapToken = process.env.MAP_TOKEN;

// Initialize MapTiler SDK
let maptilersdk;

// Function to initialize MapTiler SDK
async function initializeMapTiler() {
  if (!maptilersdk) {
    try {
      const { config, geocoding } = await import("@maptiler/sdk");
      // Use named exports
      maptilersdk = { config, geocoding };
      // Store config and geocoding
      maptilersdk.config.apiKey = mapToken;
    } catch (err) {
      console.error("Failed to initialize MapTiler SDK:", err);
      throw err;
    }
  }
  return maptilersdk;
}

// Call initialization immediately
initializeMapTiler().catch((err) => {
  console.error("Initial MapTiler SDK load failed:", err);
});

// Index callback to show all data
module.exports.index = async (req, res) => {
  const allListings = await listing.find().sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};

// Create Route
// New Callback to handle GET request
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// New Callback to handle POST request for create
module.exports.createListing = async (req, res, next) => {
  try {
    // Ensure MapTiler SDK is initialized
    await initializeMapTiler();

    // Perform geocoding with MapTiler
    const { location, country } = req.body.listing;
    const query = `${location}, ${country}`.trim();
    const geocodeResult = await maptilersdk.geocoding.forward(query, {
      limit: 1,
    });
    const coordinates = geocodeResult.features[0]?.geometry.coordinates || null;

    // Check if file was uploaded
    if (!req.file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("/listings");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // Store geocoding coordinates (GeoJSON format)
    newListing.geometry = coordinates ? { type: "Point", coordinates } : null;

    const saved = await newListing.save();
    console.log("Saved listing:", saved);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error in createListing:", error);
    req.flash("error", "Failed to create listing.");
    res.redirect("/listings");
  }
};

// Update Route
// Get request callback to handle request from Edit form
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let updateListing = await listing.findById(id);
  if (!updateListing) {
    req.flash("error", "Listing you requested for is not existing.");
    return res.redirect("/listings");
  }
  let originalImageUrl = updateListing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/update.ejs", { updateListing, originalImageUrl });
};

// Handle PUT request for Edit form
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let Listing = await listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    Listing.image = { url, filename };
    await Listing.save();
  }
  req.flash("success", "Listing Successfully Updated");
  res.redirect(`/listings/${id}`);
};

// Delete Request Route callback
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await listing.findByIdAndDelete(id);
  req.flash("success", "Listing Successfully Deleted");
  res.redirect("/listings");
};

// Show Route Callback
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let Listing = await listing
    .findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!Listing) {
    req.flash("error", "Listing you requested for is not existing.");
    res.redirect("/listings");
  } else {
    res.render("listings/show.ejs", { Listing });
  }
};

// Filtered data review
// trending callback to show all data
module.exports.trending = async (req, res) => {
  const allListings = await listing
    .find({ category: "trending" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Rooms callback to show rooms data
module.exports.rooms = async (req, res) => {
  const allListings = await listing
    .find({ category: "rooms" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Iconic Cities callback to show rooms data
module.exports.iconic_cities = async (req, res) => {
  const allListings = await listing
    .find({ category: "iconic_cities" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Mountain Hotels callback to show rooms data
module.exports.mountain = async (req, res) => {
  const allListings = await listing
    .find({ category: "mountain" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Castels Hotels callback to show rooms data
module.exports.castels = async (req, res) => {
  const allListings = await listing
    .find({ category: "castels" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Amazing Pools Hotels callback to show rooms data
module.exports.amazing_pools = async (req, res) => {
  const allListings = await listing
    .find({ category: "amazing_pools" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Camping Hotels callback to show rooms data
module.exports.camping = async (req, res) => {
  const allListings = await listing
    .find({ category: "camping" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Farms side hotels callback to show rooms data
module.exports.farms = async (req, res) => {
  const allListings = await listing
    .find({ category: "farms" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};
// Arctic hotels callback to show rooms data
module.exports.arctic = async (req, res) => {
  const allListings = await listing
    .find({ category: "arctic" })
    .sort({ createdAt: -1 });
  res.render("listings/index.ejs", { allListings });
};

// Search Routes
module.exports.search = async (req, res) => {
  const keyword = req.query.keyword;
  let allListings = await listing
    .find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
        { country: { $regex: keyword, $options: "i" } },
      ],
    })
    .sort({ createdAt: -1 });
  if (allListings.length === 0) {
    allListings = await listing.find().sort({ createdAt: -1 }).limit(10);
  }
  res.render("listings/index.ejs", { allListings });
};
