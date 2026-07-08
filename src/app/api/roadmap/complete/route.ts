import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { ROADMAP_STAGE_KEYS } from "@/data/roadmap-stages";
import { grantBadges } from "@/lib/grant-badges";
import { issueCertificateIfEligible } from "@/lib/certificates";
import { sendCertificateEmail } from "@/lib/email";
import { notifyLevelUpIfNeeded } from "@/lib/notify-level-up";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const stageKey = body?.stageKey as string | undefined;

  if (!token || !stageKey) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  if (!(ROADMAP_STAGE_KEYS as readonly string[]).includes(stageKey)) {
    return NextResponse.json({ error: "etapa inválida" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  const { error: progressError } = await supabase
    .from("roadmap_progress")
    .upsert({ token, stage_key: stageKey });

  if (progressError) {
    return NextResponse.json(
      { error: "não foi possível salvar o progresso" },
      { status: 500 }
    );
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (purchase) {
    const referenceId = `${token}:${stageKey}`;

    const { data: existingXpEvent } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("action_type", "roadmap")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (!existingXpEvent) {
      // O progresso já foi salvo com sucesso acima; a concessão de XP é um bônus
      // best-effort. Um erro aqui não deve fazer a rota retornar erro, pois isso
      // faria o cliente achar que o progresso não foi salvo quando na verdade foi.
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "roadmap",
        reference_id: referenceId,
      });
    }

    await grantBadges(supabase, purchase.user_id);
    if (!existingXpEvent) {
      await notifyLevelUpIfNeeded(supabase, purchase.user_id, 50);
    }

    if (stageKey === "missao_final") {
      try {
        const { data: allProgress } = await supabase
          .from("roadmap_progress")
          .select("stage_key")
          .eq("token", token);

        const { data: validacaoEvent } = await supabase
          .from("xp_events")
          .select("id")
          .eq("user_id", purchase.user_id)
          .eq("action_type", "validacao")
          .limit(1);

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", tokenRow.profile_id ?? "")
          .maybeSingle();

        const certificateResult = await issueCertificateIfEligible(supabase, {
          userId: purchase.user_id,
          profileName: profileRow?.name ?? "Matriz Central",
          roadmapStagesCompleted: (allProgress ?? []).map((p) => p.stage_key),
          quizValidacaoPassed: (validacaoEvent ?? []).length > 0,
        });

        if (certificateResult?.created) {
          const { data: userRow } = await supabase
            .from("users")
            .select("email")
            .eq("id", purchase.user_id)
            .single();

          if (userRow) {
            await sendCertificateEmail({
              to: userRow.email,
              title: `Certificado de Conclusão — Trilha ${profileRow?.name ?? "Matriz Central"}`,
              verificationCode: certificateResult.verificationCode,
            }).catch((err) => console.error("Falha ao enviar e-mail de certificado:", err));
          }
        }
      } catch (err) {
        console.error("Falha ao processar certificado de missao_final:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
