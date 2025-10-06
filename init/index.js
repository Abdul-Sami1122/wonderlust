const mongoose = require("mongoose");
const initData = require("./data");
const listing = require("../Models/listing");

// Atlas connection string (keep credentials secure—use env vars in prod!)
const dbUrl = process.env;

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connection established");
}

const initializeDB = async () => {
  try {
    // Clear existing data
    await listing.deleteMany({});
    console.log("Cleared existing listings");

    // Prepare data with owner ID
    const seededData = initData.data.map((obj) => ({
      ...obj,
      owner: "68de8b34379932e2528531aa" // Ensure this ObjectId exists in your users collection if referenced
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
