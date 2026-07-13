import { describe, expect, it } from "vitest";
import { parseTriagemAnswers } from "./diagnosis";

describe("parseTriagemAnswers", () => {
  it("aceita um array de respostas bem formado", () => {
    const raw = [
      { questionId: 1, selectedOptionIndexes: [0] },
      { questionId: 2, selectedOptionIndexes: [1, 3] },
    ];
    expect(parseTriagemAnswers(raw)).toEqual(raw);
  });

  it("rejeita não-array", () => {
    expect(parseTriagemAnswers("nope")).toBeNull();
    expect(parseTriagemAnswers(null)).toBeNull();
    expect(parseTriagemAnswers(undefined)).toBeNull();
  });

  it("rejeita array vazio", () => {
    expect(parseTriagemAnswers([])).toBeNull();
  });

  it("rejeita item sem questionId numérico", () => {
    expect(parseTriagemAnswers([{ selectedOptionIndexes: [0] }])).toBeNull();
    expect(parseTriagemAnswers([{ questionId: "1", selectedOptionIndexes: [0] }])).toBeNull();
  });

  it("rejeita selectedOptionIndexes que não é array de inteiros", () => {
    expect(parseTriagemAnswers([{ questionId: 1, selectedOptionIndexes: "x" }])).toBeNull();
    expect(parseTriagemAnswers([{ questionId: 1, selectedOptionIndexes: [1.5] }])).toBeNull();
  });
});
