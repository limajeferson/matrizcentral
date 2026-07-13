import { cycleKeyFor } from "./consumption";

export type DueEmail = {
  user_id: string;
  email_type: "novo_ciclo" | "expiracao";
  reference: string;
};

type EntitlementRow = {
  user_id: string;
  plan: "regular" | "advanced";
  starts_at: string;
  expires_at: string;
};
type SentRow = { user_id: string; email_type: string; reference: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Dado os entitlements vigentes + os e-mails já enviados, quais vencem hoje. */
export function computeDueEmails(
  entitlements: EntitlementRow[],
  sent: SentRow[],
  now: Date
): DueEmail[] {
  const sentKeys = new Set(sent.map((s) => `${s.user_id}|${s.email_type}|${s.reference}`));
  const due: DueEmail[] = [];

  for (const e of entitlements) {
    const expires = new Date(e.expires_at);
    if (expires.getTime() <= now.getTime()) continue; // expirado

    // Regular: novo ciclo mensal. Level-triggered — dispara em qualquer dia do
    // ciclo (>= cycle-1) ainda não enviado, então um cron perdido no aniversário
    // recupera no dia seguinte. A dedup por cycle_key garante 1x por ciclo.
    if (e.plan === "regular") {
      const today = cycleKeyFor(new Date(e.starts_at), now);
      if (today !== "cycle-0") {
        const key = `${e.user_id}|novo_ciclo|${today}`;
        if (!sentKeys.has(key)) due.push({ user_id: e.user_id, email_type: "novo_ciclo", reference: today });
      }
    }

    // Expiração: 7 e 1 dias antes (cada um dispara uma vez, primeira vez na janela).
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / DAY_MS);
    for (const d of [1, 7]) {
      if (daysLeft <= d && daysLeft >= 1) {
        const ref = `expiry-${d}d`;
        const key = `${e.user_id}|expiracao|${ref}`;
        if (!sentKeys.has(key)) due.push({ user_id: e.user_id, email_type: "expiracao", reference: ref });
        break; // só o limiar mais urgente que casa — evita 7d e 1d no mesmo run
      }
    }
  }
  return due;
}
