export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetActionType: "conteudo" | "roadmap" | "validacao";
  targetCount: number;
}

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "tres_conteudos",
    title: "Maratona de Conteúdo",
    description: "Conclua 3 itens do hub de conteúdo nesta semana.",
    xpReward: 100,
    targetActionType: "conteudo",
    targetCount: 3,
  },
  {
    id: "avanco_roadmap",
    title: "Passo Firme",
    description: "Conclua 2 etapas do roadmap nesta semana.",
    xpReward: 150,
    targetActionType: "roadmap",
    targetCount: 2,
  },
  {
    id: "um_conteudo_rapido",
    title: "Comece Leve",
    description: "Conclua 1 item do hub de conteúdo nesta semana.",
    xpReward: 50,
    targetActionType: "conteudo",
    targetCount: 1,
  },
];
