import { describe, expect, it } from "vitest";
import {
  MAX_FRAME_MS,
  advanceStoryClock,
  createStoryClock,
  storyProgress,
} from "./story-clock";

describe("createStoryClock", () => {
  it("começa zerado e sem âncora de tempo", () => {
    expect(createStoryClock()).toEqual({ elapsed: 0, last: null });
  });
});

describe("advanceStoryClock", () => {
  it("o primeiro frame só ancora o relógio, sem creditar tempo", () => {
    const c = advanceStoryClock(createStoryClock(), 1000, false);
    expect(c).toEqual({ elapsed: 0, last: 1000 });
  });

  it("soma o intervalo entre frames consecutivos", () => {
    let c = advanceStoryClock(createStoryClock(), 1000, false);
    c = advanceStoryClock(c, 1016, false);
    c = advanceStoryClock(c, 1032, false);
    expect(c.elapsed).toBe(32);
    expect(c.last).toBe(1032);
  });

  it("não anda enquanto congelado (dedo na tela / aba oculta)", () => {
    let c = advanceStoryClock(createStoryClock(), 1000, false);
    c = advanceStoryClock(c, 1100, false);
    const beforePause = c.elapsed;
    c = advanceStoryClock(c, 1200, true);
    c = advanceStoryClock(c, 1300, true);
    expect(c.elapsed).toBe(beforePause);
    expect(c.last).toBeNull();
  });

  it("retoma de onde parou depois de voltar de aba, sem creditar o buraco", () => {
    // 3 s de slide, aba some por 2 min, volta.
    let c = advanceStoryClock(createStoryClock(), 0, false);
    c = advanceStoryClock(c, 3000, false);
    expect(c.elapsed).toBe(MAX_FRAME_MS); // já limitado pelo teto de frame

    c = advanceStoryClock(c, 3000, true); // visibilitychange → hidden
    const frozenAt = c.elapsed;

    c = advanceStoryClock(c, 123_000, false); // primeiro frame ao voltar
    expect(c.elapsed).toBe(frozenAt); // nada creditado no retorno
    c = advanceStoryClock(c, 123_016, false);
    expect(c.elapsed).toBe(frozenAt + 16); // e volta a andar normalmente
  });

  it("limita o crédito de um frame gigante ao teto (defesa de segunda linha)", () => {
    let c = advanceStoryClock(createStoryClock(), 0, false);
    c = advanceStoryClock(c, 60_000, false);
    expect(c.elapsed).toBe(MAX_FRAME_MS);
  });

  it("ignora timestamp que anda para trás", () => {
    let c = advanceStoryClock(createStoryClock(), 5000, false);
    c = advanceStoryClock(c, 4000, false);
    expect(c.elapsed).toBe(0);
    expect(c.last).toBe(4000);
  });
});

describe("storyProgress", () => {
  it("mapeia o decorrido para 0..1", () => {
    expect(storyProgress(0, 15_000)).toBe(0);
    expect(storyProgress(7_500, 15_000)).toBeCloseTo(0.5);
    expect(storyProgress(15_000, 15_000)).toBe(1);
  });

  it("satura em 1 e no piso 0", () => {
    expect(storyProgress(99_000, 15_000)).toBe(1);
    expect(storyProgress(-10, 15_000)).toBe(0);
  });

  it("duração inválida conta como concluída (não trava o slide)", () => {
    expect(storyProgress(10, 0)).toBe(1);
    expect(storyProgress(10, -1)).toBe(1);
  });
});
