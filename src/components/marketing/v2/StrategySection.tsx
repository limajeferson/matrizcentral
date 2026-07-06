"use client";

import { Reveal } from "./motion-primitives";

const PILLARS = [
  {
    icon: "💬",
    title: "Zero jargão técnico",
    desc: "Tudo em português claro. A gente parte do seu objetivo e do seu contexto — nunca do seu nível de programação.",
  },
  {
    icon: "🧭",
    title: "Passo a passo guiado",
    desc: "Você instala e coloca sua IA para rodar seguindo instruções simples, na ordem certa. Sem escrever uma linha de código.",
  },
  {
    icon: "🔒",
    title: "Feito para usar, não construir",
    desc: "O foco é você usando IA no dia a dia — offline, privada e sem mensalidade. Você no controle, do primeiro dia.",
  },
];

export default function StrategySection() {
  return (
    <section className="mc-section" id="estrategia">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Para quem quer usar IA</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-strategy-heading">
            Você não precisa
            <br />
            saber programar
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-strategy-sub">
            A Matriz Central é para quem quer <strong>usar</strong> inteligência
            artificial — profissionais, criadores, estudantes, empresários e
            curiosos. Não é um curso para desenvolvedores. Esta é a estratégia
            que leva qualquer pessoa do zero à própria IA rodando localmente.
          </p>
        </Reveal>

        <div className="mc-strategy-grid">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={0.05 * i}>
              <div className="mc-strategy-card">
                <span className="mc-strategy-icon" aria-hidden="true">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div className="mc-strategy-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Começar sem complicação
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
