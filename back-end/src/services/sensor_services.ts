import { supabase } from "../config/supabase"

export const SensorServices = {
  getLimitByID: async function(user_id: string) {
    return await supabase.from("sensor_limits").select("*").eq("user_id", user_id);
  }
}