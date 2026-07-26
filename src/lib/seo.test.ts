import { describe, expect, it } from "vitest";
import { SITE_URL, buildSitemapEntries, isPrivatePath } from "./seo";

describe("isPrivatePath", () => {
  it("marca as areas logadas como privadas", () => {
    expect(isPrivatePath("/feed")).toBe(true);
    expect(isPrivatePath("/conta")).toBe(true);
    expect(isPrivatePath("/dashboard/abc123")).toBe(true);
    expect(isPrivatePath("/api/checkout")).toBe(true);
    expect(isPrivatePath("/biblioteca/parte1")).toBe(true);
    expect(isPrivatePath("/certificado/XYZ")).toBe(true);
  });

  it("nao confunde prefixo com comeco de outra rota", () => {
    expect(isPrivatePath("/contato")).toBe(false);
    expect(isPrivatePath("/")).toBe(false);
    expect(isPrivatePath("/blog/por-que-ia-local")).toBe(false);
    expect(isPrivatePath("/oferta")).toBe(false);
  });
});

describe("buildSitemapEntries", () => {
  const posts = [{ slug: "por-que-ia-local", date: "2026-07-01" }];

  it("inclui a landing e a pagina de venda", () => {
    const urls = buildSitemapEntries(posts).map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/oferta`);
  });

  it("inclui um item por post, com a data do post", () => {
    const entry = buildSitemapEntries(posts).find(
      (e) => e.url === `${SITE_URL}/blog/por-que-ia-local`
    );
    expect(entry).toBeDefined();
    expect(entry?.lastModified).toBe("2026-07-01");
  });

  it("nunca expoe uma rota privada no sitemap", () => {
    for (const entry of buildSitemapEntries(posts)) {
      const path = entry.url.replace(SITE_URL, "") || "/";
      expect(isPrivatePath(path)).toBe(false);
    }
  });

  it("usa url absoluta em todas as entradas", () => {
    for (const entry of buildSitemapEntries(posts)) {
      expect(entry.url.startsWith(`${SITE_URL}/`)).toBe(true);
    }
  });
});
