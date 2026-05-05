const mongoose = require("mongoose");

const trapSchema = new mongoose.Schema(
  {
    macAddress:     { type: String, required: true },
    name:           { type: String },           // ← enlève required
    nodeId:         { type: String },           // ← enlève required
    sectorKey:      { type: String, default: "" },

    locationName:   { type: String },           // ← enlève required
    lat:            { type: Number },           // ← enlève required
    lng:            { type: Number },           // ← enlève required

    battery:        { type: Number, default: 100 },
    signalStrength: { type: Number, default: -60 },
    weight:         { type: Number, default: 0 },
    irActive:       { type: Boolean, default: false },
    isAlert:        { type: Boolean, default: false },
    buzzerOn:       { type: Boolean, default: false },
    
    tenantId:       { type: String, default: "default_tenant" },
    temperature:    { type: Number },
    humidity:       { type: Number },
    speciesDetected:{ type: String },

    status: {
      type: String,
      enum: ["SYSTEM_READY", "CAPTURE_ACTIVE", "OFFLINE", "LOW_BATTERY"],
      default: "SYSTEM_READY",
    },

    online:   { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trap", trapSchema);