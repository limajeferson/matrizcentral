"use client";

import { useEffect, useRef } from "react";
import { waveY, type WaveLayer } from "@/lib/wave-field";

interface ColoredLayer extends WaveLayer {
  /** Cor do topo do preenchimento (some para transparente na base). */
  color: string;
}

// Deep blues + violetas sobre o fundo escuro — casa com os tokens da .mcv2.
const LAYERS: ColoredLayer[] = [
  { amplitude: 84, wavelength: 760, speed: 0.35, phase: 0.0, yOffset: 0.42, color: "rgba(91, 61, 245, 0.44)" },
  { amplitude: 66, wavelength: 560, speed: 0.5, phase: 1.6, yOffset: 0.58, color: "rgba(124, 92, 255, 0.36)" },
  { amplitude: 50, wavelength: 420, speed: 0.68, phase: 3.1, yOffset: 0.74, color: "rgba(70, 110, 255, 0.30)" },
];

const STEP = 8; // resolução horizontal em px
const TIME_INC = 0.6; // avanço de tempo por frame

export default function WaveCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let time = 0;
    let rafId = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const layer of LAYERS) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += STEP) {
          ctx.lineTo(x, waveY(layer, x, time, height));
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, height * 0.15, 0, height);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, "rgba(10, 8, 18, 0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      if (!reduced) {
        time += TIME_INC;
        rafId = requestAnimationFrame(draw);
      }
    };
    draw();

    const handleResize = () => {
      resize();
      if (reduced) draw();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mc-wave-bg" aria-hidden="true" />;
}
