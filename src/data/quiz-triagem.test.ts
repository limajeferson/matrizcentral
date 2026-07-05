import { describe, expect, it } from "vitest";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

describe("QUIZ_TRIAGEM — Diagnóstico Inicial", () => {
  it("tem exatamente 7 perguntas", () => {
    expect(QUIZ_TRIAGEM).toHaveLength(7);
  });

  it("nenhuma pergunta usa showIf (sem ramificação técnica)", () => {
    expect(QUIZ_TRIAGEM.every((q) => q.showIf === undefined)).toBe(true);
  });

  it("nenhuma opção menciona linguagens de programação", () => {
    const bannedTerms = ["Python", "JavaScript", "TypeScript", "Go/Rust", "programo"];
    const allOptionTexts = QUIZ_TRIAGEM.flatMap((q) => q.options.map((o) => o.text));
    for (const term of bannedTerms) {
      expect(allOptionTexts.some((text) => text.includes(term))).toBe(false);
    }
  });

  it("toda opção distribui pontos para ao menos um perfil", () => {
    const allOptions = QUIZ_TRIAGEM.flatMap((q) => q.options);
    expect(allOptions.every((o) => Object.keys(o.points).length > 0)).toBe(true);
  });
});
