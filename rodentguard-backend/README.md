# 🐀 RodentGuard — Backend API

> Express.js REST API + Socket.io real-time server for the RodentGuard IoT rodent detection system.

---

## 📌 Overview

RodentGuard is an IoT system that connects physical ESP32 traps to a React dashboard via a Node.js backend. This repository contains the backend that bridges the hardware and the frontend in real time.

---

## 🏗️ Architecture

```
ESP32 Trap          Backend Express        React Dashboard
    |                      |                      |
    |-- POST /device/ping ->|                      |
    |-- POST /device/alert->|-- TRAP_ALERT ------->|
    |                      |-- TRAP_UPDATE ------->|
    |                      |                      |
    |                      |<-- GET /api/traps ----|
    |                      |<-- POST .../buzzer ---|
    |<-- BUZZER_COMMAND ----|                      |
```

- **REST API** → initial data loading + user actions
- **Socket.io** → real-time automatic updates (no page refresh needed)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
cd rodentguard-backend
npm install
```

### Environment Variables

Create a `.env` file in `rodentguard-backend/`:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/rodentguard
JWT_SECRET_KEY=your_jwt_secret_here
DEVICE_SECRET=rodentguard-esp32-secret-2024
```

### Run the server

```bash
node server.js
```

Server runs on `http://localhost:8080`

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register a new supervisor | Public |
| POST | `/api/auth/login` | Login and receive JWT token | Public |
| GET | `/api/auth/me` | Get current logged-in user | JWT |

### Traps — `/api/traps`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/traps` | Get all traps | Public |
| GET | `/api/traps/:id` | Get trap by ID | Public |
| POST | `/api/traps` | Create a new trap | Public |
| POST | `/api/traps/:id/buzzer` | Trigger buzzer remotely | JWT |

### Logs — `/api/logs`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/logs` | Get all event logs | Public |

### Dashboard — `/api/dashboard`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/dashboard` | Get stats summary | Public |

### Settings — `/api/settings`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/settings` | Get system settings | Public |
| PUT | `/api/settings` | Update settings | Public |

### Device (ESP32) — `/api/device`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/device/ping` | Heartbeat from ESP32 | Device Token |
| POST | `/api/device/alert` | Rodent detected alert | Device Token |

> Device routes require header: `x-device-token: <DEVICE_SECRET>`

---

## ⚡ Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `TRAP_UPDATE` | Server → Client | Trap state changed (battery, status...) |
| `TRAP_ALERT` | Server → Client | Rodent detected — triggers alarm on dashboard |
| `BUZZER_COMMAND` | Server → ESP32 | Activate/deactivate buzzer remotely |

---

## 🔐 Security

| Protection | Details |
|-----------|---------|
| JWT Auth | Protects sensitive routes (buzzer, user profile) |
| Device Token | `x-device-token` header — only trusted ESP32s can send data |
| Rate Limiting | `/api/device/*` → max 1 req/5s per IP |
| Rate Limiting | `/api/auth/login` → max 10 req/10min (brute-force protection) |
| Password Hashing | bcryptjs — passwords never stored in plain text |

---

## 🗄️ Database Schema (MongoDB)

### Trap
```
macAddress, name, nodeId, locationName, lat, lng,
battery, signalStrength, weight, irActive,
isAlert, buzzerOn, status, online, lastSeen
```

### Log
```
type (CAPTURE | BATTERY | SYSTEM), trapId, message, timestamp
```

### User
```
name, email, password (hashed), role (admin | supervisor | viewer)
```

### Setting
```
smsAlerts, emailReports, darkMode, language
```

---

## 🛠️ Tech Stack

| Technology | Role |
|-----------|------|
| Express.js | REST API server |
| Socket.io | Real-time bidirectional communication |
| MongoDB + Mongoose | Database + data modeling |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| express-rate-limit | Request rate limiting |

---

## 👩‍💻 Author

**Wiem Boughatta** — Backend Developer  
RodentGuard IoT Project — 2026
