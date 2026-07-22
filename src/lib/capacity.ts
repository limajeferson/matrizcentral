import type { TriagemAnswer } from "@/lib/quiz-scoring";

/** Eixo de CAPACIDADE (recursos/infra) — ortogonal aos 8 perfis de caso de uso.
 *  Interno: performance | equilibrio | essencial. Público: ver CAPACITY_PATHS
 *  ("limitado" do pedido virou "Essencial" — nunca rotular o usuário por falta). */
export type CapacityTier = "performance" | "equilibrio" | "essencial";

export interface CapacityOption {
  text: string;
  capacityPoints: Partial<Record<CapacityTier, number>>;
}
export interface CapacityQuestion {
  id: number;
  text: string;
  type: "radio";
  options: CapacityOption[];
}

/** Ids continuam a numeração do QUIZ_TRIAGEM (1–7). Estas perguntas pontuam
 *  SÓ o eixo de capacidade — as 7 do perfil ficam intactas. */
export const CAPACITY_QUESTIONS: CapacityQuestion[] = [
  {
    id: 8,
    text: "Se precisar investir para rodar IA local, qual é o seu momento?",
    type: "radio",
    options: [
      { text: "Posso montar o melhor setup (GPU dedicada ou servidor/VPS robusta)", capacityPoints: { performance: 2 } },
      { text: "Invisto no que fizer sentido para o meu projeto", capacityPoints: { equilibrio: 2 } },
      { text: "Quero começar com o que já tenho, sem gastar agora", capacityPoints: { essencial: 2 } },
    ],
  },
  {
    id: 9,
    text: "Qual equipamento você tem disponível hoje?",
    type: "radio",
    options: [
      { text: "Desktop potente com GPU dedicada (ou VPS/servidor)", capacityPoints: { performance: 2 } },
      { text: "Notebook ou desktop com GPU dedicada", capacityPoints: { performance: 1, equilibrio: 1 } },
      { text: "Notebook comum, sem GPU dedicada", capacityPoints: { equilibrio: 1, essencial: 1 } },
      { text: "Só smartphone (ou um computador bem antigo)", capacityPoints: { essencial: 2 } },
    ],
  },
];

/** Desempate/zero → mais conservador PRIMEIRO: nunca recomendar acima do
 *  recurso real (frustra e gera suporte); subir de tier é 1 clique no refazer. */
const TIE_ORDER: CapacityTier[] = ["essencial", "equilibrio", "performance"];

export function hasCapacityAnswers(answers: TriagemAnswer[]): boolean {
  return answers.some((a) => CAPACITY_QUESTIONS.some((q) => q.id === a.questionId));
}

export function scoreCapacity(answers: TriagemAnswer[]): CapacityTier {
  const scores: Record<CapacityTier, number> = { performance: 0, equilibrio: 0, essencial: 0 };
  for (const answer of answers) {
    const question = CAPACITY_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    for (const index of answer.selectedOptionIndexes) {
      const option = question.options[index];
      if (!option) continue;
      for (const tier of TIE_ORDER) scores[tier] += option.capacityPoints[tier] ?? 0;
    }
  }
  return TIE_ORDER.reduce((winner, tier) => (scores[tier] > scores[winner] ? tier : winner));
}

export interface CapacityPath {
  tier: CapacityTier;
  publicName: string;
  /** Promessa curta (landing/feed). */
  tagline: string;
  /** Setup recomendado (feed/e-mail). */
  setup: string;
  /** Primeiro passo concreto dentro da plataforma. */
  primeiroPasso: string;
}

/** FONTE ÚNICA de copy dos 3 caminhos — landing, feed e e-mails leem daqui
 *  (evita drift de mensagem entre canais). */
export const CAPACITY_PATHS: Record<CapacityTier, CapacityPath> = {
  performance: {
    tier: "performance",
    publicName: "Performance",
    tagline: "Você pode montar a melhor infra — vamos direto ao topo de linha.",
    setup: "GPU dedicada ou VPS robusta rodando os modelos mais performáticos, ajustados ao uso que você definir.",
    primeiroPasso: "Comece pelo relatório de benchmark e monte seu setup de referência.",
  },
  equilibrio: {
    tier: "equilibrio",
    publicName: "Equilíbrio",
    tagline: "Projeto definido — o modelo certo para o seu caso, sem excesso.",
    setup: "Estruturas prontas: a triagem direciona o melhor modelo para o formato do seu projeto.",
    primeiroPasso: "Siga a trilha recomendada do seu diagnóstico — ela já aponta o modelo do seu caso.",
  },
  essencial: {
    tier: "essencial",
    publicName: "Essencial",
    tagline: "Comece com o que você já tem — smartphone ou notebook, com ou sem GPU.",
    setup: "Modelos leves calibrados para rodar sem travar no equipamento que você já possui.",
    primeiroPasso: "Comece pela jornada básica: um modelo leve rodando hoje vale mais que um setup ideal amanhã.",
  },
};

/** Valida valor cru (do banco/requisição) contra os 3 tiers — nunca `as CapacityTier` cego.
 *  Rejeita prototype keys ("toString", "constructor" etc) e valores não-string. */
export function toCapacityTier(value: unknown): CapacityTier | undefined {
  if (typeof value !== "string") return undefined;
  const tiers = Object.keys(CAPACITY_PATHS) as CapacityTier[];
  return tiers.includes(value as CapacityTier) ? (value as CapacityTier) : undefined;
}
