// deviceController.js
// Handles incoming data from physical ESP32 traps

// @route  POST /api/device/ping
const ping = (io) => async (req, res) => {
  const { macAddress, battery, signalStrength, weight, lat, lng, temperature, humidity, doorClosed } = req.body;
  
  console.log(`[PING] Device: ${macAddress}`);
  console.log(`  Battery: ${battery}%, RSSI: ${signalStrength}dBm`);
  console.log(`  Weight: ${weight}g, Door: ${doorClosed ? "CLOSED" : "OPEN"}`);
  if (temperature !== undefined) console.log(`  Temp: ${temperature}°C, Humidity: ${humidity}%`);

  const trapData = {
    macAddress,
    id: macAddress,
    battery: battery || 100,
    signalStrength: signalStrength || -60,
    weight: weight !== undefined ? weight : 0,
    lat,
    lng,
    temperature,
    humidity,
    doorClosed: doorClosed !== undefined ? doorClosed : false,
    online: true,
    lastSeen: new Date().toISOString()
  };

  // Broadcast to all connected frontend clients
  io.emit("TRAP_UPDATE", trapData);
  console.log(`[PING] Broadcasted TRAP_UPDATE for ${macAddress}`);
  
  res.status(200).json({ message: "Ping received", trap: trapData });
};

// --- MOCK INTEGRATIONS FOR PITCH ---
const sendMockSMS = (macAddress, species, location) => {
  const adminPhone = "+216 55 123 456"; // Tunisian number format for presentation
  console.log(`\n======================================================`);
  console.log(`📲 [TWILIO SMS API SIMULATION]`);
  console.log(`To: ${adminPhone}`);
  console.log(`Message: ⚠️ URGENT ALERT: ${species} capture detected at ${macAddress} (Lat: ${location.lat}, Lng: ${location.lng}). Please dispatch technician.`);
  console.log(`Status: Message queued successfully`);
  console.log(`======================================================\n`);
};

// @route  POST /api/device/alert
const alert = (io) => async (req, res) => {
  const { macAddress, weight, irActive, lat, lng, temperature, humidity, doorClosed } = req.body;
  
  const cleanWeight = weight !== undefined && weight >= 0 ? weight : 0;
  
  console.log(`[ALERT] ⚠️ Rodent detected by: ${macAddress}`);
  console.log(`  Weight: ${cleanWeight}g, IR: ${irActive}, Door: ${doorClosed}`);
  
  let speciesDetected = "Unknown";
  if (cleanWeight > 0 && cleanWeight < 50) speciesDetected = "House Mouse";
  else if (cleanWeight >= 50 && cleanWeight < 400) speciesDetected = "Rat";
  else if (cleanWeight >= 400) speciesDetected = "Large Pest (e.g. Possum)";

  if (doorClosed && cleanWeight <= 5) speciesDetected = "False Alarm (Misfire)";
  
  console.log(`  Species: ${speciesDetected}`);

  const alertData = {
    trap: {
        id: macAddress,
        macAddress,
        weight: cleanWeight,
        irActive: irActive !== undefined ? irActive : true,
        isAlert: true,
        status: "CAPTURE_ACTIVE",
        lat,
        lng,
        temperature,
        humidity,
        doorClosed: doorClosed !== undefined ? doorClosed : true,
        speciesDetected,
        lastSeen: new Date().toISOString(),
        capturedAt: new Date().toISOString()
    },
    log: {
        id: Date.now(),
        type: "CAPTURE",
        message: `⚠️ ${speciesDetected} detected by ${macAddress}`,
        timestamp: new Date()
    },
    message: `⚠️ ${speciesDetected} detected! (${macAddress})`
  };

  // Trigger Actionable Integrations (Phase 4)
  if (speciesDetected !== "Unknown") {
    sendMockSMS(macAddress, speciesDetected, { lat, lng });
  }

  // BROADCAST TO DASHBOARD IMMEDIATELY
  io.emit("TRAP_ALERT", alertData);
  io.emit("TRAP_UPDATE", alertData.trap);
  console.log(`[ALERT] Broadcasted TRAP_ALERT and TRAP_UPDATE for ${macAddress}`);

  res.status(200).json({ message: "Alert received", ...alertData });
};

module.exports = { ping, alert };
