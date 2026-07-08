import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { getLevelProgress } from "@/lib/levels";
import { sendLevelUpEmail } from "@/lib/email";

/**
 * Verifica se a última concessão de XP fez o usuário cruzar um threshold de
 * nível e, se sim, dispara o e-mail de level up (best-effort).
 *
 * Deve ser chamado DEPOIS do insert em `xp_events` — o trigger de banco já
 * atualizou `users.total_xp` nesse ponto, então `total_xp - xpJustGranted`
 * reconstrói o valor de XP anterior à concessão.
 */
export async function notifyLevelUpIfNeeded(
  supabase: SupabaseClient<Database>,
  userId: string,
  xpJustGranted: number
): Promise<void> {
  const { data: userRow } = await supabase
    .from("users")
    .select("total_xp, email")
    .eq("id", userId)
    .single();

  if (!userRow) {
    return;
  }

  const levelBefore = getLevelProgress(userRow.total_xp - xpJustGranted).level;
  const progressAfter = getLevelProgress(userRow.total_xp);

  if (progressAfter.level > levelBefore) {
    await sendLevelUpEmail({
      to: userRow.email,
      level: progressAfter.level,
      levelName: progressAfter.name,
    }).catch((err) => console.error("Falha ao enviar e-mail de level up:", err));
  }
}
