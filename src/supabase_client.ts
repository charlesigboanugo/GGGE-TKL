import { createClient } from "@supabase/supabase-js";

if (
  !import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.log("Configuration error!");
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
