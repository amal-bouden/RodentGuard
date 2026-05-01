/*
 * RodentGuard IoT - ESP8266 Advanced Firmware
 * 
 * Components:
 * - ESP8266 (NodeMCU/Wemos D1 Mini)
 * - HW-201 Infrared Sensor (Obstacle detection)
 * - GPS6MV2 (NEO-6M) for location tracking
 * - Buzzer for local alarm
 * - Analog Weight Sensor (A0)
 * 
 * Wiring:
 * - IR HW-201: VCC (3.3V), GND (GND), OUT (D5)
 * - GPS6MV2:   VCC (3.3V), GND (GND), TX (D1), RX (D2)
 * - Buzzer:    Positive (D6), Negative (GND)
 * - HX711:    DT (D4), SCK (D3)
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <HX711.h>
#include <WiFiManager.h>
#include <EEPROM.h>

// --- CONFIGURATION ---
char serverUrl[60] = "http://10.187.74.71:8080";
const char* deviceToken = "rodent_guard_secret_2024";

// --- PINS ---
const int IR_SENSOR_PIN = D5;
const int BUZZER_PIN = D6;
const int GPS_RX_PIN = D1; // Connected to GPS TX
const int GPS_TX_PIN = D2; // Connected to GPS RX
const int LOADCELL_DOUT_PIN = D4;
const int LOADCELL_SCK_PIN = D3;

// --- OBJECTS ---
TinyGPSPlus gps;
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
HX711 scale;
float calibration_factor = -7050.0; // Adjustable calibration factor
unsigned long lastPingTime = 0;
const unsigned long pingInterval = 60000; // 1 minute

bool shouldSaveConfig = false;
void saveConfigCallback () {
  shouldSaveConfig = true;
}

void loadConfig() {
  EEPROM.begin(512);
  if (EEPROM.read(0) == 'R' && EEPROM.read(1) == 'G') {
    for (int i = 0; i < 60; ++i) {
      serverUrl[i] = EEPROM.read(2 + i);
    }
  }
}

void saveConfig() {
  EEPROM.write(0, 'R');
  EEPROM.write(1, 'G');
  for (int i = 0; i < 60; ++i) {
    EEPROM.write(2 + i, serverUrl[i]);
  }
  EEPROM.commit();
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  
  pinMode(IR_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  Serial.println("Initializing the scale...");
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare(); // Reset the scale to 0
  Serial.println("Scale initialized and tared.");
  
  loadConfig();
  
  WiFiManagerParameter custom_server_url("server", "Server URL", serverUrl, 60);
  WiFiManager wifiManager;
  wifiManager.setSaveConfigCallback(saveConfigCallback);
  wifiManager.addParameter(&custom_server_url);
  
  if (!wifiManager.autoConnect("RodentGuard_Setup")) {
    Serial.println("Failed to connect to WiFi and hit timeout");
    delay(3000);
    ESP.restart();
  }
  
  strcpy(serverUrl, custom_server_url.getValue());
  
  if (shouldSaveConfig) {
    saveConfig();
  }
  
  Serial.println("\nWiFi Connected!");
}

void loop() {
  // Feed GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (WiFi.status() == WL_CONNECTED) {
    checkSensors();
    
    // Periodic Ping
    if (millis() - lastPingTime > pingInterval) {
      sendPing();
      lastPingTime = millis();
    }
  }
}

void checkSensors() {
  bool irDetected = digitalRead(IR_SENSOR_PIN) == LOW; // Active Low
  
  long weightValue = 0;
  if (scale.is_ready()) {
    weightValue = scale.get_units(5); // Average of 5 readings
    if (weightValue < 0) weightValue = 0; // Prevent negative readings
  } else {
    Serial.println("HX711 not found.");
  }
  
  if (irDetected) {
    Serial.println("⚠️ RODENT DETECTED!");
    sendAlert(weightValue, irDetected);
    
    // Alert feedback (Loud Beep)
    tone(BUZZER_PIN, 2500); // 2500Hz beep
    delay(1000);
    noTone(BUZZER_PIN);
    
    delay(10000); // Cooldown
  }
}

void sendPing() {
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, String(serverUrl) + "/api/device/ping");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", deviceToken);
  
  StaticJsonDocument<512> doc;
  doc["macAddress"] = WiFi.macAddress();
  doc["battery"] = 100; // Logic for battery reading can be added here
  doc["signalStrength"] = WiFi.RSSI();
  
  if (scale.is_ready()) {
    doc["weight"] = scale.get_units(5);
  } else {
    doc["weight"] = 0;
  }
  
  if (gps.location.isValid()) {
    doc["lat"] = gps.location.lat();
    doc["lng"] = gps.location.lng();
  }

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  Serial.printf("Ping Result: %d\n", code);
  http.end();
}

void sendAlert(int weight, bool irActive) {
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, String(serverUrl) + "/api/device/alert");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", deviceToken);
  
  StaticJsonDocument<512> doc;
  doc["macAddress"] = WiFi.macAddress();
  doc["weight"] = weight;
  doc["irActive"] = irActive;
  
  if (gps.location.isValid()) {
    doc["lat"] = gps.location.lat();
    doc["lng"] = gps.location.lng();
  }

  String body;
  serializeJson(doc, body);
  int code = http.POST(body);
  Serial.printf("Alert Result: %d\n", code);
  http.end();
}
