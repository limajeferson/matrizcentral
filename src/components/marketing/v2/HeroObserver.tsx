"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FADE_SCROLL_PX = 620; // distância de scroll até sumir
const BASE_OPACITY = 0.7; // presente, mas ainda atrás do texto

// Esfera de IA "viva": globo/íris em wireframe, código piscando por dentro e
// glitch periódico (jitter + scanline + scramble). Canto superior direito,
// ~63% visível (cortada pelo overflow do hero), some ao rolar.
export default function HeroObserver() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, FADE_SCROLL_PX], [BASE_OPACITY, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let size = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      size = Math.max(rect.width || 0, rect.height || 0, 300);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = size / 2;
      cy = size / 2;
      R = size * 0.46;
    };
    resize();

    const GLYPHS = "01<>/{}[]#$%&*=+アイウ01";
    const codes = Array.from({ length: 64 }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 0.9; // distribuição uniforme no disco
      return {
        nx: Math.cos(a) * r,
        ny: Math.sin(a) * r,
        ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.6,
      };
    });

    let t = 0;
    let raf = 0;
    let glitchUntil = 0;
    let nextGlitch = 90;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.03);
      const glitching = t < glitchUntil;
      const gx = glitching ? (Math.random() - 0.5) * 10 : 0;

      // brilho externo (pulsa)
      const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.08);
      glow.addColorStop(0, `rgba(124, 92, 255, ${0.12 + pulse * 0.06})`);
      glow.addColorStop(0.7, "rgba(124, 92, 255, 0.05)");
      glow.addColorStop(1, "rgba(124, 92, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // borda da esfera
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(124, 92, 255, ${0.55 + pulse * 0.35})`;
      ctx.beginPath();
      ctx.arc(cx + gx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // globo em wireframe (meridianos/paralelos como elipses)
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(124, 92, 255, 0.16)";
      for (let i = 1; i <= 3; i += 1) {
        const rr = R * (i / 4);
        ctx.beginPath();
        ctx.ellipse(cx + gx, cy, rr, R, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx + gx, cy, R, rr, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // círculos concêntricos (íris)
      ctx.strokeStyle = "rgba(124, 92, 255, 0.2)";
      for (let i = 1; i <= 3; i += 1) {
        ctx.beginPath();
        ctx.arc(cx + gx, cy, R * (i / 3.5), 0, Math.PI * 2);
        ctx.stroke();
      }

      // código piscando por dentro
      ctx.font = `${Math.round(size * 0.026)}px ui-monospace, "SF Mono", Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const c of codes) {
        const a = 0.12 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.05 * c.speed + c.phase));
        ctx.fillStyle = `rgba(160, 140, 255, ${a})`;
        if (glitching && Math.random() < 0.12) {
          c.ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        ctx.fillText(c.ch, cx + gx + c.nx * R * 0.88, cy + c.ny * R * 0.88);
      }

      // scanline de glitch (fatia ciano)
      if (glitching) {
        const sy = cy + (Math.random() - 0.5) * R * 1.6;
        ctx.strokeStyle = "rgba(77, 225, 255, 0.55)";
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(cx - R, sy);
        ctx.lineTo(cx + R, sy);
        ctx.stroke();
      }
      ctx.restore();

      if (!reduced) {
        t += 1;
        if (t > nextGlitch) {
          glitchUntil = t + 4 + Math.random() * 7;
          nextGlitch = t + 140 + Math.random() * 260;
        }
        raf = requestAnimationFrame(draw);
      }
    };
    draw();

    const onResize = () => {
      resize();
      if (reduced) draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <motion.div className="mc-observer" style={{ opacity }} aria-hidden="true">
      <canvas ref={canvasRef} className="mc-observer-canvas" />
    </motion.div>
  );
}
