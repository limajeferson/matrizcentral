# Landing Redesign (Identidade Dark/Violeta) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever a landing principal (`/`) com a nova identidade dark/violeta e sistema de animações Framer Motion, sem alterar `/oferta`, `/quiz` ou `/dashboard`.

**Architecture:** Novos componentes em `src/components/marketing/v2/` montados por `src/app/(marketing)/page.tsx`; identidade nova em `landing-v2.css` escopada sob `.mcv2` (o CSS antigo `.lp-guide` permanece para a /oferta e o DemoWidget). Fontes novas (Archivo Black + Inter) carregadas via `next/font` no próprio `page.tsx` e aplicadas como CSS variables no wrapper `.mcv2`. Animações via `framer-motion` com primitivos compartilhados (`Reveal`, `AnimatedCounter`).

**Tech Stack:** Next.js 14 (App Router), React 18, framer-motion (nova dep, MIT), CSS puro escopado, vitest para lógica pura.

## Global Constraints

- Custo zero: nenhuma dependência paga, nenhum asset externo/raster; visuais são SVG/CSS.
- `/oferta`, `/quiz` e `/dashboard` NÃO mudam: `Header.tsx`, `Footer.tsx`, `landing-clone.css` e `OfferPricing.tsx` não são editados.
- `DemoWidget.tsx` e `NetworkMotif.tsx` não são editados (reuso + overrides CSS).
- Única dependência nova: `framer-motion`.
- Copy em português do Brasil; claims apenas os já existentes no copy atual (nenhuma promessa nova). Preço: R$47 pagamento único; quiz 15 questões / 70% / certificado.
- Acessibilidade: `useReducedMotion` remove deslocamentos/parallax; conteúdo legível sem JS (nunca `opacity: 0` em CSS estático).
- Animações apenas em `transform`/`opacity`/`filter`.
- Commits frequentes, mensagens em pt-BR no padrão do repo (`feat:`, `style:`, `fix:`), com trailer:
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` e `Claude-Session: https://claude.ai/code/session_012bbzHLj2xcGJHZY89EPJDp`.
- Comandos de verificação: `npm run build` e `npm run test` devem passar ao final de cada task.

---

### Task 1: Fundação — dependência, tokens de identidade e wrapper da página

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Produces: classe de escopo `.mcv2` com tokens CSS (`--mc-bg`, `--mc-surface`, `--mc-accent`, `--mc-accent-deep`, `--mc-white`, `--mc-gray`, `--mc-line`, `--font-mc-display`, `--font-mc-sans`), utilitários `.mc-container`, `.mc-display`, `.mc-tag`, `.mc-btn`, `.mc-btn-accent`, `.mc-btn-ghost`, `.mc-section`, `.mc-block-accent`. Todos os componentes v2 dependem dessas classes.
- Produces: `page.tsx` renderiza `<div className={...mcv2 + fontes}>` — as tasks seguintes só adicionam componentes dentro dele.

- [ ] **Step 1: Instalar framer-motion**

Run: `npm install framer-motion`
Expected: adiciona `framer-motion` em dependencies, sem erros de peer deps (React 18 é suportado).

- [ ] **Step 2: Criar `src/app/(marketing)/landing-v2.css`**

```css
/*
  Identidade v2 da landing — dark + violeta elétrico, tipografia display.
  Escopado sob .mcv2 para não afetar /oferta (que usa .lp-guide).
*/
.mcv2 {
  --mc-bg: #0a0812;
  --mc-surface: #14101f;
  --mc-accent: #7c5cff;
  --mc-accent-deep: #5b3df5;
  --mc-white: #ffffff;
  --mc-gray: #a49fb8;
  --mc-line: rgba(255, 255, 255, 0.12);
  --mc-radius: 24px;
  --mc-notch: 14px;

  font-family: var(--font-mc-sans), system-ui, sans-serif;
  background: #050308;
  color: var(--mc-white);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Canvas com moldura: cantos arredondados inseridos na viewport */
.mcv2 .mc-canvas {
  background: var(--mc-bg);
  border-radius: var(--mc-radius);
  margin: 8px;
  overflow: clip;
}

.mcv2 .mc-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
}

.mcv2 .mc-display {
  font-family: var(--font-mc-display), var(--font-mc-sans), sans-serif;
  text-transform: uppercase;
  line-height: 0.94;
  letter-spacing: -0.01em;
  font-weight: 400;
  margin: 0;
}

.mcv2 h1.mc-display { font-size: clamp(3rem, 9vw, 7.25rem); }
.mcv2 h2.mc-display { font-size: clamp(2.25rem, 5.5vw, 4.25rem); }
.mcv2 h3.mc-display { font-size: clamp(1.5rem, 3vw, 2.5rem); }

.mcv2 .mc-accent-text { color: var(--mc-accent); }

.mcv2 .mc-mono {
  font-family: var(--font-marketing-mono), monospace;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mcv2 .mc-tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--mc-line);
  color: var(--mc-white);
  font-family: var(--font-marketing-mono), monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Botão chanfrado — assinatura da identidade */
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
  transition: transform 0.2s ease;
}
.mcv2 .mc-btn:hover { transform: translate(2px, -2px); }
.mcv2 .mc-btn-accent { background: var(--mc-accent); color: #fff; }
.mcv2 .mc-btn-accent:hover { background: var(--mc-accent-deep); }
.mcv2 .mc-btn-ghost {
  background: transparent;
  color: var(--mc-white);
  box-shadow: inset 0 0 0 1px var(--mc-line);
}
.mcv2 .mc-btn-ghost:hover { box-shadow: inset 0 0 0 1px var(--mc-accent); }

.mcv2 .mc-section { padding: 96px 0; }

/* Bloco de cor sólida do acento (seções violeta) */
.mcv2 .mc-block-accent {
  background: var(--mc-accent-deep);
  border-radius: var(--mc-radius);
  color: #fff;
}

.mcv2 p { margin: 0; }
.mcv2 a { color: inherit; }

@media (prefers-reduced-motion: reduce) {
  .mcv2 * { transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 3: Reescrever `src/app/(marketing)/page.tsx` com wrapper e fontes**

Substituir todo o conteúdo (os imports antigos voltam a ser adicionados/trocados nas tasks seguintes; nesta task a página fica com as seções antigas ainda montadas DENTRO do novo wrapper, para não quebrar a página durante a migração):

```tsx
import { Archivo_Black, Inter } from "next/font/google";
import "./landing-v2.css";

