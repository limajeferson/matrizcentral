import { BADGES, type BadgeDefinition } from "@/data/badges";
import type { ContentType } from "@/data/content-hub";

export interface UserGamificationStats {
  totalXp: number;
  contentCompletedByType: Partial<Record<ContentType, number>>;
  roadmapStagesCompleted: string[];
  quizValidacaoPassed: boolean;
  purchaseCount: number;
}

function meetsCondition(
  condition: BadgeDefinition["condition"],
  stats: UserGamificationStats
): boolean {
  switch (condition.type) {
    case "xp_total":
      return stats.totalXp >= condition.value;
    case "content_type_count":
      return (stats.contentCompletedByType[condition.contentType] ?? 0) >= condition.value;
    case "roadmap_stage":
      return stats.roadmapStagesCompleted.includes(condition.stageKey);
    case "quiz_validacao_passed":
      return stats.quizValidacaoPassed;
    case "purchase_count":
      return stats.purchaseCount >= condition.value;
  }
}

export function evaluateBadges(stats: UserGamificationStats): string[] {
  return BADGES.filter((badge) => meetsCondition(badge.condition, stats)).map(
    (badge) => badge.id
  );
}
