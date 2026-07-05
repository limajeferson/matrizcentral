"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FixedCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("mc-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

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
