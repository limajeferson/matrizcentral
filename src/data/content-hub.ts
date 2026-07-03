export type ContentType = "relatorio" | "podcast" | "video";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  durationMinutes: number;
  xpReward: number;
  /** Caminho do arquivo markdown (só para type="relatorio"). */
  bodyPath?: string;
  /** URL de embed (Spotify/YouTube). null = ainda não publicado ("em breve"). */
  embedUrl: string | null;
}

export const CONTENT_HUB: ContentItem[] = [
  {
    id: "relatorio-panorama-llms-locais",
    type: "relatorio",
    title: "Panorama Estratégico de LLMs Locais",
    description:
      "Guia comparativo de alta performance (2026): visão geral de modelos, tendências e decisões estratégicas para IA local.",
    durationMinutes: 12,
    xpReward: 30,
    bodyPath: "content/relatorios/panorama-estrategico-llms-locais.md",
    embedUrl: null,
  },
  {
    id: "relatorio-comparativo-modelos",
    type: "relatorio",
    title: "Relatório Comparativo de Modelos LLM Locais",
    description:
      "Comparação direta entre os principais modelos de linguagem para rodar localmente, com foco em performance por hardware.",
    durationMinutes: 10,
    xpReward: 30,
    bodyPath: "content/relatorios/comparativo-modelos-llm-locais.md",
    embedUrl: null,
  },
  {
    id: "podcast-rode-ia-potente",
    type: "podcast",
    title: "Rode IA Potente Direto no Seu Computador",
    description:
      "Episódio 1: como colocar uma IA poderosa para rodar localmente, sem depender de mensalidade.",
    durationMinutes: 18,
    xpReward: 20,
    embedUrl: null,
  },
  {
    id: "podcast-ias-poderosas",
    type: "podcast",
    title: "IAs Poderosas Rodando no Seu Computador",
    description: "Episódio 2: aprofundando no setup de IA local para o dia a dia.",
    durationMinutes: 16,
    xpReward: 20,
    embedUrl: null,
  },
  {
    id: "podcast-melhor-ia-hardware",
    type: "podcast",
    title: "A Melhor IA para Seu Hardware Local",
    description:
      "Episódio 3: como escolher o modelo certo com base no organograma de decisão por hardware.",
    durationMinutes: 20,
    xpReward: 20,
    embedUrl: null,
  },
  {
    id: "podcast-escolher-ias-sem-travar",
    type: "podcast",
    title: "Como Escolher IAs Locais Sem Travar",
    description: "Episódio 4: evitando os erros mais comuns na hora de rodar IA local.",
    durationMinutes: 15,
    xpReward: 20,
    embedUrl: null,
  },
  {
    id: "video-verdade-ia-local",
    type: "video",
    title: "A Verdade sobre IA Local",
    description: "Por que rodar sua própria IA muda a forma como você paga (e não paga) por tecnologia.",
    durationMinutes: 8,
    xpReward: 25,
    embedUrl: null,
  },
  {
    id: "video-evolucao-ia-local",
    type: "video",
    title: "A Evolução da IA Local",
    description: "Linha do tempo de como os modelos locais evoluíram até chegarem no ponto de hoje.",
    durationMinutes: 10,
    xpReward: 25,
    embedUrl: null,
  },
];
