export type StripeEventKind = "completed" | "refund" | "dispute" | "ignore";

/** Classifica o evento Stripe no que o webhook trata. Puro para testar sem SDK. */
export function classifyStripeEvent(eventType: string): StripeEventKind {
  if (eventType === "checkout.session.completed") return "completed";
  if (eventType === "charge.refunded") return "refund";
  if (eventType === "charge.dispute.created") return "dispute";
  return "ignore";
}
