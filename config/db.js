const mongoose = require("mongoose");

// Fail fast instead of buffering every query for 10s when there's no
// active connection (this is what caused "users.findOne() buffering
// timed out after 10000ms" during registration).
mongoose.set("bufferCommands", false);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Catch a missing/empty .env value immediately instead of letting
  // mongoose attempt to parse `undefined` and fail with a confusing error.
  if (!uri) {
    console.error(
      "MongoDB connection error: MONGO_URI is not set. " +
        "Check that backend/.env exists and contains MONGO_URI=..., " +
        "and that dotenv.config() runs before connectDB()."
    );
    process.exit(1);
  }

  // Only log success from the actual 'connected' event, never optimistically.
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Ready State: ${mongoose.connection.readyState}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  try {
    // serverSelectionTimeoutMS controls how long mongoose will wait to find
    // a usable server (including DNS/SRV resolution) before giving up.
    // Lowered from the default 30s so a broken DNS/network path fails
    // fast and visibly instead of hanging.
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (error) {
    // This is the ONLY place a failed connection is reported for the
    // initial connect attempt. If you see this, mongoose.connect() did
    // NOT succeed - no success message will print because none is ever
    // printed optimistically.
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
