import { describe, expect, it } from "vitest";
import { isEligibleForCertificate } from "@/lib/certificates";

describe("isEligibleForCertificate", () => {
  it("não é elegível sem a etapa final do roadmap", () => {
    expect(
      isEligibleForCertificate({
        roadmapStagesCompleted: ["fundacao_local"],
        quizValidacaoPassed: true,
      })
    ).toBe(false);
  });

  it("não é elegível sem o quiz de validação aprovado", () => {
    expect(
      isEligibleForCertificate({
        roadmapStagesCompleted: ["missao_final"],
        quizValidacaoPassed: false,
      })
    ).toBe(false);
  });

  it("é elegível com a etapa final concluída e quiz aprovado", () => {
    expect(
      isEligibleForCertificate({
        roadmapStagesCompleted: ["fundacao_local", "missao_final"],
        quizValidacaoPassed: true,
      })
    ).toBe(true);
  });
});
