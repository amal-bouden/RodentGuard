const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const logRoutes = require("./routes/logRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const trapRoutes = require("./routes/trapRoutes");   // io injected below
const deviceRoutes = require("./routes/deviceRoutes"); // io injected below

// Import Rate Limiters
const { authLimiter } = require("./middleware/rateLimiter");

console.log("Starting backend...");
console.log("MONGO_URI =", process.env.MONGO_URI);
console.log("PORT =", process.env.PORT);

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, "../dist")));

// Default Route
app.get("/api-status", (req, res) => {
  res.send("RodentGuard backend is running 🐀");
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/traps", trapRoutes(io));         // buzzer needs io
app.use("/api/logs", logRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/device", deviceRoutes(io));      // ping/alert need io

// Redirect all other requests to React app (SPA support)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../dist", "index.html"));
// });

// Socket.io Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});