import { describe, it, expect } from "vitest";
import { classifyStripeEvent } from "./stripe-events";

describe("classifyStripeEvent", () => {
  it("mapeia os tipos tratados", () => {
    expect(classifyStripeEvent("checkout.session.completed")).toBe("completed");
    expect(classifyStripeEvent("charge.refunded")).toBe("refund");
    expect(classifyStripeEvent("charge.dispute.created")).toBe("dispute");
  });
  it("qualquer outro tipo → ignore", () => {
    expect(classifyStripeEvent("payment_intent.succeeded")).toBe("ignore");
    expect(classifyStripeEvent("")).toBe("ignore");
  });
});
