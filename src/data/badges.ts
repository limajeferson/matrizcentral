import type { ContentType } from "@/data/content-hub";

export type BadgeCondition =
  | { type: "xp_total"; value: number }
  | { type: "content_type_count"; contentType: ContentType; value: number }
  | { type: "roadmap_stage"; stageKey: string }
  | { type: "quiz_validacao_passed" }
  | { type: "purchase_count"; value: number };

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: BadgeCondition;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "autoconhecimento",
    name: "Autoconhecimento",
    description: "Completou o diagnóstico inicial.",
    icon: "🧭",
    rarity: "common",
    condition: { type: "xp_total", value: 50 },
  },
  {
    id: "primeiro_relatorio",
    name: "Primeira Leitura",
    description: "Concluiu o primeiro relatório do hub de conteúdo.",
    icon: "📄",
    rarity: "common",
    condition: { type: "content_type_count", contentType: "relatorio", value: 1 },
  },
  {
    id: "ouvinte_dedicado",
    name: "Ouvinte Dedicado",
    description: "Concluiu 3 podcasts do hub de conteúdo.",
    icon: "🎧",
    rarity: "rare",
    condition: { type: "content_type_count", contentType: "podcast", value: 3 },
  },
  {
    id: "iniciado",
    name: "Iniciado",
    description: "Atingiu 500 XP.",
    icon: "⭐",
    rarity: "rare",
    condition: { type: "xp_total", value: 500 },
  },
  {
    id: "missao_cumprida",
    name: "Missão Cumprida",
    description: "Concluiu a etapa final do roadmap.",
    icon: "🏁",
    rarity: "epic",
    condition: { type: "roadmap_stage", stageKey: "missao_final" },
  },
  {
    id: "validado",
    name: "Conhecimento Validado",
    description: "Foi aprovado no quiz de validação.",
    icon: "✅",
    rarity: "epic",
    condition: { type: "quiz_validacao_passed" },
  },
  {
    id: "especialista",
    name: "Especialista",
    description: "Atingiu 2000 XP.",
    icon: "🔥",
    rarity: "legendary",
    condition: { type: "xp_total", value: 2000 },
  },
];
