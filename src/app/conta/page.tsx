import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function ContaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  // Resolve o token da compra mais recente para o botão "meu painel".
  const supabase = getSupabaseServerClient();
  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let dashboardToken: string | null = null;
  if (purchase) {
    const { data: tokenRow } = await supabase
      .from("tokens")
      .select("token")
      .eq("purchase_id", purchase.id)
      .maybeSingle();
    dashboardToken = tokenRow?.token ?? null;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="mb-1 text-2xl font-bold">Minha conta</h1>
      <p className="mb-6 text-gray-600">Olá, {user.email}</p>

      <div className="flex gap-4">
        {dashboardToken ? (
          <a
            href={`/dashboard/${dashboardToken}`}
            className="inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"
          >
            Ir para meu painel de conteúdo
          </a>
        ) : (
          <p className="text-gray-500">
            Nenhuma compra encontrada nesta conta ainda.
          </p>
        )}
        <a
          href="/feed"
          className="inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"
        >
          Ver o feed
        </a>
        <a
          href="/forum"
          className="inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"
        >
          Ver o fórum
        </a>
      </div>

      <section className="mt-10 rounded-lg border border-dashed p-6 text-gray-500">
        <h2 className="mb-1 font-semibold text-gray-700">Em breve</h2>
        <p>Assinatura, feed e fórum aparecerão aqui nas próximas atualizações.</p>
      </section>

      <div className="mt-10">
        <LogoutButton />
      </div>
    </div>
  );
}
