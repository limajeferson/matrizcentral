import type { RoadmapStageKey } from "@/data/roadmap-stages";

export type ContentType = "relatorio" | "podcast" | "video" | "pesquisa";

export interface SurveyOption {
  id: string;
  label: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  durationMinutes: number;
  xpReward: number;
  /** Etapa do roadmap em que este item é recomendado como próximo passo. */
  recommendedStage?: RoadmapStageKey;
  /** Caminho do arquivo markdown (só para type="relatorio"). */
  bodyPath?: string;
  /** URL de embed (Spotify/YouTube). null = ainda não publicado ("em breve"). */
  embedUrl: string | null;
  /** Opções de resposta (só para type="pesquisa"). */
  surveyOptions?: SurveyOption[];
  /** Se true, consumível no nível "view" (incluído no Start, ex.: relatório de benchmark). Ausente = biblioteca paga. */
  startIncluded?: boolean;
}

export const CONTENT_HUB: ContentItem[] = [
  {
    id: "relatorio-panorama-llms-locais",
    type: "relatorio",
    title: "Panorama Estratégico de LLMs Locais",
    description:
      "O mapa dos modelos locais que mais entregam em 2026 — e quais já não valem o seu tempo.",
    durationMinutes: 12,
    xpReward: 30,
    recommendedStage: "fundacao_local",
    bodyPath: "content/relatorios/panorama-estrategico-llms-locais.md",
    embedUrl: null,
  },
  {
    id: "relatorio-comparativo-modelos",
    type: "relatorio",
    title: "Relatório Comparativo de Modelos LLM Locais",
    description:
      "Qual modelo realmente roda bem no seu hardware, comparado lado a lado e sem marketing.",
    durationMinutes: 10,
    xpReward: 30,
    recommendedStage: "modelos_performance",
    bodyPath: "content/relatorios/comparativo-modelos-llm-locais.md",
    embedUrl: null,
  },
  {
    id: "podcast-rode-ia-potente",
    type: "podcast",
    title: "Rode IA Potente Direto no Seu Computador",
    description:
      "Como colocar uma IA de verdade rodando na sua máquina sem pagar mensalidade.",
    durationMinutes: 18,
    xpReward: 20,
    recommendedStage: "fundacao_local",
    embedUrl: null,
  },
  {
    id: "podcast-ias-poderosas",
    type: "podcast",
    title: "IAs Poderosas Rodando no Seu Computador",
    description: "O setup que transforma um computador comum em uma central de IA para o dia a dia.",
    durationMinutes: 16,
    xpReward: 20,
    recommendedStage: "fluxo_trabalho",
    embedUrl: null,
  },
  {
    id: "podcast-melhor-ia-hardware",
    type: "podcast",
    title: "A Melhor IA para Seu Hardware Local",
    description:
      "O organograma que usamos para decidir qual IA instalar em menos de dois minutos.",
    durationMinutes: 20,
    xpReward: 20,
    recommendedStage: "modelos_performance",
    embedUrl: null,
  },
  {
    id: "podcast-escolher-ias-sem-travar",
    type: "podcast",
    title: "Como Escolher IAs Locais Sem Travar",
    description: "Os erros mais comuns que travam a IA local — e como evitá-los antes de instalar.",
    durationMinutes: 15,
    xpReward: 20,
    recommendedStage: "automacoes",
    embedUrl: null,
  },
  {
    id: "video-verdade-ia-local",
    type: "video",
    title: "A Verdade sobre IA Local",
    description: "Por que alguns modelos locais já superam serviços pagos em determinados cenários.",
    durationMinutes: 8,
    xpReward: 25,
    recommendedStage: "fluxo_trabalho",
    embedUrl: null,
  },
  {
    id: "video-evolucao-ia-local",
    type: "video",
    title: "A Evolução da IA Local",
    description: "A linha do tempo que mostra como a IA local passou de curiosidade a substituta de serviço pago.",
    durationMinutes: 10,
    xpReward: 25,
    recommendedStage: "automacoes",
    embedUrl: null,
  },
  {
    id: "pesquisa-hardware-atual",
    type: "pesquisa",
    title: "Qual hardware você usa hoje pra rodar IA?",
    description:
      "Descubra em 5 segundos com qual hardware a comunidade está rodando IA local hoje.",
    durationMinutes: 1,
    xpReward: 15,
    recommendedStage: "missao_final",
    embedUrl: null,
    surveyOptions: [
      { id: "gpu_dedicada", label: "GPU dedicada (RTX ou similar)" },
      { id: "apple_silicon", label: "Mac com Apple Silicon (M1/M2/M3/M4)" },
      { id: "so_cpu", label: "Só CPU / notebook comum" },
      { id: "ainda_nao", label: "Ainda não rodei nada localmente" },
    ],
  },
];
