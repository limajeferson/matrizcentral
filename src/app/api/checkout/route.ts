import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, PLANOS, type PlanoId } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth-session";
import { couponEligible, UPGRADE_COUPON_CENTS } from "@/lib/coupon";
import { createRateLimiter } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/email-validation";

const limiter = createRateLimiter(10_000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const plan: PlanoId = (["ebook", "regular", "advanced"].includes(body?.plan) ? body.plan : "ebook");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
  }

  if (!limiter.check(email.toLowerCase(), Date.now())) {
    return NextResponse.json({ error: "aguarde um instante e tente de novo" }, { status: 429 });
  }

  const produto = PLANOS[plan];
  let unitAmount = produto.priceCents;
  let customerEmail = email;

  // Cupom de upgrade: SÓ para o usuário AUTENTICADO (não o e-mail postado) — evita
  // que alguém obtenha o desconto usando o e-mail de um terceiro. Quando logado, o
  // passe também atacha à identidade real (customer_email = e-mail da sessão).
  if (plan !== "ebook") {
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      customerEmail = sessionUser.email;
      const supabase = getSupabaseServerClient();
      const { data: ebook } = await supabase
        .from("purchases").select("created_at").eq("user_id", sessionUser.id).eq("product_id", "ebook_llm_local")
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { data: ent } = await supabase.from("entitlements").select("id").eq("user_id", sessionUser.id).limit(1).maybeSingle();
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
    customer_email: customerEmail,
    metadata: { product_id: produto.productId },
  };

  // Parcelamento em cartão (BR) só no Advanced.
  if (plan === "advanced") {
    params.payment_method_options = { card: { installments: { enabled: true } } };
  }

  const session = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
