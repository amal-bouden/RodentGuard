// deviceMiddleware.js
// Validates the pre-shared secret sent by ESP32 in x-device-token header
// This prevents anyone from spoofing trap data

const verifyDeviceToken = (req, res, next) => {
  const deviceToken = req.headers["x-device-token"];

  if (!deviceToken) {
    return res.status(401).json({ message: "Unauthorized — missing x-device-token header" });
  }

  if (deviceToken !== process.env.DEVICE_SECRET) {
    return res.status(403).json({ message: "Forbidden — invalid device token" });
  }

  next();
};

module.exports = { verifyDeviceToken };