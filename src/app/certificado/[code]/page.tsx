import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function VerificacaoCertificadoPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = getSupabaseServerClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("title, issued_at")
    .eq("verification_code", params.code)
    .maybeSingle();

  if (!certificate) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-zinc-900">Certificado não encontrado</h1>
        <p className="mt-2 text-zinc-600">
          O código informado não corresponde a nenhum certificado emitido.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-8 text-center">
      <p className="text-sm uppercase tracking-widest text-emerald-600">Certificado válido ✓</p>
      <h1 className="text-2xl font-bold text-zinc-900">{certificate.title}</h1>
      <p className="text-zinc-600">
        Emitido em{" "}
        {new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
