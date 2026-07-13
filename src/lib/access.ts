import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendTokenEmail } from "@/lib/email";

const AUTO_LOGIN_WINDOW_MS = 30 * 60 * 1000; // 30 min

/**
 * Resolve o link de acesso (quiz de triagem) a partir do `session_id` da
 * Stripe. Usado pela página de sucesso para MOSTRAR o acesso na tela assim que
 * o webhook terminar de criar o token — o cliente não fica dependente do
 * e-mail. Retorna null se a sessão não bate, se a compra ainda não foi
 * processada, ou se o token ainda não existe (o cliente deve tentar de novo em
 * instantes).
 */
export async function resolveQuizUrlBySessionId(
  sessionId: string
): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntent) return null;

    const supabase = getSupabaseServerClient();

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("stripe_payment_id", paymentIntent)
      .maybeSingle();
    if (!purchase) return null;

    const { data: tokenRow } = await supabase
      .from("tokens")
      .select("token")
      .eq("purchase_id", purchase.id)
      .maybeSingle();
    if (!tokenRow) return null;

    return `${process.env.NEXT_PUBLIC_URL}/quiz/${tokenRow.token}`;
  } catch (err) {
    console.error("Falha ao resolver acesso por session_id:", err);
    return null;
  }
}

/**
 * Reenvia o e-mail de acesso para um e-mail que já comprou. Best-effort e
 * silencioso quanto à existência do e-mail (não vaza se comprou ou não).
 * Retorna true apenas se um e-mail foi efetivamente enviado.
 */
export async function resendAccessByEmail(email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    const normalized = email.toLowerCase().trim();

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalized)
      .maybeSingle();
    if (!user) return false;

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!purchase) return false;

    const { data: tokenRow } = await supabase
      .from("tokens")
      .select("token")
      .eq("purchase_id", purchase.id)
      .maybeSingle();
    if (!tokenRow) return false;

    await sendTokenEmail({ to: email, token: tokenRow.token });
    return true;
  } catch (err) {
    console.error("Falha ao reenviar acesso por e-mail:", err);
    return false;
  }
}

/**
 * Resolve o usuário dono de uma compra a partir do `session_id` da Stripe,
 * SÓ se a sessão estiver paga. Base do auto-login pós-compra (a página de
 * sucesso troca isto por uma sessão logada, sem depender de e-mail).
 */
export async function resolveUserBySessionId(
  sessionId: string
): Promise<{ userId: string; email: string } | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;

    // Janela de tempo: o auto-login só vale por ~30 min após a criação da
    // sessão de checkout; depois disso, o comprador entra por magic link.
    if (
      typeof session.created === "number" &&
      Date.now() - session.created * 1000 > AUTO_LOGIN_WINDOW_MS
    ) {
      return null;
    }

    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntent) return null;

    const supabase = getSupabaseServerClient();
    const { data: purchase } = await supabase
      .from("purchases")
      .select("user_id")
      .eq("stripe_payment_id", paymentIntent)
      .maybeSingle();
    if (!purchase) return null;

    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", purchase.user_id)
      .maybeSingle();
    if (!user) return null;

    // Uso único: consome o session_id atomicamente (PK). Se já foi consumido
    // (replay), o insert conflita e negamos — não minta a sessão de novo.
    const { error: consumeError } = await supabase
      .from("checkout_logins")
      .insert({ session_id: sessionId, user_id: user.id });
    if (consumeError) return null;

    return { userId: user.id, email: user.email };
  } catch (err) {
    console.error("Falha ao resolver usuário por session_id:", err);
    return null;
  }
}
