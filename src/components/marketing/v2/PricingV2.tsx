"use client";

import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";
import ProductBanner from "./ProductBanner";
import {
  IconBookOpen,
  IconBooks,
  IconCheck,
  IconCompass,
  IconPuzzle,
  IconRoad,
  IconTrophy,
} from "./icons";

// C7 (Onda 3): a lista apresentava os 6 itens como se todos fossem do R$47.
// Biblioteca e feed sao dos passes (Regular/Advanced) - o plano de entrada da
// previa. A pessoa continua vendo tudo o que existe, mas ninguem compra achando
// que leva a biblioteca inteira: essa descoberta pos-compra e a origem numero um
// de pedido de reembolso.
const INCLUDED = [
  { icon: IconBookOpen, label: "Ebook técnico completo", description: "9 capítulos, do organograma de decisão ao troubleshooting de hardware." },
  { icon: IconCompass, label: "Diagnóstico inicial", description: "Uma trilha recomendada para o seu contexto." },
  { icon: IconRoad, label: "Roadmap inteligente", description: "Sempre o próximo passo certo, sem excesso de conteúdo." },
  { icon: IconTrophy, label: "Gamificação + Certificado", description: "XP, níveis e certificação verificável ao concluir a trilha." },
  { icon: IconBooks, label: "Biblioteca multi-formato", description: "Relatórios, podcasts, vídeos e apresentações. No plano de entrada você navega e vê as prévias; o acesso completo é dos passes." },
  { icon: IconPuzzle, label: "Plataforma-feed", description: "Aprenda no seu ritmo, como numa rede social de aprendizado. Disponível nos passes." },
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
            Comece por
            <br />
            R$47
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-price-sub">
            Seu diagnóstico, seu roadmap e o ebook técnico — pagamento único.
            Sem mensalidade, sem renovação automática, sem fidelidade.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mc-price-badges mc-mono">
            <span><IconCheck className="mc-check" /> Pagamento único</span>
            <span><IconCheck className="mc-check" /> Acesso imediato</span>
            <span><IconCheck className="mc-check" /> Sem assinatura</span>
            <span><IconCheck className="mc-check" /> Acesso vitalício à versão adquirida</span>
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
            {/* Lado "que você NÃO vai pagar": atenuado e riscado, para o
                R$47 ao lado ler como o valor real. Ver `.mc-price-alt`. */}
            <div className="mc-price-alt">
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
