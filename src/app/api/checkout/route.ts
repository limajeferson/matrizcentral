import { NextRequest, NextResponse } from "next/server";
import { stripe, PRODUTO_1 } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email é obrigatório" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: PRODUTO_1.name },
          unit_amount: PRODUTO_1.priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancelado`,
    customer_email: email,
    metadata: { product_id: PRODUTO_1.productId },
  });

  return NextResponse.json({ url: session.url });
}
