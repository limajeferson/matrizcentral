import { describe, it, expect } from "vitest";
import { buildContentFeed, formatActivity } from "./feed";
import type { ContentItem } from "@/data/content-hub";

const rel: ContentItem = { id: "r1", type: "relatorio", title: "Rel", description: "d", durationMinutes: 5, xpReward: 10, embedUrl: null };
const pod: ContentItem = { id: "p1", type: "podcast", title: "Pod", description: "d", durationMinutes: 5, xpReward: 10, embedUrl: null };
const podPub: ContentItem = { ...pod, id: "p2", embedUrl: "https://x" };

describe("buildContentFeed", () => {
  it("mapeia título e href com token", () => {
    const [c] = buildContentFeed([rel], "TOK");
    expect(c.title).toBe("Rel");
    expect(c.href).toBe("/dashboard/TOK/conteudo/r1");
  });
  it("sem token → href para /oferta", () => {
    expect(buildContentFeed([rel])[0].href).toBe("/oferta");
  });
  it("relatorio/pesquisa nunca 'em breve'; podcast sem embed = em breve", () => {
    expect(buildContentFeed([rel])[0].emBreve).toBe(false);
    expect(buildContentFeed([pod])[0].emBreve).toBe(true);
    expect(buildContentFeed([podPub])[0].emBreve).toBe(false);
  });
  it("repassa duração e XP para o card", () => {
    const [c] = buildContentFeed([rel]);
    expect(c.durationMinutes).toBe(5);
    expect(c.xpReward).toBe(10);
  });
});

describe("buildContentFeed — ordenação por afinidade (capacityFit)", () => {
  const a: ContentItem = { ...rel, id: "a", capacityFit: ["equilibrio"] };
  const b: ContentItem = { ...rel, id: "b", capacityFit: ["essencial"] };
  const c: ContentItem = { ...rel, id: "c" }; // sem capacityFit
  const d: ContentItem = { ...rel, id: "d", capacityFit: ["essencial", "equilibrio"] };

  it("com tier: itens afins sobem para a frente, ordem relativa preservada (sort estável)", () => {
    const cards = buildContentFeed([a, b, c, d], undefined, "essencial");
    expect(cards.map((x) => x.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("sem tier: saída idêntica à ordem original (sem ordenação)", () => {
    const cards = buildContentFeed([a, b, c, d], undefined, undefined);
    expect(cards.map((x) => x.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("item sem capacityFit nunca é removido, mesmo com tier ativo", () => {
    const cards = buildContentFeed([a, b, c, d], undefined, "essencial");
    expect(cards.map((x) => x.id)).toContain("c");
    expect(cards).toHaveLength(4);
  });
});

describe("formatActivity", () => {
  const label = (id: string) => (id === "b1" ? "Validador" : id);
  it("filtra sem display_name, formata e ordena desc", () => {
    const rows = [
      { display_name: "Ana", badge_id: "b1", earned_at: "2026-01-01T00:00:00Z" },
      { display_name: null, badge_id: "b1", earned_at: "2026-02-01T00:00:00Z" },
      { display_name: "Beto", badge_id: "b1", earned_at: "2026-03-01T00:00:00Z" },
    ];
    const out = formatActivity(rows, label);
    expect(out).toHaveLength(2);
    expect(out[0].text).toContain("Beto");
    expect(out[0].text).toContain("Validador");
  });
});
