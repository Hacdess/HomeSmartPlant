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
#define RELAY_LIGHT 23   // Relay for Light (Active HIGH)


// =======================================================
//                     OBJECTS
// =======================================================
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// =======================================================
//                     WIFI & MQTT CONFIG
// =======================================================
const char* ssid = "POCO M5s";
const char* password = "12345678";

const char* mqttServer = "c91c3b64d47444098772381daeb628ea.s1.eu.hivemq.cloud";
const int mqttPort = 8883;

const char* mqttUser = "SmartPlant";
const char* mqttPass = "My_plant@123";

const char* deviceID = "esp32_c91c3b64d47444098772381daeb628ea";

// =======================================================
//                     TLS ROOT CERT
// =======================================================
const char* root_ca =
"-----BEGIN CERTIFICATE-----\n"
"MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw\n"
"TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n"
"cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4\n"
"WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu\n"
"ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY\n"
"MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc\n"
"h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+\n"
"0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U\n"
"A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW\n"
"T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH\n"
"B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC\n"
"B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv\n"
"KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn\n"
"OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn\n"
"jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw\n"
"qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI\n"
"rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV\n"
"HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq\n"
"hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL\n"
"ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ\n"
"3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK\n"
"NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5\n"
"ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur\n"
"TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC\n"
"jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc\n"
"oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq\n"
"4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA\n"
"mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d\n"
"emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=\n"
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

    // -------- Light Control --------
  if (String(topic) == String(deviceID) + "/cmd/light") {
    if (msg == "ON")  digitalWrite(RELAY_LIGHT, HIGH);
    if (msg == "OFF") digitalWrite(RELAY_LIGHT, LOW);
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
  Serial.begin(9600);

  dht.begin();
  lcd.init();
  lcd.backlight();

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  digitalWrite(RELAY_PUMP, LOW);
  pinMode(RELAY_LIGHT, OUTPUT);
  digitalWrite(RELAY_LIGHT, LOW); // Light OFF initially


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
