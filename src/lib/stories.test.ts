import { describe, it, expect } from "vitest";
import { buildStories, STORY_WINDOW_DAYS, STORY_DURATION_MS } from "./stories";
import type { ContentItem } from "@/data/content-hub";

const now = new Date("2026-07-14T12:00:00Z");
const item = (over: Partial<ContentItem>): ContentItem => ({
  id: "x",
  type: "relatorio",
  title: "T",
  description: "D",
  durationMinutes: 5,
  xpReward: 10,
  embedUrl: null,
  ...over,
});

describe("buildStories", () => {
  it("agrupa itens dentro da janela por tipo, mais novo primeiro", () => {
    const groups = buildStories(
      [
        item({ id: "r1", type: "relatorio", publishedAt: "2026-07-10" }),
        item({ id: "r2", type: "relatorio", publishedAt: "2026-07-13" }),
        item({ id: "p1", type: "podcast", embedUrl: "http://e", publishedAt: "2026-07-12" }),
      ],
      now,
    );
    expect(groups.map((g) => g.type)).toEqual(["relatorio", "podcast"]);
    expect(groups[0].slides.map((s) => s.contentId)).toEqual(["r2", "r1"]);
    expect(groups[0].label).toBe("Relatórios");
  });

  it("exclui itens fora da janela, futuros e sem publishedAt", () => {
    const groups = buildStories(
      [
        item({ id: "old", publishedAt: "2026-06-01" }),
        item({ id: "nodate" }),
        item({ id: "future", publishedAt: "2026-07-20" }),
      ],
      now,
    );
    expect(groups).toEqual([]);
  });

  it("descarta grupos vazios", () => {
    const groups = buildStories([item({ id: "r", publishedAt: "2026-07-13" })], now);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("relatorio");
  });

  it("href respeita token; emBreve para vídeo sem embed", () => {
    const [g] = buildStories(
      [item({ id: "v", type: "video", publishedAt: "2026-07-13" })],
      now,
      "TOK",
    );
    expect(g.slides[0].href).toBe("/dashboard/TOK/conteudo/v");
    expect(g.slides[0].emBreve).toBe(true);
    expect(g.slides[0].ctaLabel).toBe("Assistir");

    const [g2] = buildStories([item({ id: "v", type: "video", publishedAt: "2026-07-13" })], now);
    expect(g2.slides[0].href).toBe("/oferta");
  });

  it("relatório/pesquisa não são 'em breve' mesmo sem embed", () => {
    const groups = buildStories(
      [
        item({ id: "r", type: "relatorio", publishedAt: "2026-07-13" }),
        item({ id: "q", type: "pesquisa", publishedAt: "2026-07-13" }),
      ],
      now,
    );
    expect(groups.every((g) => g.slides.every((s) => s.emBreve === false))).toBe(true);
  });

  it("constantes expostas", () => {
    expect(STORY_WINDOW_DAYS).toBe(7);
    expect(STORY_DURATION_MS).toBe(15000);
  });
});
