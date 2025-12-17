import { supabase } from "../config/supabase"

export type supabaseLog = {
  user_id: string,
  type: string,
  content: string
}

export const LogServices = {
  writeLog: async function (log: supabaseLog) {
    return supabase.from("system_logs").insert(log);
  },
}