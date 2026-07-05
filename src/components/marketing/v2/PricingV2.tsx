"use client";

import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";
import ProductBanner from "./ProductBanner";

const INCLUDED = [
  { icon: "📘", label: "Ebook Técnico", description: "Aprenda a rodar IA local do zero ao uso prático." },
  { icon: "🧭", label: "Diagnóstico Inicial", description: "Receba uma trilha recomendada para o seu contexto." },
  { icon: "🛣️", label: "Roadmap Inteligente", description: "Saiba exatamente qual é o próximo passo." },
  { icon: "🏆", label: "Certificação Verificável", description: "Valide seu aprendizado ao concluir a trilha." },
];

export default function PricingV2() {
  return (
    <section className="mc-section" id="preco">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Um único pagamento</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-price-headline">
            Todo o sistema por apenas
            <br />
            R$47
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-price-sub">
            Pagamento único. Sem mensalidade. Sem renovação automática. Sem
            fidelidade.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mc-price-badges mc-mono">
            <span><span className="mc-check" aria-hidden="true">✓</span> Pagamento único</span>
            <span><span className="mc-check" aria-hidden="true">✓</span> Acesso imediato</span>
            <span><span className="mc-check" aria-hidden="true">✓</span> Sem assinatura</span>
            <span><span className="mc-check" aria-hidden="true">✓</span> Acesso vitalício à versão adquirida</span>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mc-product-banners">
            {INCLUDED.map((item, index) => (
              <ProductBanner
                key={item.label}
                icon={item.icon}
                label={item.label}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mc-price-compare">
            <div>
              <span className="mc-mono">Assinaturas</span>
              <p className="mc-display">
                <AnimatedCounter value={annualSpendBRL()} format={formatBRL} />
              </p>
              <span className="mc-mono">/ano</span>
            </div>
            <span aria-hidden="true">vs</span>
            <div>
              <span className="mc-mono">Matriz Central</span>
              <p className="mc-display">R$47</p>
              <span className="mc-mono">pagamento único</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.5}>
          <div className="mc-price-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero por R$47
            </a>
            <p className="mc-price-cta-note">
              Acesso liberado imediatamente após a confirmação do pagamento.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <p className="mc-price-foot mc-mono">
            No futuro novos conteúdos poderão estar disponíveis por
            assinatura. O produto atual continua sendo vendido separadamente
            por R$47.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
