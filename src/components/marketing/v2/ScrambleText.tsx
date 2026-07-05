"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz";
const FRAME_MS = 35;
const FRAMES_PER_CHAR = 3;

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const totalFrames = text.length * FRAMES_PER_CHAR;

    const id = setInterval(() => {
      const resolvedCount = Math.floor(frame / FRAMES_PER_CHAR);
      const next = text
        .split("")
        .map((char, index) => {
          if (char === " " || char === "/") return char;
          if (index < resolvedCount) return text[index];
          return randomGlyph();
        })
        .join("");
      setDisplay(next);
      frame += 1;

      if (frame > totalFrames) {
        setDisplay(text);
        clearInterval(id);
      }
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [text, reduced]);

  return <span className={className}>{display}</span>;
}
