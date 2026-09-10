import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { resolveDashboardToken } from "@/lib/dashboard-token";
import { getAccessContext } from "@/lib/entitlement-access";
import LogoutButton from "@/components/auth/LogoutButton";
import { READER_DOCS } from "@/data/reader-docs";
import { NOINDEX_METADATA } from "@/lib/seo";

const readerEbook = READER_DOCS.find((d) => d.kind === "ebook");

const PLAN_LABEL = { view: "Start", regular: "Regular", advanced: "Advanced" } as const;

export const metadata = NOINDEX_METADATA;

export default async function ContaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  // Resolve o token da compra mais recente para o botão "meu painel".
  const supabase = getSupabaseServerClient();
  const dashboardToken = await resolveDashboardToken(supabase, user.id);
  const { access } = await getAccessContext(user.id);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="mb-1 text-2xl font-bold">Minha conta</h1>
      <p className="text-gray-600">Olá, {user.email}</p>
      <p className="mb-6 text-sm font-medium text-violet-600">Plano {PLAN_LABEL[access]}</p>

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
        {readerEbook && (
          <a
            href={`/biblioteca/${readerEbook.slug}`}
            className="inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"
          >
            Ler o guia
          </a>
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
        <a
          href="/certificado"
          className="inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"
        >
          Meu certificado
        </a>
      </div>

      <div className="mt-10">
        <LogoutButton />
      </div>
    </div>
  );
}
