const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Trying MongoDB connection...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("DEMO MODE: Continuing without database...");
  }
};

module.exports = connectDB;