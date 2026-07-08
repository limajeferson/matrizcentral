# Hero Observador + Fundo Pixel Glow + Rodapé Escuro — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o fundo de ondas por um fundo de pequenos quadrados que brilham (apagado e lento), adicionar um círculo "IA observando" quase apagado no canto superior direito do hero que some ao rolar, e deixar o rodapé em Surface `#14101F`.

**Architecture:** Componentes client-side sob `.mcv2` (landing v2). Fundo e twinkle em Canvas 2D nativo; círculo em CSS (radial-gradients) com opacidade ligada ao scroll via framer-motion. Lógica pura (alpha do twinkle) extraída para helper testável. Zero dependências novas.

**Tech Stack:** Next.js 14.2, React 18, TypeScript, framer-motion 12, Canvas 2D nativo, CSS (`landing-v2.css`), vitest 4 (`node`).

## Global Constraints

- **Custo zero:** sem dependências npm novas, sem assets externos. Canvas 2D nativo + CSS + framer-motion (instalado).
- **Escopo CSS:** todo estilo novo/alterado sob `.mcv2` em `src/app/(marketing)/landing-v2.css`.
- **Acessibilidade:** `prefers-reduced-motion` desliga a animação do fundo (frame estático, sem RAF); decorativos com `aria-hidden`.
- **Cores:** violeta `#7c5cff`, azul `#466eff`, surface `#14101F`. Tudo apagado (dim).
- **Gate por task:** `npx tsc --noEmit` (exit 0) + `npm run test`. NÃO usar `npm run build` (falha pré-existente em `/api/checkout` por env do Stripe; não relacionada).

---

## File Structure

- Create `src/lib/pixel-twinkle.ts` + `src/lib/pixel-twinkle.test.ts` — alpha puro do brilho.
- Create `src/components/marketing/v2/PixelGridBackground.tsx` — fundo de quadrados.
- Create `src/components/marketing/v2/HeroObserver.tsx` — círculo do hero.
- Modify `src/app/(marketing)/page.tsx` — trocar `WaveCanvasBackground` por `PixelGridBackground`.
- Modify `src/components/marketing/v2/HeroV2.tsx` — montar `HeroObserver`.
- Modify `src/app/(marketing)/landing-v2.css` — `.mc-pixel-bg` (renomeia `.mc-wave-bg`), `.mc-observer`, rodapé escuro.
- Delete `src/components/marketing/v2/WaveCanvasBackground.tsx`, `src/lib/wave-field.ts`, `src/lib/wave-field.test.ts` (órfãos após a troca).

---

## Task 1: Helper puro do brilho (twinkle)

**Files:**
- Create: `src/lib/pixel-twinkle.ts`
- Test: `src/lib/pixel-twinkle.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `function twinkleAlpha(amp: number, speed: number, phase: number, time: number): number` — retorna `amp * (0.5 + 0.5*sin(time*speed + phase))`, limitado a `[0, amp]`.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/pixel-twinkle.test.ts
import { describe, expect, it } from "vitest";
import { twinkleAlpha } from "@/lib/pixel-twinkle";

describe("twinkleAlpha", () => {
  it("é amp/2 quando o seno é zero (time=0, phase=0)", () => {
    expect(twinkleAlpha(0.12, 1, 0, 0)).toBeCloseTo(0.06, 6);
  });

  it("atinge amp no pico do seno", () => {
    // phase = π/2, time = 0 => sin = 1
    expect(twinkleAlpha(0.12, 1, Math.PI / 2, 0)).toBeCloseTo(0.12, 6);
  });

  it("chega a zero no vale do seno", () => {
    // phase = -π/2, time = 0 => sin = -1
    expect(twinkleAlpha(0.12, 1, -Math.PI / 2, 0)).toBeCloseTo(0, 6);
  });

  it("fica sempre em [0, amp] para qualquer tempo", () => {
    for (let t = 0; t < 100; t += 0.7) {
      const v = twinkleAlpha(0.2, 0.5, 1.3, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(0.2 + 1e-9);
    }
  });

  it("amp zero resulta sempre em zero", () => {
    expect(twinkleAlpha(0, 1, 0, 3.3)).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- pixel-twinkle`
Expected: FAIL — "Failed to resolve import" / `twinkleAlpha is not a function`.

- [ ] **Step 3: Implementar o mínimo para passar**

```ts
// src/lib/pixel-twinkle.ts

/**
 * Brilho (alpha) de um quadradinho no instante `time`, oscilando lentamente
 * entre 0 e `amp`. `speed` controla a velocidade e `phase` o deslocamento
 * inicial (para os quadrados não piscarem em sincronia).
 */
export function twinkleAlpha(amp: number, speed: number, phase: number, time: number): number {
  const v = amp * (0.5 + 0.5 * Math.sin(time * speed + phase));
  return v < 0 ? 0 : v;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test -- pixel-twinkle`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pixel-twinkle.ts src/lib/pixel-twinkle.test.ts
