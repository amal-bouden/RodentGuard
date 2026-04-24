// deviceRoutes.js
// Routes for physical ESP32 traps
// All routes protected by device token + rate limiter

const express = require("express");
const router = express.Router();
const { ping, alert } = require("../controllers/deviceController");
const { verifyDeviceToken } = require("../middleware/deviceMiddleware");
const { deviceLimiter } = require("../middleware/rateLimiter");

// io is injected from server.js so controllers can emit Socket.io events
module.exports = (io) => {
  // POST /api/device/ping — ESP32 heartbeat
  router.post("/ping", deviceLimiter, verifyDeviceToken, ping(io));

  // POST /api/device/alert — rodent detected
  router.post("/alert", deviceLimiter, verifyDeviceToken, alert(io));

  return router;
};