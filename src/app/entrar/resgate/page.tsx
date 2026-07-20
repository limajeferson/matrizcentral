import ResgateClient from "./ResgateClient";

// Página de troca de token por sessão — não é conteúdo indexável e o token
// vem na query string, então nem buscadores devem tocar nela.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function ResgatePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <ResgateClient token={searchParams.token ?? null} />;
}
