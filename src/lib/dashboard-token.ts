import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

/**
 * Resolve o token do painel a partir do usuário logado (compra mais recente).
 * As rotas do painel são por token (`/dashboard/[token]/...`), mas as páginas
 * da conta só conhecem o usuário — este é o pulo entre os dois mundos.
 * Devolve `null` quando não há compra ou token associado.
 */
export async function resolveDashboardToken(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!purchase) return null;

  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("token")
    .eq("purchase_id", purchase.id)
    .maybeSingle();

  return tokenRow?.token ?? null;
}
