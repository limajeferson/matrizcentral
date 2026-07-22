import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

export default async function CertificadoPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .maybeSingle();

  if (!purchase) {
    notFound();
  }

  const { data: certificate } = await supabase
    .from("certificates")
    .select("title, issued_at, verification_code")
    .eq("user_id", purchase.user_id)
    .eq("certificate_type", "roadmap_completion")
    .maybeSingle();

  if (!certificate) {
    return (
      <p className="max-w-md mx-auto p-8 text-center">
        Você ainda não concluiu os requisitos para o certificado (roadmap completo + quiz de
        validação aprovado).
      </p>
    );
  }

  return (
    <div className="force-light mx-auto max-w-2xl space-y-6 bg-background p-6 text-foreground print:p-0">
      <div className="rounded-2xl border-4 border-violet-600 p-10 text-center print:border-2">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Matriz Central</p>
        <h1 className="mt-4 text-3xl font-bold text-foreground">{certificate.title}</h1>
        <p className="mt-4 text-muted-foreground">
          Emitido em{" "}
          {new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Código de verificação: {certificate.verification_code}
        </p>
        <p className="text-xs text-muted-foreground">
          Verifique em matrizcentral.com.br/certificado/{certificate.verification_code}
        </p>
      </div>
      <p className="text-center text-sm text-muted-foreground print:hidden">
        Use Ctrl+P (ou Cmd+P) para salvar este certificado como PDF.
      </p>
    </div>
  );
}
