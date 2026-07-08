# Landing — Animações Visuais (Frentes A–D) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar 4 tratamentos visuais na landing da Matriz Central: fundo em ondas (canvas), logo com scramble aprimorado, cards de "O SISTEMA" em linha com destaque no hover, e blocos de produto de "UM ÚNICO PAGAMENTO" como banners ultrawide empilhados com animação em loop.

**Architecture:** Componentes React client-side sob o escopo CSS `.mcv2` (landing v2). Toda animação é feita com Canvas 2D nativo ou CSS/framer-motion já presentes — zero dependências novas, zero assets externos (custo zero). A lógica pura de geometria (ondas) e de scramble é extraída para `src/lib` com testes vitest (ambiente `node`); a composição visual é verificada rodando o app.

**Tech Stack:** Next.js 14.2 (App Router), React 18, TypeScript, framer-motion 12 (já instalado), Canvas 2D nativo, CSS puro (`landing-v2.css`), vitest 4 (ambiente `node`).

## Global Constraints

- **Custo zero:** proibido adicionar dependências npm pagas ou assets externos (vídeo/imagem/fonte). Usar apenas Canvas 2D nativo, CSS e libs já em `package.json`. Imagens Unsplash já usadas em `SystemSection` podem permanecer.
- **Escopo CSS:** todo estilo novo deve ficar sob o seletor `.mcv2` em `src/app/(marketing)/landing-v2.css` para não vazar para `/oferta` (`.lp-guide`) nem `/checkout`.
- **Acessibilidade:** todo movimento deve respeitar `prefers-reduced-motion` (via `useReducedMotion()` do framer-motion nos componentes, `window.matchMedia("(prefers-reduced-motion: reduce)")` no canvas, ou `@media (prefers-reduced-motion: reduce)` no CSS). Com movimento reduzido, mostrar o estado final estático.
- **Idioma:** toda copy visível permanece em português do Brasil, textos existentes inalterados.
- **Ambiente de teste:** vitest roda em `environment: "node"` — sem jsdom/testing-library. Testes automatizados cobrem apenas helpers puros em `src/lib`. Componentes são verificados rodando o app (`npm run dev` + inspeção visual).
- **Tokens de cor existentes (`.mcv2`):** `--mc-bg:#0a0812`, `--mc-surface:#14101f`, `--mc-accent:#7c5cff`, `--mc-accent-deep:#5b3df5`, `--mc-white:#fff`, `--mc-gray:#a49fb8`, `--mc-line:rgba(255,255,255,0.12)`, `--mc-radius:24px`.

---

## File Structure

- **Frente A — Fundo em ondas:**
  - Create `src/lib/wave-field.ts` — geometria pura de ondas senoidais (`waveY`, `WaveLayer`).
  - Create `src/lib/wave-field.test.ts` — testes de `waveY`.
  - Create `src/components/marketing/v2/WaveCanvasBackground.tsx` — canvas de fundo animado.
  - Modify `src/app/(marketing)/page.tsx` — trocar `AmbientNetwork` por `WaveCanvasBackground`.
  - Modify `src/app/(marketing)/landing-v2.css` — classe `.mc-wave-bg`.
- **Frente B — Logo scramble:**
  - Create `src/lib/scramble.ts` — resolução pura de frame de scramble (`resolveScramble`, `totalScrambleFrames`, `SCRAMBLE_GLYPHS`, `ScrambleChar`).
  - Create `src/lib/scramble.test.ts` — testes.
  - Modify `src/components/marketing/v2/ScrambleText.tsx` — consumir helper + destacar chars em ciclo.
  - Modify `src/app/(marketing)/landing-v2.css` — classe `.mc-scramble-live`.
- **Frente C — O Sistema em linha:**
  - Modify `src/components/marketing/v2/SystemSection.tsx` — grid em linha + hover destaque.
  - Modify `src/app/(marketing)/landing-v2.css` — `.mc-system-row` substitui `.mc-system-stack`.
- **Frente D — Banners ultrawide:**
  - Create `src/components/marketing/v2/ProductBanner.tsx` — card ultrawide com loop.
  - Modify `src/components/marketing/v2/PricingV2.tsx` — renderizar 4 `ProductBanner`.
  - Modify `src/app/(marketing)/landing-v2.css` — `.mc-product-banners` + `.mc-product-banner`.

---

## Task 1: Frente A — Geometria de ondas (helper puro)

