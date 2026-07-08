# Reposicionamento Copy + Diagnóstico Inicial + Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposicionar a landing (`/`) para um tom de oportunidade/evolução, renomear e simplificar a triagem para "Diagnóstico Inicial" sem jargão técnico, e transformar o Roadmap do dashboard num sistema de evolução com etapas bloqueadas e progresso real.

**Architecture:** Landing: reescreve/renomeia componentes existentes em `src/components/marketing/v2/` (mesma base `.mcv2`/framer-motion), sem tocar `/oferta`. Triagem: troca o conteúdo de `src/data/quiz-triagem.ts` (7 perguntas sem branch técnico) mantendo intactas as interfaces `TriagemQuestion`/`TriagemAnswer` e a função pura `scoreTriagem`; renomeia copy de UI. Roadmap: nova migration reestrutura `profiles.study_roadmap` para 5 etapas fixas, nova tabela `roadmap_progress` + rota `POST /api/roadmap/complete` para progresso real, `RoadmapCard.tsx` reescrito para renderizar bloqueio/desbloqueio.

**Tech Stack:** Next.js 14 (App Router), React 18, framer-motion (já instalado), Supabase (Postgres), Vitest.

## Global Constraints

- Custo zero: fotos do `SystemSection` via hotlink direto a URLs de CDN do Unsplash (grátis, sem download/armazenamento); nenhuma dependência nova.
- Não editar `/oferta`, checkout, Stripe, nem os componentes/CSS específicos da `/oferta` (`Header.tsx`, `Footer.tsx`, `landing-clone.css`, `OfferPricing.tsx`).
- `scoreTriagem()` e as interfaces `TriagemQuestion`/`TriagemAnswer`/`TriagemOption` (`src/lib/quiz-scoring.ts`) não mudam de assinatura — só o conteúdo de `src/data/quiz-triagem.ts` muda.
- Nunca prometer "nunca mais pagar por IA" — posicionamento correto: "reduzir ou eliminar a dependência de assinatura para quem roda IA local".
- Sem hype: nunca usar "revolucionário", "definitivo", "game changer".
- Copy em português do Brasil.
- Animações apenas em `transform`/`opacity`/`filter`; respeitar `useReducedMotion` (padrão já usado em `motion-primitives.tsx`).
- Commits em pt-BR, trailers:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` e
  `Claude-Session: https://claude.ai/code/session_012bbzHLj2xcGJHZY89EPJDp`.
- `npm run build` e `npm run test` devem passar ao final de cada task.

---

## FRENTE A — Landing (copy + visual)

### Task A1: Hero com badge novo e headline de palavra rotativa

