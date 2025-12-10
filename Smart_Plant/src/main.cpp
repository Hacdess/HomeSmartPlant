#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>      // TLS
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// =======================================================
//                     PIN CONFIG
// =======================================================
#define DHTPIN 4
#define DHTTYPE DHT11

#define LIGHT_PIN 34
#define SOIL_PIN 35
#define RAIN_PIN 36

#define BUTTON_PIN 5
#define BUZZER_PIN 18
#define RELAY_PUMP 19   // Active HIGH

// =======================================================
//                     OBJECTS
// =======================================================
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// =======================================================
//                     WIFI & MQTT CONFIG
// =======================================================
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

const char* mqttServer = "c91c3b64d47444098772381daeb628ea.s1.eu.hivemq.cloud";
const int mqttPort = 8883;

const char* mqttUser = "mqtt-user";
const char* mqttPass = "mqtt-password";

const char* deviceID = "esp32_c91c3b64d47444098772381daeb628ea";

// =======================================================
//                     TLS ROOT CERT
// =======================================================
const char* root_ca =
"-----BEGIN CERTIFICATE-----\n"
"MIIDSjCCAjKgAwIBAgIQRl5NvKPC3DxbhQ36SEs88TANBgkqhkiG9w0BAQsFADA/\n"
"MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFjAUBgNVBAMT\n"
"DURTVCBSb290IENBIFgzMB4XDTIwMDkwMTAwMDAwMFoXDTMwMDgyOTIzNTk1OVow\n"
"PzEkMCIGA1UEChMbRGlnaXRhbCBTaWduYXR1cmUgVHJ1c3QgQ28uMRYwFAYDVQQD\n"
"Ew1EU1QgUm9vdCBDQSBYMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB\n"
"AJ0T0U/3sSVDQKp0qKXqQyV2pAonw8rWBVg1SPjz67sV1Nw3pS4o0lS2Vx2jcWc1\n"
"hlV5PxL2M8xSD1XD4kvp+JaR6R1x7U0EdGDQmL1o0jXP9DD35JtIhXCTITVEWilR\n"
"vJ6Z0TiQ2jHGhEq+y3OC/YLXTr4Wr9yi5xRngk6VwBEmc6k6R/+qvOB0fOkH1ZZ1\n"
"p1Zd0NenE2x0RvrRZtGJPD7W82dManIeZDV4mQdlqzTeWY5AvzkdxlIo0NGdiszI\n"
"gxF5EYh3YOEoTP0TO+GfY+3CX6XfGZV8oPZxC25f6/sOlne342XQI3/OQvPsvPV/\n"
"Fnf4Idu8LojRxurx8Wc58SUCAwEAAaNCMEAwDgYDVR0PAQH/BAQDAgEGMA8GA1Ud\n"
"EwEB/wQFMAMBAf8wHQYDVR0OBBYEFMSmc5QwTqHoPazTA/gkGEXUX/MmMA0GCSqG\n"
"SIb3DQEBCwUAA4IBAQC24HGIcG9H9n1tFoZT3zh0+BTtPlqvGjufH6G+jD/adJzi\n"
"UTduVdJN9WewtG/XAIN5e8w1sM+d1ZBgU984wgKqeFTig84yYI6FqdtYY4c3SeN5\n"
"lSRXyoxkBq/Y7W82dManIeZDV4mQdlqzTeWY5AvzkdxlIo0NGdiszI+QwaP42Qik\n"
"-----END CERTIFICATE-----\n";

// =======================================================
//                  SECURE MQTT CLIENT
// =======================================================
WiFiClientSecure secureClient;
PubSubClient client(secureClient);

// =======================================================
//                  STATE VARIABLES
// =======================================================
bool lcdEnabled = true;
int lastButton = HIGH;

bool pumpAutoEnabled = true;   // (Giữ nguyên)
int soilThreshold = 1800;
unsigned long lastPumpTime = 0;
unsigned long pumpInterval = 10000;

// =======================================================
//                 SENSOR READ FUNCTIONS
// =======================================================
int readLight() { return analogRead(LIGHT_PIN); }
int readSoil()  { return analogRead(SOIL_PIN); }
int readRain()  { return analogRead(RAIN_PIN); }

float readTemp() { return dht.readTemperature(); }
float readHum()  { return dht.readHumidity(); }

// =======================================================
//                        LCD
// =======================================================
void toggleLCD() {
  int current = digitalRead(BUTTON_PIN);
  if (lastButton == HIGH && current == LOW) {
    lcdEnabled = !lcdEnabled;
    if (lcdEnabled) lcd.backlight();
    else { lcd.clear(); lcd.noBacklight(); }
  }
  lastButton = current;
}

void updateLCD() {
  if (!lcdEnabled) return;
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(readTemp());
  lcd.print(" H:");
  lcd.print(readHum());

  lcd.setCursor(0, 1);
  lcd.print("Soil:");
  lcd.print(readSoil());
  lcd.print(" R:");
  lcd.print(readRain());
}

// =======================================================
//                 MQTT CALLBACK HANDLER
// =======================================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.printf("[MQTT] %s → %s\n", topic, msg.c_str());

  // --- Remote Pump Control ---
  if (String(topic) == String(deviceID) + "/cmd/pump") {
    if (msg == "ON")  digitalWrite(RELAY_PUMP, HIGH);
    if (msg == "OFF") digitalWrite(RELAY_PUMP, LOW);
  }

  // --- Remote LCD Control ---
  if (String(topic) == String(deviceID) + "/cmd/lcd") {
    if (msg == "ON")  { lcdEnabled = true;  lcd.backlight(); }
    if (msg == "OFF") { lcdEnabled = false; lcd.noBacklight(); }
  }
}

// =======================================================
//                 WIFI + MQTT CONNECT
// =======================================================
void connectWiFi() {
  Serial.print("Connecting WiFi ");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println(" connected!");
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT... ");

    if (client.connect(deviceID, mqttUser, mqttPass)) {
      Serial.println("connected!");

      client.subscribe((String(deviceID) + "/cmd/#").c_str());
      client.publish((String(deviceID) + "/status").c_str(), "online");

    } else {
      Serial.printf("fail (%d)\n", client.state());
      delay(2000);
    }
  }
}

// =======================================================
//                PUBLISH SENSOR DATA
// =======================================================
void sendSensorsMQTT() {
  client.publish((String(deviceID)+"/sensor/light").c_str(), String(readLight()).c_str());
  client.publish((String(deviceID)+"/sensor/soil").c_str(),  String(readSoil()).c_str());
  client.publish((String(deviceID)+"/sensor/rain").c_str(),  String(readRain()).c_str());
  client.publish((String(deviceID)+"/sensor/temp").c_str(),  String(readTemp()).c_str());
  client.publish((String(deviceID)+"/sensor/hum").c_str(),   String(readHum()).c_str());

  Serial.println("[MQTT] Sensor data sent!");
}

// =======================================================
//                        SETUP
// =======================================================
void setup() {
  Serial.begin(115200);

  dht.begin();
  lcd.init();
  lcd.backlight();

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  digitalWrite(RELAY_PUMP, LOW);

  secureClient.setCACert(root_ca);

  connectWiFi();

  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);

  connectMQTT();

  Serial.println("SmartPlant TLS MQTT Ready!");
}

// =======================================================
//                         LOOP
// =======================================================
void loop() {
  if (!client.connected()) connectMQTT();
  client.loop();

  toggleLCD();
  updateLCD();

  static unsigned long lastSend = 0;
  if (millis() - lastSend > 3000) {
    lastSend = millis();
    sendSensorsMQTT();
  }

  delay(20);
}
