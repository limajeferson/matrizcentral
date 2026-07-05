import { ROADMAP_STAGE_KEYS, type RoadmapStageKey } from "@/data/roadmap-stages";

export interface RoadmapView {
  activeIndex: number;
  currentStageNumber: number;
  progressPercent: number;
  statusFor: (key: RoadmapStageKey) => "done" | "active" | "locked";
}

export function deriveRoadmapView(completedStages: string[]): RoadmapView {
  const activeIndex = ROADMAP_STAGE_KEYS.findIndex((key) => !completedStages.includes(key));
  const currentStageNumber = activeIndex === -1 ? ROADMAP_STAGE_KEYS.length : activeIndex + 1;
  const progressPercent = Math.round(
    (completedStages.length / ROADMAP_STAGE_KEYS.length) * 100
  );

  const statusFor = (key: RoadmapStageKey): "done" | "active" | "locked" => {
    if (completedStages.includes(key)) return "done";
    const keyIndex = ROADMAP_STAGE_KEYS.indexOf(key);
    return keyIndex === activeIndex ? "active" : "locked";
  };

  return { activeIndex, currentStageNumber, progressPercent, statusFor };
}
