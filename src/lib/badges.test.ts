import { describe, expect, it } from "vitest";
import { evaluateBadges, type UserGamificationStats } from "@/lib/badges";

const baseStats: UserGamificationStats = {
  totalXp: 0,
  contentCompletedByType: {},
  roadmapStagesCompleted: [],
  quizValidacaoPassed: false,
  purchaseCount: 0,
};

describe("evaluateBadges", () => {
  it("nenhum badge com stats zerados", () => {
    expect(evaluateBadges(baseStats)).toEqual([]);
  });

  it("badges de xp_total quando atinge o valor", () => {
    const badges = evaluateBadges({ ...baseStats, totalXp: 500 });
    expect(badges).toContain("autoconhecimento");
    expect(badges).toContain("iniciado");
  });

  it("badge de content_type_count por tipo de conteúdo", () => {
    const badges = evaluateBadges({
      ...baseStats,
      contentCompletedByType: { podcast: 3 },
    });
    expect(badges).toContain("ouvinte_dedicado");
  });

  it("não concede content_type_count antes de atingir o valor", () => {
    const badges = evaluateBadges({
      ...baseStats,
      contentCompletedByType: { podcast: 2 },
    });
    expect(badges).not.toContain("ouvinte_dedicado");
  });

  it("badge de roadmap_stage quando a etapa está na lista", () => {
    const badges = evaluateBadges({
      ...baseStats,
      roadmapStagesCompleted: ["missao_final"],
    });
    expect(badges).toContain("missao_cumprida");
  });

  it("badge de quiz_validacao_passed", () => {
    const badges = evaluateBadges({ ...baseStats, quizValidacaoPassed: true });
    expect(badges).toContain("validado");
  });
});
