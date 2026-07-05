# Tratamentos Visuais Inspirados (Frente D) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar 6 tratamentos visuais reimplementados do zero (inspirados em referências do 21st.dev, recoloridos para a identidade violeta/escura): botões com relevo tátil, fundo de estrelas em `/oferta`, blobs no checkout, uma rede de nós ambiente lenta substituindo os motifs pontuais, cards da seção "O Sistema" em stack sobreposto, e logo com efeito de scramble.

**Architecture:** Cada tratamento é um componente novo e isolado (canvas, CSS puro ou framer-motion) integrado em pontos específicos já mapeados na spec — nenhuma reescrita de componentes existentes além do necessário para plugar o novo elemento. `/oferta` ganha só uma camada de fundo (Header/Footer/OfferPricing/landing-clone.css continuam intocados); as páginas de checkout (hoje sem identidade) são redesenhadas por completo.

**Tech Stack:** Next.js 14, React 18, framer-motion (já instalado), Canvas API nativo, CSS puro. Nenhuma dependência nova.

## Global Constraints

- Nenhuma dependência nova.
- `/oferta`: `Header.tsx`, `Footer.tsx`, `OfferPricing.tsx`, `landing-clone.css` NÃO são editados — D2 só adiciona uma camada de fundo atrás do conteúdo.
- Conteúdo funcional das páginas de checkout não muda (mensagens de sucesso/cancelamento, link de volta) — só a apresentação.
- Toda animação nova respeita `prefers-reduced-motion` com um fallback estático coerente.
- Paleta: `--mc-bg: #0a0812`, `--mc-surface: #14101f`, `--mc-accent: #7c5cff`, `--mc-accent-deep: #5b3df5`, `--mc-white: #ffffff`, `--mc-gray: #a49fb8`.
- `npm run build` e `npm run test` passam ao final de cada task.
- Commits em pt-BR, trailers:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` e
  `Claude-Session: https://claude.ai/code/session_012bbzHLj2xcGJHZY89EPJDp`.

---

### Task D1: Botões skeuomórficos escuros

**Files:**
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Nenhuma interface nova — só CSS sobre as classes existentes `.mc-btn`, `.mc-btn-accent`, `.mc-btn-ghost` (usadas em `HeroV2.tsx`, `PricingV2.tsx`, `ClosingSection.tsx`, `FixedCta.tsx` — nenhum desses arquivos muda).

- [ ] **Step 1: Substituir o bloco `/* Botão chanfrado — assinatura da identidade */` em `landing-v2.css`**

```css
/* Botão chanfrado — assinatura da identidade, com relevo tátil (skeuomorphism escuro) */
.mcv2 .mc-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 28px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  clip-path: polygon(
    0 0,
    calc(100% - var(--mc-notch)) 0,
    100% var(--mc-notch),
    100% 100%,
    var(--mc-notch) 100%,
    0 calc(100% - var(--mc-notch))
  );
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.mcv2 .mc-btn:hover { transform: translate(2px, -2px); }
.mcv2 .mc-btn:active { transform: translate(0, 1px); }

.mcv2 .mc-btn-accent {
  background: var(--mc-accent);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -3px 6px rgba(0, 0, 0, 0.25),
    0 6px 14px -4px rgba(124, 92, 255, 0.55);
}
.mcv2 .mc-btn-accent:hover {
  background: var(--mc-accent-deep);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -3px 6px rgba(0, 0, 0, 0.3),
    0 8px 18px -4px rgba(124, 92, 255, 0.65);
}
.mcv2 .mc-btn-accent:active {
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.35),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15);
}

.mcv2 .mc-btn-ghost {
  background: var(--mc-surface);
  color: var(--mc-white);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -3px 6px rgba(0, 0, 0, 0.4),
    0 0 0 1px var(--mc-line);
}
.mcv2 .mc-btn-ghost:hover {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -3px 6px rgba(0, 0, 0, 0.45),
    0 0 0 1px var(--mc-accent);
}
.mcv2 .mc-btn-ghost:active {
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--mc-line);
}

@media (prefers-reduced-motion: reduce) {
  .mcv2 .mc-btn { transition: box-shadow 0.15s ease; }
  .mcv2 .mc-btn:hover, .mcv2 .mc-btn:active { transform: none; }
}
```

