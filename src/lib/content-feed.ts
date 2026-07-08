import type { ContentItem } from "@/data/content-hub";
import type { RoadmapStageKey } from "@/data/roadmap-stages";

function isPublished(item: ContentItem): boolean {
  return item.embedUrl !== null || item.type === "relatorio" || item.type === "pesquisa";
}

export function getRecommendedContent(
  items: ContentItem[],
  activeStageKey: RoadmapStageKey | null,
  completedContentIds: string[]
): ContentItem[] {
  if (!activeStageKey) {
    return [];
  }

  const completedSet = new Set(completedContentIds);

  return items.filter(
    (item) =>
      item.recommendedStage === activeStageKey &&
      isPublished(item) &&
      !completedSet.has(item.id)
  );
}
