import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendMagicLinkEmail } from "@/lib/email";
import {
  generateAuthSecret,
  hashAuthSecret,
  magicLinkExpiry,
  sessionExpiry,
  isExpired,
  REQUEST_LINK_THROTTLE_MS,
} from "@/lib/auth-tokens";

export const SESSION_COOKIE = "mc_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export type SessionUser = { id: string; email: string };

/** Pede um magic link. Só envia se o e-mail já tem conta (nasce na compra). */
export async function requestMagicLink(
  email: string
): Promise<"sent" | "no-account"> {
  const supabase = getSupabaseServerClient();
  const normalized = email.trim().toLowerCase();

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", normalized)
    .maybeSingle();
  if (!user) return "no-account";

  // Rate-limit: já existe link recente para este usuário? não reenvia.
  const throttleSince = new Date(Date.now() - REQUEST_LINK_THROTTLE_MS).toISOString();
  const { data: recent } = await supabase
    .from("magic_links")
    .select("id")
    .eq("user_id", user.id)
    .gt("created_at", throttleSince)
    .maybeSingle();
  if (recent) return "sent";

  const secret = generateAuthSecret();
  const { error } = await supabase.from("magic_links").insert({
    user_id: user.id,
    token_hash: hashAuthSecret(secret),
    expires_at: magicLinkExpiry().toISOString(),
  });
  if (error) throw new Error("Falha ao criar magic link");

  await sendMagicLinkEmail({ to: user.email, secret });
  return "sent";
}

/** Valida o cartão do e-mail. Sucesso → marca uso único e devolve o usuário. */
export async function verifyMagicLink(
  rawSecret: string
): Promise<SessionUser | null> {
  const supabase = getSupabaseServerClient();
  const hash = hashAuthSecret(rawSecret);

  const { data: link } = await supabase
    .from("magic_links")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", hash)
    .maybeSingle();
  if (!link) return null;
  if (link.used_at) return null;
  if (isExpired(link.expires_at)) return null;

  // Uso único com trava condicional (evita corrida de duplo-clique).
  const { data: claimed } = await supabase
    .from("magic_links")
    .update({ used_at: new Date().toISOString() })
    .eq("id", link.id)
    .is("used_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", link.user_id)
    .maybeSingle();
  return user ? { id: user.id, email: user.email } : null;
}

/** Cria a sessão no banco. Retorna o segredo cru (vai pro cookie). */
export async function createSession(userId: string): Promise<string> {
  const supabase = getSupabaseServerClient();
  const secret = generateAuthSecret();
  const { error } = await supabase.from("sessions").insert({
    user_id: userId,
    token_hash: hashAuthSecret(secret),
    expires_at: sessionExpiry().toISOString(),
  });
  if (error) throw new Error("Falha ao criar sessão");
  return secret;
}

/** O porteiro: lê o cookie e resolve o usuário logado, ou null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token_hash", hashAuthSecret(raw))
    .maybeSingle();
  if (!session) return null;
  if (isExpired(session.expires_at)) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", session.user_id)
    .maybeSingle();
  return user ? { id: user.id, email: user.email } : null;
}

/** Logout / revogação: apaga a sessão do cookie atual. */
export async function revokeCurrentSession(): Promise<void> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return;
  const supabase = getSupabaseServerClient();
  await supabase.from("sessions").delete().eq("token_hash", hashAuthSecret(raw));
}
