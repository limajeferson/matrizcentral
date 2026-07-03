import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRODUTO_1 = {
  productId: "ebook_llm_local",
  name: "Construa Seu Próprio ChatGPT Particular em Poucos Minutos - LLM Local",
  priceCents: 4700,
};
