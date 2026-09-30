const listing = require("../Models/listing.js");
const { cloudinary } = require("../cloudConfig.js");
const mapToken = process.env.MAP_TOKEN;

// Initialize MapTiler SDK
let maptilersdk;

// Function to initialize MapTiler SDK
async function initializeMapTiler() {
  if (!maptilersdk) {
    try {
      const { config, geocoding } = await import("@maptiler/sdk");
      maptilersdk = { config, geocoding };
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

// Index callback with unified search, category, city, and price range filtering
module.exports.index = async (req, res) => {
  const { category, keyword, min, max, city } = req.query;
  let filter = {};

  if (category && category.trim()) {
    filter.category = category.trim();
  }

  if (city && city.trim()) {
    filter.location = { $regex: city.trim(), $options: "i" };
  }

  if (keyword && keyword.trim()) {
    const kw = keyword.trim();
    filter.$or = [
      { title: { $regex: kw, $options: "i" } },
      { location: { $regex: kw, $options: "i" } },
      { country: { $regex: kw, $options: "i" } },
    ];
  }

  if (min && max) {
    filter.price = { $gte: Number(min), $lte: Number(max) };
  } else if (min) {
    filter.price = { $gte: Number(min) };
  } else if (max) {
    filter.price = { $lte: Number(max) };
  }

  let message = null;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 9;
  const skip = (page - 1) * limit;

  // Retrieve distinct available cities for dropdown filter
  const rawCities = await listing.distinct("location");
  const distinctCities = rawCities.filter(Boolean).sort();

  let totalCount = await listing.countDocuments(filter);
  let allListings = await listing
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  if (allListings.length === 0 && (category || keyword || min || max || city) && page === 1) {
    message = "No listings found matching your search/filter criteria. Showing recent listings instead.";
    allListings = await listing.find().sort({ createdAt: -1 }).limit(limit);
    totalCount = allListings.length;
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  res.render("listings/index.ejs", {
    allListings,
    message,
    activeCategory: category || "",
    activeCity: city || "",
    distinctCities,
    activeMin: min || "",
    activeMax: max || "",
    activeKeyword: keyword || "",
    currentPage: page,
    totalPages,
    totalCount,
  });
};

// Create Route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Handle POST request for create
module.exports.createListing = async (req, res, next) => {
  try {
    let coordinates = [74.3587, 31.5204];
    try {
      await initializeMapTiler();
      const { location, country } = req.body.listing;
      const query = `${location}, ${country}`.trim();
      const geocodeResult = await maptilersdk.geocoding.forward(query, {
        limit: 1,
      });
      if (geocodeResult?.features?.[0]?.geometry?.coordinates) {
        coordinates = geocodeResult.features[0].geometry.coordinates;
      }
    } catch (geoErr) {
      console.warn("Geocoding notice (using fallback coordinates):", geoErr.message);
    }

    if (!req.file) {
      req.flash("error", "Please upload an image for the listing.");
      return res.redirect("/listings/newlisting");
    }

    let url = req.file.path.startsWith("http") ? req.file.path : "/uploads/" + req.file.filename;
    let filename = req.file.filename;
    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.maxGuests = Number(req.body.listing.maxGuests) || 4;
    newListing.geometry = { type: "Point", coordinates };

    const saved = await newListing.save();
    console.log("Saved listing:", saved.title);
    req.flash("success", "New Listing Created Successfully!");
    res.redirect("/listings/" + saved._id);
  } catch (error) {
    console.error("Error in createListing:", error);
    req.flash("error", "Failed to create listing: " + error.message);
    res.redirect("/listings/newlisting");
  }
};

// Update Route - Render Edit form
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let updateListing = await listing.findById(id);
  if (!updateListing) {
    req.flash("error", "Listing you requested for does not exist.");
    return res.redirect("/listings");
  }
  let originalImageUrl = updateListing.image ? updateListing.image.url : "";
  if (originalImageUrl && originalImageUrl.includes("/upload")) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
  }
  res.render("listings/update.ejs", { updateListing, originalImageUrl });
};

// Handle PUT request for Edit form
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let targetListing = await listing.findById(id);
  if (!targetListing) {
    req.flash("error", "Listing you requested for does not exist.");
    return res.redirect("/listings");
  }

  // Update fields
  Object.assign(targetListing, req.body.listing);
  if (req.body.listing?.maxGuests) {
    targetListing.maxGuests = Number(req.body.listing.maxGuests);
  }

  // If location or country changed, re-geocode
  const newLocation = req.body.listing?.location;
  const newCountry = req.body.listing?.country;
  if (newLocation || newCountry) {
    try {
      await initializeMapTiler();
      const query = `${newLocation || targetListing.location}, ${
        newCountry || targetListing.country
      }`.trim();
      const geocodeResult = await maptilersdk.geocoding.forward(query, {
        limit: 1,
      });
      const coordinates = geocodeResult?.features?.[0]?.geometry?.coordinates || null;
      if (coordinates) {
        targetListing.geometry = { type: "Point", coordinates };
      }
    } catch (err) {
      console.warn("MapTiler re-geocoding notice:", err.message);
    }
  }

  // If a new image was uploaded
  if (typeof req.file !== "undefined") {
    // Delete old image from Cloudinary if it was a Cloudinary asset
    if (
      targetListing.image &&
      targetListing.image.filename &&
      targetListing.image.url &&
      !targetListing.image.url.startsWith("/uploads/")
    ) {
      try {
        await cloudinary.uploader.destroy(targetListing.image.filename);
      } catch (err) {
        console.warn("Cloudinary cleanup notice:", err.message);
      }
    }
    let url = req.file.path.startsWith("http") ? req.file.path : "/uploads/" + req.file.filename;
    let filename = req.file.filename;
    targetListing.image = { url, filename };
  }

  await targetListing.save();
  req.flash("success", "Listing Updated Successfully!");
  res.redirect("/listings/" + id);
};

// Delete Request Route callback
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await listing.findByIdAndDelete(id);
  if (deleteListing && deleteListing.image && deleteListing.image.filename) {
    try {
      await cloudinary.uploader.destroy(deleteListing.image.filename);
    } catch (err) {
      console.error("Error deleting image from Cloudinary on delete:", err);
    }
  }
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
    req.flash("error", "Listing you requested for does not exist.");
    res.redirect("/listings");
  } else {
    res.render("listings/show.ejs", { Listing });
  }
};

// Category redirects for backwards-compatible routes
module.exports.trending = (req, res) => res.redirect("/listings?category=trending");
module.exports.rooms = (req, res) => res.redirect("/listings?category=rooms");
module.exports.iconic_cities = (req, res) =>
  res.redirect("/listings?category=iconic_cities");
module.exports.mountain = (req, res) => res.redirect("/listings?category=mountain");
module.exports.castels = (req, res) => res.redirect("/listings?category=castels");
module.exports.amazing_pools = (req, res) =>
  res.redirect("/listings?category=amazing_pools");
module.exports.camping = (req, res) => res.redirect("/listings?category=camping");
module.exports.farms = (req, res) => res.redirect("/listings?category=farms");
module.exports.arctic = (req, res) => res.redirect("/listings?category=arctic");

// Legacy Search and Range redirects
module.exports.search = (req, res) => {
  const keyword = req.query.keyword || "";
  res.redirect(`/listings?keyword=${encodeURIComponent(keyword)}`);
};

module.exports.range = (req, res) => {
  const { min, max } = req.query;
  res.redirect(`/listings?min=${min || ""}&max=${max || ""}`);
};