**Files:**
- Create: `src/lib/wave-field.ts`
- Test: `src/lib/wave-field.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `interface WaveLayer { amplitude: number; wavelength: number; speed: number; phase: number; yOffset: number; }`
  - `function waveY(layer: WaveLayer, x: number, time: number, height: number): number` — retorna a posição vertical (px) da onda em `x` no instante `time`, com a linha base em `yOffset * height`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/wave-field.test.ts
import { describe, expect, it } from "vitest";
import { waveY, type WaveLayer } from "@/lib/wave-field";

const base: WaveLayer = {
  amplitude: 20,
  wavelength: 100,
  speed: 1,
  phase: 0,
  yOffset: 0.5,
};

describe("waveY", () => {
  it("retorna a linha base quando o seno é zero (x=0, time=0, phase=0)", () => {
    expect(waveY(base, 0, 0, 1000)).toBeCloseTo(500, 5);
  });

  it("soma a amplitude no pico (quarto de comprimento de onda)", () => {
    // x = wavelength/4 => argumento = π/2 => sin = 1 => base + amplitude
    expect(waveY(base, 25, 0, 1000)).toBeCloseTo(520, 5);
  });

  it("subtrai a amplitude no vale (três quartos)", () => {
    // x = 3*wavelength/4 => argumento = 3π/2 => sin = -1
    expect(waveY(base, 75, 0, 1000)).toBeCloseTo(480, 5);
  });

  it("é limitada entre base±amplitude para qualquer x e time", () => {
    for (let x = 0; x < 500; x += 7) {
      for (let t = 0; t < 50; t += 3) {
        const y = waveY(base, x, t, 1000);
        expect(y).toBeGreaterThanOrEqual(480 - 1e-9);
        expect(y).toBeLessThanOrEqual(520 + 1e-9);
      }
    }
  });

  it("desloca a fase pelo tempo * speed", () => {
    const fast: WaveLayer = { ...base, speed: Math.PI / 2 };
    // time=1 => argumento em x=0 = π/2 => sin=1 => 520
    expect(waveY(fast, 0, 1, 1000)).toBeCloseTo(520, 5);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- wave-field`
Expected: FAIL — "Failed to resolve import" / `waveY is not a function`.

- [ ] **Step 3: Implementar o mínimo para passar**

```ts
// src/lib/wave-field.ts

/** Uma camada senoidal do fundo de ondas. */
export interface WaveLayer {
  /** Altura do pico em px. */
  amplitude: number;
  /** Comprimento de onda em px (distância entre picos). */
  wavelength: number;
  /** Fator de avanço da fase por unidade de tempo. */
  speed: number;
  /** Deslocamento de fase inicial em radianos. */
  phase: number;
  /** Linha base como fração da altura (0 = topo, 1 = base). */
  yOffset: number;
}

/**
 * Posição vertical (px) da camada `layer` na coluna `x`, no instante `time`.
 * A linha base fica em `yOffset * height`; o seno oscila ±`amplitude` ao redor dela.
 */
export function waveY(
  layer: WaveLayer,
  x: number,
  time: number,
  height: number,
): number {
  const k = (Math.PI * 2) / layer.wavelength;
  const offset = Math.sin(x * k + time * layer.speed + layer.phase) * layer.amplitude;
  return layer.yOffset * height + offset;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test -- wave-field`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/wave-field.ts src/lib/wave-field.test.ts
git commit -m "feat: geometria pura de ondas senoidais para o fundo animado"
```

---

## Task 2: Frente A — Componente WaveCanvasBackground + wiring

**Files:**
- Create: `src/components/marketing/v2/WaveCanvasBackground.tsx`
- Modify: `src/app/(marketing)/page.tsx` (linhas 4 e 31)
- Modify: `src/app/(marketing)/landing-v2.css` (bloco final, ~linha 696-707)

**Interfaces:**
- Consumes: `waveY`, `WaveLayer` de `@/lib/wave-field` (Task 1).
- Produces: `default export function WaveCanvasBackground(): JSX.Element` — `<canvas className="mc-wave-bg">` fixo atrás do conteúdo.

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/marketing/v2/WaveCanvasBackground.tsx
"use client";

import { useEffect, useRef } from "react";
import { waveY, type WaveLayer } from "@/lib/wave-field";

interface ColoredLayer extends WaveLayer {
  /** Cor do topo do preenchimento (some para transparente na base). */
  color: string;
}

// Deep blues + violetas sobre o fundo escuro — casa com os tokens da .mcv2.
const LAYERS: ColoredLayer[] = [
  { amplitude: 72, wavelength: 720, speed: 0.35, phase: 0.0, yOffset: 0.55, color: "rgba(91, 61, 245, 0.26)" },
  { amplitude: 56, wavelength: 540, speed: 0.5, phase: 1.6, yOffset: 0.68, color: "rgba(124, 92, 255, 0.20)" },
  { amplitude: 40, wavelength: 400, speed: 0.68, phase: 3.1, yOffset: 0.8, color: "rgba(70, 110, 255, 0.15)" },
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

        const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
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
```

