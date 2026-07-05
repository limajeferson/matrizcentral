"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const TYPE_SPEED_MS = 55;
const DELETE_SPEED_MS = 32;
const PAUSE_AFTER_TYPE_MS = 1300;
const PAUSE_AFTER_DELETE_MS = 200;

export default function RotatingWord({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const currentWord = words[wordIndex];

    // Palavra inteira digitada: pausa antes de começar a apagar.
    if (!deleting && text === currentWord) {
      const id = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPE_MS);
      return () => clearTimeout(id);
    }

    // Palavra totalmente apagada: pequena pausa antes de digitar a próxima.
    if (deleting && text === "") {
      const id = setTimeout(() => {
        setDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, PAUSE_AFTER_DELETE_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(
      () => {
        setText((prev) =>
          deleting ? currentWord.slice(0, prev.length - 1) : currentWord.slice(0, prev.length + 1)
        );
      },
      deleting ? DELETE_SPEED_MS : TYPE_SPEED_MS
    );
    return () => clearTimeout(id);
  }, [text, deleting, wordIndex, words, reduced]);

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
      <span className="mc-rotating-word-inner">{text}</span>
      <span className="mc-rotating-cursor" aria-hidden="true">|</span>
    </span>
  );
}