- [ ] **Step 2: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros (mudança é só CSS). No navegador, os botões `.mc-btn-accent`/`.mc-btn-ghost` mostram relevo (sombra externa + realce interno no topo) e "afundam" visualmente ao clicar (`:active`).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/landing-v2.css"
git commit -m "feat: botoes com relevo tatil (skeuomorphism escuro em violeta)"
```

---

### Task D2: Starfield em `/oferta`

**Files:**
- Create: `src/components/marketing/v2/Starfield.tsx`
- Modify: `src/app/(marketing)/oferta/page.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Produces: `<Starfield />` (sem props) — client component com canvas full-viewport fixo.

- [ ] **Step 1: Criar `Starfield.tsx`**

```tsx
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
      rafId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mc-oferta-starfield" aria-hidden="true" />;
}
```

- [ ] **Step 2: Adicionar CSS ao final de `landing-v2.css`**

```css
/* ---- Starfield da /oferta ---- */
.mc-oferta-wrapper {
  position: relative;
  background: #0a0812;
  min-height: 100vh;
}
.mc-oferta-starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.mc-oferta-wrapper > * {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 3: Atualizar `src/app/(marketing)/oferta/page.tsx`**

```tsx
import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import OfferPricing from "@/components/marketing/OfferPricing";
import Starfield from "@/components/marketing/v2/Starfield";
import "../landing-v2.css";

export default function OfertaPage() {
  return (
    <div className="mc-oferta-wrapper">
      <Starfield />
      <Header ctaLabel="Voltar para o início" ctaHref="/" />
      <section>
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag mono">
                <i>✦</i> Escolha seu plano
              </span>
              <h2>Quanto mais tempo, menor o custo por ebook</h2>
            </div>
            <div className="aside">
              Comece com 1 ebook avulso ou já entre direto no plano anual — o
              mesmo acesso completo à plataforma, pelo menor custo por
              conteúdo.
            </div>
          </div>

          <OfferPricing />
        </div>
      </section>
      <Footer />
    </div>
  );
}
```

Nota: `landing-v2.css` é importado aqui só para reaproveitar as 2 classes novas
(`mc-oferta-wrapper`/`mc-oferta-starfield`) — os estilos `.mcv2 ...` do resto do
arquivo são todos escopados sob `.mcv2` (que esta página não usa), então não
vazam para `/oferta`. `Header`/`Footer`/`OfferPricing` continuam renderizando
com as classes de `landing-clone.css`/`.lp-guide` exatamente como antes.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros. No navegador, abrir `/oferta`: fundo escuro com pontos
brancos cintilando/à deriva atrás do conteúdo claro existente (cards de
preço continuam legíveis, sem mudança funcional). Emular
`prefers-reduced-motion: reduce`: pontos ficam parados, sem cintilar.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/Starfield.tsx "src/app/(marketing)/oferta/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: fundo starfield na pagina /oferta"
```

---

### Task D3: Blobs (neural backdrop) nas páginas de checkout

**Files:**
- Create: `src/components/marketing/v2/NeuralBackdrop.tsx`
- Create: `src/app/checkout/checkout-dark.css`
- Modify: `src/app/checkout/sucesso/page.tsx`
- Modify: `src/app/checkout/cancelado/page.tsx`

**Interfaces:**
- Produces: `<NeuralBackdrop />` (sem props) — client component com blobs desfocados + parallax de mouse.

- [ ] **Step 1: Criar `src/app/checkout/checkout-dark.css`**

