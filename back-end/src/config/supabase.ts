import { createClient } from "@supabase/supabase-js";
import Config from "./config";

export const config: Config = new Config();

// https://supabase.com/docs/reference/javascript/initializing
export const supabase = createClient(config.DB_URL, config.DB_KEY);