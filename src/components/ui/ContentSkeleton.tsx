/** Esqueleto de leitura: usado pelos loading.tsx das rotas que leem markdown
 *  do disco em runtime (blog, biblioteca, conteúdo por token). */
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
