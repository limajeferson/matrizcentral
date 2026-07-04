"use client";

import { useState } from "react";
import type { WaitlistPlanId } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function WaitlistForm({ planId }: { planId: WaitlistPlanId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setValidationError("Informe seu e-mail para continuar.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setValidationError("Informe um e-mail válido.");
      return;
    }
    setValidationError(null);
    setStatus("loading");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, planId }),
    });

    setStatus(response.ok ? "done" : "error");
  };

  if (status === "done") {
    return <p className="waitlist-done">✓ Anotado! Avisamos assim que abrir.</p>;
  }

  return (
    <div>
      <div className="waitlist-form">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="button" className="btn btn-ghost" onClick={handleSubmit} disabled={status === "loading"}>
          {status === "loading" ? "..." : "Avise-me"}
        </button>
      </div>
      {validationError && <p className="hero-error">{validationError}</p>}
      {status === "error" && <p className="hero-error">Não deu certo, tenta de novo.</p>}
    </div>
  );
}

function EbookAvulsoCheckout() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email) {
      setError("Informe seu e-mail para continuar.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setLoading(false);
      setError("Não foi possível iniciar o checkout. Tente novamente.");
      return;
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div>
      <div className="waitlist-form">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-dark"
        style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Redirecionando..." : "Comprar agora"}
      </button>
      {error && (
        <p className="hero-error" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function OfferPricing() {
  return (
    <div>
      <div className="plans-grid">
        <div className="plan">
          <h3>Ebook Avulso</h3>
          <div className="price">
            <b>R$47</b>
            <small>
              pagamento único
              <br />
              1 ebook completo
            </small>
          </div>
          <EbookAvulsoCheckout />
          <ul>
            <li>Ebook completo (9 capítulos) sobre rodar LLMs localmente</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Garantia de 30 dias — não gostou, devolvemos</li>
          </ul>
          <span className="foot">Ideal pra testar antes de assinar</span>
        </div>

        <div className="plan">
          <span className="plan-badge-soon mono">Em breve</span>
          <h3 style={{ marginTop: 20 }}>Assinatura Mensal</h3>
          <div className="price">
            <b>R$97</b>
            <small>
              por mês
              <br />
              1 ebook novo/mês
            </small>
          </div>
          <WaitlistForm planId="mensal_97" />
          <ul>
            <li>1 ebook novo por mês — 12 no ano</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Acesso ao hub de conteúdo (relatórios, podcasts, pesquisas)</li>
            <li>Cancela quando quiser</li>
          </ul>
          <span className="foot">Pra quem quer estudar todo mês, sem compromisso longo</span>
        </div>

        <div className="plan recommended">
          <span className="plan-badge-soon mono">Em breve</span>
          <span className="plan-tag mono">Melhor custo por ebook</span>
          <h3 style={{ marginTop: 20 }}>Acesso Total 12 Meses</h3>
          <div className="price">
            <b>R$497</b>
            <small>
              à vista ou 12x R$47
              <br />
              acesso completo 12 meses
            </small>
          </div>
          <WaitlistForm planId="anual_497" />
          <ul>
            <li>Todos os ebooks lançados durante os 12 meses</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Hub de conteúdo completo (relatórios, podcasts, pesquisas)</li>
            <li>≈ R$41 por ebook — o mais barato do catálogo</li>
          </ul>
          <span className="foot">Pra quem já sabe que vai estudar o ano inteiro</span>
        </div>
      </div>

      <p className="plan-note" style={{ maxWidth: 640, margin: "24px auto 0" }}>
        Funciona sem placa de vídeo dedicada? Sim — o capítulo sobre Ollama e
        quantização mostra modelos que rodam só na CPU, incluindo em notebooks
        comuns.
      </p>
    </div>
  );
}
