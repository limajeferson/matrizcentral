import { describe, it, expect } from "vitest";
import { couponEligible, UPGRADE_COUPON_CENTS } from "./coupon";

const now = new Date("2026-06-30T00:00:00.000Z");

describe("couponEligible", () => {
  it("sem compra Start → false", () => {
    expect(couponEligible(null, false, now)).toBe(false);
  });
  it("compra há 29 dias, sem entitlement → true", () => {
    expect(couponEligible("2026-06-01T00:00:00.000Z", false, now)).toBe(true);
  });
  it("compra há 31 dias → false", () => {
    expect(couponEligible("2026-05-30T00:00:00.000Z", false, now)).toBe(false);
  });
  it("já tem entitlement → false", () => {
    expect(couponEligible("2026-06-20T00:00:00.000Z", true, now)).toBe(false);
  });
  it("valor do cupom", () => {
    expect(UPGRADE_COUPON_CENTS).toBe(4700);
  });
});
