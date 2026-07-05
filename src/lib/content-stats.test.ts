import { describe, expect, it } from "vitest";
import { formatCounts } from "@/lib/content-stats";
import { CONTENT_HUB } from "@/data/content-hub";

describe("formatCounts", () => {
  it("retorna os 5 formatos na ordem fixa", () => {
    expect(formatCounts().map((s) => s.type)).toEqual([
      "relatorio",
      "podcast",
      "video",
      "apresentacao",
      "pesquisa",
    ]);
  });

  it("conta cada tipo real do CONTENT_HUB", () => {
    const stats = formatCounts();
    const count = (t: string) => stats.find((s) => s.type === t)?.count;
    expect(count("relatorio")).toBe(CONTENT_HUB.filter((i) => i.type === "relatorio").length);
    expect(count("podcast")).toBe(CONTENT_HUB.filter((i) => i.type === "podcast").length);
    expect(count("video")).toBe(CONTENT_HUB.filter((i) => i.type === "video").length);
    expect(count("pesquisa")).toBe(CONTENT_HUB.filter((i) => i.type === "pesquisa").length);
  });

  it("apresentações tem contagem fixa 3 (fora do hub)", () => {
    expect(formatCounts().find((s) => s.type === "apresentacao")?.count).toBe(3);
  });

  it("aceita lista custom; apresentações permanece fixa", () => {
    const stats = formatCounts([]);
    expect(stats.find((s) => s.type === "podcast")?.count).toBe(0);
    expect(stats.find((s) => s.type === "apresentacao")?.count).toBe(3);
  });

  it("cada formato tem label e ícone não vazios", () => {
    for (const s of formatCounts()) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.icon.length).toBeGreaterThan(0);
    }
  });
});
