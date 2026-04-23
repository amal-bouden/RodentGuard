export const mockTraps = [
  {
    id: "RG-NODE-01",
    nameIndex: "01",
    sectorKey: "kitchen",
    isAlert: false,
    weight: 0,
    irActive: false,
    buzzerOn: false,
    battery: 89,
    signalStrength: -45,
    lat: 35.8256,
    lng: 10.6084,
  },
  {
    id: "RG-NODE-02",
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
    id: "RG-NODE-03",
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
    id: "RG-NODE-04",
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
  { id: 1, type: "CAPTURE", trapId: "RG-NODE-02", time: "10:45 AM", dateKey: "today", msgKey: "capture_stock" },
  { id: 2, type: "BATTERY", trapId: "RG-NODE-03", time: "09:00 AM", dateKey: "today", msgKey: "bat_critical" }
];
