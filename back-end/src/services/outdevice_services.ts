import { supabase } from "../config/supabase"

export type DeviceName = 'PUMP' | 'GROW_LIGHT';

export const OutDeviceServices = {
  get: async function(user_id: string, name: DeviceName) {
    return supabase.from("output_device").select("*").eq("user_id", user_id).eq("name", name).single();
  },

  getPump: async function(user_id: string) {
    return supabase.from("output_device").select("*").eq("user_id", user_id).eq("name", "PUMP").single();
  },

  getLight: async function(user_id: string) {
    return supabase.from("output_device").select("*").eq("user_id", user_id).eq("name", "GROW_LIGHT").single();
  },

  update: async function(user_id: string, name: DeviceName, status: boolean) {
    return supabase
      .from("output_device")
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user_id)
      .eq("name", name);
  }
}