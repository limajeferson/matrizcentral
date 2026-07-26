import ResgateClient from "./ResgateClient";
import { NOINDEX_METADATA } from "@/lib/seo";

// Página de troca de token por sessão — não é conteúdo indexável e o token
// vem na query string, então nem buscadores devem tocar nela.
export const metadata = NOINDEX_METADATA;

export default function ResgatePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResgateClient token={searchParams.token ?? null} />;
}