```css
/*
  Identidade escura mínima para as páginas de checkout (hoje sem
  identidade nenhuma — Tailwind puro). Escopo próprio `.mc-checkout`,
  independente de `.mcv2`/`.lp-guide`.
*/
.mc-checkout {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  background: #0a0812;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: clip;
}
.mc-checkout-card {
  position: relative;
  z-index: 1;
  max-width: 420px;
  text-align: center;
}
.mc-checkout-card h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #ffffff;
}
.mc-checkout-card p {
  color: #a49fb8;
  margin-bottom: 16px;
}
.mc-checkout-card a {
  color: #7c5cff;
  text-decoration: underline;
}

.mc-neural-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .mc-neural-blob { animation: none !important; }
}
```

- [ ] **Step 2: Criar `NeuralBackdrop.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";

const BLOBS = [
  { size: 320, top: "10%", left: "15%", color: "rgba(124, 92, 255, 0.35)", duration: 22, depth: 18 },
  { size: 260, top: "60%", left: "70%", color: "rgba(91, 61, 245, 0.3)", duration: 26, depth: 26 },
  { size: 200, top: "75%", left: "20%", color: "rgba(124, 92, 255, 0.25)", duration: 30, depth: 12 },
  { size: 240, top: "20%", left: "75%", color: "rgba(91, 61, 245, 0.28)", duration: 24, depth: 22 },
];

export default function NeuralBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const xRatio = event.clientX / window.innerWidth - 0.5;
      const yRatio = event.clientY / window.innerHeight - 0.5;

      container.querySelectorAll<HTMLDivElement>(".mc-neural-blob").forEach((blob, index) => {
        const depth = BLOBS[index]?.depth ?? 15;
        blob.style.transform = `translate(${xRatio * depth}px, ${yRatio * depth}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true">
      {BLOBS.map((blob, index) => (
        <div
          key={index}
          className="mc-neural-blob"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: blob.color,
            animation: `mc-blob-drift-${index % 2} ${blob.duration}s ease-in-out infinite`,
            transition: "transform 0.3s ease-out",
          }}
        />
      ))}
      <style>{`
        @keyframes mc-blob-drift-0 {
          0%, 100% { margin: 0; }
          50% { margin: 20px 30px; }
        }
        @keyframes mc-blob-drift-1 {
          0%, 100% { margin: 0; }
          50% { margin: -25px 15px; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Reescrever `src/app/checkout/sucesso/page.tsx`**

```tsx
import NeuralBackdrop from "@/components/marketing/v2/NeuralBackdrop";
import "../checkout-dark.css";

export default function CheckoutSucessoPage() {
  return (
    <div className="mc-checkout">
      <NeuralBackdrop />
      <div className="mc-checkout-card">
        <h1>Compra confirmada!</h1>
        <p>Verifique seu e-mail para receber o link do seu quiz de triagem.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Reescrever `src/app/checkout/cancelado/page.tsx`**

```tsx
import Link from "next/link";
import NeuralBackdrop from "@/components/marketing/v2/NeuralBackdrop";
import "../checkout-dark.css";

export default function CheckoutCanceladoPage() {
  return (
    <div className="mc-checkout">
      <NeuralBackdrop />
      <div className="mc-checkout-card">
        <h1>Checkout cancelado</h1>
        <p>Sua compra não foi concluída.</p>
        <Link href="/">Voltar para a página inicial</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros. Abrir `/checkout/sucesso` e `/checkout/cancelado`: fundo
escuro com 4 blobs violeta desfocados, deriva lenta contínua, leve parallax
ao mover o mouse. Emular `prefers-reduced-motion: reduce`: blobs ficam
parados (sem `@keyframes` nem parallax).

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/v2/NeuralBackdrop.tsx src/app/checkout/checkout-dark.css src/app/checkout/sucesso/page.tsx src/app/checkout/cancelado/page.tsx
git commit -m "feat: fundo de blobs (neural backdrop) nas paginas de checkout"
```

---

### Task D4: Rede de nós ambiente (substitui os motifs pontuais)

**Files:**
- Create: `src/components/marketing/v2/AmbientNetwork.tsx`
- Modify: `src/components/marketing/v2/HeroV2.tsx`
- Modify: `src/components/marketing/v2/ClosingSection.tsx`
- Modify: `src/app/(marketing)/page.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Delete: `src/components/marketing/v2/NetworkField.tsx` (só após confirmar que nenhuma referência resta)

**Interfaces:**
- Produces: `<AmbientNetwork />` (sem props) — client component, canvas fixo full-viewport, atrás de todo o conteúdo de `.mcv2`.

- [ ] **Step 1: Criar `AmbientNetwork.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_COUNT = 16;
const CONNECT_DISTANCE = 260;
const BASE_ALPHA = 0.06;

export default function AmbientNetwork() {
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

    const speed = reduced ? 0 : 0.06;
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
    }));

    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONNECT_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(124, 92, 255, ${BASE_ALPHA * (1 - dist / CONNECT_DISTANCE)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124, 92, 255, ${BASE_ALPHA + 0.04})`;
        ctx.fill();

        node.x = (node.x + node.vx + width) % width;
        node.y = (node.y + node.vy + height) % height;
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="mc-ambient-network" aria-hidden="true" />;
}
```

- [ ] **Step 2: Adicionar CSS ao final de `landing-v2.css`**

```css
/* ---- Rede ambiente (fundo único do site) ---- */
.mcv2 .mc-ambient-network {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.mcv2 .mc-header,
.mcv2 .mc-canvas,
.mcv2 .mc-footer,
.mcv2 .mc-fixed-cta,
.mcv2 .mc-menu-overlay {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 3: Remover o `NetworkField` local de `HeroV2.tsx`**

Remover a linha `import NetworkField from "./NetworkField";` e o bloco:

```tsx
      <motion.div className="mc-hero-motif" style={{ y }} aria-hidden="true">
        <NetworkField />
      </motion.div>
```

Como o parallax (`useScroll`/`useTransform`/`y`) só existia para esse motif,
remover também as linhas `const { scrollY } = useScroll();`,
`const reduced = useReducedMotion();`, `const y = useTransform(...)`, e o
import de `useReducedMotion`/`useScroll`/`useTransform`/`motion` que ficarem
sem uso (o arquivo mantém `"use client"` pois `Reveal`/`RotatingWord` ainda
são client components consumidos aqui, mas a própria função `HeroV2` deixa
de precisar de hooks do framer-motion diretamente).

- [ ] **Step 4: Remover o `NetworkField` local de `ClosingSection.tsx`**

Remover `import NetworkField from "./NetworkField";` e o bloco:

```tsx
      <div className="mc-closing-motif" aria-hidden="true">
        <NetworkField />
      </div>
```

- [ ] **Step 5: Adicionar `<AmbientNetwork />` em `page.tsx`**

Em `src/app/(marketing)/page.tsx`, adicionar o import
`import AmbientNetwork from "@/components/marketing/v2/AmbientNetwork";` e
renderizar `<AmbientNetwork />` como primeiro filho de `.mcv2` (antes do
`<noscript>`):

```tsx
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <AmbientNetwork />
      <noscript>
```

- [ ] **Step 6: Confirmar que `NetworkField.tsx` não tem mais referências e deletá-lo**

Run: `grep -rln "NetworkField" src/`
Expected: nenhum resultado (fora do próprio arquivo, que ainda não foi
deletado). Então:

```bash
git rm src/components/marketing/v2/NetworkField.tsx
```

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros. No navegador, abrir `/`: fundo com poucos nós violeta
bem sutis, deriva quase imperceptível, cobrindo a página inteira (não só o
hero); as seções restantes (Oportunidade, Sistema, Preço, etc.) ficam por
cima, legíveis. Emular `prefers-reduced-motion: reduce`: nós ficam parados
(velocidade 0).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: rede de nos ambiente unica substitui os motifs pontuais do hero/closing"
```

---

### Task D5: Cards da `SystemSection` em stack sobreposto

**Files:**
- Modify: `src/components/marketing/v2/SystemSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Consumes: `Reveal` de `./motion-primitives` (mantém o `Reveal` do título; a listagem de cards deixa de usar `Stagger`/`StaggerItem` — vira interativa via `motion.div` com estado próprio de qual card está em foco).
- Produces: `<SystemSection />` inalterado externamente (mesmo `id="sistema"`, mesmo array `ITEMS`).

- [ ] **Step 1: Reescrever `SystemSection.tsx`**

```tsx
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

const OFFSET_X = 28;
const OFFSET_Y = 20;
const ROTATION = 2.5;

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

        <div className="mc-system-stack">
          {ITEMS.map((item, index) => {
            const isFocused = focusIndex === index;
            const isDimmed = focusIndex !== null && !isFocused;

            return (
              <motion.div
                key={item.feature}
                className={`mc-system-card${item.accent ? " is-accent" : ""}`}
                style={{ zIndex: isFocused ? 10 : ITEMS.length - index }}
                initial={{
                  x: index * OFFSET_X,
                  y: index * OFFSET_Y,
                  rotate: reduced ? 0 : (index - 1.5) * ROTATION,
                }}
                animate={{
                  x: index * OFFSET_X,
                  y: index * OFFSET_Y,
                  rotate: reduced || isFocused ? 0 : (index - 1.5) * ROTATION,
                  scale: isFocused ? 1.05 : isDimmed ? 0.96 : 1,
                  opacity: isDimmed ? 0.55 : 1,
                }}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                onHoverStart={() => setFocusIndex(index)}
                onHoverEnd={() => setFocusIndex(null)}
                onFocus={() => setFocusIndex(index)}
                onBlur={() => setFocusIndex(null)}
                tabIndex={0}
                transition={{ duration: reduced ? 0 : 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
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

- [ ] **Step 2: Substituir o bloco `/* ---- Sistema ---- */` em `landing-v2.css`**

```css
/* ---- Sistema (stack sobreposto) ---- */
.mcv2 .mc-system-heading { margin-top: 20px; }
.mcv2 .mc-system-stack {
  position: relative;
  margin-top: 64px;
  height: 620px;
  max-width: 480px;
}
.mcv2 .mc-system-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  overflow: clip;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.6);
}
.mcv2 .mc-system-card.is-accent { background: var(--mc-accent-deep); border-color: transparent; }
.mcv2 .mc-system-image-wrap { aspect-ratio: 16 / 10; overflow: clip; }
.mcv2 .mc-system-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) brightness(0.85);
}
.mcv2 .mc-system-card-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mcv2 .mc-system-card.is-accent .mc-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.mcv2 .mc-system-card p { color: var(--mc-gray); }
.mcv2 .mc-system-card.is-accent p { color: rgba(255, 255, 255, 0.85); }

@media (max-width: 800px) {
  .mcv2 .mc-system-stack {
    position: static;
    height: auto;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .mcv2 .mc-system-card {
    position: static;
    transform: none !important;
  }
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros. No navegador em desktop (>800px): os 4 cards aparecem
em pilha com leve rotação/offset diagonal; ao passar o mouse sobre um card,
ele sobe para frente (sem rotação, levemente maior) e os outros recuam
(escala menor, opacidade reduzida). Em mobile (≤800px): pilha vira lista
vertical simples, sem sobreposição.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/SystemSection.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: cards da SystemSection em stack sobreposto com foco no hover"
```

---

### Task D6: Logo com efeito de scramble

**Files:**
- Create: `src/components/marketing/v2/ScrambleText.tsx`
- Modify: `src/components/marketing/v2/LandingHeader.tsx`

**Interfaces:**
- Produces: `<ScrambleText text={string} className? />` — client component, embaralha caracteres ao montar e resolve progressivamente para `text`.

- [ ] **Step 1: Criar `ScrambleText.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ/abcdefghijklmnopqrstuvwxyz";
const FRAME_MS = 35;
const FRAMES_PER_CHAR = 3;

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    const totalFrames = text.length * FRAMES_PER_CHAR;

    const id = setInterval(() => {
      const resolvedCount = Math.floor(frame / FRAMES_PER_CHAR);
      const next = text
        .split("")
        .map((char, index) => {
          if (char === " " || char === "/") return char;
          if (index < resolvedCount) return text[index];
          return randomGlyph();
        })
        .join("");
      setDisplay(next);
      frame += 1;

      if (frame > totalFrames) {
        setDisplay(text);
        clearInterval(id);
      }
    }, FRAME_MS);

    return () => clearInterval(id);
  }, [text, reduced]);

  return <span className={className}>{display}</span>;
}
```

- [ ] **Step 2: Aplicar no logo em `LandingHeader.tsx`**

Trocar:

```tsx
          <span className="mc-logo mc-display">
            Matriz<span className="mc-accent-text">/</span>Central
          </span>
```

por:

```tsx
          <span className="mc-logo mc-display">
            <ScrambleText text="Matriz/Central" />
          </span>
```

Adicionar o import `import ScrambleText from "./ScrambleText";` no topo do
arquivo. Nota: como o texto agora inclui `/` dentro da própria string (em
vez de um `<span>` colorido separado), o destaque de cor do `/` deixa de
existir nesta task — é uma simplificação aceitável para o efeito de
scramble funcionar sobre a string inteira; não recriar o `<span
className="mc-accent-text">` separado.

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros. No navegador, ao carregar `/`, a logo "Matriz/Central"
aparece embaralhando caracteres aleatórios por ~400-600ms antes de se
resolver na palavra final, da esquerda para a direita. Emular
`prefers-reduced-motion: reduce`: a logo aparece direto no texto final, sem
embaralhar.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/ScrambleText.tsx src/components/marketing/v2/LandingHeader.tsx
git commit -m "feat: logo com efeito de scramble ao carregar a pagina"
```

---

### Task D7: Verificação final e ajustes finos

**Files:**
- Modify (se necessário): `src/app/(marketing)/landing-v2.css`, `src/app/checkout/checkout-dark.css`

**Interfaces:**
- Consumes: todos os componentes das Tasks D1-D6.

- [ ] **Step 1: Rodar suíte completa e build**

Run: `npm run test && STRIPE_SECRET_KEY=sk_test_dummy npm run build`
Expected: todos os testes passam (nenhuma task desta frente adiciona lógica
testável nova — são todos tratamentos visuais); build lista todas as rotas
sem erro, incluindo `/checkout/sucesso` e `/checkout/cancelado`.

- [ ] **Step 2: Verificação end-to-end no navegador — desktop (1280×800)**

- `/`: rede de nós ambiente sutil cobrindo a página inteira; botões com
  relevo tátil e efeito de "afundar" ao clicar; logo com scramble ao
  carregar; cards da seção "O Sistema" em stack, com foco/destaque ao
  passar o mouse.
- `/oferta`: starfield atrás do conteúdo claro existente, sem quebrar
  layout do `Header`/`Footer`/`OfferPricing`.
- `/checkout/sucesso` e `/checkout/cancelado`: blobs violeta com deriva e
  parallax de mouse, conteúdo legível por cima.

- [ ] **Step 3: Verificação mobile (375×667)**

- Starfield/blobs/rede ambiente não causam scroll horizontal.
- Cards da `SystemSection` em lista vertical simples (sem sobreposição).
- Botões continuam com o comportamento de toque normal (sem depender de
  hover).

- [ ] **Step 4: Verificação de `prefers-reduced-motion: reduce`**

- Starfield: pontos parados.
- Blobs do checkout: sem deriva, sem parallax.
- Rede ambiente: nós parados.
- Logo: aparece direto no texto final, sem scramble.
- Cards do sistema: `useReducedMotion` já zera a rotação inicial e a
  duração da transição no código da Task D5 — confirmar visualmente que os
  cards aparecem sem rotação e que o hover ainda muda escala/z-index
  instantaneamente (sem tween).

- [ ] **Step 5: Corrigir achados e commit final (se houver)**

```bash
git add -A
git commit -m "style: ajustes finos da Frente D pos-verificacao end-to-end"
```
