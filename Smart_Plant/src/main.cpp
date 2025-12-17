#include <Arduino.h>
#include <WiFi.h>
#include <vector>
#include <WiFiClientSecure.h>      // TLS
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

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
bool isLCDOn = false;

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
std::vector<String> seenBSSIDs;

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

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

// Reading sensors functions
int readLight() { return analogRead(LIGHT_PIN); }
int readSoil()  { return analogRead(SOIL_PIN); }
int readRain()  { return analogRead(RAIN_PIN); }

float readTemp() { return dht.readTemperature(); }
float readHum()  { return dht.readHumidity(); }

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
  for (auto &s : seenBSSIDs) {
    if (s == bssid) return true;
  }
  return false;
}

void scanWiFi() {
  seenBSSIDs.clear();
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
        seenBSSIDs.push_back(bssid);
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

void connectWiFiHelper(String ssid, String pass) {
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
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed.");
    WiFi.disconnect(true);
    delay(1000);
  }
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

  connectWiFiHelper(ssid, pass);
  
  if (isReuse && WiFi.status() != WL_CONNECTED) {
    Serial.println("\nReusing old WiFi credentials...");
    connectWiFiHelper(oldSSID, oldPass);
    oldSSID = "";
    oldPass = "";
    isReuse = false;
  }
  return; 
}

void disConnectWifi(){
  if (WiFi.status() == WL_CONNECTED) {
    ssid = "";
    pass = "";
    WiFi.disconnect(true);
    Serial.println("\nWiFi disconnected successfully!");
    delay(1000);
  } else {
    Serial.println("\nWiFi is not connected.");
  }
  return;
}

void runDevices() {
  Serial.println("\nRunning devices...");

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Current WiFi: ");
    Serial.println(WiFi.SSID());
  } else {
    Serial.println("Current WiFi: Not connected => Can not connect to MQTT broker.");
    Serial.println("Please connect to WiFi first.");
    isRunning = false;
    isShowMenu = true;
    return;
  }
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT... ");

    if (client.connect(deviceID, mqttUser, mqttPass)) {
      Serial.println("connected!");
      client.subscribe((String(deviceID) + "/bind").c_str());
      StaticJsonDocument<64> doc;
      doc["device_id"] = deviceID;

      char buf[64];
      serializeJson(doc, buf);
      client.publish("device/bind", buf);

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

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, msg);

  if (String(topic) == String(deviceID) + "/bind") {
    if (userID == "")
    {
      userID = doc["user_id"] | "";
      Serial.print("[MQTT] Bound to user ID: ");
      Serial.println(userID);
      client.subscribe((String(userID) + "/#").c_str());
    }
  }

  // --- Remote Pump Control ---
  if (String(topic) == String(userID) + "/pump") {
    if (doc["action"] == "ON")  digitalWrite(RELAY_PUMP, HIGH);
    if (doc["action"] == "OFF") digitalWrite(RELAY_PUMP, LOW);
  }

    // -------- Light Control --------
  if (String(topic) == String(userID) + "/light") {
    Serial.println("[MQTT] Light control command received.");
    Serial.println("[MQTT] Action: " + String((const char*)doc["action"]));
    if (doc["action"] == "ON")  digitalWrite(RELAY_LIGHT, HIGH);
    if (doc["action"] == "OFF") digitalWrite(RELAY_LIGHT, LOW);
  }
}

void sendSensorsMQTT() {
  if (userID == "") {
    Serial.println("[MQTT] User ID not bound yet. Cannot send sensor data.");
    return;
  }
  StaticJsonDocument<256> doc;
  doc["light"] = readLight();
  doc["soil"]  = readSoil();
  doc["rain"]  = readRain();
  doc["temp"]  = readTemp();
  doc["hum"]   = readHum();

  char buffer[256];
  serializeJson(doc, buffer, sizeof(buffer));
  client.publish((String(userID)+"/sensor").c_str(), buffer);

  Serial.println("[MQTT] Sensor data sent!");
}

void showMenu() {
  Serial.println("\n========== MENU ==========");
  Serial.println("1. Detect WiFi networks");
  Serial.println("2. Connect to WiFi");
  Serial.println("3. Disconnect WiFi");
  Serial.println("4. Run devices");
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

void setup() {
  Serial.begin(9600);
  delay(1000);

  dht.begin();
  lcd.init();

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  digitalWrite(RELAY_PUMP, LOW);
  pinMode(RELAY_LIGHT, OUTPUT);
  digitalWrite(RELAY_LIGHT, LOW); // Light OFF initially

  WiFi.mode(WIFI_STA);
  WiFi.disconnect(true);

  secureClient.setCACert(root_ca);
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback);

  showMenu();
}


void loop() {
  // Detect WiFi lost
  if (WiFi.status() != WL_CONNECTED && !isShowMenu) {
    Serial.println("\nWiFi disconnected!");
    isShowMenu = true;
    isRunning = false;
  }

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
      disConnectWifi();
    }
    else if (choice == "4") {
      isShowMenu = false;
      isRunning = true;
      runDevices();
    }
    else {
      Serial.println("\nInvalid option.");
    }
  }

  if (isRunning) {
    client.loop();
    connectMQTT();

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

    if (isLCDOn) {
      updateLCD();
    }

    if (currentTime - lastTime >= 5000) {
      sendSensorsMQTT();
      updateLCD();
      lastTime = currentTime;
    }
  }
}
