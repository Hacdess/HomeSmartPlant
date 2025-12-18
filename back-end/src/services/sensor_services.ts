import { supabase } from "../config/supabase"

export type SensorLimit = {
  humid_max?: number;
  humid_min?: number;
  light_max?: number;
  light_min?: number;
  soil_max?: number;
  soil_min?: number;
  temp_max?: number;
  temp_min?: number;
  user_id: string;
}

export type SensorRecord = {
  rec_id: number;
  user_id: string;
  humid: number;
  light: number;
  recorded_at: string | null;
  soil_moisture: number;
  temperature: number;
}

export const SensorServices = {
  getLimitByID: async function(user_id: string) {
    return supabase.from("sensor_limits").select("*").eq("user_id", user_id);
  },

  updateLimitByID: async function(user_id: string, updateLimit: SensorLimit) {
    return supabase.from("sensor_limits").update(updateLimit);
  },

  getAllRecordsByID: async function(user_id: string) {
    return supabase.from("sensor_records").select('*').eq("user_id", user_id);
  },

  getLatestRecordByID: async function (user_id: string) {
    return supabase.from("sensor_records").select('*').eq("user_id", user_id).order("recorded_at", { ascending: false }).limit(1).single();
  },

  insertRecordByID: async function(user_id: string, record: any) {
    return supabase.from("sensor_limits").insert(record).eq("usser_id", user_id);
  }
}