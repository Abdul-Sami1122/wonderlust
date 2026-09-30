const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const initData = require("./data");
const listing = require("../Models/listing");
const User = require("../Models/user");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connection established");
}

const initializeDB = async () => {
  try {
    // Clear existing data
    await listing.deleteMany({});
    console.log("Cleared existing listings");

    // Find or create an owner user
    let defaultOwner = await User.findOne();
    if (!defaultOwner) {
      defaultOwner = new User({
        email: "admin@wonderlust.com",
        username: "wonderlust_admin",
      });
      await User.register(defaultOwner, "admin123");
      console.log("Created default admin user for listings");
    }

    // Prepare data with owner ID
    const seededData = initData.data.map((obj) => ({
      ...obj,
      owner: defaultOwner._id,
    }));

    // Insert seeded data
    const result = await listing.insertMany(seededData);
    console.log(`Initialized ${result.length} listings successfully`);
  } catch (error) {
    console.error("Error initializing data:", error.message);
    throw error;  // Re-throw to bubble up if needed
  }
};

// Main execution flow
main()
  .then(async () => {
    // Only run seeding AFTER connection is confirmed
    await initializeDB();
  })
  .catch((error) => {
    console.error("Connection failed:", error.message);
  })
  .finally(async () => {
    // Close connection and exit
    await mongoose.connection.close();
    console.log("Connection closed");
    process.exit(0);
  });