import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import AdvantagesSection from "@/components/marketing/AdvantagesSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCta from "@/components/marketing/FinalCta";
import Footer from "@/components/marketing/Footer";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mc-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mc-sans",
});

export default function HomePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <Header />
      <Hero />
      <AdvantagesSection />
      <FeaturesGrid />
      <PricingSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
```

- [ ] **Step 4: Verificar build e /oferta intacta**

Run: `npm run build`
Expected: build passa. A landing fica visualmente "quebrada de propósito" (fundo escuro com componentes antigos) — estado intermediário aceitável; /oferta não referencia `.mcv2` nem `landing-v2.css` (verificar com `grep -rn "mcv2\|landing-v2" src/app/"(marketing)"/oferta/` → sem resultados).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: fundação da identidade v2 da landing (tokens dark/violeta + framer-motion)"
```

---

### Task 2: Lógica pura — gasto anual com IA (TDD)

**Files:**
- Create: `src/lib/annual-spend.ts`
- Test: `src/lib/annual-spend.test.ts`

**Interfaces:**
- Produces: `MONTHLY_AI_SUBSCRIPTIONS_BRL: number` (220), `annualSpendBRL(monthly?: number): number`, `formatBRL(value: number): string` (ex.: `formatBRL(2640)` → `"R$ 2.640"`). Usados pelo `ProblemSection` (Task 6) e `AnimatedCounter` (Task 3).

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/annual-spend.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  MONTHLY_AI_SUBSCRIPTIONS_BRL,
  annualSpendBRL,
  formatBRL,
} from "@/lib/annual-spend";

