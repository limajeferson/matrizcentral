"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  driftX: number;
  driftY: number;
}

const STAR_COUNT = 140;

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.05,
      driftY: (Math.random() - 0.5) * 0.05,
    }));

    let frame = 0;
    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const twinkle = reduced ? star.baseAlpha : star.baseAlpha + Math.sin(frame * 0.02 + star.phase) * 0.25;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, twinkle))})`;
        ctx.fill();

        if (!reduced) {
          star.x = (star.x + star.driftX + width) % width;
          star.y = (star.y + star.driftY + height) % height;
        }
      }
      frame += 1;
      if (!reduced) {
        rafId = requestAnimationFrame(draw);
      }
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      if (reduced) {
        draw();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mc-oferta-starfield" aria-hidden="true" />;
}
