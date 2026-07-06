"use client";

import { useEffect, useRef } from "react";
import { twinkleAlpha } from "@/lib/pixel-twinkle";

const CELL = 34;         // espaçamento da grade (px)
const SQUARE = 10;       // lado do quadradinho (px)
const MAX_ALPHA = 0.12;  // brilho máximo — bem apagado
const TIME_INC = 0.012;  // avanço de tempo por frame — lento
const COLORS = ["124, 92, 255", "70, 110, 255"]; // violeta, azul

interface Cell {
  x: number;
  y: number;
  amp: number;
  speed: number;
  phase: number;
  color: string;
}

export default function PixelGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let cells: Cell[] = [];

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cells = [];
      for (let y = CELL; y < height; y += CELL) {
        for (let x = CELL; x < width; x += CELL) {
          const r = Math.random();
          cells.push({
            x,
            y,
            // r² enviesa para baixo: a maioria dos quadrados fica quase apagada
            amp: MAX_ALPHA * r * r,
            speed: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
    };
    build();

    let time = 0;
    let rafId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 6;
      for (const c of cells) {
        const a = twinkleAlpha(c.amp, c.speed, c.phase, time);
        if (a < 0.008) continue;
        const fill = `rgba(${c.color}, ${a})`;
        ctx.fillStyle = fill;
        ctx.shadowColor = fill;
        ctx.fillRect(c.x - SQUARE / 2, c.y - SQUARE / 2, SQUARE, SQUARE);
      }
      ctx.shadowBlur = 0;

      if (!reduced) {
        time += TIME_INC;
        rafId = requestAnimationFrame(draw);
      }
    };
    draw();

    const handleResize = () => {
      build();
      if (reduced) draw();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mc-pixel-bg" aria-hidden="true" />;
}
