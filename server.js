import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Initial Database State (In-Memory)
let trapDatabase = [
  { id: "RG-NODE-01", nameIndex: "01", sectorKey: "kitchen", isAlert: false, weight: 0, irActive: false, buzzerOn: false, battery: 89, signalStrength: -45, lat: 35.8256, lng: 10.6084 },
  { id: "RG-NODE-02", nameIndex: "02", sectorKey: "stockA", isAlert: true, weight: 345, irActive: true, buzzerOn: false, battery: 92, signalStrength: -50, lat: 35.8286, lng: 10.6184 },
  { id: "RG-NODE-03", nameIndex: "03", sectorKey: "basement", isAlert: false, weight: 0, irActive: false, buzzerOn: false, battery: 15, signalStrength: -85, lat: 35.8210, lng: 10.6010 },
  { id: "RG-NODE-04", nameIndex: "04", sectorKey: "garbage", isAlert: false, weight: 0, irActive: false, buzzerOn: true, battery: 76, signalStrength: -60, lat: 35.8300, lng: 10.6200 }
];

let alertLogs = [
  { id: 1, type: "CAPTURE", trapId: "RG-NODE-02", time: "10:45 AM", dateKey: "today", msgKey: "capture_stock" },
  { id: 2, type: "BATTERY", trapId: "RG-NODE-03", time: "09:00 AM", dateKey: "today", msgKey: "bat_critical" }
];

// --- 1. DASHBOARD API ROUTES ---
app.get('/api/traps', (req, res) => {
  res.json(trapDatabase);
});

app.get('/api/logs', (req, res) => {
  res.json(alertLogs);
});

// Manual Toggle for Alerts/Buzzer from Dashboard
app.post('/api/traps/:id/toggle', (req, res) => {
  const { id } = req.params;
  const { field } = req.body; // 'isAlert' or 'buzzerOn'
  
  let trapIndex = trapDatabase.findIndex(t => t.id === id);
  if (trapIndex !== -1) {
    trapDatabase[trapIndex][field] = !trapDatabase[trapIndex][field];
    
    // Notify all clients
    io.emit('TRAP_UPDATE', trapDatabase[trapIndex]);
    return res.json({ success: true, trap: trapDatabase[trapIndex] });
  }
  res.status(404).json({ error: "Trap not found" });
});

// --- 2. HARDWARE TELEMETRY RECEIVER ---
app.post('/api/telemetry', (req, res) => {
  const { trapId, weight, irActive, isAlert } = req.body;
  
  if (!trapId) return res.status(400).json({ error: "Missing Trap ID" });

  let trapIndex = trapDatabase.findIndex(t => t.id === trapId);
  if (trapIndex !== -1) {
    const wasAlert = trapDatabase[trapIndex].isAlert;
    trapDatabase[trapIndex] = { ...trapDatabase[trapIndex], weight, irActive, isAlert };
    
    // Create log entry if a new alert triggered
    if (isAlert && !wasAlert) {
      const newLog = {
          id: Date.now(),
          type: "CAPTURE",
          trapId: trapId,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateKey: "today",
          msgKey: trapDatabase[trapIndex].sectorKey === "stockA" ? "capture_stock" : "capture_event"
      };
      alertLogs.unshift(newLog);
      io.emit('LOG_UPDATE', newLog);
    }

    console.log(`[HARDWARE] ${trapId} -> weight: ${weight}g, Alert: ${isAlert}`);
    io.emit('TRAP_UPDATE', trapDatabase[trapIndex]);
  }

  res.status(200).json({ status: "ACK" });
});

// Redirect all other requests to React app (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- 3. SOCKET.IO ---
io.on('connection', (socket) => {
  console.log('📱 Client Connected:', socket.id);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RodentGuard IoT Backend running on port ${PORT}`);
});
