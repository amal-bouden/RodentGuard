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
 * - Buzzer:    Positive (D8), Negative (GND)
 * - HX711:     DT (D4), SCK (D3)
 */

// --- Pin Definitions for NodeMCU/Wemos D1 Mini ---
#define D0 16
#define D1 5
#define D2 4
#define D3 0
#define D4 2
#define D5 14
#define D6 12
#define D7 13
#define D8 15
#define D9 3   // RX
#define D10 1  // TX
// -------------------------------------------------

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <HX711.h>
#include <WiFiManager.h>
#include <EEPROM.h>
#include <DHT.h>

// --- DHT11 SENSOR ---
#define DHTPIN D7
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
// -------------------------------------------

const bool ENABLE_DEEP_SLEEP = true;
const uint64_t SLEEP_INTERVAL = 3600e6; // 1 hour

// --- CONFIGURATION ---
char serverUrl[60] = "http://10.187.74.71:8080";
const char* deviceToken = "rodent_guard_secret_2024";

// --- PINS ---
const int IR_SENSOR_PIN = D5;
const int BUZZER_PIN = D8;
const int MICROSWITCH_PIN = D6;
const int GPS_RX_PIN = D1;
const int GPS_TX_PIN = D2;
const int LOADCELL_DOUT_PIN = D4;
const int LOADCELL_SCK_PIN = D3;

// --- OBJECTS ---
TinyGPSPlus gps;
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
HX711 scale;
float calibration_factor = -7050.0;
unsigned long lastPingTime = 0;
const unsigned long pingInterval = 60000;

unsigned long lastBuzzerCheckTime = 0;
const unsigned long buzzerCheckInterval = 2000; // Check buzzer state every 2 seconds
bool remoteBuzzerActive = false;

bool shouldSaveConfig = false;
void saveConfigCallback () { shouldSaveConfig = true; }

// --- CALIBRATION MODE ---
bool calibrationMode = false;
unsigned long calibrationStartTime = 0;

// --- Function Prototypes (Fixes Arduino IDE scope errors) ---
void loadConfig();
void saveConfig();
void checkSensors();
void sendPing();
void sendAlert(int weight, bool irActive, bool doorClosed);
void handleSerialCommands();
void startCalibration();
void runCalibration();
void endCalibration();
void checkRemoteBuzzer();
void activateBuzzer(int duration);
// ------------------------------------------------------------

void ICACHE_FLASH_ATTR loadConfig() {
  EEPROM.begin(512);
  if (EEPROM.read(0) == 'R' && EEPROM.read(1) == 'G') {
    for (int i = 0; i < 60; ++i) {
      serverUrl[i] = EEPROM.read(2 + i);
    }
  }
}

void ICACHE_FLASH_ATTR saveConfig() {
  EEPROM.write(0, 'R');
  EEPROM.write(1, 'G');
  for (int i = 0; i < 60; ++i) {
    EEPROM.write(2 + i, serverUrl[i]);
  }
  EEPROM.commit();
}

void handleSerialCommands() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();
    
    if (command == "CAL" || command == "CALIBRATE") {
      startCalibration();
    }
    else if (command == "TARE") {
      if (scale.is_ready()) {
        scale.tare();
        Serial.println("✓ Scale tared!");
      } else {
        Serial.println("✗ Scale not ready!");
      }
    }
    else if (command == "READ") {
      if (scale.is_ready()) {
        long reading = scale.get_units(10);
        Serial.printf("Raw reading: %ld\n", reading);
      } else {
        Serial.println("✗ Scale not ready!");
      }
    }
    else if (command == "TEST") {
      Serial.println("=== SENSOR TEST ===");
      Serial.printf("IR Sensor (D5): %s\n", digitalRead(IR_SENSOR_PIN) == LOW ? "BLOCKED" : "CLEAR");
      Serial.printf("Door Switch (D6): %s\n", digitalRead(MICROSWITCH_PIN) == LOW ? "CLOSED" : "OPEN");
      Serial.printf("Weight: %ld g\n", scale.is_ready() ? scale.get_units(5) : 0);
      Serial.printf("Temp: %.1f°C, Humidity: %.0f%%\n", dht.readTemperature(), dht.readHumidity());
      Serial.printf("WiFi Signal: %d dBm\n", WiFi.RSSI());
    }
    else if (command.startsWith("SET:")) {
      // SET:100 to set calibration factor to 100
      String value = command.substring(4);
      calibration_factor = value.toFloat();
      scale.set_scale(calibration_factor);
      Serial.printf("Calibration factor set to: %.2f\n", calibration_factor);
    }
  }
}

