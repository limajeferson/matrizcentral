"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FixedCta() {
  const [footerVisible, setFooterVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("mc-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // No mobile o CTA fixo (canto inferior direito) sobrepõe o CTA do
    // próprio hero (canto inferior esquerdo); escondemos o CTA fixo
    // enquanto o hero estiver visível para evitar a colisão.
    const hero = document.querySelector(".mc-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const hidden = footerVisible || heroVisible;

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="mc-fixed-cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35 }}
        >
          <a className="mc-btn mc-btn-accent" href="/oferta">
            Começar por R$47
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
