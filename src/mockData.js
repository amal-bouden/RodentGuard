export const mockTraps = [
  {
    id: "NEXYS-3-6SLX16",
    nameIndex: "01",
    sectorKey: "kitchen",
    isAlert: false,
    weight: 0, // grams
    irActive: false, // infrared beam broken?
    buzzerOn: false,
    battery: 89,
    signalStrength: -45, // dBm
    lat: 35.8256,
    lng: 10.6084,
  },
  {
    id: "NEXYS-3-6SLX17",
    nameIndex: "02",
    sectorKey: "stockA",
    isAlert: true,
    weight: 345,
    irActive: true,
    buzzerOn: false,
    battery: 92,
    signalStrength: -50,
    lat: 35.8286,
    lng: 10.6184,
  },
  {
    id: "NEXYS-3-6SLX18",
    nameIndex: "03",
    sectorKey: "basement",
    isAlert: false,
    weight: 0,
    irActive: false,
    buzzerOn: false,
    battery: 15,
    signalStrength: -85,
    lat: 35.8210,
    lng: 10.6010,
  },
  {
    id: "NEXYS-3-6SLX19",
    nameIndex: "04",
    sectorKey: "garbage",
    isAlert: true,
    weight: 280,
    irActive: true,
    buzzerOn: true,
    battery: 76,
    signalStrength: -60,
    lat: 35.8300,
    lng: 10.6200,
  }
];

export const mockAlertLogs = [
  { id: 1, type: "CAPTURE", trapId: "NEXYS-3-6SLX17", time: "10:45 AM", dateKey: "today", msgKey: "capture_stock" },
  { id: 2, type: "BATTERY", trapId: "NEXYS-3-6SLX18", time: "09:00 AM", dateKey: "today", msgKey: "bat_critical" },
  { id: 3, type: "CAPTURE", trapId: "NEXYS-3-6SLX19", time: "08:30 AM", dateKey: "yesterday", msgKey: "capture_garbage" },
  { id: 4, type: "SYSTEM", trapId: "NEXYS-NETWORK", time: "05:00 AM", dateKey: "yesterday", msgKey: "sys_diag_pass" }
];