void startCalibration() {
  Serial.println("\n╔════════════════════════════════════════════════╗");
  Serial.println("║  HX711 CALIBRATION PROCEDURE                   ║");
  Serial.println("╚════════════════════════════════════════════════╝");
  Serial.println("Step 1: Remove ANY weight from the scale");
  Serial.println("Step 2: Send 'TARE' command");
  Serial.println("Step 3: Place a KNOWN weight on the scale (e.g., 100g)");
  Serial.println("Step 4: Send 'READ' command to get raw reading");
  Serial.println("Step 5: Calculate: NEW_FACTOR = -(raw_reading / known_weight)");
  Serial.println("Step 6: Send 'SET:VALUE' to apply (e.g., 'SET:-705')");
  Serial.println("Step 7: Test with different weights\n");
  
  calibrationMode = true;
  calibrationStartTime = millis();
  
  if (scale.is_ready()) {
    Serial.println("✓ Scale is ready");
    Serial.println("→ Remove weight and type 'TARE'\n");
  } else {
    Serial.println("✗ Scale NOT detected!\n");
    calibrationMode = false;
  }
}

void ICACHE_FLASH_ATTR sendAlert(int weight, bool irActive, bool doorClosed) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot send alert");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, String(serverUrl) + "/api/device/alert");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", deviceToken);
  
  StaticJsonDocument<256> doc;
  doc["macAddress"] = WiFi.macAddress();
  doc["weight"] = (weight < 0) ? 0 : weight;
  doc["irActive"] = irActive;
  doc["doorClosed"] = doorClosed;
  
  if (gps.location.isValid()) {
    doc["lat"] = gps.location.lat();
    doc["lng"] = gps.location.lng();
  }

  doc["temperature"] = dht.readTemperature();
  doc["humidity"] = dht.readHumidity();

  String body;
  serializeJson(doc, body);
  
  Serial.printf("→ ALERT: Sending to %s\n", (String(serverUrl) + "/api/device/alert").c_str());
  int code = http.POST(body);
  Serial.printf("  Response: %d\n  Payload: %s\n", code, body.c_str());
  
  http.end();
}

void ICACHE_FLASH_ATTR checkRemoteBuzzer() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  WiFiClient client;
  HTTPClient http;
  
  String url = String(serverUrl) + "/api/device/" + WiFi.macAddress() + "/buzzer-state";
  http.begin(client, url);
  http.addHeader("x-device-token", deviceToken);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(256);
    deserializeJson(doc, payload);
    
    bool shouldBuzz = doc["buzzerOn"] | false;
    
    if (shouldBuzz && !remoteBuzzerActive) {
      Serial.println("🔊 Remote buzzer command received - ACTIVATING");
      activateBuzzer(2000); // 2 second buzz
      remoteBuzzerActive = true;
    } else if (!shouldBuzz && remoteBuzzerActive) {
      Serial.println("🔇 Remote buzzer command - STOPPING");
      noTone(BUZZER_PIN);
      remoteBuzzerActive = false;
    }
  } else if (httpCode == -1) {
    Serial.println("Buzzer check failed (connection error)");
  }
  
  http.end();
}

