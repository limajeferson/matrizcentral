import { customAlphabet } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const generateCode = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

export function buildVerificationCode(): string {
  return generateCode();
}

export function isEligibleForCertificate(params: {
  roadmapStagesCompleted: string[];
  quizValidacaoPassed: boolean;
}): boolean {
  return (
    params.roadmapStagesCompleted.includes("missao_final") && params.quizValidacaoPassed
  );
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