- [ ] **Step 2: Trocar o fundo na página**

Em `src/app/(marketing)/page.tsx`, trocar o import (linha 4) e o uso (linha 31).

Linha 4 — de:
```tsx
import AmbientNetwork from "@/components/marketing/v2/AmbientNetwork";
```
para:
```tsx
import WaveCanvasBackground from "@/components/marketing/v2/WaveCanvasBackground";
```

Linha 31 — de:
```tsx
      <AmbientNetwork />
```
para:
```tsx
      <WaveCanvasBackground />
```

- [ ] **Step 3: Adicionar o CSS do fundo**

Em `src/app/(marketing)/landing-v2.css`, no bloco final "Rede ambiente", adicionar a classe `.mc-wave-bg` ao lado da `.mc-ambient-network` (mantendo a antiga, pois `AmbientNetwork.tsx` segue existindo para outras páginas). Substituir o bloco atual (linhas ~696-707):

```css
/* ---- Rede ambiente (fundo único do site) ---- */
.mcv2 .mc-ambient-network,
.mcv2 .mc-wave-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.mcv2 .mc-canvas,
.mcv2 .mc-footer {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 4: Verificar build + visual**

Run: `npm run build`
Expected: build conclui sem erros de TypeScript/ESLint.

Depois `npm run dev` e abrir `http://localhost:3000` — confirmar ondas violeta/azul animando atrás do conteúdo, conteúdo legível por cima, e que com `prefers-reduced-motion` o fundo fica estático (sem travar). Verificação visual via app (skill `run`/`verify`).

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/WaveCanvasBackground.tsx "src/app/(marketing)/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: fundo da landing em ondas canvas animadas (frente A)"
```

---

## Task 3: Frente B — Resolução de scramble (helper puro)

**Files:**
- Create: `src/lib/scramble.ts`
- Test: `src/lib/scramble.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `const SCRAMBLE_GLYPHS: string`
  - `interface ScrambleChar { char: string; settled: boolean; }`
  - `function resolveScramble(target: string, frame: number, framesPerChar: number, glyphAt: (index: number) => string): ScrambleChar[]`
  - `function totalScrambleFrames(target: string, framesPerChar: number): number`

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/scramble.test.ts
import { describe, expect, it } from "vitest";
import { resolveScramble, totalScrambleFrames } from "@/lib/scramble";

const HASH = () => "#";

describe("resolveScramble", () => {
  it("no frame 0 tudo (exceto espaço e barra) está em ciclo", () => {
    const out = resolveScramble("AB/C", 0, 3, HASH);
    expect(out.map((c) => c.char)).toEqual(["#", "#", "/", "#"]);
    expect(out.map((c) => c.settled)).toEqual([false, false, true, false]);
  });

  it("resolve da esquerda para a direita conforme os frames avançam", () => {
    // framesPerChar=3 => após 3 frames o 1º char assenta
    const out = resolveScramble("AB", 3, 3, HASH);
    expect(out[0]).toEqual({ char: "A", settled: true });
    expect(out[1]).toEqual({ char: "#", settled: false });
  });

  it("espaço e barra ficam sempre assentados no valor final", () => {
    const out = resolveScramble("A B/C", 0, 3, HASH);
    expect(out[1]).toEqual({ char: " ", settled: true });
    expect(out[3]).toEqual({ char: "/", settled: true });
  });

  it("com frames suficientes tudo assenta no alvo", () => {
    const out = resolveScramble("Matriz", 999, 3, HASH);
    expect(out.map((c) => c.char).join("")).toBe("Matriz");
    expect(out.every((c) => c.settled)).toBe(true);
  });
});