void ICACHE_FLASH_ATTR activateBuzzer(int duration) {
  Serial.printf("🔊 Buzzer activated for %d ms\n", duration);
  tone(BUZZER_PIN, 2500, duration);
  delay(duration + 50);
  noTone(BUZZER_PIN);
}
  
  Serial.printf("→ ALERT: Sending to %s\n", (String(serverUrl) + "/api/device/alert").c_str());
  int code = http.POST(body);
  Serial.printf("  Response: %d\n  Payload: %s\n", code, body.c_str());
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600);
  
  pinMode(IR_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(MICROSWITCH_PIN, INPUT_PULLUP);
  
  Serial.println("\n\n===== RodentGuard IoT Boot Sequence =====");
  Serial.println("Initializing HX711 scale...");
  delay(100);
  
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  delay(500);
  
  if (scale.is_ready()) {
    Serial.println("✓ HX711 detected!");
    Serial.printf("  Calibration Factor: %.2f\n", calibration_factor);
    scale.set_scale(calibration_factor);
    
    Serial.println("  Taring scale (removing weight)...");
    scale.tare();
    delay(500);
    Serial.println("✓ Scale tared!");
    
    // Test read
    long testRead = scale.get_units(5);
    Serial.printf("  Test reading: %ld grams\n", testRead);
  } else {
    Serial.println("✗ ERROR: HX711 NOT DETECTED!");
    Serial.println("  Check wiring:");
    Serial.println("    - DT (D4 = GPIO2) connected?");
    Serial.println("    - SCK (D3 = GPIO0) connected?");
    Serial.println("    - VCC & GND connected?");
  }
  
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
  
  if (shouldSaveConfig) saveConfig();
  
  Serial.println("\nWiFi Connected!");
  Serial.printf("  SSID: %s\n", WiFi.SSID().c_str());
  Serial.printf("  IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("  Server URL: %s\n", serverUrl);
  
  dht.begin();
  wifiManager.setConfigPortalTimeout(120);
  Serial.println("===== Setup Complete =====\n");
}

void loop() {
  while (gpsSerial.available() > 0) gps.encode(gpsSerial.read());
  
  // Handle calibration/debug commands
  handleSerialCommands();

  if (WiFi.status() == WL_CONNECTED) {
    // Check for remote buzzer commands
    if (millis() - lastBuzzerCheckTime > buzzerCheckInterval) {
      checkRemoteBuzzer();
      lastBuzzerCheckTime = millis();
    }
    
    checkSensors();
    
    if (millis() - lastPingTime > pingInterval || ENABLE_DEEP_SLEEP) {
      sendPing();
      lastPingTime = millis();
      
      if (ENABLE_DEEP_SLEEP) {
        Serial.println("Going to Deep Sleep...");
        ESP.deepSleep(SLEEP_INTERVAL);
      }
    }
  }
}

void ICACHE_FLASH_ATTR checkSensors() {
  bool irDetected = digitalRead(IR_SENSOR_PIN) == LOW;
  bool doorClosed = digitalRead(MICROSWITCH_PIN) == LOW;
  
  long weightValue = 0;
  if (scale.is_ready()) {
    weightValue = scale.get_units(5);
    if (weightValue < 0) weightValue = 0;
    Serial.printf("Scale ready, weight: %ld grams\n", weightValue);
  } else {
    Serial.println("⚠️ WARNING: HX711 scale not ready!");
    Serial.println("Check connections: DT (D4) and SCK (D3)");
  }
  
  if (irDetected || doorClosed) {
    Serial.println("⚠️ TRAP TRIGGERED!");
    Serial.printf("  IR Detected: %s, Door Closed: %s, Weight: %ld\n", irDetected ? "YES" : "NO", doorClosed ? "YES" : "NO", weightValue);
    sendAlert(weightValue, irDetected, doorClosed);
    
    tone(BUZZER_PIN, 2500);
    delay(1000);
    noTone(BUZZER_PIN);
    delay(10000);
  }
}

void ICACHE_FLASH_ATTR sendPing() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping ping");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, String(serverUrl) + "/api/device/ping");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", deviceToken);
  
  StaticJsonDocument<256> doc;
  doc["macAddress"] = WiFi.macAddress();
  doc["battery"] = 100;
  doc["signalStrength"] = WiFi.RSSI();
  doc["doorClosed"] = (digitalRead(MICROSWITCH_PIN) == LOW);
  
  long weight = scale.is_ready() ? scale.get_units(5) : 0;
  doc["weight"] = (weight < 0) ? 0 : weight;
  
  if (gps.location.isValid()) {
    doc["lat"] = gps.location.lat();
    doc["lng"] = gps.location.lng();
  }
  
  doc["temperature"] = dht.readTemperature();
  doc["humidity"] = dht.readHumidity();

  String body;
  serializeJson(doc, body);
  
  Serial.printf("→ PING: Sending to %s\n", (String(serverUrl) + "/api/device/ping").c_str());
  int code = http.POST(body);
  Serial.printf("  Response: %d (Weight: %ldg, RSSI: %d dBm, Door: %s)\n", 
    code, weight, WiFi.RSSI(), digitalRead(MICROSWITCH_PIN) == LOW ? "CLOSED" : "OPEN");
  
  http.end();
}

void ICACHE_FLASH_ATTR sendAlert(int weight, bool irActive, bool doorClosed) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, cannot send alert");
    return;
  }
  
  WiFiClient client;
  HTTPClient http;
  
  http.begin(client, String(serverUrl) + "/api/device/alert");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-device-token", deviceToken);
  
  StaticJsonDocument<256> doc;
  doc["macAddress"] = WiFi.macAddress();
  doc["weight"] = (weight < 0) ? 0 : weight;
  doc["irActive"] = irActive;
  doc["doorClosed"] = doorClosed;
  
  if (gps.location.isValid()) {
    doc["lat"] = gps.location.lat();
    doc["lng"] = gps.location.lng();
  }

  doc["temperature"] = dht.readTemperature();
  doc["humidity"] = dht.readHumidity();

  String body;
  serializeJson(doc, body);
  
  Serial.printf("→ ALERT: Sending to %s\n", (String(serverUrl) + "/api/device/alert").c_str());
  int code = http.POST(body);
  Serial.printf("  Response: %d\n  Payload: %s\n", code, body.c_str());
  
  http.end();
}
