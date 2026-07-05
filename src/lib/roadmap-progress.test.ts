import { describe, expect, it } from "vitest";
import { deriveRoadmapView } from "@/lib/roadmap-progress";

describe("deriveRoadmapView", () => {
  it("etapa 1 de 5 quando nada foi concluído", () => {
    const view = deriveRoadmapView([]);
    expect(view.currentStageNumber).toBe(1);
    expect(view.progressPercent).toBe(0);
  });

  it("avança a etapa ativa conforme conclusões", () => {
    const view = deriveRoadmapView(["fundacao_local"]);
    expect(view.currentStageNumber).toBe(2);
    expect(view.progressPercent).toBe(20);
  });

  it("classifica cada etapa como done, active ou locked", () => {
    const view = deriveRoadmapView(["fundacao_local"]);
    expect(view.statusFor("fundacao_local")).toBe("done");
    expect(view.statusFor("modelos_performance")).toBe("active");
    expect(view.statusFor("fluxo_trabalho")).toBe("locked");
  });

  it("quando todas concluídas, etapa 5 de 5 e 100%", () => {
    const view = deriveRoadmapView([
      "fundacao_local",
      "modelos_performance",
      "fluxo_trabalho",
      "automacoes",
      "missao_final",
    ]);
    expect(view.currentStageNumber).toBe(5);
    expect(view.progressPercent).toBe(100);
    expect(view.statusFor("missao_final")).toBe("done");
  });
});
