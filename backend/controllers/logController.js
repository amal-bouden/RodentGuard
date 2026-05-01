const Log = require("../models/Log");

const getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find()
      .populate("trapId", "name nodeId locationName")
      .sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
};

module.exports = { getAllLogs };