**Files:**
- Create: `src/components/marketing/v2/RotatingWord.tsx`
- Modify: `src/components/marketing/v2/HeroV2.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Produces: `<RotatingWord words={string[]} intervalMs={number} className? />` — client component, exportado para uso futuro em outras seções se necessário.

- [ ] **Step 1: Criar `RotatingWord.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function RotatingWord({
  words,
  intervalMs = 2200,
  className,
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs, reduced]);

  if (reduced) {
    return (
      <span className={className}>
        {words[0]}
        <span className="mc-rotating-cursor" aria-hidden="true">|</span>
      </span>
    );
  }

  return (
    <span className={`mc-rotating-word ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mc-rotating-word-inner"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      <span className="mc-rotating-cursor" aria-hidden="true">|</span>
    </span>
  );
}
```

- [ ] **Step 2: Adicionar CSS ao final de `landing-v2.css`**

```css
/* ---- Palavra rotativa (hero) ---- */
.mcv2 .mc-rotating-word {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  color: var(--mc-accent);
}
.mcv2 .mc-rotating-word-inner { display: inline-block; white-space: nowrap; }
.mcv2 .mc-rotating-cursor {
  display: inline-block;
  margin-left: 4px;
  animation: mc-cursor-blink 1s step-start infinite;
  color: var(--mc-accent);
}
@keyframes mc-cursor-blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .mcv2 .mc-rotating-cursor { animation: none; }
}
```

- [ ] **Step 3: Reescrever `HeroV2.tsx`**

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import DemoWidget from "@/components/marketing/DemoWidget";
import NetworkField from "./NetworkField";
import RotatingWord from "./RotatingWord";
import { Reveal } from "./motion-primitives";

const ROTATING_WORDS = ["do GPT", "do Claude", "do Gemini", "de aluguel de servidor", "de VPS"];

// Backlog de sub-headline (teste A/B via PostHog quando a landing for divulgada).
// Variante 1 (ativa hoje) já está no JSX abaixo.
// const HERO_SUBHEADLINE_VARIANTS = [
//   "Aprenda a rodar modelos de IA no seu computador e elimine a necessidade de pagar ChatGPT, Claude ou Gemini todo mês. Sem depender da nuvem. Sem precisar ser especialista.",
//   "Descubra como ter sua própria IA rodando no seu computador, sem mensalidade, com mais privacidade e controle. Tudo explicado passo a passo.",
//   "Troque o aluguel mensal por uma solução que é sua. Aprenda a rodar IA local no seu computador em menos de uma hora.",
//   "Você não precisa continuar pagando assinatura para usar IA todos os meses. Aprenda a rodar sua própria IA local com um método simples e uma única compra.",
// ];

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
            ✦ Para quem cansou de assinaturas — e usa IA todos os dias
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mc-display">
            Pare de pagar mensalidade
            <br />
            <RotatingWord words={ROTATING_WORDS} />
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mc-hero-sub">
            Aprenda a rodar modelos de IA no seu computador e elimine a
            necessidade de pagar ChatGPT, Claude ou Gemini todo mês. Sem
            depender da nuvem. Sem precisar ser especialista.
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

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: dev server, abrir `/`, observar hero — headline troca de palavra com cursor piscando a cada ~2.2s; com `prefers-reduced-motion` mostra só a primeira palavra com cursor estático piscando via CSS.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/RotatingWord.tsx src/components/marketing/v2/HeroV2.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: hero com badge novo e headline de palavra rotativa"
```

---

### Task A2: `ProblemSection` → `OpportunitySection`

**Files:**
- Create: `src/components/marketing/v2/OpportunitySection.tsx`
- Delete: `src/components/marketing/v2/ProblemSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal`, `AnimatedCounter` de `./motion-primitives`; `annualSpendBRL`, `formatBRL` de `@/lib/annual-spend`.
- Produces: `<OpportunitySection />` (sem props).

- [ ] **Step 1: Criar `OpportunitySection.tsx`**

```tsx
"use client";

import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";

export default function OpportunitySection() {
  return (
    <section className="mc-section">
      <div className="mc-container">
        <div className="mc-block-accent mc-opportunity">
          <Reveal>
            <span className="mc-tag">Uma forma mais inteligente de usar IA</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mc-display">Sua IA. Suas regras.</h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mc-opportunity-sub">
              A Matriz Central ensina você a rodar modelos de IA localmente,
              reduzindo a dependência de assinaturas recorrentes e dando mais
              controle sobre como você usa IA no seu dia a dia.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mc-opportunity-compare">
              <div>
                <span className="mc-mono mc-opportunity-label">Hoje</span>
                <p className="mc-opportunity-value mc-display">
                  <AnimatedCounter value={annualSpendBRL()} format={formatBRL} />
                </p>
                <span className="mc-mono mc-opportunity-note">assinaturas recorrentes /ano</span>
              </div>
              <span className="mc-opportunity-arrow" aria-hidden="true">→</span>
              <div>
                <span className="mc-mono mc-opportunity-label">Com Matriz Central</span>
                <p className="mc-opportunity-value mc-display">R$47</p>
                <span className="mc-mono mc-opportunity-note">pagamento único</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <p className="mc-opportunity-result mc-mono">
              Resultado: sua própria estrutura de IA, sem mensalidade recorrente
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Adicionar CSS ao final de `landing-v2.css`** (substitui o bloco `/* ---- Problema ---- */` — remover esse bloco antigo e inserir este)

```css
/* ---- Oportunidade ---- */
.mcv2 .mc-opportunity { padding: 72px 48px; }
.mcv2 .mc-opportunity .mc-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.mcv2 .mc-opportunity h2 { margin-top: 20px; max-width: 720px; }
.mcv2 .mc-opportunity-sub {
  margin-top: 24px;
  max-width: 560px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
}
.mcv2 .mc-opportunity-compare {
  margin-top: 48px;
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.mcv2 .mc-opportunity-label { color: rgba(255, 255, 255, 0.7); }
.mcv2 .mc-opportunity-value {
  margin-top: 8px;
  font-size: clamp(2rem, 5vw, 3.25rem);
}
.mcv2 .mc-opportunity-note { color: rgba(255, 255, 255, 0.6); }
.mcv2 .mc-opportunity-arrow {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.5);
}
.mcv2 .mc-opportunity-result {
  margin-top: 32px;
  color: rgba(255, 255, 255, 0.85);
}
@media (max-width: 640px) {
  .mcv2 .mc-opportunity { padding: 48px 24px; }
  .mcv2 .mc-opportunity-compare { gap: 16px; }
}
```

- [ ] **Step 3: Atualizar `page.tsx`**

Trocar `import ProblemSection from "@/components/marketing/v2/ProblemSection";` por
`import OpportunitySection from "@/components/marketing/v2/OpportunitySection";`
e `<ProblemSection />` por `<OpportunitySection />`.

- [ ] **Step 4: Deletar o arquivo antigo**

```bash
git rm src/components/marketing/v2/ProblemSection.tsx
```

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; seção mostra headline positiva, comparativo Hoje→Com Matriz Central, sem palavras "problema/erro/risco/prejuízo".

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: substitui ProblemSection por OpportunitySection com tom positivo"
```

---

### Task A3: `SystemSection` com benefícios, fotos reais e hover em CSS

**Files:**
- Modify: `src/components/marketing/v2/SystemSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Consumes: `Reveal`, `Stagger`, `StaggerItem` de `./motion-primitives` (sem mudança de assinatura).
- Produces: `<SystemSection />` inalterado externamente (mesmo `id="sistema"`).

- [ ] **Step 1: Reescrever `SystemSection.tsx`**

```tsx
import { Reveal, Stagger, StaggerItem } from "./motion-primitives";

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
              key={item.feature}
              className={`mc-system-card${item.accent ? " is-accent" : ""}`}
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
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Substituir o bloco `/* ---- Sistema ---- */` em `landing-v2.css`**

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
  overflow: clip;
  display: flex;
  flex-direction: column;
}
.mcv2 .mc-system-card.is-accent { background: var(--mc-accent-deep); border-color: transparent; }
.mcv2 .mc-system-image-wrap {
  aspect-ratio: 16 / 10;
  overflow: clip;
}
.mcv2 .mc-system-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(0.2) brightness(0.85);
  transition: transform 0.4s ease, filter 0.4s ease;
}
.mcv2 .mc-system-card:hover .mc-system-image {
  transform: scale(1.05);
  filter: grayscale(0) brightness(0.95);
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
  .mcv2 .mc-system-grid { grid-template-columns: 1fr; }
  .mcv2 .mc-system-card-body { padding: 24px; }
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; no navegador, cada card mostra foto real no topo (16:10), zoom + dessaturação reduzindo no hover; textos seguem ordem Benefício → Recurso → Descrição.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/SystemSection.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: SystemSection com benefícios, fotografia real e hover em CSS"
```

---

### Task A4: `ProcessSteps` — timeline glassmorphism

**Files:**
- Modify: `src/components/marketing/v2/ProcessSteps.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Consumes: `Reveal` de `./motion-primitives`; `motion`/`useScroll`/`useTransform` de `framer-motion` (já usados em `HeroV2.tsx` — mesmo padrão).
- Produces: `<ProcessSteps />` inalterado externamente (mesmo `id="processo"`).

- [ ] **Step 1: Reescrever `ProcessSteps.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./motion-primitives";

const STEPS = [
  {
    number: "01",
    title: "Comece pelo caminho certo",
    description:
      "Após adquirir seu acesso, você recebe uma orientação personalizada para começar exatamente pelo que faz sentido para seu contexto.",
    detail: "Diagnóstico Inicial",
  },
  {
    number: "02",
    title: "Siga sua trilha",
    description:
      "Cada etapa mostra o próximo objetivo, liberando uma evolução organizada sem excesso de conteúdo.",
    detail: "Roadmap Inteligente",
  },
  {
    number: "03",
    title: "Construa sua independência",
    description:
      "Ao concluir sua trilha, você terá aprendido a utilizar IA local com mais autonomia, além de validar seu conhecimento através da certificação.",
    detail: "Certificação Verificável",
  },
];

function GlassPanel({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"],
  });
  const glow = useTransform(scrollYProgress, [0, 1], [0.15, 0.55]);

  return (
    <motion.div ref={ref} className="mc-glass-panel" style={{ ["--mc-glow" as string]: glow }}>
      <span className="mc-glass-number mc-display">{step.number}</span>
      <h3 className="mc-display">{step.title}</h3>
      <p className="mc-glass-desc">{step.description}</p>
      <span className="mc-mono mc-glass-detail">{step.detail}</span>
    </motion.div>
  );
}

export default function ProcessSteps() {
  return (
    <section className="mc-section" id="processo">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Sua jornada</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display">Seu caminho até uma IA independente</h2>
        </Reveal>
        <div className="mc-glass-track">
          {STEPS.map((step, i) => (
            <GlassPanel key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Substituir o bloco `/* ---- Processo (sticky stack) ---- */` em `landing-v2.css`**

```css
/* ---- Jornada (glassmorphism) ---- */
.mcv2 .mc-glass-track {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.mcv2 .mc-glass-panel {
  position: relative;
  padding: 36px 28px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 0 0 1px rgba(124, 92, 255, calc(var(--mc-glow, 0.15) * 0.6)),
    0 20px 60px -30px rgba(124, 92, 255, calc(var(--mc-glow, 0.15) * 1.4));
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.mcv2 .mc-glass-panel:hover {
  transform: translateY(-4px);
  box-shadow:
    0 0 0 1px rgba(124, 92, 255, 0.55),
    0 24px 70px -28px rgba(124, 92, 255, 0.65);
}
.mcv2 .mc-glass-number {
  display: block;
  font-size: 2.25rem;
  color: var(--mc-accent);
  opacity: 0.8;
}
.mcv2 .mc-glass-panel h3 { margin-top: 12px; font-size: clamp(1.25rem, 2.4vw, 1.75rem); }
.mcv2 .mc-glass-desc {
  margin-top: 16px;
  color: var(--mc-gray);
  font-size: 0.98rem;
}
.mcv2 .mc-glass-detail {
  display: inline-block;
  margin-top: 20px;
  color: var(--mc-accent);
}
@media (max-width: 800px) {
  .mcv2 .mc-glass-track { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; painéis translúcidos com blur e glow que intensifica conforme o painel entra na viewport durante o scroll; copy usa "01/02/03" (sem "Passo"); não menciona pagamento/compra/checkout/valor.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/ProcessSteps.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: ProcessSteps redesenhado como timeline glassmorphism"
```

---

### Task A5: `PricingV2` reformulado — decisão, não tabela de preços

**Files:**
- Modify: `src/components/marketing/v2/PricingV2.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Consumes: `Reveal`, `AnimatedCounter` de `./motion-primitives`; `annualSpendBRL`, `formatBRL` de `@/lib/annual-spend`.
- Produces: `<PricingV2 />` inalterado externamente (mesmo `id="preco"`).

- [ ] **Step 1: Reescrever `PricingV2.tsx`**

```tsx
"use client";

import { annualSpendBRL, formatBRL } from "@/lib/annual-spend";
import { AnimatedCounter, Reveal } from "./motion-primitives";

const INCLUDED = [
  { icon: "📘", label: "Ebook Técnico", description: "Aprenda a rodar IA local do zero ao uso prático." },
  { icon: "🧭", label: "Diagnóstico Inicial", description: "Receba uma trilha recomendada para o seu contexto." },
  { icon: "🛣️", label: "Roadmap Inteligente", description: "Saiba exatamente qual é o próximo passo." },
  { icon: "🏆", label: "Certificação Verificável", description: "Valide seu aprendizado ao concluir a trilha." },
];

export default function PricingV2() {
  return (
    <section className="mc-section" id="preco">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Um único pagamento</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-price-headline">
            Todo o sistema por apenas
            <br />
            R$47
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-price-sub">
            Pagamento único. Sem mensalidade. Sem renovação automática. Sem
            fidelidade.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mc-price-badges mc-mono">
            <span>✓ Pagamento único</span>
            <span>✓ Acesso imediato</span>
            <span>✓ Sem assinatura</span>
            <span>✓ Acesso vitalício à versão adquirida</span>
          </div>
        </Reveal>

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

        <Reveal delay={0.4}>
          <div className="mc-price-compare">
            <div>
              <span className="mc-mono">Assinaturas</span>
              <p className="mc-display">
                <AnimatedCounter value={annualSpendBRL()} format={formatBRL} />
              </p>
              <span className="mc-mono">/ano</span>
            </div>
            <span aria-hidden="true">vs</span>
            <div>
              <span className="mc-mono">Matriz Central</span>
              <p className="mc-display">R$47</p>
              <span className="mc-mono">pagamento único</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.5}>
          <div className="mc-price-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero por R$47
            </a>
            <p className="mc-price-cta-note">
              Acesso liberado imediatamente após a confirmação do pagamento.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <p className="mc-price-foot mc-mono">
            No futuro novos conteúdos poderão estar disponíveis por
            assinatura. O produto atual continua sendo vendido separadamente
            por R$47.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Substituir o bloco `/* ---- Preço ---- */` em `landing-v2.css`**

```css
/* ---- Preço ---- */
.mcv2 .mc-price-headline { margin-top: 20px; }
.mcv2 .mc-price-sub {
  margin-top: 20px;
  max-width: 480px;
  color: var(--mc-gray);
  font-size: 1.05rem;
}
.mcv2 .mc-price-badges {
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: var(--mc-gray);
}
.mcv2 .mc-price-included {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
.mcv2 .mc-price-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.mcv2 .mc-price-item-icon { font-size: 1.5rem; }
.mcv2 .mc-price-item h3 { font-size: 1.15rem; margin-bottom: 6px; }
.mcv2 .mc-price-item p { color: var(--mc-gray); font-size: 0.95rem; }
.mcv2 .mc-price-compare {
  margin-top: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px;
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  flex-wrap: wrap;
}
.mcv2 .mc-price-compare > div { display: flex; flex-direction: column; gap: 6px; }
.mcv2 .mc-price-compare p.mc-display { font-size: clamp(2rem, 5vw, 3rem); }
.mcv2 .mc-price-compare > span { color: var(--mc-gray); }
.mcv2 .mc-price-cta { margin-top: 56px; }
.mcv2 .mc-price-cta-note { margin-top: 14px; color: var(--mc-gray); font-size: 0.9rem; }
.mcv2 .mc-price-foot { margin-top: 40px; color: var(--mc-gray); max-width: 560px; }
@media (max-width: 800px) {
  .mcv2 .mc-price-included { grid-template-columns: 1fr; }
  .mcv2 .mc-price-compare { gap: 20px; }
}
```

- [ ] **Step 3: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; seção não contém "Preço simples", "A partir de" nem "Ver todos os planos"; preço R$47 em tipografia grande; nota de planos futuros aparece só como texto discreto, sem botão.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/PricingV2.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: PricingV2 reformulado como decisão de investimento, não tabela de preços"
```

---

### Task A6: `FinalCtaV2` + `FooterV2` → `ClosingSection`

**Files:**
- Create: `src/components/marketing/v2/ClosingSection.tsx`
- Delete: `src/components/marketing/v2/FinalCtaV2.tsx`
- Modify: `src/components/marketing/v2/FooterV2.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`
- Modify: `src/app/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `Reveal` de `./motion-primitives`; `NetworkField` de `./NetworkField`.
- Produces: `<ClosingSection />` (sem props). `FooterV2` mantém `id="mc-footer"` (consumido por `FixedCta`, já implementado — não mexer nessa lógica).

- [ ] **Step 1: Criar `ClosingSection.tsx`**

```tsx
import NetworkField from "./NetworkField";
import { Reveal } from "./motion-primitives";

export default function ClosingSection() {
  return (
    <section className="mc-section mc-closing">
      <div className="mc-closing-motif" aria-hidden="true">
        <NetworkField />
      </div>
      <div className="mc-container mc-closing-content">
        <Reveal>
          <h2 className="mc-display">
            Pare de pagar aluguel
            <br />
            para usar <span className="mc-accent-text">IA</span>.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-closing-sub">
            Comece a construir algo que é seu. Aprenda a rodar modelos de IA
            localmente com um sistema organizado que acompanha sua evolução
            do primeiro passo até a certificação.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mc-closing-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero por R$47
            </a>
            <p className="mc-closing-cta-note">
              Pagamento único. Acesso imediato. Sem mensalidade.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Reescrever `FooterV2.tsx`** (mantém `id="mc-footer"`)

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
            Sistema para aprender IA local através de conteúdo estruturado,
            diagnóstico personalizado, roadmap de evolução e certificação.
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
        <span>© {new Date().getFullYear()} Matriz Central. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Adicionar CSS ao final de `landing-v2.css`** (substitui o bloco `/* ---- CTA final ---- */`, mantém o bloco `/* ---- Footer claro ---- */` como está)

```css
/* ---- Closing ---- */
.mcv2 .mc-closing { position: relative; overflow: clip; padding: 140px 0; }
.mcv2 .mc-closing-motif {
  position: absolute;
  inset: 0;
  color: var(--mc-accent);
  opacity: 0.2;
  pointer-events: none;
}
.mcv2 .mc-closing-motif svg { width: 100%; height: 100%; }
.mcv2 .mc-closing-content { position: relative; text-align: center; }
.mcv2 .mc-closing-sub {
  max-width: 520px;
  margin: 24px auto 0;
  color: var(--mc-gray);
  font-size: 1.1rem;
}
.mcv2 .mc-closing-cta { margin-top: 40px; }
.mcv2 .mc-closing-cta-note { margin-top: 14px; color: var(--mc-gray); font-size: 0.9rem; }
```

- [ ] **Step 4: Atualizar `page.tsx`**

Trocar `import FinalCtaV2 from "@/components/marketing/v2/FinalCtaV2";` por
`import ClosingSection from "@/components/marketing/v2/ClosingSection";`
e `<FinalCtaV2 />` por `<ClosingSection />`.

- [ ] **Step 5: Deletar o arquivo antigo**

```bash
git rm src/components/marketing/v2/FinalCtaV2.tsx
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npm run build`
Expected: sem erros; seção de fechamento com headline "Pare de pagar aluguel para usar IA. Comece a construir algo que é seu.", CTA único, seguida do rodapé institucional discreto.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: substitui FinalCtaV2 por ClosingSection como último argumento de venda"
```

---

## FRENTE B — Diagnóstico Inicial (triagem reformulada)

### Task B1: Novo banco de 7 perguntas em `quiz-triagem.ts` (com teste)

**Files:**
- Modify: `src/data/quiz-triagem.ts`
- Test: `src/data/quiz-triagem.test.ts` (já existe — estender)

**Interfaces:**
- Consumes: `TriagemQuestion`, `TriagemOption` de `@/lib/quiz-scoring` (sem mudança de assinatura).
- Produces: `QUIZ_TRIAGEM: TriagemQuestion[]` com exatamente 7 perguntas, IDs 1–7, sem `showIf`.

- [ ] **Step 1: Ler o teste existente para entender o formato esperado**

Run: `cat src/data/quiz-triagem.test.ts`

(Este passo é de leitura — confirme que os testes existentes verificam contagem de perguntas e/ou ausência de `showIf`; ajuste os testes conforme o Step 2 abaixo se algum teste antigo assumir 20 perguntas ou branches técnicos.)

- [ ] **Step 2: Escrever/atualizar o teste**

Adicionar a `src/data/quiz-triagem.test.ts` (mantendo os testes existentes que ainda façam sentido, removendo os que assumem branch técnico):

```ts
import { describe, expect, it } from "vitest";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

describe("QUIZ_TRIAGEM — Diagnóstico Inicial", () => {
  it("tem exatamente 7 perguntas", () => {
    expect(QUIZ_TRIAGEM).toHaveLength(7);
  });

  it("nenhuma pergunta usa showIf (sem ramificação técnica)", () => {
    expect(QUIZ_TRIAGEM.every((q) => q.showIf === undefined)).toBe(true);
  });

  it("nenhuma opção menciona linguagens de programação", () => {
    const bannedTerms = ["Python", "JavaScript", "TypeScript", "Go/Rust", "programo"];
    const allOptionTexts = QUIZ_TRIAGEM.flatMap((q) => q.options.map((o) => o.text));
    for (const term of bannedTerms) {
      expect(allOptionTexts.some((text) => text.includes(term))).toBe(false);
    }
  });

  it("toda opção distribui pontos para ao menos um perfil", () => {
    const allOptions = QUIZ_TRIAGEM.flatMap((q) => q.options);
    expect(allOptions.every((o) => Object.keys(o.points).length > 0)).toBe(true);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run src/data/quiz-triagem.test.ts`
Expected: FAIL (banco atual tem 20 perguntas e usa `showIf`).

- [ ] **Step 4: Reescrever `src/data/quiz-triagem.ts`**

```ts
import type { TriagemQuestion } from "@/lib/quiz-scoring";

/**
 * Banco de perguntas do Diagnóstico Inicial.
 *
 * Sem ramificação técnica: todas as perguntas são sempre visíveis (nenhuma
 * usa `showIf`). O objetivo não é medir conhecimento técnico, e sim mapear
 * uso, objetivo, contexto e tempo disponível para recomendar uma trilha.
 * A pontuação alimenta os mesmos 8 perfis internos (ver lib/quiz-scoring.ts),
 * que continuam existindo como classificação interna — nunca exibidos como
 * "perfil" na UI (ver dashboard: "Sua Trilha Recomendada").
 */
export const QUIZ_TRIAGEM: TriagemQuestion[] = [
  {
    id: 1,
    text: "Como você utiliza IA hoje?",
    type: "radio",
    options: [
      {
        text: "Todos os dias",
        points: { profissional_produtividade: 2, founder_builder: 1 },
      },
      {
        text: "Algumas vezes por semana",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      {
        text: "Estou começando",
        points: { estudante_curioso: 2 },
      },
      {
        text: "Ainda não utilizo",
        points: { estudante_curioso: 3 },
      },
    ],
  },
  {
    id: 2,
    text: "Qual é seu principal objetivo?",
    type: "radio",
    options: [
      {
        text: "Economizar com assinaturas",
        points: { profissional_produtividade: 2, founder_builder: 1 },
      },
      {
        text: "Ter mais privacidade",
        points: { devops_infra: 2, ceo_financeiro: 1 },
      },
      {
        text: "Trabalhar sem depender da internet",
        points: { devops_infra: 2, profissional_produtividade: 1 },
      },
      {
        text: "Aprender IA local",
        points: { estudante_curioso: 3 },
      },
      {
        text: "Automatizar tarefas",
        points: { founder_builder: 2, dev_nodejs_web: 1 },
      },
    ],
  },
  {
    id: 3,
    text: "Como você prefere aprender?",
    type: "radio",
    options: [
      {
        text: "Quero o caminho mais simples",
        points: { profissional_produtividade: 2, estudante_curioso: 1 },
      },
      {
        text: "Quero entender como funciona",
        points: { dev_python_aia: 2, devops_infra: 1 },
      },
      {
        text: "Um equilíbrio entre teoria e prática",
        points: { pm_product: 1, dev_nodejs_web: 1, estudante_curioso: 1 },
      },
    ],
  },
  {
    id: 4,
    text: "Qual computador você pretende utilizar?",
    type: "radio",
    options: [
      {
        text: "Notebook básico",
        points: { estudante_curioso: 1, profissional_produtividade: 1 },
      },
      {
        text: "Notebook intermediário",
        points: { profissional_produtividade: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Desktop",
        points: { dev_python_aia: 1, devops_infra: 1 },
      },
      {
        text: "Ainda não sei",
        points: { estudante_curioso: 1 },
      },
    ],
  },
  {
    id: 5,
    text: "Você pretende utilizar IA principalmente para:",
    type: "radio",
    options: [
      {
        text: "Trabalho",
        points: { profissional_produtividade: 2, pm_product: 1 },
      },
      {
        text: "Estudos",
        points: { estudante_curioso: 2 },
      },
      {
        text: "Empresa",
        points: { ceo_financeiro: 2, founder_builder: 1 },
      },
      {
        text: "Projetos pessoais",
        points: { founder_builder: 1, dev_python_aia: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Ainda estou descobrindo",
        points: { estudante_curioso: 2 },
      },
    ],
  },
  {
    id: 6,
    text: "Quanto tempo você pretende dedicar inicialmente?",
    type: "radio",
    options: [
      {
        text: "Até 30 minutos",
        points: { profissional_produtividade: 1 },
      },
      {
        text: "Cerca de 1 hora",
        points: { profissional_produtividade: 1, estudante_curioso: 1 },
      },
      {
        text: "Algumas horas",
        points: { dev_python_aia: 1, devops_infra: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Aos poucos",
        points: { estudante_curioso: 1 },
      },
    ],
  },
  {
    id: 7,
    text: "O que mais incomoda você hoje?",
    type: "radio",
    options: [
      {
        text: "Pagar assinatura todo mês",
        points: { profissional_produtividade: 2, founder_builder: 1 },
      },
      {
        text: "Limites de uso",
        points: { dev_python_aia: 1, dev_nodejs_web: 1 },
      },
      {
        text: "Falta de privacidade",
        points: { devops_infra: 2, ceo_financeiro: 1 },
      },
      {
        text: "Depender da internet",
        points: { devops_infra: 2 },
      },
      {
        text: "Não saber por onde começar",
        points: { estudante_curioso: 3 },
      },
    ],
  },
];
```

- [ ] **Step 5: Rodar e ver passar**

Run: `npx vitest run src/data/quiz-triagem.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm run test`
Expected: todos os arquivos passam, incluindo `src/lib/quiz-scoring.ts` (se houver teste) e `src/app/api/quiz/route.test.ts` (que usa `scoreTriagem` com o novo banco — a função em si não muda, então deve continuar passando).

- [ ] **Step 7: Commit**

```bash
git add src/data/quiz-triagem.ts src/data/quiz-triagem.test.ts
git commit -m "feat: substitui as 20 perguntas técnicas por 7 perguntas do Diagnóstico Inicial"
```

---

### Task B2: Renomear copy de UI — "Diagnóstico Inicial" e "Sua Trilha Recomendada"

**Files:**
- Modify: `src/components/quiz/QuizTriagem.tsx`
- Modify: `src/app/quiz/[token]/page.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Nenhuma interface nova; apenas texto visível muda. Nenhuma mudança de rota, schema, ou fluxo de submissão (`POST /api/quiz`, redirect para `/dashboard/[token]`).

- [ ] **Step 1: Atualizar `QuizTriagem.tsx`**

No arquivo `src/components/quiz/QuizTriagem.tsx`, trocar a linha do botão final (linha ~104):

```tsx
{isLast ? (submitting ? "Calculando sua trilha..." : "Ver minha trilha recomendada") : "Próxima"}
```

E trocar a mensagem de erro (linha ~62):

```tsx
setError("Não foi possível calcular sua trilha agora. Tente novamente.");
```

- [ ] **Step 2: Verificar `src/app/quiz/[token]/page.tsx`**

Run: `grep -n "perfil\|Perfil\|Quiz" "src/app/quiz/[token]/page.tsx"`

Se houver algum texto visível tipo "Quiz de Perfil" ou "triagem de perfil" no JSX desse arquivo (fora de nomes de variável/rota), trocar por "Diagnóstico Inicial" mantendo toda a lógica de validação de token intacta.

- [ ] **Step 3: Atualizar o bloco de perfil no dashboard**

Em `src/app/dashboard/[token]/page.tsx`, trocar o bloco (linhas 67-73):

```tsx
      <GlassCard className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <CategoryBadge variant="roadmap">Perfil</CategoryBadge>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">{profile.name}</h1>
        <p className="text-zinc-600">{profile.description}</p>
      </GlassCard>
```

por:

```tsx
      <GlassCard className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <CategoryBadge variant="roadmap">Sua Trilha Recomendada</CategoryBadge>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Objetivo principal</h1>
        <p className="text-zinc-600">{profile.description}</p>
      </GlassCard>
```

Também trocar o texto de bloqueio (linhas 20-29, quando `!tokenRow.triaged`):

```tsx
  if (!tokenRow.triaged || !tokenRow.profile_id) {
    return (
      <p className="max-w-md mx-auto p-8 text-center">
        Complete primeiro o{" "}
        <a href={`/quiz/${params.token}`} className="text-violet-600 underline">
          Diagnóstico Inicial
        </a>
        .
      </p>
    );
  }
```

- [ ] **Step 4: Verificar**

Run: `npm run build`
Expected: build passa. Navegar `/quiz/[token]` (com um token de teste válido, se disponível em ambiente local) e confirmar que nenhum texto visível diz "Quiz de Perfil"/"Ver meu perfil"/"Perfil" — usa "Diagnóstico Inicial"/"Sua Trilha Recomendada".

- [ ] **Step 5: Commit**

```bash
git add src/components/quiz/QuizTriagem.tsx "src/app/quiz/[token]/page.tsx" "src/app/dashboard/[token]/page.tsx"
git commit -m "feat: renomeia UI de Quiz de Perfil para Diagnóstico Inicial / Trilha Recomendada"
```

---

## FRENTE C — Roadmap como sistema de evolução

### Task C1: Migration — etapas fixas em `study_roadmap` (com teste de forma)

**Files:**
- Create: `supabase/migrations/0007_roadmap_etapas_fixas.sql`
- Modify: `src/types/index.ts`
- Test: `src/data/roadmap-stages.test.ts`
- Create: `src/data/roadmap-stages.ts`

**Interfaces:**
- Produces: `ROADMAP_STAGE_KEYS: readonly ["fundacao_local", "modelos_performance", "fluxo_trabalho", "automacoes", "missao_final"]`; tipo `RoadmapStage = { title: string; objective: string; checklist: string[] }`; tipo `RoadmapStages = Record<(typeof ROADMAP_STAGE_KEYS)[number], RoadmapStage>`. Consumido pela Task C3 (`RoadmapCard`) e pela migration SQL (via referência de nomes, não import direto — SQL é um arquivo separado).

- [ ] **Step 1: Criar `src/data/roadmap-stages.ts`**

```ts
export const ROADMAP_STAGE_KEYS = [
  "fundacao_local",
  "modelos_performance",
  "fluxo_trabalho",
  "automacoes",
  "missao_final",
] as const;

export type RoadmapStageKey = (typeof ROADMAP_STAGE_KEYS)[number];

export interface RoadmapStage {
  title: string;
  objective: string;
  checklist: string[];
}

export type RoadmapStages = Record<RoadmapStageKey, RoadmapStage>;

export const ROADMAP_STAGE_LABELS: Record<RoadmapStageKey, string> = {
  fundacao_local: "Fundação Local",
  modelos_performance: "Modelos e Performance",
  fluxo_trabalho: "Fluxo de Trabalho",
  automacoes: "Automações",
  missao_final: "Missão Final",
};
```

- [ ] **Step 2: Escrever o teste**

```ts
import { describe, expect, it } from "vitest";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS } from "@/data/roadmap-stages";

describe("roadmap-stages", () => {
  it("define exatamente 5 etapas fixas na ordem esperada", () => {
    expect(ROADMAP_STAGE_KEYS).toEqual([
      "fundacao_local",
      "modelos_performance",
      "fluxo_trabalho",
      "automacoes",
      "missao_final",
    ]);
  });

  it("toda etapa tem um rótulo em português", () => {
    for (const key of ROADMAP_STAGE_KEYS) {
      expect(ROADMAP_STAGE_LABELS[key]).toBeTruthy();
    }
  });

  it("a última etapa se chama Missão Final, não Certificação", () => {
    expect(ROADMAP_STAGE_LABELS.missao_final).toBe("Missão Final");
  });
});
```

- [ ] **Step 3: Rodar e ver passar**

Run: `npx vitest run src/data/roadmap-stages.test.ts`
Expected: PASS (3 testes) — este arquivo não depende de nada pré-existente, então já passa na primeira tentativa; ainda assim, rode antes de implementar para confirmar que ele falha (módulo não existe) e depois passa, seguindo TDD.

- [ ] **Step 4: Atualizar `src/types/index.ts`**

Trocar (linha 102):

```ts
          study_roadmap: Record<string, { title: string; items: string[] }>;
```

por:

```ts
          study_roadmap: Record<string, { title: string; objective: string; checklist: string[] }>;
```

- [ ] **Step 5: Criar a migration `supabase/migrations/0007_roadmap_etapas_fixas.sql`**

```sql
-- Reestrutura study_roadmap de "semanas por perfil" para 5 etapas fixas,
-- iguais para todos os perfis (conteúdo adaptado do que já existia em
-- week_1..4 de cada perfil nas migrations 0002 e 0003).

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Preparar seu computador e executar seu primeiro modelo local.", "checklist": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste com seus próprios prompts", "Rode seu primeiro modelo local"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher o modelo certo para o seu hardware e caso de uso.", "checklist": ["Leia o capítulo de Performance por Hardware", "Compare pelo menos 2 modelos na tabela comparativa", "Escolha o modelo ideal para sua máquina"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Integrar a IA local ao seu fluxo de trabalho real.", "checklist": ["Leia o ebook recomendado para o seu perfil", "Aplique em uma tarefa real do seu dia a dia", "Documente o resultado obtido"]},
  "automacoes": {"title": "Automações", "objective": "Automatizar tarefas recorrentes com a IA local configurada.", "checklist": ["Identifique 1 tarefa repetitiva no seu fluxo", "Monte uma automação simples usando o modelo local", "Valide o resultado com 2-3 execuções"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'dev_python_aia';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Preparar seu computador e executar seu primeiro modelo local.", "checklist": ["Leia cap 1-2 do Ebook LLM Local", "Instale Ollama e teste a API HTTP local", "Rode seu primeiro modelo local"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher o modelo certo para o seu hardware e caso de uso.", "checklist": ["Leia o capítulo de Performance por Hardware", "Compare pelo menos 2 modelos na tabela comparativa", "Escolha o modelo ideal para sua máquina"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Integrar a IA local ao seu fluxo de trabalho real.", "checklist": ["Leia o Ebook MCP: Integrações Avançadas", "Chame o LLM local a partir de uma rota Next.js/Node", "Documente o endpoint criado"]},
  "automacoes": {"title": "Automações", "objective": "Automatizar tarefas recorrentes com a IA local configurada.", "checklist": ["Implemente um servidor MCP simples", "Conecte a um agente de IA", "Valide 1 ferramenta MCP funcional"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'dev_nodejs_web';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Preparar seu computador e executar seu primeiro modelo local.", "checklist": ["Leia cap 5 do Ebook LLM Local (Performance por Hardware)", "Instale Ollama em um servidor de teste", "Rode seu primeiro modelo local em rede interna"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher o modelo certo para o seu hardware e caso de uso.", "checklist": ["Leia o capítulo de Performance por Hardware", "Compare pelo menos 2 modelos na tabela comparativa", "Escolha o modelo ideal para o servidor"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Integrar a IA local ao seu fluxo de trabalho real.", "checklist": ["Leia o Ebook LLM no Seu Servidor", "Containerize o setup (Docker)", "Documente o setup reproduzível"]},
  "automacoes": {"title": "Automações", "objective": "Automatizar tarefas recorrentes com a IA local configurada.", "checklist": ["Configure logs e métricas básicas de uso", "Teste sob carga simulada", "Documente runbook de operação"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'devops_infra';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Entender o que é uma IA local e se faz sentido para sua empresa.", "checklist": ["Leia Cap 0 e 1 do Ebook LLM Local", "Leia Cap 5: Performance por Hardware (visão de custo)", "Avalie se faz sentido para sua empresa"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Entender o custo-benefício dos modelos disponíveis.", "checklist": ["Leia a tabela comparativa de modelos", "Identifique o modelo com melhor custo-benefício", "Estime o investimento necessário"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Aplicar IA local a um processo financeiro real.", "checklist": ["Leia o Ebook CEO + IA: Decisões Financeiras", "Identifique 1 processo financeiro que poderia usar IA", "Mapeie 1 caso de uso"]},
  "automacoes": {"title": "Automações", "objective": "Avaliar viabilidade e definir plano de ação.", "checklist": ["Converse com seu time técnico sobre viabilidade", "Estime custo vs. benefício do caso mapeado", "Defina próximos passos com o time"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'ceo_financeiro';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Entender as capacidades reais de LLMs locais.", "checklist": ["Leia Cap 1-3 do Ebook LLM Local", "Teste um modelo local você mesmo", "Anote o que é possível fazer hoje"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher modelos adequados para casos de produto.", "checklist": ["Leia a tabela comparativa de modelos", "Compare 2 modelos para diferentes casos de uso", "Registre as diferenças observadas"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Organizar conhecimento e aplicar ao roadmap do produto.", "checklist": ["Leia o Ebook NotebookLM + Obsidian", "Organize uma base de conhecimento do seu produto", "Mapeie onde IA local poderia entrar no produto"]},
  "automacoes": {"title": "Automações", "objective": "Validar e comunicar 1 feature candidata.", "checklist": ["Valide a ideia com o time técnico", "Prepare um resumo executivo do caso de uso", "Documente a proposta"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'pm_product';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Ter um ambiente de testes funcionando sem custo recorrente.", "checklist": ["Leia Cap 1-2 e 6 do Ebook LLM Local (setup + hardware por budget)", "Rode seu primeiro LLM local", "Confirme o ambiente sem custo recorrente"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher um modelo leve o suficiente para prototipagem rápida.", "checklist": ["Leia a tabela comparativa de modelos", "Escolha um modelo leve para prototipagem", "Teste a latência de resposta"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Montar e validar um protótipo funcional.", "checklist": ["Leia o Ebook Harness + PTC: Automação", "Monte um protótipo simples usando o LLM local", "Teste o protótipo com 3-5 pessoas"]},
  "automacoes": {"title": "Automações", "objective": "Decidir o próximo passo com base no aprendizado validado.", "checklist": ["Ajuste o protótipo com base no feedback", "Decida se vale migrar para produção ou API paga", "Documente a decisão tomada"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'founder_builder';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Entender o que a IA faz bem e o que ela não faz.", "checklist": ["Leia os capítulos 0 e 1 do ebook (sem pressa, são introdutórios)", "Experimente uma IA gratuita com tarefas do seu dia", "Anote o que mais te surpreendeu"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Ver uma IA rodando no seu próprio computador.", "checklist": ["Leia o capítulo de setup passo a passo", "Instale o LM Studio e teste um modelo pequeno", "Rode seu primeiro modelo local"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Criar um sistema seu para organizar o que aprende.", "checklist": ["Leia o ebook NotebookLM + Obsidian", "Crie seu primeiro caderno de anotações com IA", "Guarde 1 aprendizado importante"]},
  "automacoes": {"title": "Automações", "objective": "Consolidar o aprendizado e definir o próximo passo.", "checklist": ["Revise o que mais te interessou até aqui", "Refaça o quiz de validação para consolidar", "Escolha qual trilha seguir a partir daqui"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'estudante_curioso';

update profiles set study_roadmap = '{
  "fundacao_local": {"title": "Fundação Local", "objective": "Decidir conscientemente qual IA usar (e quanto pagar, se pagar).", "checklist": ["Leia os capítulos 0 e 1 do ebook", "Compare o que você usa hoje com opções gratuitas e pagas", "Anote sua decisão"]},
  "modelos_performance": {"title": "Modelos e Performance", "objective": "Escolher um modelo local sem precisar usar terminal.", "checklist": ["Leia o capítulo de setup com LM Studio (sem terminal)", "Instale e teste um modelo local", "Confirme que está funcionando"]},
  "fluxo_trabalho": {"title": "Fluxo de Trabalho", "objective": "Acelerar 1 tarefa recorrente do seu trabalho com IA.", "checklist": ["Leia o ebook NotebookLM + Obsidian", "Monte um fluxo de anotações e resumos com IA", "Aplique em 1 tarefa recorrente"]},
  "automacoes": {"title": "Automações", "objective": "Ter uma rotina com IA funcionando no dia a dia.", "checklist": ["Aplique o fluxo em mais uma área do trabalho", "Meça o tempo economizado", "Documente a rotina criada"]},
  "missao_final": {"title": "Missão Final", "objective": "Validar seu conhecimento e desbloquear seu certificado verificável.", "checklist": ["Complete o Quiz de Validação", "Atinja 70% de acerto ou mais", "Gere seu certificado verificável"]}
}'::jsonb
where id = 'profissional_produtividade';
```

- [ ] **Step 6: Aplicar a migration localmente (se houver ambiente Supabase local/CLI configurado)**

Run: `npx supabase db push` (ou o comando equivalente já usado no projeto para aplicar migrations — verificar `package.json`/README do Supabase local antes de rodar; se não houver Supabase CLI configurado neste ambiente, pular este step e registrar como concern no report, já que a migration ainda assim fica commitada e correta para aplicação manual/CI).

- [ ] **Step 7: Rodar testes e build**

Run: `npm run test && npx tsc --noEmit`
Expected: `roadmap-stages.test.ts` passa; `tsc` não acusa erro no novo tipo de `study_roadmap` em `src/types/index.ts` (verificar se `RoadmapCard.tsx`, ainda não reescrito nesta task, quebra o build — se quebrar por causa do tipo antigo `items`, é esperado e será corrigido na Task C3; não alterar `RoadmapCard.tsx` nesta task).

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0007_roadmap_etapas_fixas.sql src/types/index.ts src/data/roadmap-stages.ts src/data/roadmap-stages.test.ts
git commit -m "feat: migration e tipos para etapas fixas do roadmap (Fundação Local a Missão Final)"
```

---

### Task C2: Tabela `roadmap_progress` + rota `POST /api/roadmap/complete` (TDD)

**Files:**
- Create: `supabase/migrations/0008_roadmap_progress.sql`
- Create: `src/app/api/roadmap/complete/route.ts`
- Test: `src/app/api/roadmap/complete/route.test.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient()` de `@/lib/supabase/server` (padrão já usado em `src/app/api/quiz/route.ts`).
- Produces: rota `POST /api/roadmap/complete` — body `{ token: string; stageKey: string }`, resposta `{ ok: true }` (201) ou `{ error: string }` (400/404). Consumida pela Task C3 (`RoadmapCard`, via `fetch`).

- [ ] **Step 1: Criar a migration `0008_roadmap_progress.sql`**

```sql
create table if not exists roadmap_progress (
  token text not null references tokens(token),
  stage_key text not null,
  completed_at timestamptz not null default now(),
  primary key (token, stage_key)
);
```

- [ ] **Step 2: Adicionar o tipo da tabela em `src/types/index.ts`**

Adicionar dentro de `Database["public"]["Tables"]` (mesmo padrão das tabelas existentes, ex. `quiz_responses`):

```ts
      roadmap_progress: {
        Row: {
          token: string;
          stage_key: string;
          completed_at: string;
        };
        Insert: {
          token: string;
          stage_key: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roadmap_progress"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 3: Escrever o teste da rota (seguindo o padrão de `src/app/api/quiz/route.test.ts`)**

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

function buildSupabaseMock(tokenRow: Record<string, unknown> | null) {
  const inserted: Record<string, unknown>[] = [];

  const from = (table: string) => {
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
        }),
      };
    }
    if (table === "roadmap_progress") {
      return {
        upsert: async (row: Record<string, unknown>) => {
          inserted.push(row);
          return { data: null, error: null };
        },
      };
    }
    if (table === "purchases") {
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: { user_id: "user-1" }, error: null }),
          }),
        }),
      };
    }
    if (table === "xp_events") {
      return {
        insert: async (row: unknown) => {
          inserted.push({ __xp: row });
          return { data: null, error: null };
        },
      };
    }
    throw new Error(`tabela não mockada: ${table}`);
  };

  return { from, inserted };
}

let mockSupabase: ReturnType<typeof buildSupabaseMock>;
vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: () => mockSupabase,
}));

import { POST } from "./route";

describe("POST /api/roadmap/complete", () => {
  beforeEach(() => {
    mockSupabase = buildSupabaseMock({ token: "ABC123", purchase_id: "purchase-1" });
  });

  it("rejeita payload sem token ou stageKey", async () => {
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retorna 404 quando o token não existe", async () => {
    mockSupabase = buildSupabaseMock(null);
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "NAOEXISTE", stageKey: "fundacao_local" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("marca a etapa como concluída e concede XP", async () => {
    const req = new NextRequest("http://localhost/api/roadmap/complete", {
      method: "POST",
      body: JSON.stringify({ token: "ABC123", stageKey: "fundacao_local" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(mockSupabase.inserted).toContainEqual({
      token: "ABC123",
      stage_key: "fundacao_local",
    });
    expect(
      mockSupabase.inserted.some(
        (row) => (row as { __xp?: { action_type: string } }).__xp?.action_type === "roadmap"
      )
    ).toBe(true);
  });
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npx vitest run src/app/api/roadmap/complete/route.test.ts`
Expected: FAIL — `./route` não existe.

- [ ] **Step 5: Adicionar `"roadmap"` ao `XpActionType` em `src/types/index.ts`**

Trocar (linha 2):

```ts
export type XpActionType = "compra" | "triagem" | "download" | "validacao" | "conteudo";
```

por:

```ts
export type XpActionType = "compra" | "triagem" | "download" | "validacao" | "conteudo" | "roadmap";
```

- [ ] **Step 6: Criar `src/app/api/roadmap/complete/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const stageKey = body?.stageKey as string | undefined;

  if (!token || !stageKey) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  await supabase.from("roadmap_progress").upsert({ token, stage_key: stageKey });

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (purchase) {
    await supabase.from("xp_events").insert({
      user_id: purchase.user_id,
      xp_amount: 50,
      action_type: "roadmap",
      reference_id: `${token}:${stageKey}`,
    });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `npx vitest run src/app/api/roadmap/complete/route.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 8: Rodar suíte completa**

Run: `npm run test`
Expected: todos os arquivos passam.

- [ ] **Step 9: Commit**

```bash
git add supabase/migrations/0008_roadmap_progress.sql src/app/api/roadmap/complete/route.ts src/app/api/roadmap/complete/route.test.ts src/types/index.ts
git commit -m "feat: tabela roadmap_progress e rota para concluir etapas com XP"
```

---

### Task C3: `roadmap-progress.ts` (lógica pura, TDD) + `RoadmapCard` reescrito

**Files:**
- Create: `src/lib/roadmap-progress.ts`
- Test: `src/lib/roadmap-progress.test.ts`
- Modify: `src/components/dashboard/RoadmapCard.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Consumes: `ROADMAP_STAGE_KEYS`, `RoadmapStageKey` de `@/data/roadmap-stages` (Task C1).
- Produces: `deriveRoadmapView(completedStages: string[]): { activeIndex: number; currentStageNumber: number; progressPercent: number; statusFor: (key: RoadmapStageKey) => "done" | "active" | "locked" }` — usado por `RoadmapCard.tsx`. `<RoadmapCard roadmap={RoadmapStages} completedStages={string[]} token={string} />` (client component — `"use client"` porque tem botão interativo que chama `fetch`). Nenhum teste desta task renderiza componentes React — o projeto não usa `@testing-library/react` (Vitest roda em `environment: "node"`, ver `vitest.config.ts:7`); a cobertura fica na função pura, seguindo o mesmo padrão de `src/lib/quiz-scoring.ts` e `src/lib/annual-spend.ts`.

- [ ] **Step 1: Escrever o teste da função pura**

```ts
import { describe, expect, it } from "vitest";
import { deriveRoadmapView } from "@/lib/roadmap-progress";

describe("deriveRoadmapView", () => {
  it("etapa 1 de 5 quando nada foi concluído", () => {
    const view = deriveRoadmapView([]);
    expect(view.currentStageNumber).toBe(1);
    expect(view.progressPercent).toBe(0);
  });

  it("avança a etapa ativa conforme conclusões", () => {
    const view = deriveRoadmapView(["fundacao_local"]);
    expect(view.currentStageNumber).toBe(2);
    expect(view.progressPercent).toBe(20);
  });

  it("classifica cada etapa como done, active ou locked", () => {
    const view = deriveRoadmapView(["fundacao_local"]);
    expect(view.statusFor("fundacao_local")).toBe("done");
    expect(view.statusFor("modelos_performance")).toBe("active");
    expect(view.statusFor("fluxo_trabalho")).toBe("locked");
  });

  it("quando todas concluídas, etapa 5 de 5 e 100%", () => {
    const view = deriveRoadmapView([
      "fundacao_local",
      "modelos_performance",
      "fluxo_trabalho",
      "automacoes",
      "missao_final",
    ]);
    expect(view.currentStageNumber).toBe(5);
    expect(view.progressPercent).toBe(100);
    expect(view.statusFor("missao_final")).toBe("done");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/lib/roadmap-progress.test.ts`
Expected: FAIL — módulo `@/lib/roadmap-progress` não existe.

- [ ] **Step 3: Criar `src/lib/roadmap-progress.ts`**

```ts
import { ROADMAP_STAGE_KEYS, type RoadmapStageKey } from "@/data/roadmap-stages";

export interface RoadmapView {
  activeIndex: number;
  currentStageNumber: number;
  progressPercent: number;
  statusFor: (key: RoadmapStageKey) => "done" | "active" | "locked";
}

export function deriveRoadmapView(completedStages: string[]): RoadmapView {
  const activeIndex = ROADMAP_STAGE_KEYS.findIndex((key) => !completedStages.includes(key));
  const currentStageNumber = activeIndex === -1 ? ROADMAP_STAGE_KEYS.length : activeIndex + 1;
  const progressPercent = Math.round(
    (completedStages.length / ROADMAP_STAGE_KEYS.length) * 100
  );

  const statusFor = (key: RoadmapStageKey): "done" | "active" | "locked" => {
    if (completedStages.includes(key)) return "done";
    const keyIndex = ROADMAP_STAGE_KEYS.indexOf(key);
    return keyIndex === activeIndex ? "active" : "locked";
  };

  return { activeIndex, currentStageNumber, progressPercent, statusFor };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/lib/roadmap-progress.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Reescrever `RoadmapCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS, type RoadmapStages } from "@/data/roadmap-stages";
import { deriveRoadmapView } from "@/lib/roadmap-progress";

interface Props {
  roadmap: RoadmapStages;
  completedStages: string[];
  token: string;
}

export default function RoadmapCard({ roadmap, completedStages, token }: Props) {
  const [completed, setCompleted] = useState(completedStages);
  const [submitting, setSubmitting] = useState(false);

  const view = deriveRoadmapView(completed);

  const handleComplete = async (stageKey: string) => {
    setSubmitting(true);
    const response = await fetch("/api/roadmap/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, stageKey }),
    });
    setSubmitting(false);
    if (response.ok) {
      setCompleted((prev) => [...prev, stageKey]);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-zinc-900">Sua Trilha Recomendada</h2>
      <p className="mb-1 text-sm text-zinc-500">
        Etapa {view.currentStageNumber} de {ROADMAP_STAGE_KEYS.length}
      </p>
      <div className="mb-6 h-2 w-full rounded-full bg-zinc-200">
        <div
          className="h-2 rounded-full bg-violet-600 transition-all"
          style={{ width: `${view.progressPercent}%` }}
        />
      </div>

      <div className="space-y-3">
        {ROADMAP_STAGE_KEYS.map((key) => {
          const stage = roadmap[key];
          const label = ROADMAP_STAGE_LABELS[key];
          const status = view.statusFor(key);

          if (status === "done") {
            return (
              <div key={key} className="border-l-4 border-emerald-400 pl-4 py-2">
                <h3 className="font-semibold text-zinc-900">✓ {label}</h3>
              </div>
            );
          }

          if (status === "active") {
            return (
              <div key={key} className="border-l-4 border-violet-500 bg-violet-50 pl-4 py-4 rounded-r-xl">
                <h3 className="font-semibold text-zinc-900">{label}</h3>
                <p className="mt-1 text-sm text-zinc-600">{stage.objective}</p>
                <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                  {stage.checklist.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleComplete(key)}
                  disabled={submitting}
                  className="mt-4 rounded-xl bg-violet-600 px-5 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Concluir Etapa"}
                </button>
              </div>
            );
          }

          return (
            <div key={key} className="border-l-4 border-zinc-200 pl-4 py-2 text-zinc-400">
              <h3 className="font-semibold">🔒 {label}</h3>
              <p className="mt-1 text-sm">Disponível após concluir a etapa anterior.</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rodar e ver passar (suíte de `roadmap-progress`, já coberta nos steps 1-4)**

Run: `npx tsc --noEmit`
Expected: sem erros — `RoadmapCard.tsx` compila usando `deriveRoadmapView` corretamente tipado.

- [ ] **Step 7: Atualizar `src/app/dashboard/[token]/page.tsx` para buscar `completedStages` e passar `token`**

Adicionar, logo após a busca de `purchase` (após a linha que hoje calcula `totalXp`):

```tsx
  const { data: progressRows } = await supabase
    .from("roadmap_progress")
    .select("stage_key")
    .eq("token", params.token);

  const completedStages = (progressRows ?? []).map((row: { stage_key: string }) => row.stage_key);
```

E trocar a linha `<RoadmapCard roadmap={profile.study_roadmap} />` por:

```tsx
        <RoadmapCard
          roadmap={profile.study_roadmap as RoadmapStages}
          completedStages={completedStages}
          token={params.token}
        />
```

Adicionar o import necessário no topo do arquivo:

```tsx
import type { RoadmapStages } from "@/data/roadmap-stages";
```

- [ ] **Step 8: Rodar suíte completa e build**

Run: `npm run test && npm run build`
Expected: todos os testes passam; build sem erros de tipo.

- [ ] **Step 9: Verificar visualmente**

Run: dev server, abrir `/dashboard/[token]` com um token de teste triado.
Expected: bloco "Sua Trilha Recomendada" com barra de progresso "Etapa X de 5"; etapas concluídas com ✓; etapa ativa com objetivo + checklist + botão "Concluir Etapa"; etapas futuras com 🔒 e texto de bloqueio, sem detalhes; ao clicar "Concluir Etapa", a etapa seguinte desbloqueia sem reload da página.

- [ ] **Step 10: Commit**

```bash
git add src/lib/roadmap-progress.ts src/lib/roadmap-progress.test.ts src/components/dashboard/RoadmapCard.tsx "src/app/dashboard/[token]/page.tsx"
git commit -m "feat: RoadmapCard com etapas bloqueadas, progresso real e Missão Final"
```

---

## Verificação final (todas as frentes)

- [ ] **Step 1: Rodar suíte completa**

Run: `npm run test`
Expected: todos os arquivos passam (contando os novos: `quiz-triagem.test.ts` atualizado, `roadmap-stages.test.ts`, `route.test.ts` do roadmap, `RoadmapCard.test.tsx`).

- [ ] **Step 2: Build de produção**

Run: `STRIPE_SECRET_KEY=sk_test_dummy npm run build`
Expected: build passa, lista todas as rotas incluindo a nova `/api/roadmap/complete`.

- [ ] **Step 3: Verificação end-to-end no navegador**

Percorrer `/` inteira (hero com palavra rotativa, oportunidade, sistema com fotos, jornada glassmorphism, preço reformulado, FAQ, closing, footer); depois `/quiz/[token]` (7 perguntas, sem ramificação, linguagem de Diagnóstico Inicial) até `/dashboard/[token]` (Sua Trilha Recomendada + Roadmap com etapas bloqueadas, concluir a etapa 1 e confirmar desbloqueio real da etapa 2). Confirmar que `/oferta` não mudou.

- [ ] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "style: ajustes finos pós-verificação end-to-end"
```
