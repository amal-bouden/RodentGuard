const Trap = require("../models/Trap");

// Get all traps
const getAllTraps = async (req, res) => {
  try {
    const traps = await Trap.find().sort({ createdAt: 1 });
    res.status(200).json(traps);
  } catch (error) {
    console.error("Error fetching traps:", error);
    res.status(500).json({ message: "Failed to fetch traps", error: error.message });
  }
};

// Get trap by id
const getTrapById = async (req, res) => {
  try {
    const trap = await Trap.findById(req.params.id);
    if (!trap) {
      return res.status(404).json({ message: "Trap not found" });
    }
    res.status(200).json(trap);
  } catch (error) {
    console.error("Error fetching trap:", error);
    res.status(500).json({ message: "Failed to fetch trap", error: error.message });
  }
};

// Create a new trap
const createTrap = async (req, res) => {
  const { macAddress, name, nodeId, locationName, lat, lng, battery, signalStrength, status, online } = req.body;

  try {
    if (!macAddress || !name || !nodeId) {
      return res.status(400).json({ message: "macAddress, name, and nodeId are required" });
    }

    const newTrap = new Trap({
      macAddress,
      name,
      nodeId,
      locationName,
      lat,
      lng,
      battery,
      signalStrength,
      status,
      online,
      lastSeen: new Date(),
    });

    const trap = await newTrap.save();
    res.status(201).json(trap);
  } catch (error) {
    console.error("Error in creating trap:", error);
    res.status(500).json({ message: "Failed to create trap", error: error.message });
  }
};

// @route  POST /api/traps/:id/buzzer
// @desc   Trigger or stop the buzzer on a specific trap remotely
// @body   { activate: true | false }
// @auth   Protected — requires JWT
const triggerBuzzer = (io) => async (req, res) => {
  const { id } = req.params;
  const { activate } = req.body;

  try {
    if (typeof activate !== "boolean") {
      return res.status(400).json({ message: "activate must be a boolean (true to trigger, false to stop)" });
    }

    const trap = await Trap.findByIdAndUpdate(
      id,
      { buzzerOn: activate },
      { new: true }
    );

    if (!trap) {
      return res.status(404).json({ message: "Trap not found" });
    }

    // Emit buzzer command via Socket.io — ESP32 listens for this event
    io.emit("BUZZER_COMMAND", {
      trapId: trap._id,
      macAddress: trap.macAddress,
      nodeId: trap.nodeId,
      activate,
    });

    const action = activate ? "activated" : "deactivated";
    res.status(200).json({
      message: `Buzzer ${action} for trap ${trap.name}`,
      trap,
    });
  } catch (error) {
    console.error("Buzzer error:", error);
    res.status(500).json({ message: "Failed to trigger buzzer", error: error.message });
  }
};

module.exports = {
  getAllTraps,
  getTrapById,
  createTrap,
  triggerBuzzer,
};