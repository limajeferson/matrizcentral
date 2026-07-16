import { describe, it, expect } from "vitest";
import { buildShareUrl, isTokenizedPath } from "./share";

describe("buildShareUrl", () => {
  const url = "https://www.matrizcentral.com.br/blog/meu-post";
  const text = "IA local: guia";
  it("whatsapp", () => {
    expect(buildShareUrl("whatsapp", url, text)).toBe(
      "https://wa.me/?text=IA%20local%3A%20guia%20https%3A%2F%2Fwww.matrizcentral.com.br%2Fblog%2Fmeu-post",
    );
  });
  it("x", () => {
    expect(buildShareUrl("x", url, text)).toBe(
      "https://twitter.com/intent/tweet?text=IA%20local%3A%20guia&url=https%3A%2F%2Fwww.matrizcentral.com.br%2Fblog%2Fmeu-post",
    );
  });
  it("linkedin", () => {
    expect(buildShareUrl("linkedin", url, text)).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.matrizcentral.com.br%2Fblog%2Fmeu-post",
    );
  });
});

describe("isTokenizedPath", () => {
  it("bloqueia qualquer caminho /dashboard/<token>", () => {
    expect(isTokenizedPath("https://x.com/dashboard/abc/conteudo/i")).toBe(true);
    expect(isTokenizedPath("/dashboard/abc123")).toBe(true);
  });
  it("libera URLs públicas", () => {
    expect(isTokenizedPath("https://www.matrizcentral.com.br")).toBe(false);
    expect(isTokenizedPath("/blog/meu-post")).toBe(false);
  });
});
