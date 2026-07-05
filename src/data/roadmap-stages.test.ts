import { describe, expect, it } from "vitest";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS } from "@/data/roadmap-stages";

describe("roadmap-stages", () => {
  it("define exatamente 5 etapas fixas na ordem esperada", () => {
    expect(ROADMAP_STAGE_KEYS).toEqual([
      "fundacao_local",
      "modelos_performance",
      "fluxo_trabalho",
      "automacoes",
      "missao_final",
    ]);
  });

  it("toda etapa tem um rótulo em português", () => {
    for (const key of ROADMAP_STAGE_KEYS) {
      expect(ROADMAP_STAGE_LABELS[key]).toBeTruthy();
    }
  });

  it("a última etapa se chama Missão Final, não Certificação", () => {
    expect(ROADMAP_STAGE_LABELS.missao_final).toBe("Missão Final");
  });
});
