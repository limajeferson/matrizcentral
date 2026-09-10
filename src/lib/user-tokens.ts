import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

/**
 * Todos os tokens de acesso já emitidos para o usuário (um por compra).
 * Fonte única para qualquer checagem que precise considerar TODAS as compras
 * do usuário, não só a mais recente — evitar reintroduzir a classe de bug já
 * corrigida em `resolveDashboardToken`/`issue-certificate.ts`.
 */
export async function resolveAllTokensForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId);
  const purchaseIds = (purchases ?? []).map((p) => p.id);
  if (purchaseIds.length === 0) return [];

  const { data: tokenRows } = await supabase
    .from("tokens")
    .select("token")
    .in("purchase_id", purchaseIds);
  return (tokenRows ?? []).map((t) => t.token);
}
