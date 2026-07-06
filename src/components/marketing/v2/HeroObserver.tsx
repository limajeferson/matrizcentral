"use client";

import { motion, useScroll, useTransform } from "framer-motion";

const FADE_SCROLL_PX = 600; // distância de scroll até sumir
const BASE_OPACITY = 0.38;  // quase apagado no topo

export default function HeroObserver() {
  const { scrollY } = useScroll();
  // Some ao rolar (~600px) — "desliga a observação".
  const opacity = useTransform(scrollY, [0, FADE_SCROLL_PX], [BASE_OPACITY, 0]);

  return <motion.div className="mc-observer" style={{ opacity }} aria-hidden="true" />;
}
