import { describe, expect, it } from "vitest";
import { waveY, type WaveLayer } from "@/lib/wave-field";

const base: WaveLayer = {
  amplitude: 20,
  wavelength: 100,
  speed: 1,
  phase: 0,
  yOffset: 0.5,
};

describe("waveY", () => {
  it("retorna a linha base quando o seno é zero (x=0, time=0, phase=0)", () => {
    expect(waveY(base, 0, 0, 1000)).toBeCloseTo(500, 5);
  });

  it("soma a amplitude no pico (quarto de comprimento de onda)", () => {
    // x = wavelength/4 => argumento = π/2 => sin = 1 => base + amplitude
    expect(waveY(base, 25, 0, 1000)).toBeCloseTo(520, 5);
  });

  it("subtrai a amplitude no vale (três quartos)", () => {
    // x = 3*wavelength/4 => argumento = 3π/2 => sin = -1
    expect(waveY(base, 75, 0, 1000)).toBeCloseTo(480, 5);
  });

  it("é limitada entre base±amplitude para qualquer x e time", () => {
    for (let x = 0; x < 500; x += 7) {
      for (let t = 0; t < 50; t += 3) {
        const y = waveY(base, x, t, 1000);
        expect(y).toBeGreaterThanOrEqual(480 - 1e-9);
        expect(y).toBeLessThanOrEqual(520 + 1e-9);
      }
    }
  });

  it("desloca a fase pelo tempo * speed", () => {
    const fast: WaveLayer = { ...base, speed: Math.PI / 2 };
    // time=1 => argumento em x=0 = π/2 => sin=1 => 520
    expect(waveY(fast, 0, 1, 1000)).toBeCloseTo(520, 5);
  });
});
