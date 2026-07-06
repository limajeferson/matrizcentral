"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroObserver() {
  const { scrollY } = useScroll();
  // Quase apagado no topo (0.38) e some ao rolar ~600px ("desliga a observação").
  const opacity = useTransform(scrollY, [0, 600], [0.38, 0]);

  return <motion.div className="mc-observer" style={{ opacity }} aria-hidden="true" />;
}
