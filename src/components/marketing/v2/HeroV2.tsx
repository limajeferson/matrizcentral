"use client";

import DemoWidget from "@/components/marketing/DemoWidget";
import RotatingWord from "./RotatingWord";
import { Reveal } from "./motion-primitives";
import HeroObserver from "./HeroObserver";
import { formatCounts } from "@/lib/content-stats";
import { FormatIcon, IconSpark } from "./icons";

const ROTATING_WORDS = ["do GPT", "do Claude", "do Gemini", "de servidores", "de VPS"];

// Backlog de sub-headline (teste A/B via PostHog quando a landing for divulgada).
// Variante 1 (ativa hoje) já está no JSX abaixo.
// const HERO_SUBHEADLINE_VARIANTS = [
//   "Aprenda a rodar modelos de IA no seu computador e elimine a necessidade de pagar ChatGPT, Claude ou Gemini todo mês. Sem depender da nuvem. Sem precisar ser especialista.",
//   "Descubra como ter sua própria IA rodando no seu computador, sem mensalidade, com mais privacidade e controle. Tudo explicado passo a passo.",
//   "Troque o aluguel mensal por uma solução que é sua. Aprenda a rodar IA local no seu computador em menos de uma hora.",
//   "Você não precisa continuar pagando assinatura para usar IA todos os meses. Aprenda a rodar sua própria IA local com um método simples e uma única compra.",
// ];

export default function HeroV2() {
  const formats = formatCounts();

  return (
    <section className="mc-hero">
      <HeroObserver />
      <div className="mc-container mc-hero-content">
        <Reveal>
          <p className="mc-hero-proof mc-mono">
            <IconSpark className="mc-hero-proof-icon" /> Para quem cansou de assinaturas — e usa IA todos os dias
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mc-display">
            Pare de pagar mensalidade
            <br />
            <RotatingWord words={ROTATING_WORDS} />
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mc-hero-sub">
            Aprenda a rodar modelos de IA no seu computador e elimine a
            necessidade de pagar ChatGPT, Claude ou Gemini todo mês. Sem
            depender da nuvem. Sem precisar ser especialista.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mc-hero-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero por R$47
            </a>
            <a className="mc-btn mc-btn-ghost" href="#sistema">
              Ver o que você recebe
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.35}>
          <ul className="mc-hero-proof-strip mc-mono" aria-label="A biblioteca inclui">
            {formats.map((f) => (
              <li key={f.type}>
                <FormatIcon type={f.icon} className="mc-hero-proof-icon" /> <b>{f.count}</b> {f.label}
              </li>
            ))}
            <li className="mc-hero-proof-grow">sempre em expansão</li>
          </ul>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mc-hero-demo">
            <DemoWidget />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
