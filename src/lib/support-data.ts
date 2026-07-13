import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createSupportMessage(userId: string | null, email: string, message: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("support_messages")
    .insert({ user_id: userId, email: email.trim().toLowerCase(), message: message.trim() });
  return !error;
}
