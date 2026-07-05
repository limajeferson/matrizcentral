"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";

const ITEMS = [
  {
    benefit: "Aprenda no seu ritmo",
    feature: "Ebook Técnico",
    description:
      "9 capítulos organizados para levar você do primeiro modelo até uma utilização prática da IA local, mesmo sem experiência prévia.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Receba uma orientação personalizada",
    feature: "Diagnóstico Inicial",
    description:
      "O sistema identifica seu contexto de uso e recomenda a trilha mais adequada para começar.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
  {
    benefit: "Acompanhe sua evolução",
    feature: "Roadmap Inteligente",
    description:
      "Cada etapa concluída desbloqueia a próxima, permitindo acompanhar claramente sua evolução.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Comprove seu conhecimento",
    feature: "Certificação Verificável",
    description:
      "Após concluir sua trilha e validação, gere um certificado com autenticação pública.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
];

export default function SystemSection() {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="mc-section" id="sistema">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">O sistema</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-system-heading">
            Um sistema,
            <br />
            não um ebook solto
          </h2>
        </Reveal>

        <div className="mc-system-row">
          {ITEMS.map((item, index) => {
            const isFocused = focusIndex === index;
            const isDimmed = focusIndex !== null && !isFocused;

            return (
              <motion.div
                key={item.feature}
                className={`mc-system-card${item.accent ? " is-accent" : ""}`}
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
                <div className="mc-system-image-wrap">
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className="mc-system-image"
                    loading="lazy"
                  />
                </div>
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
