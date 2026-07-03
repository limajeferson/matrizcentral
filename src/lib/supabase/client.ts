import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
