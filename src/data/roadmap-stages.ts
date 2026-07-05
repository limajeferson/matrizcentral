export const ROADMAP_STAGE_KEYS = [
  "fundacao_local",
  "modelos_performance",
  "fluxo_trabalho",
  "automacoes",
  "missao_final",
] as const;

export type RoadmapStageKey = (typeof ROADMAP_STAGE_KEYS)[number];

export interface RoadmapStage {
  title: string;
  objective: string;
  checklist: string[];
}

export type RoadmapStages = Record<RoadmapStageKey, RoadmapStage>;

export const ROADMAP_STAGE_LABELS: Record<RoadmapStageKey, string> = {
  fundacao_local: "Fundação Local",
  modelos_performance: "Modelos e Performance",
  fluxo_trabalho: "Fluxo de Trabalho",
  automacoes: "Automações",
  missao_final: "Missão Final",
};
