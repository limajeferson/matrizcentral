import { describe, expect, it } from "vitest";
import { getCurrentChallenge, getIsoWeekKey, getIsoWeekStart } from "@/lib/challenges";
import { CHALLENGES } from "@/data/challenges";

describe("getIsoWeekKey", () => {
  it("gera a mesma chave para datas na mesma semana ISO", () => {
    const segunda = new Date("2026-07-06T10:00:00Z");
    const sexta = new Date("2026-07-10T10:00:00Z");
    expect(getIsoWeekKey(segunda)).toBe(getIsoWeekKey(sexta));
  });

  it("gera chaves diferentes para semanas diferentes", () => {
    const semana1 = new Date("2026-07-06T10:00:00Z");
    const semana2 = new Date("2026-07-13T10:00:00Z");
    expect(getIsoWeekKey(semana1)).not.toBe(getIsoWeekKey(semana2));
  });
});

describe("getIsoWeekStart", () => {
  it("retorna a segunda-feira 00:00 UTC da semana", () => {
    const quarta = new Date("2026-07-08T15:30:00Z");
    const start = getIsoWeekStart(quarta);
    expect(start.toISOString()).toBe("2026-07-06T00:00:00.000Z");
  });

  it("uma segunda-feira retorna ela mesma à meia-noite", () => {
    const segunda = new Date("2026-07-06T23:00:00Z");
    const start = getIsoWeekStart(segunda);
    expect(start.toISOString()).toBe("2026-07-06T00:00:00.000Z");
  });
});

describe("getCurrentChallenge", () => {
  it("retorna sempre um desafio válido do catálogo", () => {
    const challenge = getCurrentChallenge(new Date("2026-07-06T10:00:00Z"));
    expect(CHALLENGES.map((c) => c.id)).toContain(challenge.id);
  });

  it("é determinístico para a mesma semana", () => {
    const segunda = getCurrentChallenge(new Date("2026-07-06T10:00:00Z"));
    const sexta = getCurrentChallenge(new Date("2026-07-10T10:00:00Z"));
    expect(segunda.id).toBe(sexta.id);
  });
});
