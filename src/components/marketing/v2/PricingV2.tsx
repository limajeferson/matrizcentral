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

const INCLUDED = [
  { icon: IconBooks, label: "Biblioteca multi-formato", description: "Relatórios, podcasts, vídeos e apresentações sobre IA local." },
  { icon: IconPuzzle, label: "Plataforma-feed", description: "Aprenda no seu ritmo, como numa rede social de aprendizado." },
  { icon: IconCompass, label: "Diagnóstico inicial", description: "Uma trilha recomendada para o seu contexto." },
  { icon: IconRoad, label: "Roadmap inteligente", description: "Sempre o próximo passo certo, sem excesso de conteúdo." },
  { icon: IconTrophy, label: "Gamificação + Certificado", description: "XP, níveis e certificação verificável ao concluir a trilha." },
  { icon: IconBookOpen, label: "Ebook técnico (bônus)", description: "Material de apoio para rodar IA local do zero ao uso prático." },
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
