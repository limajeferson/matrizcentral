import { describe, expect, it } from "vitest";
import { validateTrackInput } from "./funnel";

describe("validateTrackInput", () => {
  it("aceita um evento conhecido", () => {
    const result = validateTrackInput({ event: "oferta_view", path: "/oferta" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.event).toBe("oferta_view");
      expect(result.value.path).toBe("/oferta");
    }
  });

  it("recusa evento desconhecido", () => {
    const result = validateTrackInput({ event: "hackeado", path: "/" });
    expect(result.ok).toBe(false);
  });

  it("recusa payload que nao e objeto", () => {
    expect(validateTrackInput(null).ok).toBe(false);
    expect(validateTrackInput("oferta_view").ok).toBe(false);
  });

  it("NUNCA guarda caminho privado (o token do dashboard nao pode vazar)", () => {
    const result = validateTrackInput({
      event: "content_open",
      path: "/dashboard/8f3a-token-secreto/conteudo/x",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.path).toBeNull();
  });

  it("descarta a query string do referrer", () => {
    const result = validateTrackInput({
      event: "landing_view",
      path: "/",
      referrer: "https://google.com/search?q=ia+local&token=abc",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.referrer).toBe("https://google.com/search");
  });

  it("descarta referrer que nao e http(s)", () => {
    const result = validateTrackInput({
      event: "landing_view",
      path: "/",
      referrer: "javascript:alert(1)",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.referrer).toBeNull();
  });

  it("aceita meta so com valores primitivos e no maximo 10 chaves", () => {
    const ok = validateTrackInput({ event: "checkout_start", meta: { plan: "advanced" } });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.meta).toEqual({ plan: "advanced" });

    const aninhado = validateTrackInput({ event: "checkout_start", meta: { a: { b: 1 } } });
    expect(aninhado.ok).toBe(true);
    if (aninhado.ok) expect(aninhado.value.meta).toEqual({});

    const demais = Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [`k${i}`, "v"])
    );
    const cortado = validateTrackInput({ event: "checkout_start", meta: demais });
    expect(cortado.ok).toBe(true);
    if (cortado.ok) expect(Object.keys(cortado.value.meta ?? {}).length).toBe(10);
  });

  it("trunca caminho gigante em 300 caracteres", () => {
    const result = validateTrackInput({ event: "landing_view", path: `/${"a".repeat(500)}` });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.path?.length).toBe(300);
  });

  // C1 — o referrer é a rota de vazamento real: navegação dura a partir do
  // dashboard manda a URL completa (com token) via document.referrer.
  it("NUNCA guarda o referrer de um caminho privado (guarda so a origem)", () => {
    const result = validateTrackInput({
      event: "oferta_view",
      path: "/oferta",
      referrer: "https://www.matrizcentral.com.br/dashboard/TOKEN-SECRETO/conteudo/x",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.referrer).toBe("https://www.matrizcentral.com.br");
      expect(result.value.referrer).not.toContain("TOKEN-SECRETO");
    }
  });

  it("referrer externo normal continua preservado com caminho", () => {
    const result = validateTrackInput({
      event: "landing_view",
      path: "/",
      referrer: "https://google.com/search",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.referrer).toBe("https://google.com/search");
  });

  // I2 — normalizePath não pode devolver a query junto do path gravado.
  it("guarda o path sem a query string", () => {
    const result = validateTrackInput({
      event: "oferta_view",
      path: "/oferta?email=fulano@x.com",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.path).toBe("/oferta");
  });

  // I3 — o guard tem que sobreviver a formas não-canônicas do mesmo caminho
  // privado, falhando fechado (null) em todas.
  it("recusa formas nao-canonicas do caminho privado do dashboard", () => {
    const casos = [
      "//dashboard/TOKEN",
      "/Dashboard/TOKEN",
      "/./dashboard/TOKEN",
      "/dashboard%2FTOKEN",
      "/%64ashboard/TOKEN",
    ];
    for (const path of casos) {
      const result = validateTrackInput({ event: "content_open", path });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.path, `path testado: ${path}`).toBeNull();
    }
  });

  // M10 — chave de meta gigante não pode ser gravada; chave válida sim.
  it("descarta chave de meta invalida e preserva chave valida", () => {
    const chaveGigante = "k".repeat(5000);
    const result = validateTrackInput({
      event: "checkout_start",
      meta: { [chaveGigante]: "valor", plan: "advanced" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.meta).toEqual({ plan: "advanced" });
      expect(Object.keys(result.value.meta ?? {})).not.toContain(chaveGigante);
    }
  });
});
