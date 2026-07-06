"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const FADE_SCROLL_PX = 620; // distância de scroll até sumir
const BASE_OPACITY = 0.72; // presente, mas ainda atrás do texto

// Rampa de densidade (escuro -> claro). Inclui os caracteres pedidos: -=+*#%▓.
const RAMP = " .:-=+*#%▓";
const YAW_SPEED = 0.006; // rotação por frame — lenta, hipnótica
const TILT = 0.42; // inclinação fixa do eixo (rad) — deixa o giro visível
// Luz quase frontal (leve canto superior-esquerdo) — centro mais aceso.
const LX = -0.24;
const LY = -0.28;
const LZ = 0.93;

interface Pt {
  x: number;
  y: number;
  z: number;
  phi: number; // longitude original — cria "faixas" que giram com a esfera
}

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

    // Malha de pontos na superfície de uma esfera unitária (uma vez só).
    const pts: Pt[] = [];
    for (let theta = 0.05; theta < Math.PI; theta += 0.14) {
      const st = Math.sin(theta);
      const ct = Math.cos(theta);
      for (let phi = 0; phi < Math.PI * 2; phi += 0.06) {
        pts.push({ x: st * Math.cos(phi), y: ct, z: st * Math.sin(phi), phi });
      }
    }

    let size = 0;
    let cx = 0;
    let cy = 0;
    let R = 0; // raio do anel (contorno)
    let Rs = 0; // raio da esfera de caracteres — menor que o anel
    let charPx = 0;
    let cellW = 0;
    let cellH = 0;
    let cols = 0;
    let rows = 0;
    let ox = 0;
    let oy = 0;
    let zbuf: Float32Array;
    let cbuf: Uint8Array; // índice na RAMP + 1 (0 = vazio)

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      size = Math.max(rect.width || 0, rect.height || 0, 300);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = size / 2;
      cy = size / 2;
      R = size * 0.44;
      Rs = R * 0.66; // caracteres ocupam área menor que o anel (margem estruturada)
      charPx = size * 0.026;
      cellW = charPx * 0.62;
      cellH = charPx * 1.02;
      cols = Math.ceil((2 * Rs) / cellW) + 2;
      rows = Math.ceil((2 * Rs) / cellH) + 2;
      ox = cx - Rs - cellW;
      oy = cy - Rs - cellH;
      zbuf = new Float32Array(cols * rows);
      cbuf = new Uint8Array(cols * rows);
      ctx.font = `${Math.round(charPx)}px ui-monospace, "SF Mono", Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };
    resize();

    let yaw = 0;
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
      const glow = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R * 1.1);
      glow.addColorStop(0, `rgba(124, 92, 255, ${0.12 + pulse * 0.06})`);
      glow.addColorStop(0.7, "rgba(124, 92, 255, 0.05)");
      glow.addColorStop(1, "rgba(124, 92, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // z-buffer da esfera ASCII
      zbuf.fill(-2);
      cbuf.fill(0);
      const cosA = Math.cos(yaw);
      const sinA = Math.sin(yaw);
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);

      for (const p of pts) {
        // yaw em Y
        const x1 = p.x * cosA + p.z * sinA;
        const z1 = -p.x * sinA + p.z * cosA;
        const y1 = p.y;
        // tilt em X
        const y2 = y1 * cosT - z1 * sinT;
        const z2 = y1 * sinT + z1 * cosT;
        if (z2 <= 0) continue; // hemisfério de trás
        const x2 = x1;

        const col = Math.round((cx + x2 * Rs - ox) / cellW);
        const row = Math.round((cy - y2 * Rs - oy) / cellH);
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
        const idx = row * cols + col;
        if (z2 <= zbuf[idx]) continue;

        // sombreamento 3D pela luz + faixas longitudinais (giram com a esfera)
        const shade = Math.max(0, x2 * LX + y2 * LY + z2 * LZ);
        const band = 0.5 + 0.5 * Math.sin(p.phi * 6);
        const intensity = shade * (0.5 + 0.5 * band);
        zbuf[idx] = z2;
        cbuf[idx] = 1 + Math.min(RAMP.length - 1, Math.floor(intensity * (RAMP.length - 1)));
      }

      // render
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const ci = cbuf[row * cols + col];
          if (ci === 0) continue;
          let ch = RAMP[ci - 1];
          if (ch === " ") continue;
          if (glitching && Math.random() < 0.06) {
            ch = RAMP[1 + Math.floor(Math.random() * (RAMP.length - 1))];
          }
          const a = 0.3 + (ci / RAMP.length) * 0.6;
          ctx.fillStyle = `rgba(150, 132, 255, ${a})`;
          ctx.fillText(ch, ox + col * cellW + gx, oy + row * cellH);
        }
      }

      // anel fino no contorno da esfera
      ctx.strokeStyle = `rgba(150, 122, 255, ${0.4 + pulse * 0.22})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx + gx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // núcleo luminoso (a "pupila" — dá o ar de olho observador)
      const prevOp = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "lighter";
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rs * 0.62);
      core.addColorStop(0, `rgba(214, 205, 255, ${0.46 + pulse * 0.16})`);
      core.addColorStop(0.25, "rgba(150, 122, 255, 0.32)");
      core.addColorStop(0.6, "rgba(124, 92, 255, 0.08)");
      core.addColorStop(1, "rgba(124, 92, 255, 0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, Rs * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = prevOp;

      // scanline de glitch (fatia ciano)
      if (glitching) {
        const sy = cy + (Math.random() - 0.5) * R * 1.6;
        ctx.strokeStyle = "rgba(77, 225, 255, 0.5)";
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(cx - R, sy);
        ctx.lineTo(cx + R, sy);
        ctx.stroke();
      }

      if (!reduced) {
        t += 1;
        yaw += YAW_SPEED;
        if (t > nextGlitch) {
          glitchUntil = t + 3 + Math.random() * 5;
          nextGlitch = t + 280 + Math.random() * 400;
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
