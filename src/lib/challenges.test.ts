import { describe, expect, it } from "vitest";
import { getCurrentChallenge, getIsoWeekKey } from "@/lib/challenges";
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
