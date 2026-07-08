export interface LevelDefinition {
  level: number;
  name: string;
  requiredXp: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: "Aprendiz", requiredXp: 0 },
  { level: 2, name: "Iniciado", requiredXp: 500 },
  { level: 3, name: "Praticante", requiredXp: 1000 },
  { level: 4, name: "Especialista", requiredXp: 2000 },
  { level: 5, name: "Mestre", requiredXp: 4000 },
];
