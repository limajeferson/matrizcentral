import { describe, it, expect } from "vitest";
import { parseNewPost } from "./feed-posts";

describe("parseNewPost", () => {
  it("aceita body válido, apara espaços", () => {
    expect(parseNewPost({ body: "  olá mundo " })).toEqual({
      body: "olá mundo", link_url: null, image_url: null,
    });
  });
  it("rejeita body vazio/whitespace", () => {
    expect(parseNewPost({ body: "   " })).toBeNull();
    expect(parseNewPost({})).toBeNull();
    expect(parseNewPost(null)).toBeNull();
  });
  it("trunca body em 2000 chars", () => {
    const p = parseNewPost({ body: "a".repeat(3000) });
    expect(p?.body.length).toBe(2000);
  });
  it("aceita link/image http(s); descarta inválidos", () => {
    expect(parseNewPost({ body: "x", link_url: "https://a.com", image_url: "http://b.com/i.png" }))
      .toEqual({ body: "x", link_url: "https://a.com", image_url: "http://b.com/i.png" });
    expect(parseNewPost({ body: "x", link_url: "javascript:alert(1)", image_url: "ftp://x" }))
      .toEqual({ body: "x", link_url: null, image_url: null });
  });
});
