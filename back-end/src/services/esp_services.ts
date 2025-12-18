import { supabase } from "../config/supabase"

export const EspServices = {
  findByID: async function(esp_id: string) {
    return supabase.from("user_esp").select("*").eq("esp_id", esp_id).single();
  },

  insert: async function(esp_id: string, user_id: string) {
    return supabase.from("user_esp").insert({esp_id: esp_id, user_id: user_id});
  }
}