describe("totalScrambleFrames", () => {
  it("é comprimento * framesPerChar", () => {
    expect(totalScrambleFrames("Matriz/Central", 3)).toBe(14 * 3);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- scramble`
Expected: FAIL — import não resolve.

- [ ] **Step 3: Implementar o mínimo para passar**

```ts
// src/lib/scramble.ts

export const SCRAMBLE_GLYPHS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz0123456789";

export interface ScrambleChar {
  char: string;
  /** true quando o caractere já assentou no valor final. */
  settled: boolean;
}

/**
 * Estado dos caracteres de `target` após `frame` frames de scramble.
 * Resolve da esquerda para a direita: cada `framesPerChar` frames assenta mais
 * um caractere. Espaços e "/" permanecem sempre no valor final. Os caracteres
 * ainda em ciclo recebem um glifo aleatório fornecido por `glyphAt(index)`.
 */
export function resolveScramble(
  target: string,
  frame: number,
  framesPerChar: number,
  glyphAt: (index: number) => string,
): ScrambleChar[] {
  const resolvedCount = Math.floor(frame / framesPerChar);
  return target.split("").map((char, index) => {
    if (char === " " || char === "/") return { char, settled: true };
    if (index < resolvedCount) return { char, settled: true };
    return { char: glyphAt(index), settled: false };
  });
}

/** Total de frames até todos os caracteres assentarem. */
export function totalScrambleFrames(target: string, framesPerChar: number): number {
  return target.length * framesPerChar;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test -- scramble`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scramble.ts src/lib/scramble.test.ts
git commit -m "feat: helper puro de resolucao de scramble de texto"
```

---

## Task 4: Frente B — ScrambleText aprimorado (por-caractere + destaque)

**Files:**
- Modify: `src/components/marketing/v2/ScrambleText.tsx` (reescrita completa)
- Modify: `src/app/(marketing)/landing-v2.css` (adicionar `.mc-scramble-live` perto da `.mc-logo`, ~linha 175)

**Interfaces:**
- Consumes: `resolveScramble`, `totalScrambleFrames`, `SCRAMBLE_GLYPHS`, `ScrambleChar` de `@/lib/scramble` (Task 3).
- Produces: `default export function ScrambleText({ text, className }: { text: string; className?: string }): JSX.Element` — mesma assinatura pública de hoje (usado por `LandingHeader.tsx` linha 22), então nenhum consumidor muda.

- [ ] **Step 1: Reescrever o componente**

```tsx
// src/components/marketing/v2/ScrambleText.tsx
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
```

- [ ] **Step 2: Adicionar o realce dos caracteres em ciclo**

Em `src/app/(marketing)/landing-v2.css`, logo após a linha `.mcv2 .mc-logo { font-size: 1.1rem; letter-spacing: 0; }` (linha 175), adicionar:

```css
.mcv2 .mc-scramble-live { color: var(--mc-accent); opacity: 0.85; }
```

- [ ] **Step 3: Verificar build + visual**

Run: `npm run build`
Expected: build OK.

`npm run dev` e recarregar a home: a logo "Matriz/Central" no header deve embaralhar caractere-a-caractere no carregamento (glifos aleatórios em violeta) e assentar da esquerda para a direita no texto final em branco. Com `prefers-reduced-motion`, aparece direto estática. Verificar via app.

- [ ] **Step 4: Rodar a suíte completa (garantir que nada quebrou)**

Run: `npm run test`
Expected: PASS em todos os arquivos.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/ScrambleText.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: logo com scramble por-caractere e realce em cor de destaque (frente B)"
```

---

## Task 5: Frente C — "O Sistema" em linha com destaque no hover

**Files:**
- Modify: `src/components/marketing/v2/SystemSection.tsx` (trocar o layout em stack por grid em linha)
- Modify: `src/app/(marketing)/landing-v2.css` (substituir o bloco "Sistema (stack sobreposto)", linhas ~384-440)

**Interfaces:**
- Consumes: `Reveal` de `./motion-primitives`, `motion`/`useReducedMotion` de framer-motion (já usados).
- Produces: nenhum export novo (mesmo `default export function SystemSection`). Remove as constantes `OFFSET_X`, `OFFSET_Y`, `ROTATION`.

- [ ] **Step 1: Reescrever o componente para grid em linha**

```tsx
// src/components/marketing/v2/SystemSection.tsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";

const ITEMS = [
  {
    benefit: "Aprenda no seu ritmo",
    feature: "Ebook Técnico",
    description:
      "9 capítulos organizados para levar você do primeiro modelo até uma utilização prática da IA local, mesmo sem experiência prévia.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Receba uma orientação personalizada",
    feature: "Diagnóstico Inicial",
    description:
      "O sistema identifica seu contexto de uso e recomenda a trilha mais adequada para começar.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
  {
    benefit: "Acompanhe sua evolução",
    feature: "Roadmap Inteligente",
    description:
      "Cada etapa concluída desbloqueia a próxima, permitindo acompanhar claramente sua evolução.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Comprove seu conhecimento",
    feature: "Certificação Verificável",
    description:
      "Após concluir sua trilha e validação, gere um certificado com autenticação pública.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
];

export default function SystemSection() {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="mc-section" id="sistema">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">O sistema</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-system-heading">
            Um sistema,
            <br />
            não um ebook solto
          </h2>
        </Reveal>

        <div className="mc-system-row">
          {ITEMS.map((item, index) => {
            const isFocused = focusIndex === index;
            const isDimmed = focusIndex !== null && !isFocused;

            return (
              <motion.div
                key={item.feature}
                className={`mc-system-card${item.accent ? " is-accent" : ""}`}
                animate={{
                  scale: reduced ? 1 : isFocused ? 1.04 : isDimmed ? 0.97 : 1,
                  opacity: isDimmed ? 0.5 : 1,
                  y: reduced ? 0 : isFocused ? -8 : 0,
                }}
                whileHover={reduced ? undefined : { scale: 1.04, y: -8 }}
                onHoverStart={() => setFocusIndex(index)}
                onHoverEnd={() => setFocusIndex(null)}
                onFocus={() => setFocusIndex(index)}
                onBlur={() => setFocusIndex(null)}
                tabIndex={0}
                transition={{ duration: reduced ? 0 : 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <div className="mc-system-image-wrap">
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className="mc-system-image"
                    loading="lazy"
                  />
                </div>
                <div className="mc-system-card-body">
                  <span className="mc-tag">{item.benefit}</span>
                  <h3 className="mc-display">{item.feature}</h3>
                  <p>{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Substituir o CSS do "Sistema"**

Em `src/app/(marketing)/landing-v2.css`, substituir todo o bloco `/* ---- Sistema (stack sobreposto) ---- */` (linhas ~384-440, da `.mc-system-heading` até o fechamento do `@media (max-width: 800px)` do sistema) por:

```css
/* ---- Sistema (cards em linha, destaque no hover) ---- */
.mcv2 .mc-system-heading { margin-top: 20px; }
.mcv2 .mc-system-row {
  margin-top: 64px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  align-items: stretch;
}
.mcv2 .mc-system-card {
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  overflow: clip;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.6);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.mcv2 .mc-system-card:hover,
.mcv2 .mc-system-card:focus-visible {
  box-shadow: 0 26px 60px -22px rgba(124, 92, 255, 0.5);
  border-color: rgba(124, 92, 255, 0.5);
  outline: none;
}
.mcv2 .mc-system-card.is-accent { background: var(--mc-accent-deep); border-color: transparent; }
.mcv2 .mc-system-image-wrap { aspect-ratio: 16 / 11; overflow: clip; }
.mcv2 .mc-system-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) brightness(0.85);
}
.mcv2 .mc-system-card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mcv2 .mc-system-card-body h3 { font-size: 1.35rem; }
.mcv2 .mc-system-card.is-accent .mc-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.mcv2 .mc-system-card p { color: var(--mc-gray); font-size: 0.95rem; }
.mcv2 .mc-system-card.is-accent p { color: rgba(255, 255, 255, 0.85); }

@media (max-width: 1000px) {
  .mcv2 .mc-system-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .mcv2 .mc-system-row { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verificar build + visual**

Run: `npm run build`
Expected: build OK (sem referências pendentes a `.mc-system-stack`).

`npm run dev`: na seção "O SISTEMA" os 4 cards aparecem lado a lado numa linha; ao passar o mouse sobre um, ele cresce levemente, sobe e ganha brilho violeta, e os demais escurecem. Em telas médias vira 2 colunas; no mobile, 1 coluna. Verificar via app.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/SystemSection.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: O Sistema com cards em linha e destaque no hover (frente C)"
```

---

## Task 6: Frente D — Componente ProductBanner (ultrawide com loop)

**Files:**
- Create: `src/components/marketing/v2/ProductBanner.tsx`
- Modify: `src/app/(marketing)/landing-v2.css` (adicionar bloco de banners após o `.mc-price-item` styles, ~linha 516; e remover a regra `.mc-price-included` já substituída na Task 7)

**Interfaces:**
- Consumes: `motion`/`useReducedMotion` de framer-motion.
- Produces:
  - `interface ProductBannerProps { icon: string; label: string; description: string; index: number; }`
  - `default export function ProductBanner(props: ProductBannerProps): JSX.Element`

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/marketing/v2/ProductBanner.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface ProductBannerProps {
  icon: string;
  label: string;
  description: string;
  index: number;
}

export default function ProductBanner({ icon, label, description, index }: ProductBannerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      className="mc-product-banner"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="mc-product-banner-aurora" aria-hidden="true" />
      <div className="mc-product-banner-grid" aria-hidden="true" />
      <div className="mc-product-banner-content">
        <span className="mc-product-banner-icon" aria-hidden="true">
          {icon}
        </span>
        <div className="mc-product-banner-text">
          <h3 className="mc-display">{label}</h3>
          <p>{description}</p>
        </div>
        <span className="mc-product-banner-index mc-mono">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.article>
  );
}
```

- [ ] **Step 2: Adicionar o CSS dos banners**

Em `src/app/(marketing)/landing-v2.css`, logo após a linha `.mcv2 .mc-price-item p { color: var(--mc-gray); font-size: 0.95rem; }` (linha 516), adicionar:

```css
/* ---- Produtos incluídos (banners ultrawide com loop) ---- */
.mcv2 .mc-product-banners {
  margin-top: 56px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mcv2 .mc-product-banner {
  position: relative;
  overflow: clip;
  border-radius: var(--mc-radius);
  border: 1px solid var(--mc-line);
  background: var(--mc-surface);
  min-height: 132px;
  display: flex;
  isolation: isolate;
}
.mcv2 .mc-product-banner-aurora {
  position: absolute;
  inset: -50%;
  z-index: 0;
  background:
    radial-gradient(40% 60% at 20% 50%, rgba(124, 92, 255, 0.55), transparent 70%),
    radial-gradient(35% 55% at 55% 40%, rgba(91, 61, 245, 0.45), transparent 70%),
    radial-gradient(30% 50% at 85% 60%, rgba(70, 110, 255, 0.4), transparent 70%);
  filter: blur(14px);
  animation: mc-aurora 14s ease-in-out infinite;
}
@keyframes mc-aurora {
  0%, 100% { transform: translate3d(-6%, -4%, 0) scale(1.05); }
  50% { transform: translate3d(6%, 4%, 0) scale(1.15); }
}
.mcv2 .mc-product-banner-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.15;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 32px 32px;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 40%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 40%, transparent);
  animation: mc-grid-drift 18s linear infinite;
}
@keyframes mc-grid-drift {
  from { background-position: 0 0; }
  to { background-position: 64px 0; }
}
.mcv2 .mc-product-banner-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 32px;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(10, 8, 18, 0.92) 0%,
    rgba(10, 8, 18, 0.72) 45%,
    rgba(10, 8, 18, 0.1) 100%
  );
}
.mcv2 .mc-product-banner-icon { font-size: 2rem; line-height: 1; }
.mcv2 .mc-product-banner-text h3 { font-size: clamp(1.25rem, 2.4vw, 1.9rem); }
.mcv2 .mc-product-banner-text p {
  color: var(--mc-gray);
  margin-top: 6px;
  max-width: 520px;
  font-size: 0.98rem;
}
.mcv2 .mc-product-banner-index {
  margin-left: auto;
  align-self: flex-start;
  color: var(--mc-accent);
  font-size: 0.85rem;
}
@media (prefers-reduced-motion: reduce) {
  .mcv2 .mc-product-banner-aurora,
  .mcv2 .mc-product-banner-grid { animation: none; }
}
@media (max-width: 600px) {
  .mcv2 .mc-product-banner-content { padding: 22px; gap: 16px; flex-wrap: wrap; }
  .mcv2 .mc-product-banner-index { display: none; }
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: build OK. (O componente ainda não é renderizado — vira visível na Task 7. Este passo só garante que CSS/TSX compilam.)

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/ProductBanner.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: componente ProductBanner ultrawide com aurora e grid em loop (frente D)"
```

---

## Task 7: Frente D — Ligar os banners no PricingV2

**Files:**
- Modify: `src/components/marketing/v2/PricingV2.tsx` (bloco `.mc-price-included`, linhas 42-54)
- Modify: `src/app/(marketing)/landing-v2.css` (remover a regra `.mc-price-included` e sua media-query, linhas 503-508 e 535)

**Interfaces:**
- Consumes: `ProductBanner`, `ProductBannerProps` de `./ProductBanner` (Task 6).
- Produces: nenhum export novo.

- [ ] **Step 1: Importar e renderizar os banners**

Em `src/components/marketing/v2/PricingV2.tsx`, adicionar o import no topo (após a linha 4 `import { AnimatedCounter, Reveal } ...`):

```tsx
import ProductBanner from "./ProductBanner";
```

Substituir o bloco atual (linhas 42-54):

```tsx
        <Reveal delay={0.3}>
          <div className="mc-price-included">
            {INCLUDED.map((item) => (
              <div className="mc-price-item" key={item.label}>
                <span className="mc-price-item-icon" aria-hidden="true">{item.icon}</span>
                <div>
                  <h3 className="mc-display">{item.label}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
```

por:

```tsx
        <Reveal delay={0.3}>
          <div className="mc-product-banners">
            {INCLUDED.map((item, index) => (
              <ProductBanner
                key={item.label}
                icon={item.icon}
                label={item.label}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </Reveal>
```

- [ ] **Step 2: Remover o CSS obsoleto do grid antigo**

Em `src/app/(marketing)/landing-v2.css`, remover a regra `.mc-price-included` (linhas 503-508):

```css
.mcv2 .mc-price-included {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
```

E, na media-query `@media (max-width: 800px)` do preço (linha ~535), remover apenas a linha:

```css
  .mcv2 .mc-price-included { grid-template-columns: 1fr; }
```

mantendo a linha `.mcv2 .mc-price-compare { gap: 20px; }` intacta. As regras `.mc-price-item*` podem permanecer (não usadas, mas inofensivas) ou serem removidas — remover é preferível para higiene.

- [ ] **Step 3: Verificar build + visual**

Run: `npm run build`
Expected: build OK.

`npm run dev`: na seção "UM ÚNICO PAGAMENTO", abaixo dos badges (`✓ Pagamento único ...`), os 4 produtos aparecem como banners ultrawide empilhados verticalmente, cada um ocupando a largura toda, com aurora violeta/azul e grade se movendo em loop atrás do texto (texto legível pelo gradiente escuro na esquerda). Cada banner entra com fade/slide ao rolar. Verificar via app; conferir também que `/oferta` e `/checkout` seguem inalterados.

- [ ] **Step 4: Rodar a suíte completa + build final**

Run: `npm run test && npm run build`
Expected: todos os testes PASS e build sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/PricingV2.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: produtos de UM UNICO PAGAMENTO como banners ultrawide em loop (frente D)"
```

---

## Self-Review

**1. Cobertura do pedido:**
- "O SISTEMA — 4 cards em linha, destaque no hover" → Task 5. ✅
- "UM ÚNICO PAGAMENTO — 4 produtos em cards ultrawide empilhados com animação em loop" → Tasks 6 + 7. ✅
- "Logo do topo com efeito animado (referência scramble)" → Tasks 3 + 4. ✅
- "Background do site com animação de ondas canvas" → Tasks 1 + 2. ✅

**2. Placeholders:** nenhum "TBD"/"handle edge cases" — todo passo traz código completo e comandos com saída esperada.

**3. Consistência de tipos:** `WaveLayer`/`waveY` (Task 1) consumidos com os mesmos nomes na Task 2 (`ColoredLayer extends WaveLayer`). `resolveScramble`/`totalScrambleFrames`/`SCRAMBLE_GLYPHS`/`ScrambleChar` (Task 3) consumidos com os mesmos nomes na Task 4. `ProductBannerProps { icon, label, description, index }` (Task 6) — os quatro campos batem com o uso na Task 7. Classe `.mc-product-banners` criada na Task 6 e referenciada na Task 7. Assinatura pública de `ScrambleText` preservada (Task 4), sem quebrar `LandingHeader`.

**Ordem de dependências:** 1→2 (geometria antes do canvas), 3→4 (scramble antes do componente), 5 independente, 6→7 (banner antes de ligar). Todas as frentes independentes entre si — podem ser executadas em qualquer ordem relativa, respeitando os pares internos.
