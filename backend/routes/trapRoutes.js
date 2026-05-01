const express = require("express");
const router = express.Router();
const {
  getAllTraps,
  getTrapById,
  createTrap,
  triggerBuzzer,
  resetAlert,
} = require("../controllers/trapController");
const { protect } = require("../middleware/authMiddleware");

// io is injected from server.js for Socket.io buzzer events
module.exports = (io) => {
  // GET /api/traps — fetch all traps
  router.get("/", getAllTraps);

  // GET /api/traps/:id — fetch one trap
  router.get("/:id", getTrapById);

  // POST /api/traps — create a new trap
  router.post("/", createTrap);

  // POST /api/traps/:id/buzzer — trigger buzzer remotely
  router.post("/:id/buzzer", triggerBuzzer(io));

  // POST /api/traps/:id/reset — clear alert
  router.post("/:id/reset", resetAlert(io));

  return router;
};