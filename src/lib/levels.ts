import { LEVELS } from "@/data/levels";

export interface LevelProgress {
  level: number;
  name: string;
  xpIntoLevel: number;
  xpToNext: number | null;
  nextLevelName: string | null;
  progressPercent: number;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  let current = LEVELS[0];
  for (const definition of LEVELS) {
    if (totalXp >= definition.requiredXp) {
      current = definition;
    }
  }

  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[currentIndex + 1] ?? null;

  const xpIntoLevel = totalXp - current.requiredXp;
  const xpToNext = next ? next.requiredXp - totalXp : null;
  const levelSpan = next ? next.requiredXp - current.requiredXp : null;
  const progressPercent = levelSpan ? Math.round((xpIntoLevel / levelSpan) * 100) : 100;

  return {
    level: current.level,
    name: current.name,
    xpIntoLevel,
    xpToNext,
    nextLevelName: next?.name ?? null,
    progressPercent,
  };
}
