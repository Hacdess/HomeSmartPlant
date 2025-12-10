#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ====================== PIN CONFIG ======================
#define DHTPIN 4
#define DHTTYPE DHT11

#define LIGHT_PIN 34
#define SOIL_PIN 35
#define RAIN_PIN 36

#define BUTTON_PIN 5
#define BUZZER_PIN 18

#define RELAY_PUMP 19  // Active HIGH

// ====================== OBJECTS ======================
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ====================== MQTT & WIFI ======================
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

const char* mqttServer = "broker.hivemq.com";
const int mqttPort = 1883;
const char* deviceID = "esp32_c91c3b64d47444098772381daeb628ea";

WiFiClient espClient;
PubSubClient client(espClient);

// ====================== STATE ======================
bool lcdEnabled = true;
int lastButton = HIGH;

bool pumpAutoEnabled = true;
int soilThreshold = 1800;
unsigned long lastPumpTime = 0;
unsigned long pumpInterval = 10000;

// ====================== SENSOR READ ======================
int readLight() { return analogRead(LIGHT_PIN); }
int readSoil()  { return analogRead(SOIL_PIN); }
int readRain()  { return analogRead(RAIN_PIN); }

float readTemp() { return dht.readTemperature(); }
float readHum()  { return dht.readHumidity(); }

// ====================== LCD ======================
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

// ====================== MQTT CALLBACK ======================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.print("[MQTT] Topic: ");
  Serial.println(topic);
  Serial.print("[MQTT] Message: ");
  Serial.println(msg);

  // ========== LẬP TRÌNH Nhận LỆNH ==========
  if (String(topic) == String(deviceID) + "/cmd/pump") {
    if (msg == "ON") {
      digitalWrite(RELAY_PUMP, HIGH);
      Serial.println("Pump turned ON via MQTT");
    } 
    else if (msg == "OFF") {
      digitalWrite(RELAY_PUMP, LOW);
      Serial.println("Pump turned OFF via MQTT");
    }
  }

  if (String(topic) == String(deviceID) + "/cmd/lcd") {
    if (msg == "ON") { lcdEnabled = true; lcd.backlight(); }
    if (msg == "OFF") { lcdEnabled = false; lcd.noBacklight(); }
  }
}

// ====================== WIFI & MQTT CONNECT ======================
void connectWiFi() {
  Serial.print("Connecting WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    if (client.connect(deviceID)) {
      Serial.println("connected!");

      // SUBSCRIBE commands
      client.subscribe((String(deviceID) + "/cmd/#").c_str());

      // Announce online
      client.publish((String(deviceID) + "/status").c_str(), "online");

    } else {
      Serial.print("failed, code=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

// ====================== MQTT PUBLISH ======================
void sendSensorsMQTT() {
  String light = String(readLight());
  String soil = String(readSoil());
  String rain = String(readRain());
  String temp = String(readTemp());
  String hum  = String(readHum());

  client.publish((String(deviceID) + "/sensor/light").c_str(), light.c_str());
  client.publish((String(deviceID) + "/sensor/soil").c_str(), soil.c_str());
  client.publish((String(deviceID) + "/sensor/rain").c_str(), rain.c_str());
  client.publish((String(deviceID) + "/sensor/temp").c_str(), temp.c_str());
  client.publish((String(deviceID) + "/sensor/hum").c_str(), hum.c_str());

  Serial.println("[MQTT] Sensor data published!");
}

// ====================== SETUP ======================
void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  digitalWrite(RELAY_PUMP, LOW);

  connectWiFi();

  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);
  connectMQTT();

  Serial.println("SmartPlant MQTT Ready!");
}

// ====================== LOOP ======================
void loop() {
  if (!client.connected()) connectMQTT();
  client.loop();

  toggleLCD();
  updateLCD();

  // Gửi dữ liệu mỗi 3 giây
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 3000) {
    lastSend = millis();
    sendSensorsMQTT();
  }

  delay(50);
}