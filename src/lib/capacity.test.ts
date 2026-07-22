import { describe, expect, it } from "vitest";
import { CAPACITY_QUESTIONS, CAPACITY_PATHS, hasCapacityAnswers, scoreCapacity } from "./capacity";

describe("scoreCapacity", () => {
  it("classifica performance quando investimento e equipamento apontam pra cima", () => {
    expect(scoreCapacity([
      { questionId: 8, selectedOptionIndexes: [0] },
      { questionId: 9, selectedOptionIndexes: [0] },
    ])).toBe("performance");
  });
  it("classifica essencial quando só tem smartphone e não quer gastar", () => {
    expect(scoreCapacity([
      { questionId: 8, selectedOptionIndexes: [2] },
      { questionId: 9, selectedOptionIndexes: [3] },
    ])).toBe("essencial");
  });
  it("empate resolve para o tier mais conservador (nunca recomendar acima do recurso)", () => {
    // investimento aponta performance (2), equipamento aponta essencial (2)
    expect(scoreCapacity([
      { questionId: 8, selectedOptionIndexes: [0] },
      { questionId: 9, selectedOptionIndexes: [3] },
    ])).toBe("essencial");
  });
  it("sem respostas de capacidade cai no conservador", () => {
    expect(scoreCapacity([{ questionId: 1, selectedOptionIndexes: [0] }])).toBe("essencial");
  });
  it("ignora ids fora do banco de capacidade e índices inválidos", () => {
    expect(scoreCapacity([
      { questionId: 9, selectedOptionIndexes: [99] },
      { questionId: 8, selectedOptionIndexes: [1] },
    ])).toBe("equilibrio");
  });
});

describe("hasCapacityAnswers", () => {
  it("true só quando há resposta para as perguntas 8/9", () => {
    expect(hasCapacityAnswers([{ questionId: 8, selectedOptionIndexes: [0] }])).toBe(true);
    expect(hasCapacityAnswers([{ questionId: 3, selectedOptionIndexes: [0] }])).toBe(false);
  });
});

describe("CAPACITY_PATHS", () => {
  it("tem os 3 tiers, nomes públicos dignos e nunca a palavra 'limitado'", () => {
    const tiers = Object.keys(CAPACITY_PATHS).sort();
    expect(tiers).toEqual(["equilibrio", "essencial", "performance"]);
    const all = JSON.stringify(CAPACITY_PATHS).toLowerCase();
    expect(all).not.toContain("limitado");
    expect(CAPACITY_PATHS.essencial.publicName).toBe("Essencial");
  });
  it("perguntas têm ids 8 e 9 e formato radio", () => {
    expect(CAPACITY_QUESTIONS.map((q) => q.id)).toEqual([8, 9]);
    expect(CAPACITY_QUESTIONS.every((q) => q.type === "radio")).toBe(true);
  });
});
