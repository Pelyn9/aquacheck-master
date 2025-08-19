// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Get environment variables from .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY || "";

// Warn if missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase environment variables are missing. Please check your .env file.");
} else {
  console.log("✅ Supabase environment variables loaded successfully.");
}

// Create Supabase client (safe for frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
