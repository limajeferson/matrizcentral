import { describe, it, expect } from "vitest";
import { formatAvailability } from "./format-availability";
import type { ContentItem } from "@/data/content-hub";

const item = (o: Partial<ContentItem>): ContentItem => ({
  id: "x", type: "podcast", title: "T", description: "D",
  durationMinutes: 5, xpReward: 10, embedUrl: null, ...o,
});

describe("formatAvailability", () => {
  it("categoria toda sem embed (podcast/video) = em breve", () => {
    const r = formatAvailability([item({ type: "podcast" }), item({ type: "video" })]);
    expect(r.podcast.emBreve).toBe(true);
    expect(r.video.emBreve).toBe(true);
  });
  it("relatorio/pesquisa nunca em breve", () => {
    const r = formatAvailability([item({ type: "relatorio" }), item({ type: "pesquisa" })]);
    expect(r.relatorio.emBreve).toBe(false);
    expect(r.pesquisa.emBreve).toBe(false);
  });
  it("podcast com ao menos 1 embed publicado = disponível", () => {
    const r = formatAvailability([item({ type: "podcast", embedUrl: "http://e" }), item({ type: "podcast" })]);
    expect(r.podcast.emBreve).toBe(false);
  });
  it("categoria ausente = em breve (nada publicado)", () => {
    const r = formatAvailability([]);
    expect(r.video.emBreve).toBe(true);
  });
});
