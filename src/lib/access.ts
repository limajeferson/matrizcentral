import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendTokenEmail } from "@/lib/email";

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

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
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
