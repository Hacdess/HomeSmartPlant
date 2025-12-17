import mqtt, { MqttClient } from "mqtt";
import { config } from "./config";

export const mqttClient: MqttClient = mqtt.connect(config.MQTT_URL, {
  username: config.MQTT_USERNAME,
  password: config.MQTT_PASSWORD,
  clientId: "homesmart-backend",
  clean: true,
  reconnectPeriod: 5000, // auto reconnect
});

mqttClient.on("connect", () => {
  console.log("MQTT connected to HiveMQ");
});

mqttClient.on("error", (err) => {
  console.error("MQTT error:", err.message);
});

mqttClient.on("reconnect", () => {
  console.log("MQTT reconnecting...");
});