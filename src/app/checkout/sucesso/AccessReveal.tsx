"use client";

import { useEffect, useState, type FormEvent } from "react";

type ResendState = "idle" | "sending" | "done" | "error";

/**
 * Revela o link de acesso na própria tela de sucesso, resolvendo pelo
 * `session_id` da Stripe (via /api/access-status). Enquanto o webhook ainda
 * está criando o token, faz polling curto. Sempre oferece o reenvio por e-mail
 * como rede de segurança — assim o cliente NUNCA fica sem caminho para o
 * acesso, mesmo que o e-mail automático falhe.
 */
export default function AccessReveal({ sessionId }: { sessionId: string | null }) {
  const [quizUrl, setQuizUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(Boolean(sessionId));
  const [email, setEmail] = useState("");
  const [resend, setResend] = useState<ResendState>("idle");

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    let tries = 0;

    const poll = async () => {
      tries += 1;
      try {
        const res = await fetch(
          `/api/access-status?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await res.json().catch(() => null);
        if (active && data?.ready && data.quizUrl) {
          setQuizUrl(data.quizUrl as string);
          setChecking(false);
          return;
        }
      } catch {
        // ignora e tenta de novo
      }
      if (active && tries < 12) {
        setTimeout(poll, 2500);
      } else if (active) {
        setChecking(false);
      }
    };

    poll();
    return () => {
      active = false;
    };
  }, [sessionId]);

  const handleResend = async (e: FormEvent) => {
    e.preventDefault();
    if (resend === "sending") return;
    setResend("sending");
    try {
      const res = await fetch("/api/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResend(res.ok ? "done" : "error");
    } catch {
      setResend("error");
    }
  };

  if (quizUrl) {
    return (
      <>
        <p>Seu acesso está pronto:</p>
        <a className="mc-checkout-cta" href={quizUrl}>
          Começar meu diagnóstico →
        </a>
        <p className="mc-checkout-hint">
          Também enviamos este link para o seu e-mail.
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        {checking
          ? "Preparando seu acesso — só um instante…"
          : "Enviamos o link de acesso para o seu e-mail."}
      </p>
      {resend === "done" ? (
        <p className="mc-checkout-hint">
          ✓ Se este e-mail tiver uma compra, o link de acesso foi reenviado.
        </p>
      ) : (
        <form className="mc-resend" onSubmit={handleResend}>
          <label htmlFor="resend-email" className="mc-sr-only">
            Seu e-mail
          </label>
          <input
            id="resend-email"
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Seu e-mail"
          />
          <button type="submit" disabled={resend === "sending"}>
            {resend === "sending" ? "Enviando…" : "Não recebeu? Reenviar"}
          </button>
        </form>
      )}
      {resend === "error" && (
        <p className="mc-checkout-hint">
          Não foi possível reenviar agora. Tente novamente em instantes.
        </p>
      )}
    </>
  );
}
