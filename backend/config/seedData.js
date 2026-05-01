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
        macAddress: "AA:BB:CC:01:23:01",
        name: "SENTINEL 01",
        nodeId: "RG-NODE-01",
        sectorKey: "kitchen",
        locationName: "Kitchen North Block",
        lat: 35.8256,
        lng: 10.6084,
        battery: 89,
        signalStrength: -45
      },
      {
        macAddress: "AA:BB:CC:01:23:02",
        name: "SENTINEL 02",
        nodeId: "RG-NODE-02",
        sectorKey: "stockA",
        locationName: "Stock Room A",
        lat: 35.8286,
        lng: 10.6184,
        battery: 92,
        signalStrength: -50,
        isAlert: true,
        weight: 345,
        irActive: true
      },
      {
        macAddress: "AA:BB:CC:01:23:03",
        name: "SENTINEL 03",
        nodeId: "RG-NODE-03",
        sectorKey: "basement",
        locationName: "Basement Level 1",
        lat: 35.8210,
        lng: 10.6010,
        battery: 15,
        signalStrength: -85
      },
      {
        macAddress: "AA:BB:CC:01:23:04",
        name: "SENTINEL 04",
        nodeId: "RG-NODE-04",
        sectorKey: "garbage",
        locationName: "Garbage Area",
        lat: 35.8300,
        lng: 10.6200,
        battery: 76,
        signalStrength: -60,
        buzzerOn: true
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