import mqtt, { MqttClient } from "mqtt";
import { config } from "./config";

export const mqttClient: MqttClient = mqtt.connect(config.MQTT_URL, {
  username: config.MQTT_USERNAME,
  password: config.MQTT_PASSWORD,
  clientId: "homesmart-backend",
  clean: true,
  reconnectPeriod: 5000, // auto reconnect
});