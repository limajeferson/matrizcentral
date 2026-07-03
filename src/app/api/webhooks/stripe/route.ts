import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateToken, tokenAccessExpiry, refundWindowExpiry } from "@/lib/tokens";
import { sendTokenEmail } from "@/lib/email";

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

  const supabase = getSupabaseServerClient();

  const { data: existingPurchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("stripe_payment_id", stripePaymentId)
    .maybeSingle();

  if (existingPurchase) {
    return NextResponse.json({ received: true, deduped: true });
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert({ email, stripe_customer_id: session.customer as string }, { onConflict: "email" })
    .select()
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "falha ao salvar usuário" }, { status: 500 });
  }

  const now = new Date();
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      product_id: productId,
      price_cents: session.amount_total ?? 0,
      status: "paid",
      stripe_payment_id: stripePaymentId,
      refund_window_expires: refundWindowExpiry(now).toISOString(),
    })
    .select()
    .single();

  if (purchaseError || !purchase) {
    return NextResponse.json({ error: "falha ao salvar compra" }, { status: 500 });
  }

  const token = generateToken();
  await supabase.from("tokens").insert({
    token,
    purchase_id: purchase.id,
    valid_until: tokenAccessExpiry(now).toISOString(),
  });

  await supabase.from("xp_events").insert({
    user_id: user.id,
    xp_amount: 100,
    action_type: "compra",
    reference_id: purchase.id,
  });

  try {
    await sendTokenEmail({ to: email, token });
  } catch (err) {
    console.error("Falha ao enviar e-mail de token, requer reenvio manual:", err);
  }

  return NextResponse.json({ received: true });
}
