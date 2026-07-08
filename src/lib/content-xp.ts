import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { grantBadges } from "@/lib/grant-badges";

/**
 * Marca um content_id como concluído para o token e concede XP, se ainda não
 * tiver sido concedido antes (idempotente via a unique key (token, content_id)).
 */
export async function grantContentXp(
  supabase: SupabaseClient<Database>,
  token: string,
  purchaseId: string,
  contentId: string,
  xpReward: number
): Promise<number> {
  const { data: existingCompletion } = await supabase
    .from("content_completions")
    .select("id")
    .eq("token", token)
    .eq("content_id", contentId)
    .maybeSingle();

  if (existingCompletion) {
    return 0;
  }

  await supabase.from("content_completions").insert({ token, content_id: contentId });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", purchaseId)
    .single();

  if (!purchase) {
    return 0;
  }

  await supabase.from("xp_events").insert({
    user_id: purchase.user_id,
    xp_amount: xpReward,
    action_type: "conteudo",
    reference_id: contentId,
  });

  await grantBadges(supabase, purchase.user_id);

  return xpReward;
}
