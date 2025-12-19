#include <Arduino.h>
#include <WiFi.h>
#include <vector>
#include <WiFiClientSecure.h>      // TLS
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>
#include <Preferences.h>

#define DHTPIN 4
#define DHTTYPE DHT11

#define LIGHT_PIN 34
#define SOIL_PIN 35
#define RAIN_PIN 36

#define BUTTON_PIN 5

#define RELAY_PUMP 19   // Active HIGH
#define RELAY_LIGHT 23   // Relay for Light (Active HIGH)

byte tempIcon[8] = {
  B00100,
  B01010,
  B01010,
  B01010,
  B01110,
  B11111,
  B11111,
  B01110
};

byte humIcon[8] = {
  B00100,
  B00100,
  B01010,
  B01010,
  B10001,
  B10001,
  B10001,
  B01110
};


DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
bool isLCDOn = false;
Preferences preferences;

const char* mqttServer = "ae56774440b544af8d633adb3b5331af.s1.eu.hivemq.cloud";
const int mqttPort = 8883;

const char* mqttUser = "MyPlant";
const char* mqttPass = "My_plant@123";
const char* deviceID = "esp32_1307557";

const int MAX_WIFI_SCAN = 20;
bool isRunning = false;
bool isShowMenu = true;
bool isReuse = false;
int lastTime = 0;
int lastButtonState = LOW;

String ssid = "";
String pass = "";
String userID = "";
std::vector<String> seenSSIDs;

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

// Reading sensors functions
int readLight() { return map(analogRead(LIGHT_PIN), 0, 4095, 100, 0); } // %
int readSoil()  { return map(analogRead(SOIL_PIN), 0, 4095, 0, 100); } // %
int readRain()  { return map(analogRead(RAIN_PIN), 0, 2300, 0, 4000); } // mm

float readTemp() { return dht.readTemperature(); } // °C
float readHum()  { return dht.readHumidity(); }   // %

String readLineEcho() {
  String input = "";
  while (true) {
    if (Serial.available()) {
      char c = Serial.read();

      if (c == '\n' || c == '\r') {
        input.trim();
        if (input.length() > 0) {
          return input;
        }
      } else {
        Serial.print(c);   // echo character
        input += c;
      }
    }
    delay(5);
  }
}

bool isSeen(String bssid) {
  for (auto &s : seenSSIDs) {
    if (s == bssid) return true;
  }
  return false;
}

void scanWiFi() {
  seenSSIDs.clear();
  Serial.println("\nScanning WiFi networks...");
  int n = WiFi.scanNetworks();
  int count = 0;

  if (n == 0) {
    Serial.println("No networks found.");
  } else {
    int limit = min(n, MAX_WIFI_SCAN);
    for (int i = 0; i < limit; i++) {
      String bssid = WiFi.SSID(i).c_str();
      if (!isSeen(bssid)) {
        seenSSIDs.push_back(bssid);
      }
      else continue;

      Serial.printf("%d) %s (%ddBm)\n",
                     count + 1,
                    WiFi.SSID(i).c_str(),
                    WiFi.RSSI(i));
      count++;
    }
  }

}

void saveWiFi(const String& s, const String& p) {
  preferences.begin("wifi", false);
  preferences.putString("ssid", s);
  preferences.putString("pass", p);
  preferences.end();
}

bool connectWiFiHelper(String ssid, String pass) {
  Serial.print("\nConnecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid.c_str(), pass.c_str());  

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 8000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    saveWiFi(ssid, pass);
    return true;
  } else {
    Serial.println("\nWiFi connection failed.");
    WiFi.disconnect(true);
    delay(1000);
  }
  return false;
}

bool isAutoConnect() {
  preferences.begin("wifi", true);
  ssid = preferences.getString("ssid", "");
  pass = preferences.getString("pass", "");
  preferences.end();

  return connectWiFiHelper(ssid, pass);
}

void connectWiFi() {
  String oldSSID = ssid;
  String oldPass = pass;
  
  ssid = "";
  pass = "";
  if (WiFi.status() == WL_CONNECTED) {
    isReuse = true;
  }
  Serial.print("\nEnter SSID: ");
  ssid = readLineEcho();

  Serial.print("\nEnter Password: ");
  pass = readLineEcho();
  
  if (!connectWiFiHelper(ssid, pass) && isReuse) {
    isReuse = false;
    Serial.println("\nReusing old WiFi credentials...");
    connectWiFiHelper(oldSSID, oldPass);
    oldSSID = "";
    oldPass = "";
    isReuse = false;
  }
  return; 
}


