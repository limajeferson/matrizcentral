import { describe, expect, it } from "vitest";
import { visibleQuestions } from "./quiz-branching";
import type { TriagemQuestion, TriagemAnswer } from "./quiz-scoring";

const bank: TriagemQuestion[] = [
  {
    id: 1,
    text: "Você programa?",
    type: "radio",
    options: [
      { text: "Sim", points: { dev_python_aia: 1 } },
      { text: "Não", points: { profissional_produtividade: 1 } },
    ],
  },
  {
    id: 2,
    text: "Qual linguagem? (só para quem programa)",
    type: "radio",
    options: [{ text: "Python", points: { dev_python_aia: 3 } }],
    showIf: { questionId: 1, optionIndexes: [0] },
  },
  {
    id: 3,
    text: "Qual IA você usa hoje? (só para quem não programa)",
    type: "radio",
    options: [{ text: "ChatGPT grátis", points: { profissional_produtividade: 2 } }],
    showIf: { questionId: 1, optionIndexes: [1] },
  },
  {
    id: 4,
    text: "Quanto tempo por semana? (comum)",
    type: "radio",
    options: [{ text: "1-2 horas", points: { estudante_curioso: 1 } }],
  },
];

describe("visibleQuestions", () => {
  it("sem respostas, mostra apenas perguntas sem showIf", () => {
    const visible = visibleQuestions(bank, []);
    expect(visible.map((q) => q.id)).toEqual([1, 4]);
  });

  it("resposta que satisfaz o showIf revela a pergunta do ramo", () => {
    const answers: TriagemAnswer[] = [{ questionId: 1, selectedOptionIndexes: [0] }];
    const visible = visibleQuestions(bank, answers);
    expect(visible.map((q) => q.id)).toEqual([1, 2, 4]);
  });

  it("resposta que não satisfaz o showIf mantém a pergunta oculta", () => {
    const answers: TriagemAnswer[] = [{ questionId: 1, selectedOptionIndexes: [1] }];
    const visible = visibleQuestions(bank, answers);
    expect(visible.map((q) => q.id)).toEqual([1, 3, 4]);
  });

  it("checkbox: basta um índice selecionado bater com o showIf", () => {
    const checkboxBank: TriagemQuestion[] = [
      {
        id: 1,
        text: "Interesses",
        type: "checkbox",
        options: [
          { text: "A", points: {} },
          { text: "B", points: {} },
        ],
      },
      {
        id: 2,
        text: "Ramo de B",
        type: "radio",
        options: [{ text: "X", points: {} }],
        showIf: { questionId: 1, optionIndexes: [1] },
      },
    ];
    const visible = visibleQuestions(checkboxBank, [
      { questionId: 1, selectedOptionIndexes: [0, 1] },
    ]);
    expect(visible.map((q) => q.id)).toEqual([1, 2]);
  });

  it("preserva a ordem original do banco de perguntas", () => {
    const answers: TriagemAnswer[] = [{ questionId: 1, selectedOptionIndexes: [0] }];
    const visible = visibleQuestions(bank, answers);
    const ids = visible.map((q) => q.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });
});
