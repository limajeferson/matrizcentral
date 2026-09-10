import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

/**
 * Resolve o token do painel a partir do usuário logado (compra mais recente
 * QUE TEM token). As rotas do painel são por token (`/dashboard/[token]/...`),
 * mas as páginas da conta só conhecem o usuário — este é o pulo entre os dois
 * mundos. Devolve `null` quando não há nenhuma compra com token associado.
 *
 * Nem toda compra gera token (ex.: `advanced_pass` concedido fora do fluxo do
 * ebook/quiz) — pegar só a compra mais recente e travar nela faz um usuário
 * com compra de token antiga + passe novo sem token ver "nenhuma compra".
 */
export async function resolveDashboardToken(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data: purchases } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!purchases || purchases.length === 0) return null;

  const { data: tokenRows } = await supabase
    .from("tokens")
    .select("token, purchase_id")
    .in(
      "purchase_id",
      purchases.map((p) => p.id)
    );

  if (!tokenRows || tokenRows.length === 0) return null;

  for (const purchase of purchases) {
    const match = tokenRows.find((t) => t.purchase_id === purchase.id);
    if (match) return match.token;
  }
  return null;
}
