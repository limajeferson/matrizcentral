"use client";

import { useEffect, useRef } from "react";
import { twinkleAlpha } from "@/lib/pixel-twinkle";

const CELL = 34;             // espaçamento da grade (px)
const SQUARE = 10;           // lado do quadradinho (px)
const GLOW = 6;              // raio do brilho
const MAX_ALPHA = 0.12;      // brilho máximo — bem apagado
const TIME_INC = 0.012;      // avanço de tempo por frame — lento
const RESIZE_DEBOUNCE = 180; // ms
// Espelham --mc-accent (#7c5cff) e --mc-trust (#466eff). Como o canvas não lê
// custom properties do CSS, ficam aqui como fonte única do lado JS.
const COLORS = ["124, 92, 255", "70, 110, 255"];

interface Cell {
  x: number;
  y: number;
  amp: number;
  speed: number;
  phase: number;
  sprite: number; // índice em COLORS / sprites
}

/**
 * Pré-renderiza um quadradinho com brilho UMA vez por cor, num canvas offscreen.
 * O loop por frame só faz drawImage + globalAlpha — sem shadowBlur por célula.
 */
function makeSprite(color: string): HTMLCanvasElement {
  const size = SQUARE + GLOW * 4;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    g.shadowBlur = GLOW;
    g.shadowColor = `rgba(${color}, 1)`;
    g.fillStyle = `rgba(${color}, 1)`;
    const p = (size - SQUARE) / 2;
    g.fillRect(p, p, SQUARE, SQUARE);
  }
  return c;
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
    const sprites = COLORS.map(makeSprite);
    const spriteOffset = (SQUARE + GLOW * 4) / 2;

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
            sprite: Math.floor(Math.random() * sprites.length),
          });
        }
      }
    };
    build();

    let time = 0;
    let rafId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const c of cells) {
        const a = twinkleAlpha(c.amp, c.speed, c.phase, time);
        if (a < 0.008) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(sprites[c.sprite], c.x - spriteOffset, c.y - spriteOffset);
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        time += TIME_INC;
        rafId = requestAnimationFrame(draw);
      }
    };
    draw();

    let resizeTimer = 0;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (reduced) draw();
      }, RESIZE_DEBOUNCE);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mc-pixel-bg" aria-hidden="true" />;
}
