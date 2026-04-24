const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    smsAlerts: { type: Boolean, default: true },
    emailReports: { type: Boolean, default: true },
    meshSync: { type: Boolean, default: true },
    language: {
      type: String,
      enum: ["EN", "FR", "AR"],
      default: "EN",
    },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);