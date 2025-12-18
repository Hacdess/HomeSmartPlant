import { MqttServices } from "../services/mqtt_services";
import { supabase } from "../config/supabase";
import { SensorServices } from "../services/sensor_services";

export const MqttController = {
  start() {
    // Truyền hàm router vào để Service gọi khi có tin nhắn
    MqttServices.init((topic, message) => {
      this.router(topic, message);
    });
    console.log("🚀 MQTT Controller Started & Listening...");
  },

  // Hàm phân luồng (Router)
  router(topic: string, message: any) {
    if (topic === "device/bind") {
      this.handleGetEspID(message); // Tương ứng getEspID
    } 
    else if (topic.endsWith("/sensor")) {
      this.handleRecord(topic, message); // Tương ứng getRecord
    }
  },

  // --- LOGIC XỬ LÝ ---

  // 1. Nhận ESP ID và xử lý ghép đôi
  async handleGetEspID(message: any) {
    const esp_id = message.device_id;
    if (!esp_id) return;

    console.log(`📥 Received ESP ID: ${esp_id}`);

    const user_id = "";


      // Gọi Service để gửi UserID đi
  },

  // 2. Nhận dữ liệu Sensor và lưu DB
  async handleRecord(topic: string, message: any) {
    const user_id = topic.split("/")[0];
    
    console.log(`📝 Saving record for User ${user_id}...`);
    
    await supabase.from("sensor_records").insert({
      user_id: user_id,
      temperature: message.temp,
      humid: message.hum,
      soil_moisture: message.soil,
      light: message.light
    });
  }
};