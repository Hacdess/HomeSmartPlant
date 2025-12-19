import { supabase } from "../config/supabase"

export const EspServices = {
  findByID: async function(esp_id: string) {
    return supabase.from("user_esp").select("*").eq("esp_id", esp_id).maybeSingle();
  },

  insert: async function(esp_id: string, user_id: string) {
    return supabase.from("user_esp").insert({esp_id: esp_id, user_id: user_id});
  },

  deleteByID: async function (user_id: string) {
    return supabase.from("user_esp").delete().eq("user_id", user_id);
  }
}