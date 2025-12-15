import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
import { Database } from "../types/database.types";

// https://supabase.com/docs/reference/javascript/initializing
export const supabase = createClient<Database>(config.DB_URL, config.DB_KEY);