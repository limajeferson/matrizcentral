/**
 * Esqueleto de leitura, hoje sem nenhum consumidor.
 *
 * Existia como `loading.tsx` de /blog/[slug], /biblioteca/[slug] e
 * /dashboard/[token]/conteudo/[id] — mas um `loading.tsx` de rota cria um
 * boundary de Suspense que faz o Next liberar o header HTTP em streaming
 * *antes* de a página chamar notFound()/redirect(). Na prática isso vira
 * soft-404 (200 em vez de 404 num slug morto) e derruba o 307 do guard de
 * login da /biblioteca para um redirect só-no-JS. Por isso os três
 * `loading.tsx` foram apagados (Onda 1, achado Important 1) e **não podem
 * ser reintroduzidos** nessas três páginas.
 *
 * Volta a ter uso na Onda 2, dentro de um `<Suspense>` aninhado colocado
 * *depois* do guard (notFound/redirect já resolvidos), nunca como
 * `loading.tsx` de arquivo de convenção dessas rotas.
 */
export default function ContentSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl animate-pulse space-y-4 px-6 py-16"
      aria-busy="true"
      aria-label="Carregando conteúdo"
    >
      <div className="h-8 w-2/3 rounded bg-current opacity-10" />
      <div className="h-4 w-1/3 rounded bg-current opacity-10" />
      <div className="h-4 w-full rounded bg-current opacity-10" />
      <div className="h-4 w-full rounded bg-current opacity-10" />
      <div className="h-4 w-5/6 rounded bg-current opacity-10" />
    </div>
  );
}
