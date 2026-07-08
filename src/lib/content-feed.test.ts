import { describe, expect, it } from "vitest";
import { getRecommendedContent } from "@/lib/content-feed";
import type { ContentItem } from "@/data/content-hub";

const items: ContentItem[] = [
  {
    id: "relatorio-a",
    type: "relatorio",
    title: "Relatório A",
    description: "desc",
    durationMinutes: 10,
    xpReward: 30,
    bodyPath: "content/a.md",
    embedUrl: null,
    recommendedStage: "fundacao_local",
  },
  {
    id: "podcast-b",
    type: "podcast",
    title: "Podcast B",
    description: "desc",
    durationMinutes: 15,
    xpReward: 20,
    embedUrl: null,
    recommendedStage: "fundacao_local",
  },
  {
    id: "podcast-c",
    type: "podcast",
    title: "Podcast C",
    description: "desc",
    durationMinutes: 15,
    xpReward: 20,
    embedUrl: "https://open.spotify.com/embed/episode/xyz",
    recommendedStage: "fundacao_local",
  },
  {
    id: "video-d",
    type: "video",
    title: "Vídeo D",
    description: "desc",
    durationMinutes: 10,
    xpReward: 25,
    embedUrl: "https://youtube.com/embed/xyz",
    recommendedStage: "modelos_performance",
  },
];

describe("getRecommendedContent", () => {
  it("retorna vazio quando não há etapa ativa (roadmap concluído)", () => {
    expect(getRecommendedContent(items, null, [])).toEqual([]);
  });

  it("filtra só itens da etapa ativa", () => {
    const result = getRecommendedContent(items, "modelos_performance", []);
    expect(result.map((i) => i.id)).toEqual(["video-d"]);
  });

  it("exclui itens ainda não publicados (podcast/video com embedUrl null)", () => {
    const result = getRecommendedContent(items, "fundacao_local", []);
    expect(result.map((i) => i.id)).toEqual(["relatorio-a", "podcast-c"]);
  });

  it("exclui itens já concluídos", () => {
    const result = getRecommendedContent(items, "fundacao_local", ["relatorio-a"]);
    expect(result.map((i) => i.id)).toEqual(["podcast-c"]);
  });
});
