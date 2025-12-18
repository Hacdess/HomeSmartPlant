import { supabase } from "../config/supabase"

export type supabaseLog = {
  user_id: string,
  type: string,
  content: string
}

export const LogServices = {
  getAll: async function (user_id: string) {
    return supabase.from("system_logs").select('*').eq("user_id", user_id);
  },

  write: async function (log: supabaseLog) {
    return supabase.from("system_logs").insert(log);
  },
}