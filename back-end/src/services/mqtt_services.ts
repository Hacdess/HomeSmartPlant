import { mqttClient } from "../config/mqtt";
import { supabase } from "../config/supabase";
export const MqttServices = {
  init() {
    mqttClient.subscribe("device/bind");
    mqttClient.subscribe("+/sensor");

    mqttClient.on("message", this.handleMessage.bind(this));
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

  sendDeviceCommand(user_id: string, device: "pump" | "light", action: "ON" | "OFF") {
    mqttClient.publish(
      `${user_id}/${device}`,
      JSON.stringify({ action })
    );
  },
};