void connectMQTT() {
  while (!client.connected()) {
    Serial.print("\nConnecting MQTT... ");

    if (client.connect(deviceID, mqttUser, mqttPass)) {
      Serial.println("connected!");
      client.subscribe((String(deviceID) + "/#").c_str());
      return;
    } else {
      Serial.printf("fail (%d)\n", client.state());
      delay(2000);
      return;
    }
  }
  return;
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String msg = "";
  for (int i = 0; i < length; i++) msg += (char)payload[i];

  Serial.printf("[MQTT] %s → %s\n", topic, msg.c_str());

  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, msg);

  // --- Remote Pump Control ---
  if (String(topic) == String(deviceID) + "/pump") {
    if (doc["action"] == "ON")  digitalWrite(RELAY_PUMP, HIGH);
    if (doc["action"] == "OFF") digitalWrite(RELAY_PUMP, LOW);
  }

    // -------- Light Control --------
  if (String(topic) == String(deviceID) + "/GROW_LIGHT") {
    if (doc["action"] == "ON")  digitalWrite(RELAY_LIGHT, HIGH);
    if (doc["action"] == "OFF") digitalWrite(RELAY_LIGHT, LOW);
  }
}

void sendSensorsMQTT() {

  JsonDocument doc;
  doc["light"] = readLight();
  doc["soil_moisture"]  = readSoil();
  doc["water_level"]  = readRain();
  doc["temperature"]  = readTemp();
  doc["humid"]   = readHum();

  char buffer[256];
  serializeJson(doc, buffer, sizeof(buffer));
  client.publish((String(deviceID)+"/sensor").c_str(), buffer);

  Serial.println("[MQTT] Sensor data sent!");
}

void showMenu() {
  Serial.println("\n========== MENU ==========");
  Serial.println("1. Detect WiFi networks");
  Serial.println("2. Connect to WiFi");
  Serial.println("3. Run devices");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Current WiFi: ");
    Serial.println(WiFi.SSID());
  } else {
    Serial.println("Current WiFi: Not connected");
  }
  Serial.println("==========================");
  Serial.print("Select option and press ENTER: ");
}

void updateLCD() {
  if (!isLCDOn) return;
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.write(byte(0));
  lcd.print(" Temp: ");
  lcd.print(readTemp(), 1);
  lcd.print((char)223); // degree symbol
  lcd.print("C");

  lcd.setCursor(0, 1);
  lcd.write(byte(1)); // humidity icon
  lcd.print(" Hum : ");
  lcd.print(readHum(), 0);
  lcd.print("%");
}

// Use Ctrl + W to stop and open Menu
void detectControlW()
{
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 23) { // Ctrl + W
      isShowMenu = true;
      isRunning = false;
      Serial.println("\nReturning to Menu...");
    }
  }
}

void setup() {
  Serial.begin(9600);
  delay(1000);

  dht.begin();
  lcd.init();
  lcd.createChar(0, tempIcon);  // icon 0
  lcd.createChar(1, humIcon);   // icon 1

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RELAY_PUMP, OUTPUT);
  digitalWrite(RELAY_PUMP, LOW);
  pinMode(RELAY_LIGHT, OUTPUT);
  digitalWrite(RELAY_LIGHT, LOW); // Light OFF initially

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);

  secureClient.setInsecure(); // Disable certificate validation for simplicity
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);

  if (isAutoConnect()) {
    Serial.println("Auto connecting to saved WiFi...");
    isShowMenu = false;
    isRunning = true;
  }
}

void loop() {
  detectControlW();

  if (isShowMenu) {
    showMenu();
    String choice = readLineEcho();
    if (choice == "1") {
      scanWiFi();
    }
    else if (choice == "2") {
      connectWiFi();
    }
    else if (choice == "3") {
      if (WiFi.status() == WL_CONNECTED) {
          isShowMenu = false;
          isRunning = true;
      } 
      else {
        isAutoConnect();
        Serial.println("\nWiFi is not connected.");
      }
    }
    else {
      Serial.println("\nInvalid option.");
    }
  }

  // Detect WiFi lost
  if (WiFi.status() != WL_CONNECTED && !isShowMenu) {
    if (client.connected()) {
        client.disconnect();
      }
    secureClient.stop();
    Serial.println("\nWiFi disconnected.");
    isAutoConnect();
  }

  if (isRunning) {
    if (WiFi.status() == WL_CONNECTED) {
      connectMQTT();
      client.loop();
    }

    int currentTime = millis();
    int currentButtonState = digitalRead(BUTTON_PIN);
    if (currentButtonState == LOW && lastButtonState == HIGH) {
      isLCDOn = !isLCDOn;
      if (isLCDOn) {
        lcd.backlight();
      } else {
        lcd.clear();
        lcd.noBacklight();
      }
    }
    lastButtonState = currentButtonState;

    if (currentTime - lastTime >= 5000) {
      if (WiFi.status() == WL_CONNECTED) sendSensorsMQTT();
      lastTime = currentTime;
      updateLCD();
    }
  }
}