"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function RotatingWord({
  words,
  intervalMs = 2200,
  className,
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs, reduced]);

  if (reduced) {
    return (
      <span className={className}>
        {words[0]}
        <span className="mc-rotating-cursor" aria-hidden="true">|</span>
      </span>
    );
  }

  return (
    <span className={`mc-rotating-word ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mc-rotating-word-inner"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      <span className="mc-rotating-cursor" aria-hidden="true">|</span>
    </span>
  );
}
