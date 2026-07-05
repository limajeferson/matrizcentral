"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  resolveScramble,
  totalScrambleFrames,
  SCRAMBLE_GLYPHS,
  type ScrambleChar,
} from "@/lib/scramble";

const FRAME_MS = 30;
const FRAMES_PER_CHAR = 3;

function randomGlyph(): string {
  return SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
}

function settledChars(text: string): ScrambleChar[] {
  return text.split("").map((char) => ({ char, settled: true }));
}

export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [chars, setChars] = useState<ScrambleChar[]>(() => settledChars(text));

  useEffect(() => {
    if (reduced) {
      setChars(settledChars(text));
      return;
    }

    let frame = 0;
    const total = totalScrambleFrames(text, FRAMES_PER_CHAR);

    const id = setInterval(() => {
      setChars(resolveScramble(text, frame, FRAMES_PER_CHAR, randomGlyph));
      frame += 1;
      if (frame > total) {
        setChars(settledChars(text));
        clearInterval(id);
      }
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [text, reduced]);

  return (
    <span className={className} aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={c.settled ? undefined : "mc-scramble-live"}
        >
          {c.char}
        </span>
      ))}
    </span>
  );
}
