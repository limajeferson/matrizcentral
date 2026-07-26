"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sem isso o erro some: o digest e a unica chave para achar o stack real
    // nos runtime logs da Vercel.
    console.error("[app/error]", error.digest, error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-widest opacity-60">Algo quebrou</p>
      <h1 className="text-3xl font-semibold">Não conseguimos carregar esta página</h1>
      <p className="max-w-md opacity-70">
        A falha foi registrada. Tente de novo — se continuar, fale com a gente e
        informe o código <code>{error.digest ?? "sem código"}</code>.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-lg px-5 py-2.5 font-medium" style={{ background: "#7c5cff", color: "#fff" }}>
          Tentar de novo
        </button>
        <Link href="/suporte" className="rounded-lg border px-5 py-2.5 font-medium">
          Falar com o suporte
        </Link>
      </div>
    </main>
  );
}
