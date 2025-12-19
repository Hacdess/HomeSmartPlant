import { MqttServices } from "../services/mqtt_services";
import { Request, Response } from "express";
import { mqttClient } from "../config/mqtt_config";
import { EspServices } from "../services/esp_services";
import { SensorServices } from "../services/sensor_services";
import { type SensorRecord } from "../services/sensor_services";

export const MqttController = {
  // Hàm khởi chạy (gọi 1 lần ở index.ts)
  init() {
    mqttClient.on("connect", () => {
      console.log("✅ MQTT đã kết nối");
      // Subscribe vào topic dạng pattern để nghe tất cả device
      mqttClient.subscribe("+/sensor", (err) => {
        if (!err) {
          console.log(`📡 Đã đăng ký nhận dữ liệu`);
        }
      });
    });

    mqttClient.on("message", async (topic, message) => {
      const esp_id = topic.split("/")[0];

      try {
        const message_content = JSON.parse(message.toString());

        console.log(`📩 Nhận dữ liệu từ ${esp_id}:`, message_content);

        const { data: binding, error } = await EspServices.findByID(esp_id);

        if (error) throw error;

        if (!binding) return;
        
        const payload: SensorRecord = {
          user_id: binding.user_id,
          humid: message_content.humid,
          light: message_content.light,
          soil_moisture: message_content.soil_moisture,
          temperature: message_content.temperature,
          water_level: message_content.water_level,
        }

        const result = await SensorServices.insertRecord(payload)

        if (result.error) throw error;
        console.log(`✅ Dữ liệu đã lưu cho người dùng ${binding.user_id}`);
      } catch(e) {
        console.error("❌ Lỗi xử lý tin nhắn MQTT:", e);
      }
    });

    mqttClient.on("error", (err) => {
      console.error("Lỗi MQTT:", err.message);
    });

    mqttClient.on("reconnect", () => {
      console.log("MQTT đang kết nối lại...");
    });
  },


  // // API gọi hàm này để điều khiển
  // togglePump: (req: Request, res: Response) => {
  //   const { esp_id, status } = req.body; // status: "ON" | "OFF"
    
  //   // Gọi helper gửi lệnh
  //   MqttServices.sendCommand(esp_id, "PUMP", status);
    
  //   res.json({ success: true, msg: "Đã gửi lệnh bơm" });
  // }
};