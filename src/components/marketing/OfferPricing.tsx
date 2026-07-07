"use client";

import { useState } from "react";
import type { WaitlistPlanId } from "@/types";
import { isValidEmail } from "@/lib/email-validation";

function WaitlistForm({ planId }: { planId: WaitlistPlanId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setValidationError("Informe seu e-mail para continuar.");
      return;
    }
    if (!isValidEmail(email)) {
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
    if (!isValidEmail(email)) {
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
          <h3>Start</h3>
          <div className="price">
            <b>R$47</b>
            <small>
              pagamento único
              <br />
              você vira dono da sua IA
            </small>
          </div>
          <EbookAvulsoCheckout />
          <ul>
            <li>1 ebook completo com todos os capítulos sobre rodar LLMs localmente</li>
            <li>Passo a passo de instalação e uso dos modelos</li>
            <li>Avaliação de qual o melhor modelo para o seu objetivo</li>
            <li>Triagem de perfil + roadmap personalizado — indica o melhor plano para assinar</li>
            <li>1 cupom de R$47 para migrar para o plano Regular ou o Advanced</li>
            <li>Garantia de 7 dias — não gostou, devolvemos</li>
          </ul>
          <span className="foot">
            Por R$47, uma vez: um diagnóstico, um plano de ação e o fim das mensalidades.
          </span>
        </div>

        <div className="plan">
          <span className="plan-badge-soon mono">Em breve</span>
          <h3 style={{ marginTop: 20 }}>Regular</h3>
          <div className="price">
            <b>R$97</b>
            <small>
              pagamento único
              <br />
              acesso por 12 meses
            </small>
          </div>
          <WaitlistForm planId="mensal_97" />
          <ul>
            <li>Todos os benefícios do Start</li>
            <li>Acesso ao hub/portal por 12 meses</li>
            <li>1 benefício liberado por mês, você escolhe: um podcast, um relatório, uma apresentação ou uma pesquisa</li>
            <li>Cancela quando quiser — o reembolso segue as mesmas condições do Start (ver termos)</li>
          </ul>
          <span className="foot">Pra quem quer estudar no seu ritmo, sem assinatura</span>
        </div>

        <div className="plan recommended">
          <span className="plan-badge-soon mono">Em breve</span>
          <span className="plan-tag mono plan-tag-hot">Mais procurado</span>
          <h3 style={{ marginTop: 20 }}>Advanced</h3>
          <div className="price">
            <b>
              <span style={{ fontSize: "0.5em", fontWeight: 400, verticalAlign: "middle" }}>12x</span> R$47
            </b>
            <small>
              ou R$497 à vista
              <br />
              acesso completo 12 meses
            </small>
          </div>
          <WaitlistForm planId="anual_497" />
          <ul>
            <li>Acesso completo à plataforma</li>
            <li>Todos os ebooks lançados durante os 12 meses</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Gamificação de perfil para medir a profundidade do seu aprendizado</li>
            <li>Hub completo: relatórios, podcasts, pesquisas, apresentações, conteúdo personalizado e avaliação de novas ferramentas</li>
            <li>≈ R$19 por ebook — o mais barato do catálogo (2 lançamentos por mês)</li>
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
