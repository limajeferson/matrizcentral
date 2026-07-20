import Stripe from "stripe";
import {
  EBOOK_PRODUCT_ID,
  REGULAR_PASS_PRODUCT_ID,
  ADVANCED_PASS_PRODUCT_ID,
} from "@/data/reader-docs";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRODUTO_1 = {
  productId: EBOOK_PRODUCT_ID,
  name: "Construa Seu Próprio ChatGPT Particular em Poucos Minutos - LLM Local",
  priceCents: 4700,
};

export const PRODUTO_REGULAR = {
  productId: REGULAR_PASS_PRODUCT_ID,
  name: "Matriz Central — Passe Regular (12 meses, 1 conteúdo/mês)",
  priceCents: 9700,
};

export const PRODUTO_ADVANCED = {
  productId: ADVANCED_PASS_PRODUCT_ID,
  name: "Matriz Central — Passe Advanced (12 meses, acesso completo)",
  priceCents: 49700,
};

export const PLANOS = {
  ebook: PRODUTO_1,
  regular: PRODUTO_REGULAR,
  advanced: PRODUTO_ADVANCED,
} as const;
export type PlanoId = keyof typeof PLANOS;
