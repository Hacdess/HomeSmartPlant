import { mqttClient } from "../config/mqtt_config";
import { supabase } from "../config/supabase";

type MessageCallback = (topic: string, message: any) => void;

export const MqttServices = {
  init(onMessageReceived: MessageCallback) {
    mqttClient.subscribe("device/bind");
    mqttClient.subscribe("+/sensor");
    mqttClient.on("message", (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString());
        onMessageReceived (topic, message);
      } catch(e) {
        console.error("Invalid JSON format"); 
      }
    })
    console.log("MQTT Service Listening...");
  },

  parsePayload(payload: Buffer): any {
    try {
      return JSON.parse(payload.toString());
    } catch (error) {
      console.error("Error: Invalid JSON:", payload.toString());
      return null;
    }
  },

  sendUserID(esp_id: string, user_id: string) {
    const topic = `${esp_id}/bind`;
    const payload = JSON.stringify( {user_id: user_id});

    mqttClient.publish(topic, payload);
    console.log(`Sent UserID to [${topic}]`)
  },

  sendCommand(user_id: string, device: "PUMP" | "GROW_LIGHT", action: "ON" | "OFF") {
    const topic = `${user_id}/${device}`;
    const payload = JSON.stringify({ action });
    
    mqttClient.publish(topic, payload);
    console.log(`Command sent to ${topic}: ${action}`);
  },

  async handleDeviceBind(message: {device_id: string}) {
    const { device_id } = message;
    if (!device_id) return;


  },

  async handleMessage(topic: string, payload: Buffer) {
    let msg: any;
    try {
      msg = JSON.parse(payload.toString());
    } catch {
      console.error("Invalid JSON:", topic, payload.toString());
      return;
    }

    // -------- DEVICE BIND --------
    if (topic === "device/bind") {
      const { device_id } = msg;
      console.log("Binding device:", device_id);
      if (!device_id) return;

      const { data } = await supabase
        .from("output_device")
        .select("user_id")
        .eq("name", device_id)
        .single();

      if (!data) return;

      mqttClient.publish(
        `${device_id}/bind`,
        JSON.stringify({ user_id: data.user_id })
      );
    }

    // -------- SENSOR DATA --------
    else if (topic.endsWith("/sensor")) {
      const user_id = topic.split("/")[0];

      await supabase.from("sensor_records").insert({
        user_id,
        temperature: msg.temp,
        humid: msg.hum,
        soil_moisture: msg.soil,
        light: msg.light,
      });
    }
  },
};
