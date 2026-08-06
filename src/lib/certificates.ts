import { customAlphabet } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const generateCode = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

export function buildVerificationCode(): string {
  return generateCode();
}

export type CertificateRequirementKey = "roadmap" | "quiz";

export type CertificateRequirement = {
  key: CertificateRequirementKey;
  label: string;
  done: boolean;
};

/**
 * Os dois requisitos do certificado, com o estado de cada um. Existe para a
 * página `/certificado` poder dizer ao membro **o que falta** — passar no quiz
 * sozinho não emite nada (ver `issueCertificateForToken`).
 */
export function certificateRequirements(params: {
  roadmapStagesCompleted: string[];
  quizValidacaoPassed: boolean;
}): CertificateRequirement[] {
  return [
    {
      key: "roadmap",
      label: "Concluir a missão final da sua trilha",
      done: params.roadmapStagesCompleted.includes("missao_final"),
    },
    {
      key: "quiz",
      label: "Passar no quiz de validação de conhecimento",
      done: params.quizValidacaoPassed,
    },
  ];
}

export function isEligibleForCertificate(params: {
  roadmapStagesCompleted: string[];
  quizValidacaoPassed: boolean;
}): boolean {
  return certificateRequirements(params).every((r) => r.done);
}

export async function issueCertificateIfEligible(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    profileName: string;
    roadmapStagesCompleted: string[];
    quizValidacaoPassed: boolean;
  }
): Promise<{ verificationCode: string; created: boolean } | null> {
  if (!isEligibleForCertificate(params)) {
    return null;
  }

  const { data: existing } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("user_id", params.userId)
    .eq("certificate_type", "roadmap_completion")
    .maybeSingle();

  if (existing) {
    return { verificationCode: existing.verification_code, created: false };
  }

  const verificationCode = buildVerificationCode();

  const { error: insertError } = await supabase.from("certificates").insert({
    user_id: params.userId,
    certificate_type: "roadmap_completion",
    reference_id: params.profileName,
    title: `Certificado de Conclusão — Trilha ${params.profileName}`,
    verification_code: verificationCode,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: concurrentlyCreated } = await supabase
        .from("certificates")
        .select("verification_code")
        .eq("user_id", params.userId)
        .eq("certificate_type", "roadmap_completion")
        .single();

      if (concurrentlyCreated) {
        return { verificationCode: concurrentlyCreated.verification_code, created: false };
      }
    }
    throw new Error(`Falha ao emitir certificado: ${insertError.message}`);
  }

  return { verificationCode, created: true };
}