git commit -m "feat: helper puro do brilho dos quadrados (twinkle)"
```

---

## Task 2: Fundo Pixel Glow (substitui as ondas)

**Files:**
- Create: `src/components/marketing/v2/PixelGridBackground.tsx`
- Modify: `src/app/(marketing)/page.tsx` (import linha 4 + uso linha 32)
- Modify: `src/app/(marketing)/landing-v2.css` (renomear `.mc-wave-bg` → `.mc-pixel-bg`)
- Delete: `src/components/marketing/v2/WaveCanvasBackground.tsx`, `src/lib/wave-field.ts`, `src/lib/wave-field.test.ts`

**Interfaces:**
- Consumes: `twinkleAlpha` de `@/lib/pixel-twinkle` (Task 1).
- Produces: `default export function PixelGridBackground(): JSX.Element` — `<canvas className="mc-pixel-bg">` fixo atrás do conteúdo.

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/marketing/v2/PixelGridBackground.tsx
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
```

- [ ] **Step 2: Trocar o fundo na página**

Em `src/app/(marketing)/page.tsx`:

Linha 4 — de:
```tsx
import WaveCanvasBackground from "@/components/marketing/v2/WaveCanvasBackground";
```
para:
```tsx
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
```

Linha 32 — de:
```tsx
      <WaveCanvasBackground />
```
para:
```tsx
      <PixelGridBackground />
```

- [ ] **Step 3: Renomear o seletor CSS do fundo**

Em `src/app/(marketing)/landing-v2.css`, no bloco "Rede ambiente" (perto do fim), trocar o seletor `.mc-wave-bg` por `.mc-pixel-bg`:

```css
/* ---- Fundo pixel glow (fundo único do site) ---- */
.mcv2 .mc-pixel-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
```

Também atualizar o comentário do `.mc-canvas` (perto da linha 32), trocando a menção "WaveCanvasBackground" por "PixelGridBackground":

```css
  /* Fundo transparente para o PixelGridBackground (fixo, z-index 0) aparecer
     atrás do conteúdo. */
```

- [ ] **Step 4: Remover os arquivos órfãos das ondas**

```bash
git rm src/components/marketing/v2/WaveCanvasBackground.tsx src/lib/wave-field.ts src/lib/wave-field.test.ts
```

- [ ] **Step 5: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0 (nenhuma referência pendente a `wave-field`/`WaveCanvasBackground`).

Run: `npm run test`
Expected: todos os testes passam (os 5 testes de `wave-field` somem; os 5 de `pixel-twinkle` entram).

Verificação visual (controlador, via app): o fundo agora são quadradinhos violeta/azul apagados que brilham devagar; nada de ondas.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/v2/PixelGridBackground.tsx "src/app/(marketing)/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: fundo pixel glow substitui ondas; remove wave orfao"
```

---

## Task 3: Círculo "IA Observando" no hero

**Files:**
- Create: `src/components/marketing/v2/HeroObserver.tsx`
- Modify: `src/components/marketing/v2/HeroV2.tsx` (import + montar como primeiro filho de `.mc-hero`)
- Modify: `src/app/(marketing)/landing-v2.css` (bloco `.mc-observer`, junto às regras `.mc-hero-*`)

**Interfaces:**
- Consumes: `motion`, `useScroll`, `useTransform` de `framer-motion`.
- Produces: `default export function HeroObserver(): JSX.Element` — `<motion.div className="mc-observer">` decorativo, com `opacity` ligada ao scroll.

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/marketing/v2/HeroObserver.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroObserver() {
  const { scrollY } = useScroll();
  // Quase apagado no topo (0.38) e some ao rolar ~600px ("desliga a observação").
  const opacity = useTransform(scrollY, [0, 600], [0.38, 0]);

  return <motion.div className="mc-observer" style={{ opacity }} aria-hidden="true" />;
}
```

- [ ] **Step 2: Montar no hero**

Em `src/components/marketing/v2/HeroV2.tsx`, adicionar o import após a linha `import { Reveal } from "./motion-primitives";`:

```tsx
import HeroObserver from "./HeroObserver";
```

E renderizar o círculo como **primeiro filho** de `<section className="mc-hero">` (antes do `<div className="mc-container mc-hero-content">`):

```tsx
    <section className="mc-hero">
      <HeroObserver />
      <div className="mc-container mc-hero-content">
```

- [ ] **Step 3: Adicionar o CSS do círculo**

Em `src/app/(marketing)/landing-v2.css`, logo após a regra `.mcv2 .mc-hero-demo { ... }` (perto da linha 274), adicionar:

```css
/* Círculo "IA observando" — anéis tênues (íris), quase apagado, canto sup. direito */
.mcv2 .mc-observer {
  position: absolute;
  top: -18%;
  right: -12%;
  width: clamp(560px, 62vw, 880px);
  aspect-ratio: 1 / 1;
  z-index: 0;
  pointer-events: none;
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 38%, rgba(124, 92, 255, 0.10) 39%, transparent 41%),
    radial-gradient(circle, transparent 52%, rgba(70, 110, 255, 0.08) 53%, transparent 55%),
    radial-gradient(circle, transparent 66%, rgba(124, 92, 255, 0.06) 67%, transparent 69%),
    radial-gradient(circle at 50% 50%, rgba(124, 92, 255, 0.14) 0%, rgba(91, 61, 245, 0.06) 30%, transparent 62%);
  filter: blur(1px);
}
.mcv2 .mc-hero-content { z-index: 1; }
@media (max-width: 700px) {
  .mcv2 .mc-observer { width: clamp(420px, 90vw, 560px); top: -12%; right: -22%; }
}
```

