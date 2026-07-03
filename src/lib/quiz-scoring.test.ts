import { describe, expect, it } from "vitest";
import { scoreTriagem, type TriagemQuestion, type TriagemAnswer } from "./quiz-scoring";

const questions: TriagemQuestion[] = [
  {
    id: 1,
    text: "Pergunta de escolha única",
    type: "radio",
    options: [
      { text: "A", points: { dev_python_aia: 3 } },
      { text: "B", points: { ceo_financeiro: 3 } },
    ],
  },
  {
    id: 2,
    text: "Pergunta de múltipla escolha",
    type: "checkbox",
    options: [
      { text: "A", points: { dev_python_aia: 2 } },
      { text: "B", points: { dev_nodejs_web: 2 } },
      { text: "C", points: { devops_infra: 1 } },
    ],
  },
];

describe("scoreTriagem", () => {
  it("escolhe o perfil com maior soma de pontos", () => {
    const answers: TriagemAnswer[] = [
      { questionId: 1, selectedOptionIndexes: [0] },
      { questionId: 2, selectedOptionIndexes: [0] },
    ];
    expect(scoreTriagem(questions, answers)).toBe("dev_python_aia");
  });

  it("soma pontos de múltiplas opções marcadas (checkbox)", () => {
    const answers: TriagemAnswer[] = [
      { questionId: 1, selectedOptionIndexes: [1] },
      { questionId: 2, selectedOptionIndexes: [1, 2] },
    ];
    // ceo_financeiro=3 vs dev_nodejs_web=2 vs devops_infra=1 -> ceo_financeiro vence
    expect(scoreTriagem(questions, answers)).toBe("ceo_financeiro");
  });

  it("em empate, retorna o perfil declarado primeiro na ordem de scores", () => {
    const tieQuestions: TriagemQuestion[] = [
      {
        id: 1,
        text: "Empate",
        type: "radio",
        options: [{ text: "A", points: { dev_python_aia: 2, dev_nodejs_web: 2 } }],
      },
    ];
    const answers: TriagemAnswer[] = [{ questionId: 1, selectedOptionIndexes: [0] }];
    expect(scoreTriagem(tieQuestions, answers)).toBe("dev_python_aia");
  });

  it("ignora respostas para perguntas ou opções inexistentes", () => {
    const answers: TriagemAnswer[] = [
      { questionId: 999, selectedOptionIndexes: [0] },
      { questionId: 1, selectedOptionIndexes: [99] },
    ];
    expect(scoreTriagem(questions, answers)).toBe("dev_python_aia");
  });
});