describe("annual-spend", () => {
  it("calcula o gasto anual a partir do mensal padrão", () => {
    expect(annualSpendBRL()).toBe(MONTHLY_AI_SUBSCRIPTIONS_BRL * 12);
  });

  it("aceita mensal customizado", () => {
    expect(annualSpendBRL(100)).toBe(1200);
  });

  it("formata em BRL sem centavos", () => {
    const formatted = formatBRL(2640);
    expect(formatted).toContain("R$");
    expect(formatted).toContain("2.640");
    expect(formatted).not.toContain(",00");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/annual-spend.test.ts`
Expected: FAIL — módulo `@/lib/annual-spend` não existe.

- [ ] **Step 3: Implementação mínima**

Criar `src/lib/annual-spend.ts`:

```ts
// Estimativa: ChatGPT Plus (~R$110/mês) + Claude Pro (~R$110/mês)
export const MONTHLY_AI_SUBSCRIPTIONS_BRL = 220;

export function annualSpendBRL(monthly: number = MONTHLY_AI_SUBSCRIPTIONS_BRL): number {
  return monthly * 12;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/annual-spend.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/annual-spend.ts src/lib/annual-spend.test.ts
git commit -m "feat: helper de gasto anual com assinaturas de IA"
```

---

### Task 3: Primitivos de animação (Reveal, Stagger, AnimatedCounter)

**Files:**
- Create: `src/components/marketing/v2/motion-primitives.tsx`

**Interfaces:**
- Consumes: nada de tasks anteriores (o counter recebe `format` por prop; quem passa `formatBRL` é o consumidor, ex. Task 6).
- Produces (todos client components, importados pelas Tasks 4–10):
  - `Reveal({ children, delay?, className? })` — aparição fade+slide+blur no scroll.
  - `Stagger({ children, className? })` e `StaggerItem({ children, className? })` — grupo com filhos em cascata.
  - `AnimatedCounter({ value, format?, className? })` — número anima de 0 até `value` quando entra na viewport; `format: (n: number) => string` (default `String`).

- [ ] **Step 1: Criar `src/components/marketing/v2/motion-primitives.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const item: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({
  value,
  format = String,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (latest) => setDisplay(format(Math.round(latest))),
    });
    return () => controls.stop();
  }, [inView, value, reduced, format]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
```

- [ ] **Step 2: Verificar tipos/build**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/v2/motion-primitives.tsx
git commit -m "feat: primitivos de animação da landing v2 (Reveal, Stagger, AnimatedCounter)"
```

---

### Task 4: LandingHeader (menu overlay) + FixedCta

**Files:**
- Create: `src/components/marketing/v2/LandingHeader.tsx`
- Create: `src/components/marketing/v2/FixedCta.tsx`
- Modify: `src/app/(marketing)/landing-v2.css` (adicionar estilos ao final)
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: classes `.mc-*` (Task 1).
- Produces: `<LandingHeader />` (sem props) e `<FixedCta />` (sem props; esconde-se quando `#mc-footer` está visível — o `FooterV2` da Task 10 usa esse id; até lá o botão fica sempre visível).

- [ ] **Step 1: Criar `LandingHeader.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { href: "#sistema", label: "O Sistema" },
  { href: "#processo", label: "Como Funciona" },
  { href: "#preco", label: "Preço" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mc-header">
      <div className="mc-container mc-header-row">
        <span className="mc-logo mc-display">
          Matriz<span className="mc-accent-text">/</span>Central
        </span>
        <button
          type="button"
          className="mc-menu-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`mc-menu-line${open ? " open-top" : ""}`} />
          <span className={`mc-menu-line${open ? " open-bottom" : ""}`} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mc-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
              {LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 32 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <a
                    className="mc-display"
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 2: Criar `FixedCta.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FixedCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("mc-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          className="mc-fixed-cta"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35 }}
        >
          <a className="mc-btn mc-btn-accent" href="/oferta">
            Começar por R$47
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Adicionar CSS ao final de `landing-v2.css`**

```css
/* ---- Header + menu overlay ---- */
.mcv2 .mc-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(10, 8, 18, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--mc-line);
}
.mcv2 .mc-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}
.mcv2 .mc-logo { font-size: 1.1rem; letter-spacing: 0; }
.mcv2 .mc-menu-toggle {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px 6px;
  background: none;
  border: 0;
  cursor: pointer;
  z-index: 60;
  position: relative;
}
.mcv2 .mc-menu-line {
  width: 28px;
  height: 2px;
  background: var(--mc-white);
  transition: transform 0.3s ease;
}
.mcv2 .mc-menu-line.open-top { transform: translateY(4.5px) rotate(45deg); }
.mcv2 .mc-menu-line.open-bottom { transform: translateY(-4.5px) rotate(-45deg); }
.mcv2 .mc-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: var(--mc-accent-deep);
  display: flex;
  align-items: center;
}
.mcv2 .mc-menu-overlay ul {
  list-style: none;
  margin: 0;
  padding: 0 24px;
  width: 100%;
  max-width: 1160px;
  margin-inline: auto;
}
.mcv2 .mc-menu-overlay a {
  display: block;
  font-size: clamp(2.5rem, 8vw, 5rem);
  color: #fff;
  text-decoration: none;
  padding: 8px 0;
}
.mcv2 .mc-menu-overlay a:hover { color: var(--mc-bg); }

/* ---- CTA fixo ---- */
.mcv2 .mc-fixed-cta {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 45;
}
```

- [ ] **Step 4: Trocar Header pela LandingHeader no `page.tsx`**

Em `src/app/(marketing)/page.tsx`, remover `import Header from "@/components/marketing/Header";` e a linha `<Header />`; adicionar:

```tsx
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FixedCta from "@/components/marketing/v2/FixedCta";
```

e no JSX (primeiros filhos do wrapper `.mcv2`):

```tsx
<LandingHeader />
<FixedCta />
```

- [ ] **Step 5: Verificar no navegador**

Run: `npm run dev` e abrir `http://localhost:3000/` (Playwright ou manual).
Expected: header sticky com logo e hamburguer; clicar abre overlay violeta fullscreen com links em cascata; CTA fixo no canto inferior direito leva a `/oferta`. Abrir `http://localhost:3000/oferta` e confirmar que o header antigo continua lá, inalterado.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/v2/LandingHeader.tsx src/components/marketing/v2/FixedCta.tsx "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: header com menu overlay e CTA fixo da landing v2"
```

---

### Task 5: HeroV2 com rede de nós em parallax

**Files:**
- Create: `src/components/marketing/v2/NetworkField.tsx`
- Create: `src/components/marketing/v2/HeroV2.tsx`
- Modify: `src/app/(marketing)/landing-v2.css` (adicionar estilos)
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 3), `DemoWidget` existente (`@/components/marketing/DemoWidget`, não editar).
- Produces: `<HeroV2 />` (sem props); `<NetworkField className? />` — SVG de rede de nós com pulso CSS, reutilizável.

- [ ] **Step 1: Criar `NetworkField.tsx`**

```tsx
const NODES: [number, number, number][] = [
  [60, 80, 5], [180, 40, 4], [300, 90, 6], [420, 50, 4], [540, 110, 5],
  [220, 160, 4], [340, 200, 6], [460, 180, 4], [120, 240, 5], [520, 260, 4],
  [260, 300, 5], [400, 320, 4], [80, 340, 4], [560, 350, 5],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [3, 7], [5, 6], [6, 7],
  [0, 5], [5, 8], [6, 10], [7, 9], [8, 12], [10, 11], [9, 13], [11, 13], [8, 10],
];

export default function NetworkField({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5">
        {EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODES[a][0]} y1={NODES[a][1]}
            x2={NODES[b][0]} y2={NODES[b][1]}
          />
        ))}
      </g>
      <g fill="currentColor">
        {NODES.map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x} cy={y} r={r}
            className="mc-node"
            style={{ animationDelay: `${(i % 7) * 0.6}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Criar `HeroV2.tsx`**

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import DemoWidget from "@/components/marketing/DemoWidget";
import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

export default function HeroV2() {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const y = useTransform(scrollY, [0, 800], [0, reduced ? 0 : 160]);

  return (
    <section className="mc-hero">
      <motion.div className="mc-hero-motif" style={{ y }} aria-hidden="true">
        <NetworkField />
      </motion.div>
      <div className="mc-container mc-hero-content">
        <Reveal>
          <p className="mc-hero-proof mc-mono">
            ✦ Para quem quer dominar IA — programando ou não
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mc-display">
            Pare de alugar
            <br />
            sua <span className="mc-accent-text">IA</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mc-hero-sub">
            Construa seu próprio ChatGPT particular em menos de uma hora.
            Rode sua IA local — sem mensalidade, sem depender da nuvem e sem
            precisar ser especialista.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mc-hero-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero por R$47
            </a>
            <a className="mc-btn mc-btn-ghost" href="#sistema">
              Ver o que você recebe
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mc-hero-demo">
            <DemoWidget />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Adicionar CSS ao final de `landing-v2.css`**

```css
/* ---- Hero ---- */
.mcv2 .mc-hero {
  position: relative;
  padding: 120px 0 80px;
  overflow: clip;
}
.mcv2 .mc-hero-motif {
  position: absolute;
  inset: -10% -5% auto;
  height: 120%;
  color: var(--mc-accent);
  opacity: 0.28;
  pointer-events: none;
}
.mcv2 .mc-hero-motif svg { width: 100%; height: 100%; }
.mcv2 .mc-node { animation: mc-pulse 3.6s ease-in-out infinite; }
@keyframes mc-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .mcv2 .mc-node { animation: none; }
}
.mcv2 .mc-hero-content { position: relative; }
.mcv2 .mc-hero-proof { color: var(--mc-gray); margin-bottom: 20px; }
.mcv2 .mc-hero-sub {
  max-width: 560px;
  margin-top: 28px;
  font-size: 1.15rem;
  color: var(--mc-gray);
}
.mcv2 .mc-hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 36px;
}
.mcv2 .mc-hero-demo { margin-top: 72px; }

/* Overrides dark para o DemoWidget existente (classes do .lp-guide) */
.mcv2 .demo {
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  color: var(--mc-white);
}
```

Nota: ao verificar no navegador (Step 5), inspecionar o DemoWidget e adicionar overrides `.mcv2 .demo-tabs`, `.mcv2 .quiz-option`, `.mcv2 .roadmap-step`, `.mcv2 .xp-ring`, `.mcv2 .streak` etc. conforme necessário para legibilidade em fundo escuro — mesma técnica do override `.mcv2 .demo` acima (fundo `var(--mc-surface)`, bordas `var(--mc-line)`, texto `var(--mc-white)`/`var(--mc-gray)`).

- [ ] **Step 4: Trocar Hero pelo HeroV2 no `page.tsx`**

Remover `import Hero from "@/components/marketing/Hero";` e `<Hero />`; adicionar `import HeroV2 from "@/components/marketing/v2/HeroV2";` e `<HeroV2 />` logo após `<FixedCta />`.

- [ ] **Step 5: Verificar no navegador**

Run: dev server, abrir `/`.
Expected: headline display gigante com "IA" em violeta; rede de nós pulsando ao fundo se movendo mais devagar que o scroll (parallax); CTAs funcionam; DemoWidget legível em dark. Sem scroll horizontal em 375px de largura.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/v2/NetworkField.tsx src/components/marketing/v2/HeroV2.tsx "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: hero v2 com rede de nós em parallax"
```

---

### Task 6: ProblemSection (bloco violeta + contador de gasto anual)

**Files:**
- Create: `src/components/marketing/v2/ProblemSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal`, `AnimatedCounter` (Task 3); `annualSpendBRL`, `formatBRL` (Task 2).
- Produces: `<ProblemSection />` (sem props).

- [ ] **Step 1: Criar `ProblemSection.tsx`**

```tsx
import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";

export default function ProblemSection() {
  return (
    <section className="mc-section">
      <div className="mc-container">
        <div className="mc-block-accent mc-problem">
          <Reveal>
            <span className="mc-tag">O problema</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mc-display">
              Assinatura de IA é aluguel sem escritura
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mc-problem-sub">
              ChatGPT Plus e Claude Pro podem mudar de preço, limitar uso ou
              sair do ar — e o que você paga por mês nunca vira patrimônio.
              Em um ano, duas assinaturas custam cerca de:
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mc-problem-counter mc-display" aria-label={formatBRL(annualSpendBRL())}>
              <AnimatedCounter value={annualSpendBRL()} format={formatBRL} />
              <span className="mc-problem-per">/ano</span>
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="mc-problem-vs mc-mono">
              vs R$47 · pagamento único · IA rodando na sua máquina
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Adicionar CSS**

```css
/* ---- Problema ---- */
.mcv2 .mc-problem { padding: 72px 48px; }
.mcv2 .mc-problem .mc-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.mcv2 .mc-problem h2 { margin-top: 20px; max-width: 720px; }
.mcv2 .mc-problem-sub {
  margin-top: 24px;
  max-width: 560px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
}
.mcv2 .mc-problem-counter {
  margin-top: 40px;
  font-size: clamp(3rem, 8vw, 6rem);
}
.mcv2 .mc-problem-per {
  font-size: 0.35em;
  margin-left: 12px;
  color: rgba(255, 255, 255, 0.7);
}
.mcv2 .mc-problem-vs {
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.8);
}
@media (max-width: 640px) {
  .mcv2 .mc-problem { padding: 48px 24px; }
}
```

- [ ] **Step 3: Substituir AdvantagesSection no `page.tsx`**

Remover `import AdvantagesSection ...` e `<AdvantagesSection />`; adicionar `import ProblemSection from "@/components/marketing/v2/ProblemSection";` e `<ProblemSection />` após `<HeroV2 />`.

- [ ] **Step 4: Verificar**

Run: dev server, scroll até a seção.
Expected: bloco violeta sólido; contador sobe de R$ 0 até ≈ R$ 2.640 ao entrar na tela; com `prefers-reduced-motion` o valor aparece direto.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/ProblemSection.tsx "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: seção do problema com contador de gasto anual"
```

---

### Task 7: SystemSection (cards alternados dark/violeta)

**Files:**
- Create: `src/components/marketing/v2/SystemSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal`, `Stagger`, `StaggerItem` (Task 3).
- Produces: `<SystemSection />` (sem props), com âncora `id="sistema"`.

- [ ] **Step 1: Criar `SystemSection.tsx`**

Conteúdo adaptado do `FeaturesGrid` atual (mesmos claims), condensado em 4 cards grandes. Visuais em SVG próprios (variações dark dos existentes — NÃO importar os do FeaturesGrid, que são light):

```tsx
import { Reveal, Stagger, StaggerItem } from "./motion-primitives";

const ITEMS = [
  {
    tag: "CONTEÚDO",
    title: "Ebook completo",
    description:
      "9 capítulos do zero ao avançado para rodar LLMs localmente — com trilha sem código para quem não programa.",
    accent: false,
    bars: [36, 52, 44, 68, 84],
  },
  {
    tag: "TRIAGEM + APRENDIZADO",
    title: "Trilha sob medida",
    description:
      "Quiz de perfil mapeia sua stack, nível e objetivos; o roadmap evita que você estude o que já domina.",
    accent: true,
    bars: [28, 44, 60, 72, 90],
  },
  {
    tag: "PROGRESSO",
    title: "Dashboard com XP",
    description:
      "Cada ebook concluído e cada quiz aprovado somam XP. Progresso visível a cada etapa.",
    accent: false,
    bars: [20, 36, 48, 66, 80],
  },
  {
    tag: "RECONHECIMENTO",
    title: "Certificado verificável",
    description:
      "Quiz de validação com 15 questões; 70% de acerto libera certificado com QR code verificável publicamente.",
    accent: true,
    bars: [40, 55, 65, 78, 96],
  },
];

function CardVisual({ bars, accent }: { bars: number[]; accent: boolean }) {
  const fill = accent ? "rgba(255,255,255,0.85)" : "#7c5cff";
  const dim = accent ? "rgba(255,255,255,0.3)" : "rgba(124,92,255,0.3)";
  return (
    <svg viewBox="0 0 160 110" width="100%" aria-hidden="true">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={16 + i * 28}
          y={100 - h}
          width="18"
          height={h}
          rx="4"
          fill={i === bars.length - 1 ? fill : dim}
        />
      ))}
    </svg>
  );
}

export default function SystemSection() {
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
        <Stagger className="mc-system-grid">
          {ITEMS.map((item) => (
            <StaggerItem
              key={item.title}
              className={`mc-system-card${item.accent ? " is-accent" : ""}`}
            >
              <span className="mc-tag">{item.tag}</span>
              <h3 className="mc-display">{item.title}</h3>
              <p>{item.description}</p>
              <div className="mc-system-visual">
                <CardVisual bars={item.bars} accent={item.accent} />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Adicionar CSS**

```css
/* ---- Sistema ---- */
.mcv2 .mc-system-heading { margin-top: 20px; }
.mcv2 .mc-system-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 48px;
}
.mcv2 .mc-system-card {
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mcv2 .mc-system-card.is-accent {
  background: var(--mc-accent-deep);
  border-color: transparent;
}
.mcv2 .mc-system-card.is-accent .mc-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.mcv2 .mc-system-card p { color: var(--mc-gray); }
.mcv2 .mc-system-card.is-accent p { color: rgba(255, 255, 255, 0.85); }
.mcv2 .mc-system-visual { margin-top: auto; padding-top: 16px; }
@media (max-width: 800px) {
  .mcv2 .mc-system-grid { grid-template-columns: 1fr; }
  .mcv2 .mc-system-card { padding: 28px; }
}
```

- [ ] **Step 3: Substituir FeaturesGrid no `page.tsx`**

Remover `import FeaturesGrid ...` e `<FeaturesGrid />`; adicionar `import SystemSection from "@/components/marketing/v2/SystemSection";` e `<SystemSection />` após `<ProblemSection />`.

- [ ] **Step 4: Verificar**

Expected: grid 2×2 com cards alternando dark/violeta, aparição em cascata; âncora `#sistema` funciona a partir do CTA ghost do hero e do menu.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/SystemSection.tsx "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: seção do sistema com cards alternados"
```

---

### Task 8: ProcessSteps (passos sticky empilhados)

**Files:**
- Create: `src/components/marketing/v2/ProcessSteps.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal` (Task 3), `NetworkField` (Task 5).
- Produces: `<ProcessSteps />` (sem props), âncora `id="processo"`.

- [ ] **Step 1: Criar `ProcessSteps.tsx`**

Empilhamento via CSS `position: sticky` (robusto, sem JS) + Reveal para conteúdo interno:

```tsx
import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

const STEPS = [
  {
    number: "01",
    title: "Garanta seu acesso",
    description:
      "Pagamento único de R$47. Sem mensalidade, sem fidelidade, acesso imediato.",
  },
  {
    number: "02",
    title: "Descubra sua trilha",
    description:
      "O quiz de perfil mapeia sua stack, nível e objetivos e gera um roadmap de estudo sob medida.",
  },
  {
    number: "03",
    title: "Estude e suba de nível",
    description:
      "Cada capítulo concluído soma XP no dashboard. Valide com o quiz final e emita seu certificado verificável.",
  },
];

export default function ProcessSteps() {
  return (
    <section className="mc-section" id="processo">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Como funciona</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">Três passos até sua IA própria</h2>
        </Reveal>
      </div>
      <div className="mc-steps">
        {STEPS.map((step, i) => (
          <div className="mc-step" key={step.number} style={{ top: `${72 + i * 20}px` }}>
            <div className="mc-container mc-step-inner">
              <span className="mc-step-number mc-display">{step.number}</span>
              <div className="mc-step-body">
                <p className="mc-mono mc-step-label">Passo {step.number}</p>
                <h3 className="mc-display">{step.title}</h3>
                <p className="mc-step-desc">{step.description}</p>
              </div>
              <div className="mc-step-motif" aria-hidden="true">
                <NetworkField />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Adicionar CSS**

```css
/* ---- Processo (sticky stack) ---- */
.mcv2 .mc-steps { margin-top: 48px; }
.mcv2 .mc-step {
  position: sticky;
  padding: 32px 0;
  background: var(--mc-bg);
  border-top: 1px solid var(--mc-line);
  min-height: 60vh;
  display: flex;
  align-items: center;
}
.mcv2 .mc-step:nth-child(2) { background: var(--mc-surface); }
.mcv2 .mc-step:nth-child(3) { background: var(--mc-accent-deep); }
.mcv2 .mc-step-inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 40px;
  align-items: center;
  width: 100%;
}
.mcv2 .mc-step-number {
  font-size: clamp(4rem, 12vw, 9rem);
  opacity: 0.25;
}
.mcv2 .mc-step-label { color: var(--mc-gray); margin-bottom: 12px; }
.mcv2 .mc-step:nth-child(3) .mc-step-label { color: rgba(255, 255, 255, 0.7); }
.mcv2 .mc-step-desc {
  margin-top: 16px;
  max-width: 440px;
  color: var(--mc-gray);
  font-size: 1.05rem;
}
.mcv2 .mc-step:nth-child(3) .mc-step-desc { color: rgba(255, 255, 255, 0.85); }
.mcv2 .mc-step-motif {
  width: 220px;
  height: 150px;
  color: var(--mc-accent);
  opacity: 0.4;
}
.mcv2 .mc-step:nth-child(3) .mc-step-motif { color: #fff; }
.mcv2 .mc-step-motif svg { width: 100%; height: 100%; }
@media (max-width: 800px) {
  .mcv2 .mc-step { position: static; min-height: 0; }
  .mcv2 .mc-step-inner { grid-template-columns: 1fr; gap: 16px; }
  .mcv2 .mc-step-motif { display: none; }
}
```

- [ ] **Step 3: Adicionar no `page.tsx`**

`import ProcessSteps from "@/components/marketing/v2/ProcessSteps";` e `<ProcessSteps />` após `<SystemSection />`.

- [ ] **Step 4: Verificar**

Expected: no desktop, os passos empilham (cada um "gruda" alguns px abaixo do anterior ao rolar); no mobile (≤800px) viram stack simples. Passo 3 é violeta.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/ProcessSteps.tsx "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: seção de processo com passos sticky"
```

---

### Task 9: PricingV2 + FaqSection

**Files:**
- Create: `src/components/marketing/v2/PricingV2.tsx`
- Create: `src/components/marketing/v2/faq-data.ts`
- Create: `src/components/marketing/v2/FaqSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal`, `Stagger`, `StaggerItem` (Task 3).
- Produces: `<PricingV2 />` (âncora `id="preco"`), `<FaqSection />` (âncora `id="faq"`); `faq-data.ts` exporta `FAQ_ITEMS: { question: string; answer: string }[]`.

- [ ] **Step 1: Criar `PricingV2.tsx`**

Copy fiel ao PricingSection atual (ebook avulso disponível; demais planos = lista de espera em /oferta):

```tsx
import { Reveal } from "./motion-primitives";

const INCLUDED = [
  "Ebook completo (9 capítulos) sobre rodar LLMs localmente",
  "Triagem de perfil personalizada",
  "Roadmap de estudo sob medida para o seu perfil",
  "Quiz de validação com certificado de conclusão",
];

export default function PricingV2() {
  return (
    <section className="mc-section" id="preco">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Preço simples</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">
            R$47. Sem mensalidade.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mc-price-card">
            <div className="mc-price-main">
              <span className="mc-tag">A partir de</span>
              <p className="mc-price-value mc-display">
                R$47<span className="mc-price-note">pagamento único</span>
              </p>
              <a className="mc-btn mc-btn-accent" href="/oferta">
                Ver todos os planos
              </a>
            </div>
            <ul className="mc-price-list">
              {INCLUDED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mc-price-foot mc-mono">
            Planos mensal e anual (em breve) com mais ebooks — lista de espera em /oferta
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Criar `faq-data.ts`**

Respostas adaptadas do copy existente (DemoWidget/FeaturesGrid/oferta — nenhum claim novo):

```ts
export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Preciso saber programar?",
    answer:
      "Não. O ebook tem uma trilha sem código para quem não programa, além do caminho completo para quem é técnico.",
  },
  {
    question: "Funciona no meu computador?",
    answer:
      "O ebook cobre modelos para diferentes níveis de hardware e os relatórios comparativos ajudam a escolher o modelo certo para a sua máquina.",
  },
  {
    question: "É assinatura?",
    answer:
      "Não. O ebook avulso é pagamento único de R$47. Os planos com mais conteúdo (em breve) terão lista de espera em /oferta.",
  },
  {
    question: "Como funciona o certificado?",
    answer:
      "Você responde um quiz de validação de 15 questões; com 70% de acerto o certificado com QR code é liberado, verificável publicamente.",
  },
  {
    question: "Como recebo o acesso?",
    answer:
      "Após o pagamento você recebe um link de acesso ao dashboard com o conteúdo, quiz de perfil e roadmap personalizado.",
  },
];
```

- [ ] **Step 3: Criar `FaqSection.tsx`**

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQ_ITEMS } from "./faq-data";
import { Reveal } from "./motion-primitives";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mc-section" id="faq">
      <div className="mc-container">
        <div className="mc-block-accent mc-faq">
          <Reveal>
            <span className="mc-tag">FAQ</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mc-display">Perguntas frequentes</h2>
          </Reveal>
          <div className="mc-faq-list">
            {FAQ_ITEMS.map((item, i) => {
              const open = openIndex === i;
              return (
                <div className="mc-faq-item" key={item.question}>
                  <button
                    type="button"
                    className="mc-faq-question"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    {item.question}
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="mc-faq-answer">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Adicionar CSS**

```css
/* ---- Preço ---- */
.mcv2 .mc-price-card {
  margin-top: 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  padding: 48px;
  clip-path: polygon(
    0 0, calc(100% - 24px) 0, 100% 24px,
    100% 100%, 24px 100%, 0 calc(100% - 24px)
  );
}
.mcv2 .mc-price-main { display: flex; flex-direction: column; gap: 20px; align-items: flex-start; }
.mcv2 .mc-price-value { font-size: clamp(3.5rem, 8vw, 5.5rem); }
.mcv2 .mc-price-note {
  display: block;
  font-family: var(--font-mc-sans), sans-serif;
  font-size: 0.9rem;
  text-transform: none;
  color: var(--mc-gray);
  margin-top: 8px;
}
.mcv2 .mc-price-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: var(--mc-gray);
}
.mcv2 .mc-price-list li { padding-left: 24px; position: relative; }
.mcv2 .mc-price-list li::before {
  content: "✦";
  position: absolute;
  left: 0;
  color: var(--mc-accent);
}
.mcv2 .mc-price-foot { margin-top: 20px; color: var(--mc-gray); }
@media (max-width: 800px) {
  .mcv2 .mc-price-card { grid-template-columns: 1fr; padding: 32px 24px; }
}

/* ---- FAQ ---- */
.mcv2 .mc-faq { padding: 72px 48px; }
.mcv2 .mc-faq .mc-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.mcv2 .mc-faq h2 { margin-top: 20px; }
.mcv2 .mc-faq-list { margin-top: 40px; display: flex; flex-direction: column; gap: 10px; }
.mcv2 .mc-faq-item {
  background: #fff;
  color: #17131f;
  border-radius: 12px;
}
.mcv2 .mc-faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: none;
  border: 0;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.mcv2 .mc-faq-answer { padding: 0 24px 20px; color: #4b4655; }
@media (max-width: 640px) {
  .mcv2 .mc-faq { padding: 48px 20px; }
}
```

- [ ] **Step 5: Substituir PricingSection no `page.tsx`**

Remover `import PricingSection ...` e `<PricingSection />`; adicionar `PricingV2` e `FaqSection` após `<ProcessSteps />`:

```tsx
import PricingV2 from "@/components/marketing/v2/PricingV2";
import FaqSection from "@/components/marketing/v2/FaqSection";
```

- [ ] **Step 6: Verificar**

Expected: card de preço chanfrado com lista; FAQ em bloco violeta com accordion animado (primeiro item aberto); âncoras `#preco` e `#faq` funcionam do menu.

- [ ] **Step 7: Commit**

```bash
git add src/components/marketing/v2/PricingV2.tsx src/components/marketing/v2/faq-data.ts src/components/marketing/v2/FaqSection.tsx "src/app/(marketing)/landing-v2.css" "src/app/(marketing)/page.tsx"
git commit -m "feat: preço chanfrado e FAQ accordion da landing v2"
```

---

### Task 10: FinalCtaV2 + FooterV2 (claro) e limpeza

**Files:**
- Create: `src/components/marketing/v2/FinalCtaV2.tsx`
- Create: `src/components/marketing/v2/FooterV2.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`
- Delete: `src/components/marketing/AdvantagesSection.tsx`, `src/components/marketing/FeaturesGrid.tsx`, `src/components/marketing/Hero.tsx`, `src/components/marketing/PricingSection.tsx`, `src/components/marketing/FinalCta.tsx` (após confirmar que nada mais importa)

**Interfaces:**
- Consumes: `Reveal` (Task 3), `NetworkField` (Task 5).
- Produces: `<FinalCtaV2 />`, `<FooterV2 />` com `id="mc-footer"` (consumido pelo `FixedCta` da Task 4 para se esconder).

- [ ] **Step 1: Criar `FinalCtaV2.tsx`**

```tsx
import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

export default function FinalCtaV2() {
  return (
    <section className="mc-section mc-final">
      <div className="mc-final-motif" aria-hidden="true">
        <NetworkField />
      </div>
      <div className="mc-container mc-final-content">
        <Reveal>
          <h2 className="mc-display">
            Sua IA.
            <br />
            Sua <span className="mc-accent-text">máquina</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-final-sub">
            Descubra seu perfil, siga um roadmap sob medida e valide o que
            aprendeu com um certificado verificável.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a className="mc-btn mc-btn-accent" href="/oferta">
            Quero por R$47
          </a>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Criar `FooterV2.tsx`**

```tsx
export default function FooterV2() {
  return (
    <footer className="mc-footer" id="mc-footer">
      <div className="mc-container mc-footer-grid">
        <div>
          <span className="mc-logo mc-display">
            Matriz<span className="mc-accent-text">/</span>Central
          </span>
          <p className="mc-footer-desc">
            Sistema de estudo para dominar IA local — ebook, trilha
            personalizada, XP e certificado verificável.
          </p>
        </div>
        <nav className="mc-footer-nav" aria-label="Links do rodapé">
          <a href="#sistema">O Sistema</a>
          <a href="#processo">Como Funciona</a>
          <a href="#preco">Preço</a>
          <a href="#faq">FAQ</a>
          <a href="/oferta">Oferta</a>
        </nav>
      </div>
      <div className="mc-container mc-footer-bottom">
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Adicionar CSS**

```css
/* ---- CTA final ---- */
.mcv2 .mc-final { position: relative; overflow: clip; padding: 140px 0; }
.mcv2 .mc-final-motif {
  position: absolute;
  inset: 0;
  color: var(--mc-accent);
  opacity: 0.2;
  pointer-events: none;
}
.mcv2 .mc-final-motif svg { width: 100%; height: 100%; }
.mcv2 .mc-final-content { position: relative; text-align: center; }
.mcv2 .mc-final-sub {
  max-width: 480px;
  margin: 24px auto 36px;
  color: var(--mc-gray);
  font-size: 1.1rem;
}

/* ---- Footer claro ---- */
.mcv2 .mc-footer {
  background: #ffffff;
  color: #17131f;
  border-radius: var(--mc-radius) var(--mc-radius) 0 0;
  padding: 64px 0 32px;
}
.mcv2 .mc-footer .mc-logo { color: #17131f; }
.mcv2 .mc-footer-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: start;
}
.mcv2 .mc-footer-desc {
  margin-top: 16px;
  max-width: 380px;
  color: #5c5666;
}
.mcv2 .mc-footer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mcv2 .mc-footer-nav a {
  text-decoration: none;
  color: #17131f;
  font-weight: 500;
}
.mcv2 .mc-footer-nav a:hover { color: var(--mc-accent-deep); }
.mcv2 .mc-footer-bottom {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid #e8e5ee;
  color: #5c5666;
  font-size: 0.9rem;
}
@media (max-width: 640px) {
  .mcv2 .mc-footer-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Montagem final do `page.tsx`**

Conteúdo final completo do arquivo:

```tsx
import { Archivo_Black, Inter } from "next/font/google";
import "./landing-v2.css";

import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FixedCta from "@/components/marketing/v2/FixedCta";
import HeroV2 from "@/components/marketing/v2/HeroV2";
import ProblemSection from "@/components/marketing/v2/ProblemSection";
import SystemSection from "@/components/marketing/v2/SystemSection";
import ProcessSteps from "@/components/marketing/v2/ProcessSteps";
import PricingV2 from "@/components/marketing/v2/PricingV2";
import FaqSection from "@/components/marketing/v2/FaqSection";
import FinalCtaV2 from "@/components/marketing/v2/FinalCtaV2";
import FooterV2 from "@/components/marketing/v2/FooterV2";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mc-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mc-sans",
});

export default function HomePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <LandingHeader />
      <FixedCta />
      <div className="mc-canvas">
        <HeroV2 />
        <ProblemSection />
        <SystemSection />
        <ProcessSteps />
        <PricingV2 />
        <FaqSection />
        <FinalCtaV2 />
      </div>
      <FooterV2 />
    </div>
  );
}
```

- [ ] **Step 5: Remover componentes antigos órfãos**

Run: `grep -rn "AdvantagesSection\|FeaturesGrid\|marketing/Hero\|marketing/PricingSection\|marketing/FinalCta" src/ --include=*.tsx --include=*.ts`
Expected: nenhuma referência restante (fora dos próprios arquivos). Então:

```bash
git rm src/components/marketing/AdvantagesSection.tsx src/components/marketing/FeaturesGrid.tsx src/components/marketing/Hero.tsx src/components/marketing/PricingSection.tsx src/components/marketing/FinalCta.tsx
```

IMPORTANTE: `Header.tsx`, `Footer.tsx`, `DemoWidget.tsx`, `NetworkMotif.tsx` e `OfferPricing.tsx` FICAM (usados pela /oferta e pelo HeroV2).

- [ ] **Step 6: Verificar build + testes**

Run: `npm run build && npm run test`
Expected: ambos passam.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: cta final, footer claro e montagem final da landing v2"
```

---

### Task 11: Verificação end-to-end e ajustes finos

**Files:**
- Modify (se necessário): `src/app/(marketing)/landing-v2.css` (ajustes de contraste/espaçamento encontrados)

**Interfaces:**
- Consumes: página completa das Tasks 1–10.

- [ ] **Step 1: Verificação desktop (Playwright, viewport 1280×800)**

Navegar `http://localhost:3000/` e percorrer a página inteira. Checklist:
- Hero: headline display, parallax do motif, CTAs → `/oferta` e `#sistema`.
- Contador do problema anima até ≈ R$ 2.640.
- Cards do sistema aparecem em cascata.
- Passos sticky empilham no scroll.
- FAQ abre/fecha com animação.
- CTA fixo visível durante todo o scroll e some quando o footer entra na tela.
- Menu overlay abre, links navegam e fecham o menu.
- Footer claro com links funcionais.

- [ ] **Step 2: Verificação mobile (viewport 375×667)**

- Sem scroll horizontal.
- Display type legível (clamp), passos em stack simples, grid do sistema em 1 coluna.
- Menu overlay e CTA fixo utilizáveis.

- [ ] **Step 3: Verificar páginas intocadas**

Navegar `/oferta`: visual idêntico ao anterior (header antigo, estilos `.lp-guide`). Conferir também que `npm run build` lista `/quiz/[token]` e `/dashboard/[token]` sem erros.

- [ ] **Step 4: Reduced motion**

Emular `prefers-reduced-motion: reduce` (Playwright: `page.emulateMedia({ reducedMotion: 'reduce' })`): conteúdo aparece sem deslocamentos; contador mostra valor final direto; nós não pulsam.

- [ ] **Step 5: Corrigir achados e commit final**

Ajustes de CSS/copy encontrados nos steps 1–4 entram em commits `fix:`/`style:` pequenos.

```bash
git add -A
git commit -m "style: ajustes finos da landing v2 pós-verificação"
```
