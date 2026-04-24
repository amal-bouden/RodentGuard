const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CAPTURE", "BATTERY", "SYSTEM"],
      required: true,
    },
    trapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trap",
      required: true,
    },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);