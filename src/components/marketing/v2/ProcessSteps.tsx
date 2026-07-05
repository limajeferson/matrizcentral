"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./motion-primitives";

const STEPS = [
  {
    number: "01",
    title: "Comece pelo caminho certo",
    description:
      "Após adquirir seu acesso, você recebe uma orientação personalizada para começar exatamente pelo que faz sentido para seu contexto.",
    detail: "Diagnóstico Inicial",
  },
  {
    number: "02",
    title: "Siga sua trilha",
    description:
      "Cada etapa mostra o próximo objetivo, liberando uma evolução organizada sem excesso de conteúdo.",
    detail: "Roadmap Inteligente",
  },
  {
    number: "03",
    title: "Construa sua independência",
    description:
      "Ao concluir sua trilha, você terá aprendido a utilizar IA local com mais autonomia, além de validar seu conhecimento através da certificação.",
    detail: "Certificação Verificável",
  },
];

function GlassPanel({ step }: { step: (typeof STEPS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"],
  });
  const glow = useTransform(scrollYProgress, [0, 1], [0.15, 0.55]);

  return (
    <motion.div ref={ref} className="mc-glass-panel" style={{ ["--mc-glow" as string]: glow }}>
      <span className="mc-glass-number mc-display">{step.number}</span>
      <h3 className="mc-display">{step.title}</h3>
      <p className="mc-glass-desc">{step.description}</p>
      <span className="mc-mono mc-glass-detail">{step.detail}</span>
    </motion.div>
  );
}

export default function ProcessSteps() {
  return (
    <section className="mc-section" id="processo">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Sua jornada</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">Seu caminho até uma IA independente</h2>
        </Reveal>
        <div className="mc-glass-track">
          {STEPS.map((step) => (
            <GlassPanel key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
