import type { RoadmapStageKey } from "@/data/roadmap-stages";
import type { CapacityTier } from "@/lib/capacity";

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
  /** Data de publicação (ISO). Ausente = não publicado ainda. Um item entra nas
   *  histórias (stories) se publishedAt estiver dentro de STORY_WINDOW_DAYS. */
  publishedAt?: string;
  /** Tiers de capacidade com que este item tem afinidade óbvia (título/descrição).
   *  Usado só para ORDENAR a vitrine (nunca filtrar) — ver `buildContentFeed`.
   *  Ausente = item neutro, não sobe nem desce para nenhum tier. */
  capacityFit?: CapacityTier[];
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
    publishedAt: "2026-07-13",
    capacityFit: ["essencial", "equilibrio"],
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
    startIncluded: true,
    publishedAt: "2026-07-11",
    capacityFit: ["performance"],
  },
  {
    id: "relatorio-ferramentas-automacao",
    type: "relatorio",
    title: "Ferramentas de IA Local para Automação e Produtividade",
    description:
      "As ferramentas e modelos locais que automatizam tarefas de verdade — organizados por caso de uso e hardware.",
    durationMinutes: 10,
    xpReward: 30,
    recommendedStage: "automacoes",
    bodyPath: "content/relatorios/ferramentas-automacao-ia.md",
    embedUrl: null,
    publishedAt: "2026-07-20",
    capacityFit: ["equilibrio", "essencial"],
  },
  {
    id: "relatorio-kimi-k3",
    type: "relatorio",
    title: "Kimi K3 e a Disrupção do Ecossistema Open Source",
    description:
      "O modelo aberto de 2,8T de parâmetros que rivaliza com os flagships proprietários — arquitetura, desempenho e custo real.",
    durationMinutes: 11,
    xpReward: 30,
    recommendedStage: "modelos_performance",
    bodyPath: "content/relatorios/kimi-k3-disrupcao-open-source.md",
    embedUrl: null,
    publishedAt: "2026-07-22",
    capacityFit: ["performance"],
  },
  {
    id: "podcast-vibe-coding-fim-programador",
    type: "podcast",
    title: "Vibe Coding e o Fim do Programador Tradicional?",
    description:
      "Debate: o que os projetos 100% gerados por IA dizem sobre o futuro de quem programa.",
    durationMinutes: 29,
    xpReward: 20,
    recommendedStage: "automacoes",
    embedUrl: null,
  },
  {
    id: "podcast-vibe-coding-engenharia",
    type: "podcast",
    title: "Vibe Coding e a Engenharia de Software",
    description:
      "Velocidade de produção vs qualidade: onde a IA acelera e onde ela quebra o design.",
    durationMinutes: 13,
    xpReward: 20,
    recommendedStage: "automacoes",
    embedUrl: null,
  },
  {
    id: "video-lucrando-ia-local",
    type: "video",
    title: "Lucrando com IA Local",
    description:
      "Como transformar modelos gratuitos rodando em VPS barata num serviço que gera receita.",
    durationMinutes: 7,
    xpReward: 20,
    recommendedStage: "automacoes",
    embedUrl: null,
    capacityFit: ["equilibrio", "performance"],
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
    capacityFit: ["essencial", "equilibrio"],
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
    capacityFit: ["equilibrio"],
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
    capacityFit: ["essencial", "equilibrio"],
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
    publishedAt: "2026-07-12",
    surveyOptions: [
      { id: "gpu_dedicada", label: "GPU dedicada (RTX ou similar)" },
      { id: "apple_silicon", label: "Mac com Apple Silicon (M1/M2/M3/M4)" },
      { id: "so_cpu", label: "Só CPU / notebook comum" },
      { id: "ainda_nao", label: "Ainda não rodei nada localmente" },
    ],
  },
  {
    id: "pesquisa-maior-dificuldade",
    type: "pesquisa",
    title: "Qual sua maior dificuldade com IA local hoje?",
    description: "Ajude a comunidade a priorizar os próximos guias e relatórios.",
    durationMinutes: 1,
    xpReward: 10,
    embedUrl: null,
    publishedAt: "2026-07-21",
    surveyOptions: [
      { id: "escolher_modelo", label: "Escolher o modelo certo" },
      { id: "configurar", label: "Instalar e configurar sem erro" },
      { id: "hardware", label: "Saber se meu hardware aguenta" },
      { id: "automatizar", label: "Automatizar tarefas com a IA" },
    ],
  },
  {
    id: "pesquisa-formato-conteudo",
    type: "pesquisa",
    title: "Que formato de conteúdo você quer mais?",
    description: "Vote no formato que a Matriz deve priorizar nas próximas semanas.",
    durationMinutes: 1,
    xpReward: 10,
    embedUrl: null,
    publishedAt: "2026-07-18",
    surveyOptions: [
      { id: "relatorios", label: "Relatórios comparativos" },
      { id: "podcasts", label: "Podcasts / debates" },
      { id: "videos", label: "Vídeos explicativos" },
      { id: "tutoriais", label: "Tutoriais passo a passo" },
    ],
  },
];
