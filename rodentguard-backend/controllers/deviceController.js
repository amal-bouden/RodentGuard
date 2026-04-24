// deviceController.js
// Handles incoming data from physical ESP32 traps
// ping  → periodic heartbeat (battery, signal, online status)
// alert → urgent interrupt when IR beam breaks or weight threshold exceeded

const Trap = require("../models/Trap");
const Log = require("../models/Log");

// @route  POST /api/device/ping
// @desc   Periodic keep-alive from ESP32 — updates battery & signal
// @header x-device-token: <DEVICE_SECRET>
// @body   { macAddress, battery, signalStrength, weight?, irActive? }
const ping = (io) => async (req, res) => {
  const { macAddress, battery, signalStrength, weight, irActive } = req.body;

  try {
    if (!macAddress) {
      return res.status(400).json({ message: "macAddress is required" });
    }

    const trap = await Trap.findOneAndUpdate(
      { macAddress },
      {
        battery,
        signalStrength,
        weight: weight ?? 0,
        irActive: irActive ?? false,
        online: true,
        lastSeen: new Date(),
        // Auto-update status based on battery level
        status: battery <= 20 ? "LOW_BATTERY" : "SYSTEM_READY",
      },
      { new: true }
    );

    if (!trap) {
      return res.status(404).json({ message: `No trap found with macAddress: ${macAddress}` });
    }

    // Create a log if battery just dropped to low
    if (battery <= 20) {
      await Log.create({
        type: "BATTERY",
        trapId: trap._id,
        message: `${trap.name} battery is low (${battery}%)`,
      });
    }

    // Emit real-time update to React dashboard
    io.emit("TRAP_UPDATE", trap);

    res.status(200).json({ message: "Ping received", trap });
  } catch (error) {
    console.error("Ping error:", error);
    res.status(500).json({ message: "Ping failed", error: error.message });
  }
};

// @route  POST /api/device/alert
// @desc   Urgent interrupt — rodent detected (IR beam broken + weight threshold)
// @header x-device-token: <DEVICE_SECRET>
// @body   { macAddress, weight, irActive }
const alert = (io) => async (req, res) => {
  const { macAddress, weight, irActive } = req.body;

  try {
    if (!macAddress) {
      return res.status(400).json({ message: "macAddress is required" });
    }

    // Validate sensor data — weight must be a number, irActive must be boolean
    if (typeof weight !== "number") {
      return res.status(400).json({ message: "weight must be a number (grams)" });
    }
    if (typeof irActive !== "boolean") {
      return res.status(400).json({ message: "irActive must be a boolean" });
    }

    const trap = await Trap.findOneAndUpdate(
      { macAddress },
      {
        weight,
        irActive,
        isAlert: true,
        status: "CAPTURE_ACTIVE",
        lastSeen: new Date(),
      },
      { new: true }
    );

    if (!trap) {
      return res.status(404).json({ message: `No trap found with macAddress: ${macAddress}` });
    }

    // Save capture event to logs
    const log = await Log.create({
      type: "CAPTURE",
      trapId: trap._id,
      message: `${trap.name} detected a rodent — weight: ${weight}g, IR: ${irActive}`,
    });

    // Emit real-time alert to React dashboard
    // Frontend listens for this to turn map pin red + play alert sound
    io.emit("TRAP_ALERT", {
      trap,
      log,
      message: `⚠️ Rodent detected in ${trap.name} (${trap.locationName})`,
    });

    io.emit("TRAP_UPDATE", trap);

    res.status(200).json({
      message: "Alert received — capture logged",
      trap,
      log,
    });
  } catch (error) {
    console.error("Alert error:", error);
    res.status(500).json({ message: "Alert failed", error: error.message });
  }
};

module.exports = { ping, alert };