import { mqttClient } from "../config/mqtt_config";

type SensorDataCallback = (esp_id: string, data: any) => void;

export const MqttServices = {
  parsePayload(payload: Buffer): any {
    try {
      return JSON.parse(payload.toString());
    } catch (error) {
      console.error("⚠️ Lỗi JSON không hợp lệ:", payload.toString());
      return null;
    }
  },
  
  listenToSensors(onDataReceived: SensorDataCallback) {
    // Subscribe wildcard: "bất_kỳ_esp/sensor"
    mqttClient.subscribe("+/sensor", (err) => {
      if (!err) console.log("📡 MqttService: Đang lắng nghe kênh +/sensor");
    });

    // Xử lý sự kiện message
    mqttClient.on("message", (topic, payload) => {
      // Chỉ xử lý nếu topic kết thúc bằng "/sensor"
      if (topic.endsWith("/sensor")) {
        const message = MqttServices.parsePayload(payload);
        
        if (message) {
          // Tách esp_id từ topic "esp32_123/sensor" -> "esp32_123"
          const esp_id = topic.split("/")[0];
          
          // Truyền data sạch về cho Controller
          onDataReceived(esp_id, message);
        }
      }
    });
  },

  sendCommand(esp_id: string, device: "PUMP" | "GROW_LIGHT", action: "ON" | "OFF") {
    const topic = `${esp_id}/${device}`;
    const payload = JSON.stringify({ action }); // vd: {"action": "ON"}
    
    mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Gửi lệnh thất bại tới ${topic}:`, err);
      } else {
        console.log(`🚀 Đã gửi lệnh: ${action} tới thiết bị ${device} của ${esp_id}`);
      }
    });
  },
};