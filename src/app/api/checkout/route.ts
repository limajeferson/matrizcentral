import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PLANOS, type PlanoId } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { couponEligible, UPGRADE_COUPON_CENTS } from "@/lib/coupon";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const plan: PlanoId = (["ebook", "regular", "advanced"].includes(body?.plan) ? body.plan : "ebook");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  const produto = PLANOS[plan];
  let unitAmount = produto.priceCents;

  // Cupom automático de upgrade (Start < 30 dias, sem passe) — só para regular/advanced.
  if (plan !== "ebook") {
    const supabase = getSupabaseServerClient();
    const normalized = email.toLowerCase().trim();
    const { data: user } = await supabase.from("users").select("id").eq("email", normalized).maybeSingle();
    if (user) {
      const { data: ebook } = await supabase
        .from("purchases").select("created_at").eq("user_id", user.id).eq("product_id", "ebook_llm_local")
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { data: ent } = await supabase.from("entitlements").select("id").eq("user_id", user.id).limit(1).maybeSingle();
      if (couponEligible(ebook?.created_at ?? null, !!ent)) {
        unitAmount = Math.max(0, unitAmount - UPGRADE_COUPON_CENTS);
      }
    }
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ["card"],
    line_items: [
      { price_data: { currency: "brl", product_data: { name: produto.name }, unit_amount: unitAmount }, quantity: 1 },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancelado`,
    customer_email: email,
    metadata: { product_id: produto.productId },
  };

  // Parcelamento em cartão (BR) só no Advanced.
  if (plan === "advanced") {
    params.payment_method_options = { card: { installments: { enabled: true } } };
  }

  const session = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
