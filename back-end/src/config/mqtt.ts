import { config } from "./config";
import mqtt, { MqttClient } from "mqtt/*";

export const MQTT: MqttClient = mqtt.connect(config.DB_URL);