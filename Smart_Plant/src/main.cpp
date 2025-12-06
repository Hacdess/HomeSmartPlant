#include <Arduino.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ====================== PIN CONFIG ======================
#define DHTPIN 4           // DHT11 digital pin
#define DHTTYPE DHT11

#define LIGHT_PIN 34       // Analog ánh sáng
#define SOIL_PIN 35        // Analog độ ẩm đất
#define RAIN_PIN 36        // Analog cảm biến mưa

#define BUTTON_PIN 5       // Nút nhấn toggle LCD
#define BUZZER_PIN 18      // Buzzer cảnh báo

#define RELAY_LIGHT 25     // Đèn (điều khiển từ Web)
#define RELAY_PUMP 19      // Máy bơm (tự động tưới)

// ====================== OBJECTS ======================
DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ====================== GLOBAL ======================
bool lcdEnabled = true;
int lastButton = HIGH;

// ====================== TEST FUNCTIONS ======================
void testLight() {
  int value = analogRead(LIGHT_PIN);
  Serial.print("Light: ");
  Serial.println(value);
}

void testSoil() {
  int value = analogRead(SOIL_PIN);
  Serial.print("Soil Moisture: ");
  Serial.println(value);
}

void testRain() {
  int value = analogRead(RAIN_PIN);
  Serial.print("Rain: ");
  Serial.println(value);
}

void testDHT() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  Serial.print("Temp: ");
  Serial.print(t);
  Serial.print("C  |  Hum: ");
  Serial.print(h);
  Serial.println("%");
}

// ====================== BUZZER ALERT ======================
void checkBuzzer() {
  int rain = analogRead(RAIN_PIN);
  int soil = analogRead(SOIL_PIN);
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  bool danger = false;

  if (t > 35 || h < 30) danger = true;
  if (soil < 1500) danger = true;  // Đất quá khô
  if (rain < 1500) danger = true;  // Mưa lớn

  if (danger)
    digitalWrite(BUZZER_PIN, HIGH);
  else
    digitalWrite(BUZZER_PIN, LOW);
}

// ====================== BUTTON TOGGLE LCD ======================
void checkButtonToggle() {
  int current = digitalRead(BUTTON_PIN);
  if (lastButton == HIGH && current == LOW) {
    lcdEnabled = !lcdEnabled;
    if (!lcdEnabled) {
      lcd.clear();
      lcd.noBacklight();
    } else {
      lcd.backlight();
    }
  }
  lastButton = current;
}

// ====================== LCD DISPLAY ======================
void displayLCD() {
  if (!lcdEnabled) return;

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  int soil = analogRead(SOIL_PIN);
  int rain = analogRead(RAIN_PIN);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(t);
  lcd.print(" H:");
  lcd.print(h);

  lcd.setCursor(0, 1);
  lcd.print("Soil:");
  lcd.print(soil);
  lcd.print(" R:");
  lcd.print(rain);
}

// ====================== AUTO WATERING ======================
void autoWatering() {
  int soil = analogRead(SOIL_PIN);

  // NGƯỠNG ĐỐI VỚI CẢM BIẾN 35
  const int SOIL_DRY = 1500;     // quá khô → bật bơm
  const int SOIL_WET = 2000;     // đã ẩm → tắt bơm ( chống bật/tắt liên tục )
  Serial.print("Soil Moisture for Auto Watering: ");
  Serial.println(soil);
  if (soil < SOIL_DRY) {
    // BẬT PUMP
    Serial.println("Pump ON (Auto)");
    digitalWrite(RELAY_PUMP, HIGH);   // nếu relay kích mức thấp
  } 
  else if (soil > SOIL_WET) {
    // TẮT PUMP
    Serial.println("Pump OFF (Enough moisture)");
    digitalWrite(RELAY_PUMP, LOW);
  }
}

// ====================== SETUP ======================
void setup() {
  Serial.begin(9600);
  
  dht.begin();
  lcd.init();
  lcd.backlight();

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(RELAY_LIGHT, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);

  digitalWrite(RELAY_LIGHT, HIGH);
  digitalWrite(RELAY_PUMP, HIGH);  // relay kích mức thấp → HIGH = tắt

  Serial.println("SmartPlant System Ready!");
}

// ====================== LOOP ======================
void loop() {
  // Test all sensors in Serial Monitor
  testLight();
  testSoil();
  testRain();
  testDHT();

  // Toggle LCD on button press
  checkButtonToggle();

  // Update LCD readings
  displayLCD();

  // Auto warning buzzer
  checkBuzzer();

  // Auto watering mode
  autoWatering();

  delay(1000);
}
