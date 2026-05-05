const Trap = require("../models/Trap");

// Get all traps
const getAllTraps = async (req, res) => {
  try {
    const traps = await Trap.find().sort({ createdAt: 1 });
    res.status(200).json(traps);
  } catch (error) {
    console.log("DB Error - Using Mock Fallback");
    const mockTraps = [
      { id: "RG-NODE-01", macAddress: "AA:BB:CC:DD:EE:01", name: "NODE-EE01", sectorKey: "kitchen", status: "SYSTEM_READY", lat: 35.8256, lng: 10.6084, battery: 88, weight: 0, signalStrength: -45, online: true },
      { id: "RG-NODE-02", macAddress: "AA:BB:CC:DD:EE:02", name: "NODE-EE02", sectorKey: "stockA", status: "SYSTEM_READY", lat: 35.8286, lng: 10.6184, battery: 92, weight: 0, signalStrength: -50, online: true },
    ];
    res.status(200).json(mockTraps);
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
const triggerBuzzer = (io) => async (req, res) => {
  const { id } = req.params;
  const { activate } = req.body;

  try {
    if (typeof activate !== "boolean") {
      return res.status(400).json({ message: "activate must be a boolean (true to trigger, false to stop)" });
    }

    let trap = null;
    
    try {
      // Try MongoDB first
      trap = await Trap.findByIdAndUpdate(
        id,
        { buzzerOn: activate },
        { new: true }
      );
    } catch (dbError) {
      console.log("DB Query failed, using demo mode");
      trap = null;
    }

    // Demo mode fallback - create virtual trap object
    if (!trap) {
      trap = {
        _id: id,
        macAddress: id,
        nodeId: id,
        name: `NODE-${id.toString().slice(-5)}`,
        buzzerOn: activate
      };
      console.log(`[BUZZER] Demo mode: ${activate ? "Activated" : "Deactivated"} for ${id}`);
    } else {
      console.log(`[BUZZER] DB mode: ${activate ? "Activated" : "Deactivated"} for ${trap.name}`);
    }

    // Emit buzzer command via Socket.io — ESP32 listens for this event
    io.emit("BUZZER_COMMAND", {
      trapId: trap._id || trap.id,
      macAddress: trap.macAddress,
      nodeId: trap.nodeId,
      activate,
    });

    // Broadcast update to frontend
    io.emit("TRAP_UPDATE", {
      id: trap._id || trap.id,
      macAddress: trap.macAddress,
      buzzerOn: activate
    });

    const action = activate ? "activated" : "deactivated";
    res.status(200).json({
      message: `Buzzer ${action} for trap ${trap.name || trap.macAddress}`,
      trap,
    });
  } catch (error) {
    console.error("Buzzer error:", error);
    res.status(500).json({ message: "Failed to trigger buzzer", error: error.message });
  }
};

// @route  POST /api/traps/:id/reset
// @desc   Clear an active alert status for a trap
const resetAlert = (io) => async (req, res) => {
  const { id } = req.params;

  try {
    let trap = null;
    
    try {
      // Try MongoDB first
      trap = await Trap.findByIdAndUpdate(
        id,
        { isAlert: false, status: "SYSTEM_READY", weight: 0, irActive: false },
        { new: true }
      );
    } catch (dbError) {
      console.log("DB Query failed, using demo mode");
      trap = null;
    }

    // Demo mode fallback - create virtual trap object
    if (!trap) {
      trap = {
        _id: id,
        macAddress: id,
        nodeId: id,
        name: `NODE-${id.toString().slice(-5)}`,
        isAlert: false,
        status: "SYSTEM_READY",
        weight: 0,
        irActive: false
      };
      console.log(`[RESET] Demo mode: Alert cleared for ${id}`);
    } else {
      console.log(`[RESET] DB mode: Alert cleared for ${trap.name}`);
    }

    // Notify frontend to update UI
    io.emit("TRAP_UPDATE", {
      id: trap._id || trap.id,
      macAddress: trap.macAddress,
      isAlert: false,
      status: "SYSTEM_READY",
      weight: 0,
      irActive: false
    });

    res.status(200).json({
      message: `Alert reset for trap ${trap.name || trap.macAddress}`,
      trap,
    });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ message: "Failed to reset alert", error: error.message });
  }
};

module.exports = {
  getAllTraps,
  getTrapById,
  createTrap,
  triggerBuzzer,
  resetAlert,
};