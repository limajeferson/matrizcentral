import { describe, expect, it } from "vitest";
import {
  scoreTriagem,
  scoreValidacao,
  type TriagemQuestion,
  type TriagemAnswer,
  type QuizLetter,
  type ValidacaoAnswer,
} from "./quiz-scoring";
import { QUIZ_LLM_LOCAL, QUIZ_CONFIG } from "../data/quiz-llm-local";

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

  it("suporta os perfis novos (estudante_curioso e profissional_produtividade)", () => {
    const novasQuestions: TriagemQuestion[] = [
      {
        id: 1,
        text: "O que te traz aqui?",
        type: "radio",
        options: [
          { text: "Entender IA do zero", points: { estudante_curioso: 3 } },
          { text: "Produtividade no dia a dia", points: { profissional_produtividade: 3 } },
        ],
      },
    ];
    expect(
      scoreTriagem(novasQuestions, [{ questionId: 1, selectedOptionIndexes: [0] }])
    ).toBe("estudante_curioso");
    expect(
      scoreTriagem(novasQuestions, [{ questionId: 1, selectedOptionIndexes: [1] }])
    ).toBe("profissional_produtividade");
  });

  it("em empate entre perfil original e novo, o original vence (ordem preservada)", () => {
    const tie: TriagemQuestion[] = [
      {
        id: 1,
        text: "Empate",
        type: "radio",
        options: [
          { text: "A", points: { founder_builder: 2, estudante_curioso: 2 } },
        ],
      },
    ];
    expect(scoreTriagem(tie, [{ questionId: 1, selectedOptionIndexes: [0] }])).toBe(
      "founder_builder"
    );
  });
});

function wrongLetter(correct: QuizLetter): QuizLetter {
  return correct === "A" ? "B" : "A";
}

// Monta respostas com exatamente `n` corretas (o restante erradas).
function answersWithNCorrect(n: number): ValidacaoAnswer[] {
  return QUIZ_LLM_LOCAL.map((q, i) => ({
    questionId: q.id,
    selected: i < n ? q.correctAnswer : wrongLetter(q.correctAnswer),
  }));
}

describe("scoreValidacao", () => {
  const total = QUIZ_LLM_LOCAL.length; // 15
  const passing = QUIZ_CONFIG.passingScore; // 70

  it("dá 100% e aprova quando tudo está correto", () => {
    const r = scoreValidacao(QUIZ_LLM_LOCAL, answersWithNCorrect(total), passing);
    expect(r.correctCount).toBe(total);
    expect(r.scorePercent).toBe(100);
    expect(r.passed).toBe(true);
  });

  it("aprova no limite (11/15 = 73%)", () => {
    const r = scoreValidacao(QUIZ_LLM_LOCAL, answersWithNCorrect(11), passing);
    expect(r.correctCount).toBe(11);
    expect(r.scorePercent).toBe(73);
    expect(r.passed).toBe(true);
  });

  it("reprova logo abaixo do limite (10/15 = 67%)", () => {
    const r = scoreValidacao(QUIZ_LLM_LOCAL, answersWithNCorrect(10), passing);
    expect(r.correctCount).toBe(10);
    expect(r.scorePercent).toBe(67);
    expect(r.passed).toBe(false);
  });

  it("reprova quando não há respostas", () => {
    const r = scoreValidacao(QUIZ_LLM_LOCAL, [], passing);
    expect(r.correctCount).toBe(0);
    expect(r.scorePercent).toBe(0);
    expect(r.passed).toBe(false);
  });

  it("ignora forja: todas erradas nunca aprovam", () => {
    const r = scoreValidacao(QUIZ_LLM_LOCAL, answersWithNCorrect(0), passing);
    expect(r.correctCount).toBe(0);
    expect(r.passed).toBe(false);
  });

  it("conta questionId inexistente como incorreto", () => {
    const r = scoreValidacao(
      QUIZ_LLM_LOCAL,
      [{ questionId: 9999, selected: "A" }],
      passing
    );
    expect(r.graded[0].isCorrect).toBe(false);
    expect(r.correctCount).toBe(0);
  });

  it("marca is_correct corretamente por questão", () => {
    const first = QUIZ_LLM_LOCAL[0];
    const r = scoreValidacao(
      QUIZ_LLM_LOCAL,
      [{ questionId: first.id, selected: first.correctAnswer }],
      passing
    );
    expect(r.graded[0]).toEqual({
      questionId: first.id,
      selected: first.correctAnswer,
      isCorrect: true,
    });
  });
});
