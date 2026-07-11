export type ProfileId =
  | "dev_python_aia"
  | "dev_nodejs_web"
  | "devops_infra"
  | "ceo_financeiro"
  | "pm_product"
  | "founder_builder"
  | "estudante_curioso"
  | "profissional_produtividade";

export interface TriagemOption {
  text: string;
  points: Partial<Record<ProfileId, number>>;
}

export interface TriagemQuestion {
  id: number;
  text: string;
  type: "radio" | "checkbox";
  options: TriagemOption[];
  /**
   * Ramificação: a pergunta só é exibida se a resposta à pergunta
   * `questionId` incluir ao menos um dos índices em `optionIndexes`.
   * Sem `showIf`, a pergunta é sempre exibida.
   */
  showIf?: { questionId: number; optionIndexes: number[] };
}

export interface TriagemAnswer {
  questionId: number;
  selectedOptionIndexes: number[];
}

const PROFILE_ORDER: ProfileId[] = [
  "dev_python_aia",
  "dev_nodejs_web",
  "devops_infra",
  "ceo_financeiro",
  "pm_product",
  "founder_builder",
  "estudante_curioso",
  "profissional_produtividade",
];

export function scoreTriagem(
  questions: TriagemQuestion[],
  answers: TriagemAnswer[]
): ProfileId {
  const scores: Record<ProfileId, number> = {
    dev_python_aia: 0,
    dev_nodejs_web: 0,
    devops_infra: 0,
    ceo_financeiro: 0,
    pm_product: 0,
    founder_builder: 0,
    estudante_curioso: 0,
    profissional_produtividade: 0,
  };

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    for (const optionIndex of answer.selectedOptionIndexes) {
      const option = question.options[optionIndex];
      if (!option) continue;

      for (const profileId of PROFILE_ORDER) {
        scores[profileId] += option.points[profileId] ?? 0;
      }
    }
  }

  return PROFILE_ORDER.reduce((winner, profileId) =>
    scores[profileId] > scores[winner] ? profileId : winner
  );
}

// ---------------------------------------------------------------------------
// Quiz de validação (correção server-side)
//
// A nota NUNCA deve ser calculada no cliente e enviada como `passed`: qualquer
// comprador poderia forjar a aprovação (e, por consequência, o certificado).
// O servidor recebe apenas as respostas escolhidas e recalcula aqui, contra o
// gabarito real.
// ---------------------------------------------------------------------------

export type QuizLetter = "A" | "B" | "C" | "D";

export interface ValidacaoAnswer {
  questionId: number;
  selected: QuizLetter;
}

export interface GradedValidacaoAnswer extends ValidacaoAnswer {
  isCorrect: boolean;
}

export interface ValidacaoResult {
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  graded: GradedValidacaoAnswer[];
}

/**
 * Corrige o quiz de validação no servidor a partir do gabarito.
 * `passingScorePercent` é o mínimo (ex.: 70) para aprovação.
 * Respostas com `questionId` inexistente contam como incorretas.
 */
export function scoreValidacao(
  questions: { id: number; correctAnswer: QuizLetter }[],
  answers: ValidacaoAnswer[],
  passingScorePercent: number
): ValidacaoResult {
  const total = questions.length;

  const graded: GradedValidacaoAnswer[] = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    return {
      questionId: answer.questionId,
      selected: answer.selected,
      isCorrect: question ? question.correctAnswer === answer.selected : false,
    };
  });

  const correctCount = graded.filter((g) => g.isCorrect).length;
  const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = scorePercent >= passingScorePercent;

  return { correctCount, totalQuestions: total, scorePercent, passed, graded };
}
