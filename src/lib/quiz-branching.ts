import type { TriagemQuestion, TriagemAnswer } from "./quiz-scoring";

/**
 * Filtra o banco de perguntas para as visíveis dado o conjunto de respostas
 * já fornecidas. Perguntas sem `showIf` são sempre visíveis; perguntas com
 * `showIf` só aparecem quando a resposta à pergunta referenciada contém ao
 * menos um dos índices esperados. Preserva a ordem original do banco.
 */
export function visibleQuestions<Q extends { id: number; showIf?: TriagemQuestion["showIf"] }>(
  questions: Q[],
  answers: TriagemAnswer[]
): Q[] {
  return questions.filter((question) => {
    if (!question.showIf) return true;

    const answer = answers.find((a) => a.questionId === question.showIf!.questionId);
    if (!answer) return false;

    return question.showIf.optionIndexes.some((index) =>
      answer.selectedOptionIndexes.includes(index)
    );
  });
}
