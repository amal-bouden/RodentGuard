const Trap = require("../models/Trap");
const Log = require("../models/Log");

const getDashboardStats = async (req, res) => {
  try {
    const activeNodes = await Trap.countDocuments({ online: true });

    const captures = await Log.countDocuments({ type: "CAPTURE" });

    const lowBattery = await Trap.countDocuments({ battery: { $lte: 20 } });

    res.status(200).json({
      activeNodes,
      captures,
      lowBattery,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

module.exports = { getDashboardStats };