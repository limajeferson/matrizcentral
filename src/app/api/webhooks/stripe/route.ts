import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateToken, tokenAccessExpiry, refundWindowExpiry } from "@/lib/tokens";
import { sendTokenEmail, sendPassPurchaseEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "assinatura inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_email;
  const productId = session.metadata?.product_id;
  const stripePaymentId = session.payment_intent as string | null;

  if (!email || !productId || !stripePaymentId) {
    return NextResponse.json({ error: "evento incompleto" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const supabase = getSupabaseServerClient();

  // 1. Usuário (idempotente por e-mail).
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ email: normalizedEmail, stripe_customer_id: session.customer as string }, { onConflict: "email" })
    .select()
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "falha ao salvar usuário" }, { status: 500 });
  }

  const now = new Date();

  // 2. Compra (idempotente por stripe_payment_id). O XP de "compra" só é
  //    concedido na criação — reentregas da Stripe não duplicam.
  let purchaseId: string | null = null;
  let purchaseWasCreated = false;

  const { data: existingPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_payment_id", stripePaymentId)
    .maybeSingle();

  if (existingPurchase) {
    purchaseId = existingPurchase.id;
  } else {
    const { data: created, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: user.id,
        product_id: productId,
        price_cents: session.amount_total ?? 0,
        status: "paid",
        stripe_payment_id: stripePaymentId,
        refund_window_expires: refundWindowExpiry(now).toISOString(),
      })
      .select("id")
      .single();

    if (purchaseError || !created) {
      // Pode ser corrida com outra reentrega (unique em stripe_payment_id):
      // relê antes de desistir.
      const { data: reread } = await supabase
        .from("purchases")
        .select("id")
        .eq("stripe_payment_id", stripePaymentId)
        .maybeSingle();
      if (!reread) {
        return NextResponse.json({ error: "falha ao salvar compra" }, { status: 500 });
      }
      purchaseId = reread.id;
    } else {
      purchaseId = created.id;
      purchaseWasCreated = true;
      await supabase.from("xp_events").insert({
        user_id: user.id,
        xp_amount: 100,
        action_type: "compra",
        reference_id: purchaseId,
      });
    }
  }

  if (!purchaseId) {
    return NextResponse.json({ error: "falha ao salvar compra" }, { status: 500 });
  }

  // 3. Token de acesso (idempotente por purchase_id). Se a criação falhar,
  //    retornamos 500 para a Stripe REENTREGAR o evento — como usuário e compra
  //    já existem, a reentrega cai direto aqui e completa o passo que faltou.
  //    É isto que impede o cenário "cliente pagou e ficou sem acesso".
  let accessToken: string | null = null;
  let tokenWasCreated = false;

  const { data: existingToken } = await supabase
    .from("tokens")
    .select("token")
    .eq("purchase_id", purchaseId)
    .maybeSingle();

  if (existingToken) {
    accessToken = existingToken.token;
  } else {
    const newToken = generateToken();
    const { error: tokenError } = await supabase.from("tokens").insert({
      token: newToken,
      purchase_id: purchaseId,
      valid_until: tokenAccessExpiry(now).toISOString(),
    });
    if (tokenError) {
      return NextResponse.json({ error: "falha ao gerar token de acesso" }, { status: 500 });
    }
    accessToken = newToken;
    tokenWasCreated = true;
  }

  // 3.5 Entitlement para passes (Regular/Advanced). Idempotente por stripe_payment_id.
  let entitlementWasCreated = false;
  const plan = productId === "regular_pass" ? "regular" : productId === "advanced_pass" ? "advanced" : null;
  if (plan) {
    const { data: existingEnt } = await supabase
      .from("entitlements").select("id").eq("stripe_payment_id", stripePaymentId).maybeSingle();
    if (!existingEnt) {
      const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const { error: entError } = await supabase.from("entitlements").insert({
        user_id: user.id, plan, starts_at: now.toISOString(), expires_at: expires, stripe_payment_id: stripePaymentId,
      });
      if (entError) {
        const { data: reread } = await supabase
          .from("entitlements").select("id").eq("stripe_payment_id", stripePaymentId).maybeSingle();
        if (!reread) return NextResponse.json({ error: "falha ao criar entitlement" }, { status: 500 });
      } else {
        entitlementWasCreated = true;
      }
    }
  }

  // Evento já totalmente processado antes (reentrega benigna): não reenvia
  // e-mail, para não spammar o cliente.
  if (!purchaseWasCreated && !tokenWasCreated && !entitlementWasCreated) {
    return NextResponse.json({ received: true, deduped: true });
  }

  // 4. E-mail (best-effort). O token já está persistido; se o e-mail falhar, o
  //    cliente ainda recupera o acesso pela página de sucesso (resolvida pelo
  //    session_id) ou por /api/resend-access. Falha de e-mail não derruba o
  //    webhook — senão a Stripe reentregaria só por causa do e-mail.
  try {
    await sendTokenEmail({ to: email, token: accessToken });
    if (entitlementWasCreated && plan) {
      await sendPassPurchaseEmail({ to: email, plan });
    }
  } catch (err) {
    console.error(
      "Falha ao enviar e-mail de token (recuperável via página de sucesso ou /api/resend-access):",
      err
    );
  }

  return NextResponse.json({ received: true });
}
