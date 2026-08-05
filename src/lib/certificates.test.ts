import { describe, expect, it, vi } from "vitest";
import {
  certificateRequirements,
  isEligibleForCertificate,
  issueCertificateIfEligible,
} from "@/lib/certificates";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

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

describe("certificateRequirements", () => {
  it("devolve os dois requisitos, na ordem trilha → quiz", () => {
    const reqs = certificateRequirements({
      roadmapStagesCompleted: [],
      quizValidacaoPassed: false,
    });
    expect(reqs.map((r) => r.key)).toEqual(["roadmap", "quiz"]);
    expect(reqs.every((r) => r.done)).toBe(false);
  });

  it("marca só o quiz quando a trilha ainda não terminou", () => {
    const reqs = certificateRequirements({
      roadmapStagesCompleted: ["fundacao_local"],
      quizValidacaoPassed: true,
    });
    expect(reqs.find((r) => r.key === "roadmap")?.done).toBe(false);
    expect(reqs.find((r) => r.key === "quiz")?.done).toBe(true);
  });

  it("marca os dois quando o aluno cumpriu tudo", () => {
    const reqs = certificateRequirements({
      roadmapStagesCompleted: ["fundacao_local", "missao_final"],
      quizValidacaoPassed: true,
    });
    expect(reqs.every((r) => r.done)).toBe(true);
  });
});

describe("issueCertificateIfEligible - idempotência", () => {
  it("retorna o certificado existente e não chama insert quando já existe", async () => {
    const insertMock = vi.fn();
    const existing = { verification_code: "EXISTINGCODE1" };

    const supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: existing, error: null })),
            })),
          })),
        })),
        insert: insertMock,
      })),
    } as unknown as SupabaseClient<Database>;

    const result = await issueCertificateIfEligible(supabaseMock, {
      userId: "user-1",
      profileName: "fundacao_local",
      roadmapStagesCompleted: ["missao_final"],
      quizValidacaoPassed: true,
    });

    expect(result).toEqual({ verificationCode: "EXISTINGCODE1", created: false });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("cria um novo certificado e sinaliza created quando não existe", async () => {
    const supabaseMock = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: null, error: null })),
            })),
          })),
        })),
        insert: vi.fn(async () => ({ error: null })),
      })),
    } as unknown as SupabaseClient<Database>;

    const result = await issueCertificateIfEligible(supabaseMock, {
      userId: "user-1",
      profileName: "fundacao_local",
      roadmapStagesCompleted: ["missao_final"],
      quizValidacaoPassed: true,
    });

    expect(result).toMatchObject({ created: true });
    expect(typeof result?.verificationCode).toBe("string");
  });
});
