import { describe, expect, it } from "vitest";
import { QUIZ_TRIAGEM } from "./quiz-triagem";
import { visibleQuestions } from "@/lib/quiz-branching";

describe("QUIZ_TRIAGEM — sanidade do banco de perguntas", () => {
  it("ids são únicos e crescentes", () => {
    const ids = QUIZ_TRIAGEM.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it("todo showIf referencia uma pergunta ANTERIOR existente", () => {
    QUIZ_TRIAGEM.forEach((q, index) => {
      if (!q.showIf) return;
      const refIndex = QUIZ_TRIAGEM.findIndex(
        (other) => other.id === q.showIf!.questionId
      );
      expect(refIndex, `Q${q.id} referencia Q${q.showIf.questionId}`).toBeGreaterThanOrEqual(0);
      expect(refIndex, `Q${q.id} deve referenciar pergunta anterior`).toBeLessThan(index);
    });
  });

  it("todo showIf usa índices de opção válidos na pergunta referenciada", () => {
    for (const q of QUIZ_TRIAGEM) {
      if (!q.showIf) continue;
      const ref = QUIZ_TRIAGEM.find((other) => other.id === q.showIf!.questionId)!;
      for (const idx of q.showIf.optionIndexes) {
        expect(idx, `Q${q.id} showIf índice ${idx}`).toBeLessThan(ref.options.length);
        expect(idx).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("a pergunta de programação tem opção acolhedora para quem não programa", () => {
    const q2 = QUIZ_TRIAGEM.find((q) => q.text.includes("programa"));
    expect(q2).toBeDefined();
    const acolhedora = q2!.options.some((o) =>
      o.text.includes("sem problema")
    );
    expect(acolhedora).toBe(true);
  });

  it("quem não programa nunca vê perguntas de linguagem/terminal/deploy", () => {
    const naoTecnico = visibleQuestions(QUIZ_TRIAGEM, [
      { questionId: 1, selectedOptionIndexes: [3] },
      { questionId: 2, selectedOptionIndexes: [2] },
    ]);
    const textos = naoTecnico.map((q) => q.text.toLowerCase()).join(" | ");
    expect(textos).not.toContain("linguagem de programação");
    expect(textos).not.toContain("terminal");
    expect(textos).not.toContain("deploy");
  });

  it("cada ramo mantém um tamanho razoável (10 a 17 perguntas visíveis)", () => {
    const ramos: { questionId: number; selectedOptionIndexes: number[] }[][] = [
      // técnico pleno
      [
        { questionId: 1, selectedOptionIndexes: [0] },
        { questionId: 2, selectedOptionIndexes: [0] },
      ],
      // não programa
      [
        { questionId: 1, selectedOptionIndexes: [4] },
        { questionId: 2, selectedOptionIndexes: [2] },
      ],
      // "um pouco"
      [
        { questionId: 1, selectedOptionIndexes: [5] },
        { questionId: 2, selectedOptionIndexes: [1] },
      ],
    ];
    for (const answers of ramos) {
      const visiveis = visibleQuestions(QUIZ_TRIAGEM, answers);
      expect(visiveis.length).toBeGreaterThanOrEqual(10);
      expect(visiveis.length).toBeLessThanOrEqual(17);
    }
  });
});
