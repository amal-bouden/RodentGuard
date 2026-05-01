const mongoose = require("mongoose");
const Trap = require("../models/Trap");
const Log = require("../models/Log");
const Setting = require("../models/Setting");

const seedData = async () => {
  try {
    // Clear existing data
    await Trap.deleteMany();
    await Log.deleteMany();
    await Setting.deleteMany();

    // Create traps (4 traps)
    const traps = [
      {
        macAddress: "00:14:22:01:23:45",
        name: "Trap 1",
        nodeId: "node-001",
        locationName: "Kitchen North Block",
        lat: 35.6895,
        lng: 139.6917,
      },
      {
        macAddress: "00:14:22:01:23:46",
        name: "Trap 2",
        nodeId: "node-002",
        locationName: "Stock Room A",
        lat: 35.6897,
        lng: 139.6920,
      },
      {
        macAddress: "00:14:22:01:23:47",
        name: "Trap 3",
        nodeId: "node-003",
        locationName: "Basement Level 1",
        lat: 35.6899,
        lng: 139.6925,
      },
      {
        macAddress: "00:14:22:01:23:48",
        name: "Trap 4",
        nodeId: "node-004",
        locationName: "Garbage Area",
        lat: 35.6900,
        lng: 139.6930,
      },
    ];

    // Insert traps into DB
    await Trap.insertMany(traps);
    console.log("Traps inserted");

    // Create logs (2 logs)
    const logs = [
      {
        type: "CAPTURE",
        trapId: traps[0]._id,
        message: "Capture detected in Kitchen North Block",
      },
      {
        type: "BATTERY",
        trapId: traps[2]._id,
        message: "Battery low in Basement Level 1",
      },
    ];

    // Insert logs into DB
    await Log.insertMany(logs);
    console.log("Logs inserted");

    // Create default settings
    const settings = {
      smsAlerts: true,
      emailReports: true,
      meshSync: true,
      language: "EN",
      darkMode: false,
    };

    // Insert settings into DB
    await Setting.create(settings);
    console.log("Settings inserted");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
    mongoose.connection.close();
  }
};

// Correct MongoDB connection without deprecated options
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected for seeding...");
    seedData();
  })
  .catch((err) => console.error("MongoDB connection error:", err));