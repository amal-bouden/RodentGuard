import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); // Parses incoming hardware payloads

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Initial Database State (Mocking MongoDB for the Dashboard)
let trapDatabase = [
  { id: "NODE-ESP32-01", nameIndex: "01", sectorKey: "kitchen", isAlert: false, weight: 0, irActive: false, buzzerOn: false, battery: 89, signalStrength: -45, lat: 35.8256, lng: 10.6084 },
  { id: "NODE-ESP32-02", nameIndex: "02", sectorKey: "stockA", isAlert: true, weight: 345, irActive: true, buzzerOn: false, battery: 92, signalStrength: -50, lat: 35.8286, lng: 10.6184 },
  { id: "TRAP-LORA-A1", nameIndex: "03", sectorKey: "basement", isAlert: false, weight: 0, irActive: false, buzzerOn: false, battery: 15, signalStrength: -85, lat: 35.8210, lng: 10.6010 },
  { id: "TRAP-LORA-A2", nameIndex: "04", sectorKey: "garbage", isAlert: false, weight: 0, irActive: false, buzzerOn: true, battery: 76, signalStrength: -60, lat: 35.8300, lng: 10.6200 }
];

// --- 1. FRONTEND DASHBOARD ROUTE ---
app.get('/api/traps', (req, res) => {
  res.json(trapDatabase);
});

// --- 2. ESP32 HARDWARE RECEIVER ROUTE ---
// Your ESP32 C++ Code will literally do an HTTP POST to this URL!
app.post('/api/telemetry', (req, res) => {
  const { trapId, weight, irActive, isAlert } = req.body;
  
  if (!trapId) return res.status(400).json({ error: "Missing Trap ID" });

  // Find and update the trap
  let trapIndex = trapDatabase.findIndex(t => t.id === trapId);
  if (trapIndex !== -1) {
    trapDatabase[trapIndex] = { ...trapDatabase[trapIndex], weight, irActive, isAlert };
    console.log(`[HARDWARE SIGNAL] Updated trap ${trapId} -> weight: ${weight}g, IR: ${irActive}`);
    
    // 🔥 PUSH REAL TIME ALERT TO NATIVE MOBILE & FRONTEND!
    io.emit('TRAP_UPDATE', trapDatabase[trapIndex]);
  }

  res.status(200).json({ status: "ACK" });
});

// --- 3. SOCKET.IO CONNECTION ROUTER ---
io.on('connection', (socket) => {
  console.log('📱 Dashboard Client Connected:', socket.id);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RodentGuard IoT Backend running on port ${PORT}`);
  console.log(`📡 Ready to receive ESP32 POST signals at http://localhost:${PORT}/api/telemetry`);
});
