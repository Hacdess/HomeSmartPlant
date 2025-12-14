import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

// https://supabase.com/docs/reference/javascript/initializing
export const supabase = createClient(config.DB_URL, config.DB_KEY);