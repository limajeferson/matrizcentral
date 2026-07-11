import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { issueCertificateIfEligible } from "@/lib/certificates";
import { sendCertificateEmail } from "@/lib/email";

/**
 * Tenta emitir o certificado de conclusão para o dono de um token, se ele já
 * cumpriu os dois requisitos (concluir `missao_final` no roadmap E passar no
 * quiz de validação). É idempotente e best-effort: qualquer erro é logado e
 * engolido, para nunca derrubar o fluxo que chamou.
 *
 * Precisa ser chamado a partir de AMBOS os gatilhos (conclusão da trilha e
 * aprovação no quiz), porque o cliente pode cumprir os requisitos em qualquer
 * ordem — se só um gatilho tentasse emitir, quem passasse no quiz depois de
 * concluir a trilha nunca receberia o certificado.
 */
export async function issueCertificateForToken(
  supabase: SupabaseClient<Database>,
  params: { userId: string; token: string; profileId: string | null }
): Promise<void> {
  try {
    const { data: allProgress } = await supabase
      .from("roadmap_progress")
      .select("stage_key")
      .eq("token", params.token);

    const { data: validacaoEvent } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", params.userId)
      .eq("action_type", "validacao")
      .limit(1);

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", params.profileId ?? "")
      .maybeSingle();

    const profileName = profileRow?.name ?? "Matriz Central";

    const certificateResult = await issueCertificateIfEligible(supabase, {
      userId: params.userId,
      profileName,
      roadmapStagesCompleted: (allProgress ?? []).map((p) => p.stage_key),
      quizValidacaoPassed: (validacaoEvent ?? []).length > 0,
    });

    if (certificateResult?.created) {
      const { data: userRow } = await supabase
        .from("users")
        .select("email")
        .eq("id", params.userId)
        .single();

      if (userRow) {
        await sendCertificateEmail({
          to: userRow.email,
          title: `Certificado de Conclusão — Trilha ${profileName}`,
          verificationCode: certificateResult.verificationCode,
        }).catch((err) =>
          console.error("Falha ao enviar e-mail de certificado:", err)
        );
      }
    }
  } catch (err) {
    console.error("Falha ao processar emissão de certificado:", err);
  }
}
