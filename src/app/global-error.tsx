"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#0a0a0f", color: "#fff", fontFamily: "sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 600 }}>Erro inesperado</h1>
          <p style={{ opacity: 0.7, maxWidth: 420 }}>
            Recarregue a página. Se continuar, informe o código{" "}
            <code>{error.digest ?? "sem código"}</code> ao suporte.
          </p>
          <button onClick={reset} style={{ background: "#7c5cff", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontWeight: 500, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
