// deviceController.js
// Handles incoming data from physical ESP32 traps

// @route  POST /api/device/ping
const ping = (io) => async (req, res) => {
  const { macAddress, battery, signalStrength, lat, lng } = req.body;
  console.log(`[PING] Device: ${macAddress}, RSSI: ${signalStrength}`);

  const mockTrap = {
    macAddress,
    battery: battery || 100,
    signalStrength: signalStrength || -60,
    weight: req.body.weight !== undefined ? req.body.weight : 0,
    lat,
    lng,
    online: true,
    lastSeen: new Date()
  };

  // Always notify frontend even if DB fails
  console.log(`[PING] Weight: ${req.body.weight}, Lat: ${lat}, Lng: ${lng}`);
  io.emit("TRAP_UPDATE", mockTrap);
  res.status(200).json({ message: "Ping received (Demo Mode)", trap: mockTrap });
};

// @route  POST /api/device/alert
const alert = (io) => async (req, res) => {
  const { macAddress, weight, irActive, lat, lng } = req.body;
  console.log(`[ALERT] ⚠️ Rodent detected by: ${macAddress}, Weight: ${weight}g`);

  const alertData = {
    trap: {
        macAddress,
        weight: weight !== undefined ? weight : 0,
        irActive: irActive !== undefined ? irActive : true,
        isAlert: true,
        status: "CAPTURE_ACTIVE",
        lat,
        lng
    },
    log: {
        id: Date.now(),
        type: "CAPTURE",
        message: `⚠️ Rodent detected by ${macAddress}`,
        timestamp: new Date()
    },
    message: `⚠️ Rodent detected! (${macAddress})`
  };

  // BROADCAST TO DASHBOARD IMMEDIATELY
  io.emit("TRAP_ALERT", alertData);
  io.emit("TRAP_UPDATE", alertData.trap);

  res.status(200).json({ message: "Alert received (Demo Mode)", ...alertData });
};

module.exports = { ping, alert };