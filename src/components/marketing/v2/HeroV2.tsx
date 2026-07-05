"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import DemoWidget from "@/components/marketing/DemoWidget";
import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

export default function HeroV2() {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const y = useTransform(scrollY, [0, 800], [0, reduced ? 0 : 160]);

  return (
    <section className="mc-hero">
      <motion.div className="mc-hero-motif" style={{ y }} aria-hidden="true">
        <NetworkField />
      </motion.div>
      <div className="mc-container mc-hero-content">
        <Reveal>
          <p className="mc-hero-proof mc-mono">
            ✦ Para quem quer dominar IA — programando ou não
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mc-display">
            Pare de alugar
            <br />
            sua <span className="mc-accent-text">IA</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mc-hero-sub">
            Construa seu próprio ChatGPT particular em menos de uma hora.
            Rode sua IA local — sem mensalidade, sem depender da nuvem e sem
            precisar ser especialista.
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
        <Reveal delay={0.4}>
          <div className="mc-hero-demo">
            <DemoWidget />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
