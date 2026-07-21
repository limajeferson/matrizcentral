"use client";

import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";

export default function OpportunitySection() {
  return (
    <section className="mc-section">
      <div className="mc-container">
        <div className="mc-block-accent mc-opportunity">
          <Reveal>
            <span className="mc-tag">Uma forma mais inteligente de usar IA</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mc-display">Sua IA. Suas regras.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mc-opportunity-sub">
              A Matriz Central ensina você a rodar modelos de IA localmente,
              reduzindo a dependência de assinaturas recorrentes e dando mais
              controle sobre como você usa IA no seu dia a dia.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mc-opportunity-compare">
              {/* Lado "que você NÃO vai pagar" — mesmo tratamento do
                  comparativo do `PricingV2`. Ver `.mc-price-alt`. */}
              <div className="mc-price-alt">
                <span className="mc-mono mc-opportunity-label">Hoje</span>
                <p className="mc-opportunity-value mc-display">
                  <AnimatedCounter value={annualSpendBRL()} format={formatBRL} />
                </p>
                <span className="mc-mono mc-opportunity-note">assinaturas recorrentes /ano</span>
              </div>
              <span className="mc-opportunity-arrow" aria-hidden="true">→</span>
              <div>
                <span className="mc-mono mc-opportunity-label">Com Matriz Central</span>
                <p className="mc-opportunity-value mc-display">R$47</p>
                <span className="mc-mono mc-opportunity-note">pagamento único</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="mc-opportunity-result mc-mono">
              Resultado: sua própria estrutura de IA, sem mensalidade recorrente
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
