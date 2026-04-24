// rateLimiter.js
// Protects against malfunctioning traps spamming the server
// A wet ESP32 could send 1000+ requests/second — this limits it to 1 req/5s

const rateLimit = require("express-rate-limit");

// General API limiter (for dashboard routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

// Strict device limiter (for ESP32 hardware endpoints)
const deviceLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Device rate limit exceeded — max 1 request per 5 seconds" },
  keyGenerator: (req) => {
    // Rate limit per IP (each ESP32 has its own IP)
    return req.ip;
  },
});

// Auth limiter — prevents brute force login attacks
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again in 10 minutes" },
});

module.exports = { apiLimiter, deviceLimiter, authLimiter };