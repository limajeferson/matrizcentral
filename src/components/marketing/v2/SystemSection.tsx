"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";
import { IconCompass, IconRoad, IconBooks, IconTrophy } from "./icons";

const ITEMS = [
  {
    benefit: "Descubra por onde começar",
    feature: "Diagnóstico Inicial",
    description:
      "Em vez de procurar informações aleatórias, o sistema identifica seu contexto e recomenda a melhor trilha para começar.",
    Icon: IconCompass,
    image: "/system/diagnostico.jpg",
  },
  {
    benefit: "Aprenda em uma sequência lógica",
    feature: "Roadmap Inteligente",
    description:
      "Cada etapa desbloqueia a próxima para que você evolua sem estudar conteúdos fora do seu momento.",
    Icon: IconRoad,
    image: "/system/roadmap.jpg",
  },
  {
    benefit: "Estude no formato que preferir",
    feature: "Biblioteca Multimídia",
    description:
      "Leia, assista ou ouça o mesmo conhecimento em diferentes formatos, mantendo sempre o mesmo objetivo.",
    Icon: IconBooks,
    image: "/system/biblioteca.jpg",
  },
  {
    benefit: "Acompanhe sua evolução",
    feature: "Progressão + Certificação",
    description:
      "Veja seu progresso crescer ao longo da jornada e valide o conhecimento adquirido ao final da trilha.",
    Icon: IconTrophy,
    image: "/system/progressao.jpg",
  },
];

export default function SystemSection() {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="mc-section" id="sistema">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Por que é diferente</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-system-heading">
            Um sistema,
            <br />
            muito além da leitura
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-system-intro">
            Você não compra apenas conteúdo. Você entra em um sistema pensado
            para levar você do primeiro contato com IA Local até a utilização
            prática, seguindo uma sequência organizada de aprendizado. Cada
            recurso existe para resolver uma etapa da jornada.
          </p>
        </Reveal>

        <div className="mc-system-row">
          {ITEMS.map((item, index) => {
            const isFocused = focusIndex === index;
            const isDimmed = focusIndex !== null && !isFocused;
            const { Icon } = item;

            return (
              <motion.div
                key={item.feature}
                className="mc-system-card"
                animate={{
                  scale: reduced ? 1 : isFocused ? 1.04 : isDimmed ? 0.97 : 1,
                  opacity: isDimmed ? 0.5 : 1,
                  y: reduced ? 0 : isFocused ? -8 : 0,
                }}
                whileHover={reduced ? undefined : { scale: 1.04, y: -8 }}
                onHoverStart={() => setFocusIndex(index)}
                onHoverEnd={() => setFocusIndex(null)}
                onFocus={() => setFocusIndex(index)}
                onBlur={() => setFocusIndex(null)}
                tabIndex={0}
                transition={{ duration: reduced ? 0 : 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  className="mc-system-image"
                  loading="lazy"
                />
                <span className="mc-system-icon-badge" aria-hidden="true">
                  <Icon className="mc-system-icon" />
                </span>
                <div className="mc-system-card-body">
                  <span className="mc-tag">{item.benefit}</span>
                  <h3 className="mc-display">{item.feature}</h3>
                  <p>{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
