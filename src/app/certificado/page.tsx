import Link from "next/link";
import { getSessionUser } from "@/lib/auth-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { resolveDashboardToken } from "@/lib/dashboard-token";
import { certificateRequirements } from "@/lib/certificates";
import { IconArrow, IconBadge, IconCheck } from "@/components/ui/icons";
import { NOINDEX_METADATA } from "@/lib/seo";

// Personalizada por sessão (cookie) — nunca indexar nem cachear.
export const metadata = NOINDEX_METADATA;
export const dynamic = "force-dynamic";

const CTA =
  "inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-700";
const CTA_GHOST =
  "inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 font-semibold text-foreground transition hover:bg-accent";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <IconBadge size={18} />
        <span className="text-xs font-semibold uppercase tracking-widest">Certificação</span>
      </div>
      {children}
    </div>
  );
}

/**
 * Porta de entrada sem token para o certificado. É o alvo estável dos links de
 * descoberta (rodapé, `/conta`, sidebar, painel): decide sozinha entre explicar
 * a certificação (visitante), mostrar o que falta (membro em andamento) ou levar
 * ao certificado emitido.
 */
export default async function CertificadoHubPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-foreground">Certificado de conclusão</h1>
        <p className="text-muted-foreground">
          Quem termina a trilha recomendada e é aprovado no quiz de validação recebe um
          certificado da Matriz Central, com código de verificação público — qualquer pessoa
          pode conferir a autenticidade pelo link do certificado.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>1. Conclua a missão final da sua trilha no painel.</li>
          <li>2. Seja aprovado no quiz de validação de conhecimento.</li>
          <li>3. O certificado é emitido automaticamente e enviado por e-mail.</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <Link href="/entrar" className={CTA}>
            Entrar na minha conta
            <IconArrow size={16} />
          </Link>
          <Link href="/oferta" className={CTA_GHOST}>
            Ver a oferta
          </Link>
        </div>
      </Shell>
    );
  }

  const supabase = getSupabaseServerClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("title, issued_at, verification_code")
    .eq("user_id", user.id)
    .eq("certificate_type", "roadmap_completion")
    .maybeSingle();

  const token = await resolveDashboardToken(supabase, user.id);

  if (certificate) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold text-foreground">{certificate.title}</h1>
        <p className="flex items-center gap-1.5 text-sm text-emerald-600">
          <IconCheck size={14} /> Emitido em{" "}
          {new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-muted-foreground">
          Código de verificação:{" "}
          <span className="font-mono text-foreground">{certificate.verification_code}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {token && (
            <Link href={`/dashboard/${token}/certificado`} className={CTA}>
              Abrir e imprimir o certificado
              <IconArrow size={16} />
            </Link>
          )}
          <Link href={`/certificado/${certificate.verification_code}`} className={CTA_GHOST}>
            Link público de verificação
          </Link>
        </div>
      </Shell>
    );
  }

  // Sem certificado: mostrar exatamente o que falta, em vez de um "não elegível".
  let roadmapStagesCompleted: string[] = [];
  if (token) {
    const { data: progressRows } = await supabase
      .from("roadmap_progress")
      .select("stage_key")
      .eq("token", token);
    roadmapStagesCompleted = (progressRows ?? []).map((row) => row.stage_key);
  }

  const { data: validacaoEvents } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("action_type", "validacao")
    .limit(1);

  const requirements = certificateRequirements({
    roadmapStagesCompleted,
    quizValidacaoPassed: (validacaoEvents ?? []).length > 0,
  });

  return (
    <Shell>
      <h1 className="text-2xl font-bold text-foreground">Seu certificado ainda não foi emitido</h1>
      <p className="text-muted-foreground">
        Faltam estes requisitos. Assim que os dois estiverem cumpridos, o certificado é emitido
        automaticamente e aparece aqui.
      </p>
      <ul className="space-y-3">
        {requirements.map((req) => (
          <li key={req.key} className="flex items-start gap-3 rounded-xl border border-border p-4">
            <span
              aria-hidden
              className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-white ${
                req.done ? "bg-emerald-600" : "bg-muted"
              }`}
            >
              {req.done && <IconCheck size={12} />}
            </span>
            <span className="text-foreground">
              {req.label}
              <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                {req.done ? "concluído" : "pendente"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {token ? (
        <Link href={`/dashboard/${token}`} className={CTA}>
          Ir para o painel
          <IconArrow size={16} />
        </Link>
      ) : (
        <p className="text-muted-foreground">
          Nenhuma compra encontrada nesta conta ainda —{" "}
          <Link href="/oferta" className="text-violet-600 underline">
            ver a oferta
          </Link>
          .
        </p>
      )}
    </Shell>
  );
}
