import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import QuizTriagem from "@/components/quiz/QuizTriagem";

function ErroToken({ mensagem, linkDashboard }: { mensagem: string; linkDashboard?: string }) {
  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <p className="text-gray-700">{mensagem}</p>
      {linkDashboard && (
        <a href={linkDashboard} className="text-blue-600 underline mt-4 inline-block">
          Ir para o dashboard
        </a>
      )}
    </div>
  );
}

export default async function QuizPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow) {
    return <ErroToken mensagem="Token não encontrado. Verifique o link do seu e-mail." />;
  }

  if (isTokenExpired(tokenRow.valid_until)) {
    return <ErroToken mensagem="Este token expirou." />;
  }

  if (tokenRow.triaged) {
    return (
      <ErroToken
        mensagem="Você já completou a triagem."
        linkDashboard={`/dashboard/${params.token}`}
      />
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 pt-10 text-center">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">
          Vamos montar seu plano de estudo
        </h1>
        <p className="text-sm text-zinc-600">
          Isto não é uma prova — é como personalizamos o conteúdo para você.
          Programando ou não, seu caminho sai daqui em poucos minutos.
        </p>
      </div>
      <QuizTriagem token={params.token} />
    </div>
  );
}
