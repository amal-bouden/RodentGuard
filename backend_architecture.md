# Express.js Backend Architecture: RodentGuard IoT

Based on the highly functional frontend we've built, your Express.js backend must perfectly bridge the gap between the physical prototype traps (ESP32/LoRa) and the React dashboard. Given the dependencies present in your project (`socket.io`, `serialport`, `express`), here is the professional blueprint for a secure, real-time backend. 

## 1. Core Responsibilities

The backend must act as the absolute source of truth. It handles:
- **Hardware Telemetry Ingestion**: Receiving data from both Wi-Fi prototypes and LoRa gateways.
- **Real-Time Client Sync**: Pushing live trap status to the React frontend instantly.
- **Event Logging**: Storing captured rodents, low battery events, and manual triggers in a database.
- **Automated Alerts**: Email and SMS dispatching.

---

## 2. Recommended System Architecture

### A. Communication Layers
1. **REST API (Express Router)**: 
   - Used by the React frontend to fetch initial states (e.g., `GET /api/traps`, `GET /api/logs`).
   - Used for authentication and user configuration (`PUT /api/settings`).
2. **WebSockets (Socket.io)**:
   - Maintains a live connection to the React frontend. Unidirectional bursts for alerts (`io.emit('trap_alert')`), and bidirectional events for triggering the trap buzzer remotely.
3. **Hardware Gateway (Serial / HTTP)**:
   - **For Wi-Fi ESP32**: Expose a secure POST route (`POST /api/telemetry`) that the trap hits when a sensor triggers.
   - **For LoRa ESP32 (Gateway)**: Use your installed `serialport` module to read incoming RF packets dynamically via USB.

### B. Database Schema (MongoDB / Mongoose Recommended)
*No IoT project is complete without persistent history.*

```javascript
// Trap Model
const trapSchema = new mongoose.Schema({
  macAddress: { type: String, required: true, unique: true },
  name: String,
  sectorKey: String,
  battery: Number,
  signalStrength: Number,
  weight: Number,      // Capteur de poids
  irActive: Boolean,   // Capteur IR
  isAlert: Boolean,
  buzzerOn: Boolean,
  lat: Number,
  lng: Number,
  lastSeen: Date
});

// Logs Model
const logSchema = new mongoose.Schema({
  type: { type: String, enum: ['CAPTURE', 'BATTERY', 'SYSTEM'] },
  trapId: String, // Reference to Trap
  message: String,
  timestamp: { type: Date, default: Date.now }
});
```

---

## 3. Necessary Backend Endpoints & Handlers

### For the Dashboard (React)
- `GET /api/traps` : Fetches the current state of all deployed traps.
- `GET /api/logs` : Fetches the historical log timeline.
- `POST /api/traps/:id/buzzer` : The route the "Trigger Buzzer" button hits. This then signals the ESP32.
- `PUT /api/settings` : Toggles SMS/Email preferences.

### For the Physical Traps (ESP32)
- `POST /api/device/ping` : Periodic "keep-alive" heartbeat (updates the battery & signal).
- `POST /api/device/alert` : Urgent interrupt: When the IR beam breaks or weight exceeds a threshold, the ESP instantly POSTs here.

---

## 4. Professional Security Measures (Jury Wow-Factor)

If you mention these during the *soutenance*, you will maximize your grade on security and robustness:

> [!CAUTION] 
> Physical IoT devices are prone to spoofing. The backend must enforce strict perimeter validation.

1. **Device Authentication (Hardware Secret)**:
   - Don't let anyone send a POST request pretending to be a trap. The ESP32 should send a pre-shared secret key (e.g., `x-device-token: 8f92a1...`) in the HTTP headers.
2. **Dashboard Authentication (JWT)**:
   - Protect the React dashboard via a Login portal using `jsonwebtoken` (JWT). Only authorized supervisors can disable alarms or view trap locations.
3. **Payload Validation (Joi or Zod)**:
   - All incoming hardware telemetry must be strictly validated. Prevent attacks by ensuring that `weight` is always an integer and `irActive` is strictly a boolean.
4. **Rate Limiting**:
   - Implement `express-rate-limit`. A malfunctioning trap (e.g., wet circuitry) could spam your server with 1000 requests per second. Limit ESP IPs to 1 request every 5 seconds normally.

---

## 5. Event-Driven Workflow Example
Here is exactly what happens when a rat enters the trap:

1. **Physical Trap**: The rat breaks the *capteur infrarouge* and the *capteur de poids* registers 250g.
2. **Network**: The ESP32 sends a `POST /api/device/alert` with `{ weight: 250, irActive: true }`.
3. **Express Backend**: Validates the secret key. Updates the MongoDB document for that trap. Saves a new Log document.
4. **Automated Actions**: The backend detects "Capture" mode, checks settings, and triggers **Twilio API** (for SMS) and **Nodemailer** (for Email) to the supervisor.
5. **Real-time Push**: The backend fires `io.emit('TRAP_UPDATE', trapData)`.
6. **React Frontend**: Instantly turns the map pin Red and plays a frontend notification sound without the user having to refresh the page!
