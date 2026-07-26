"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/email-validation";

function PlanCheckout({ plan, cta }: { plan: "ebook" | "regular" | "advanced"; cta: string }) {
  const inputId = `checkout-email-${plan}`;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    setError(null);
    // Em caso de sucesso a navegação já foi disparada: manter o botão travado
    // evita duplo clique enquanto o browser troca de página.
    let redirecting = false;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      if (!res.ok) {
        setError("Não foi possível iniciar o checkout. Tente novamente.");
        return;
      }
      const data = await res.json().catch(() => null);
      const url = data?.url;
      if (typeof url !== "string" || !url) {
        setError("Não foi possível iniciar o checkout. Tente novamente.");
        return;
      }
      redirecting = true;
      window.location.href = url;
    } catch {
      setError("Conexão instável. Verifique sua internet e tente novamente.");
    } finally {
      if (!redirecting) setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="waitlist-form">
        <label htmlFor={inputId} className="sr-only">
          Seu e-mail para receber o acesso
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <button
        type="submit"
        className="btn btn-dark"
        style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        disabled={loading}
      >
        {loading ? "Redirecionando..." : cta}
      </button>
      {error && (
        <p className="hero-error" style={{ marginBottom: 12 }} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default function OfferPricing() {
  return (
    <div>
      <div className="plans-grid">
        <div className="plan">
          <h3>Start</h3>
          <div className="price"><b>R$47</b><small>pagamento único<br />acesso vitalício ao seu núcleo</small></div>
          <PlanCheckout plan="ebook" cta="Comprar agora" />
          <ul>
            <li>Ebook técnico completo + diagnóstico (triagem) + roadmap personalizado</li>
            <li>Relatório de benchmark do seu perfil e certificado ao concluir a trilha</li>
            <li>Acesso à plataforma para <strong>visualizar</strong> toda a biblioteca (prévias)</li>
            <li>Gamificação da sua trilha do ebook (XP, níveis)</li>
            <li><strong>Cupom de R$47</strong> (válido 30 dias) para migrar ao Regular ou Advanced</li>
            <li>Garantia condicional de 7 dias (ver termos)</li>
          </ul>
          <span className="foot">Por R$47, uma vez: seu núcleo de aprendizado — e a plataforma pra explorar o resto.</span>
        </div>

        <div className="plan">
          <h3>Regular</h3>
          <div className="price"><b>R$97</b><small>passe de 12 meses<br />1 conteúdo por mês</small></div>
          <PlanCheckout plan="regular" cta="Assinar o Regular" />
          <ul>
            <li>Tudo do Start</li>
            <li><strong>Consome 1 conteúdo por mês</strong> (escolhe entre todos) — desbloqueios acumulam pelos 12 meses</li>
            <li>Passe de 12 meses, sem renovação automática</li>
          </ul>
          <span className="foot">Pra estudar no seu ritmo, sem mensalidade</span>
        </div>

        <div className="plan recommended">
          <span className="plan-tag mono plan-tag-hot">Mais procurado</span>
          <h3 style={{ marginTop: 20 }}>Advanced</h3>
          <div className="price"><b><span style={{ fontSize: "0.5em", fontWeight: 400, verticalAlign: "middle" }}>12x</span> R$47</b><small>ou R$497 à vista<br />acesso completo 12 meses</small></div>
          <PlanCheckout plan="advanced" cta="Assinar o Advanced" />
          <ul>
            <li>Tudo do Start, com <strong>a plataforma inteira liberada</strong></li>
            <li>Consumo ilimitado: relatórios, podcasts, vídeos, apresentações e o <strong>feed</strong></li>
            <li>Gamificação plena + novos conteúdos durante os 12 meses</li>
          </ul>
          <span className="foot">Pra quem vai estudar o ano inteiro</span>
        </div>
      </div>
    </div>
  );
}
