import { describe, expect, it } from "vitest";
import { twinkleAlpha } from "@/lib/pixel-twinkle";

describe("twinkleAlpha", () => {
  it("é amp/2 quando o seno é zero (time=0, phase=0)", () => {
    expect(twinkleAlpha(0.12, 1, 0, 0)).toBeCloseTo(0.06, 6);
  });

  it("atinge amp no pico do seno", () => {
    // phase = π/2, time = 0 => sin = 1
    expect(twinkleAlpha(0.12, 1, Math.PI / 2, 0)).toBeCloseTo(0.12, 6);
  });

  it("chega a zero no vale do seno", () => {
    // phase = -π/2, time = 0 => sin = -1
    expect(twinkleAlpha(0.12, 1, -Math.PI / 2, 0)).toBeCloseTo(0, 6);
  });

  it("fica sempre em [0, amp] para qualquer tempo", () => {
    for (let t = 0; t < 100; t += 0.7) {
      const v = twinkleAlpha(0.2, 0.5, 1.3, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(0.2 + 1e-9);
    }
  });

  it("amp zero resulta sempre em zero", () => {
    expect(twinkleAlpha(0, 1, 0, 3.3)).toBe(0);
  });
});
