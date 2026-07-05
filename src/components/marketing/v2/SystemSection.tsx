"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";

const ITEMS = [
  {
    benefit: "Tudo em um só lugar",
    feature: "Biblioteca multi-formato",
    description:
      "Relatórios, podcasts, vídeos e apresentações sobre IA local — com o ebook técnico como material de apoio, não como o produto.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Aprenda como numa rede social",
    feature: "Plataforma-feed",
    description:
      "Um feed de aprendizado no seu ritmo, organizado por contexto — não um PDF que você baixa e esquece.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
  {
    benefit: "Comece pelo caminho certo",
    feature: "Trilha guiada",
    description:
      "Um diagnóstico inicial do seu contexto e um roadmap inteligente que libera cada etapa na ordem certa.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Comprove sua evolução",
    feature: "Gamificação + Certificado",
    description:
      "XP, níveis e uma certificação verificável com autenticação pública ao concluir sua trilha.",
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
