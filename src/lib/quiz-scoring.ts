export type ProfileId =
  | "dev_python_aia"
  | "dev_nodejs_web"
  | "devops_infra"
  | "ceo_financeiro"
  | "pm_product"
  | "founder_builder";

export interface TriagemOption {
  text: string;
  points: Partial<Record<ProfileId, number>>;
}

export interface TriagemQuestion {
  id: number;
  text: string;
  type: "radio" | "checkbox";
  options: TriagemOption[];
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