(A linha `.mc-hero-content { z-index: 1; }` garante que o texto do hero fique acima do círculo; `.mc-hero-content` já é `position: relative`.)

- [ ] **Step 4: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): um círculo grande e apagado (anéis tipo íris) aparece no canto superior direito do hero, ~63% visível (cortado no topo e à direita pelo `overflow: clip` do hero), atrás do texto; ao rolar para baixo ele some. Texto do hero permanece legível.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/HeroObserver.tsx src/components/marketing/v2/HeroV2.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: circulo IA observando no hero, some no scroll"
```

---

## Task 4: Rodapé escuro (Surface #14101F)

**Files:**
- Modify: `src/app/(marketing)/landing-v2.css` (bloco `.mc-footer`, ~linhas 690-728)

**Interfaces:**
- Consumes: tokens `--mc-white`, `--mc-gray`, `--mc-line`, `--mc-accent` (já definidos em `.mcv2`).
- Produces: nenhum export novo. `FooterV2.tsx` fica inalterado.

- [ ] **Step 1: Trocar as cores do rodapé para o tema escuro**

Em `src/app/(marketing)/landing-v2.css`, substituir os valores claros do rodapé:

`.mcv2 .mc-footer` (linhas ~690-695) — de:
```css
.mcv2 .mc-footer {
  background: #ffffff;
  color: #17131f;
  border-radius: var(--mc-radius) var(--mc-radius) 0 0;
  padding: 64px 0 32px;
}
```
para:
```css
.mcv2 .mc-footer {
  background: #14101F;
  color: var(--mc-white);
  border-radius: var(--mc-radius) var(--mc-radius) 0 0;
  padding: 64px 0 32px;
}
```

`.mcv2 .mc-footer .mc-logo` — de `color: #17131f;` para `color: var(--mc-white);`

`.mcv2 .mc-footer-desc` — trocar `color: #5c5666;` por `color: var(--mc-gray);`

`.mcv2 .mc-footer-nav a` — trocar `color: #17131f;` por `color: var(--mc-white);` (o hover `:hover { color: var(--mc-accent-deep); }` vira `color: var(--mc-accent);` para contraste no escuro)

`.mcv2 .mc-footer-bottom` — trocar `border-top: 1px solid #e8e5ee;` por `border-top: 1px solid var(--mc-line);` e `color: #5c5666;` por `color: var(--mc-gray);`

Resultado final do bloco (para referência exata):
```css
.mcv2 .mc-footer {
  background: #14101F;
  color: var(--mc-white);
  border-radius: var(--mc-radius) var(--mc-radius) 0 0;
  padding: 64px 0 32px;
}
.mcv2 .mc-footer .mc-logo { color: var(--mc-white); }
.mcv2 .mc-footer-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: start;
}
.mcv2 .mc-footer-desc {
  margin-top: 16px;
  max-width: 380px;
  color: var(--mc-gray);
}
.mcv2 .mc-footer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mcv2 .mc-footer-nav a {
  text-decoration: none;
  color: var(--mc-white);
  font-weight: 500;
}
.mcv2 .mc-footer-nav a:hover { color: var(--mc-accent); }
.mcv2 .mc-footer-bottom {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--mc-line);
  color: var(--mc-gray);
}
```

- [ ] **Step 2: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): o rodapé agora é escuro (`#14101F`) com logo/links em branco, descrição e "© ..." em cinza, e linha divisória sutil.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/landing-v2.css"
git commit -m "feat: rodape em surface escuro (#14101F)"
```

---

## Self-Review

**1. Cobertura do spec:**
- Frente 1 (rodapé `#14101F`) → Task 4. ✅
- Frente 2 (fundo pixel glow + remoção das ondas) → Tasks 1 (helper) + 2. ✅
- Frente 3 (círculo IA observando, ~63% canto sup. direito, some no scroll) → Task 3. ✅
- Custo zero / reduced-motion / escopo `.mcv2` → nas Global Constraints e em cada task. ✅

**2. Placeholders:** nenhum — todo passo traz código completo e comandos com saída esperada.

**3. Consistência de tipos:** `twinkleAlpha(amp, speed, phase, time)` (Task 1) é consumido com a mesma assinatura na Task 2. `.mc-pixel-bg` criado na Task 2 e usado pelo componente da Task 2. `.mc-observer` (Task 3) casa com a classe do `HeroObserver`. Nenhuma referência a `wave-field`/`WaveCanvasBackground` sobra após a Task 2 (removidos + `tsc` verifica).

**Ordem de dependências:** 1 → 2 (helper antes do fundo). 3 e 4 independentes. Tasks 2, 3 e 4 tocam `landing-v2.css` em blocos distintos (fundo/hero/rodapé) — sem colisão.
