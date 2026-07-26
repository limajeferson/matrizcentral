import Link from "next/link";

export const metadata = { title: "Página não encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-widest opacity-60">Erro 404</p>
      <h1 className="text-3xl font-semibold">Esta página não existe</h1>
      <p className="max-w-md opacity-70">
        O endereço pode ter mudado ou o link estar incompleto. Você pode voltar ao
        início ou falar com a gente.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg px-5 py-2.5 font-medium" style={{ background: "#7c5cff", color: "#fff" }}>
          Voltar ao início
        </Link>
        <Link href="/suporte" className="rounded-lg border px-5 py-2.5 font-medium">
          Falar com o suporte
        </Link>
      </div>
    </main>
  );
}
