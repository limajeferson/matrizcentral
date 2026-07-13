import { describe, it, expect } from "vitest";
import { isSubscriber, validateTopicInput, validateReplyInput } from "./forum";

describe("isSubscriber", () => {
  it("view → false", () => expect(isSubscriber("view")).toBe(false));
  it("regular → true", () => expect(isSubscriber("regular")).toBe(true));
  it("advanced → true", () => expect(isSubscriber("advanced")).toBe(true));
});

describe("validateTopicInput", () => {
  it("título curto → erro", () => expect(validateTopicInput({ title: "ab", body: "x" }).ok).toBe(false));
  it("body vazio → erro", () => expect(validateTopicInput({ title: "abc", body: "  " }).ok).toBe(false));
  it("válido → ok", () => expect(validateTopicInput({ title: "Meu tópico", body: "conteúdo" }).ok).toBe(true));
  it("título longo → erro", () => expect(validateTopicInput({ title: "a".repeat(121), body: "x" }).ok).toBe(false));
});

describe("validateReplyInput", () => {
  it("vazio → erro", () => expect(validateReplyInput({ body: "" }).ok).toBe(false));
  it("válido → ok", () => expect(validateReplyInput({ body: "resposta" }).ok).toBe(true));
});
