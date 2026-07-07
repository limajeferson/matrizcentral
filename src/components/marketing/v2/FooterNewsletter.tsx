"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/email-validation";

type Status = "idle" | "loading" | "done" | "error";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setValidationError("Informe um e-mail válido.");
      return;
    }
    setValidationError(null);
    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setStatus(res && res.ok ? "done" : "error");
  };

  return (
    <div className="mc-footer-newsletter">
      <div className="mc-footer-newsletter-copy">
        <h3 className="mc-footer-newsletter-title">Receba novidades sobre IA Local</h3>
        <p className="mc-footer-newsletter-desc">
          Artigos, novidades e novos conteúdos diretamente no seu e-mail.
        </p>
      </div>
      {status === "done" ? (
        <p className="mc-footer-newsletter-done mc-mono">
          ✓ Pronto! Você vai receber nossas novidades.
        </p>
      ) : (
        <form
          className="mc-footer-newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Seu e-mail"
          />
          <button
            type="submit"
            className="mc-btn mc-btn-accent"
            disabled={status === "loading"}
          >
            {status === "loading" ? "..." : "Inscrever-se"}
          </button>
          {validationError && <p className="mc-footer-newsletter-error">{validationError}</p>}
          {status === "error" && (
            <p className="mc-footer-newsletter-error">Não deu certo, tente de novo.</p>
          )}
        </form>
      )}
    </div>
  );
}
