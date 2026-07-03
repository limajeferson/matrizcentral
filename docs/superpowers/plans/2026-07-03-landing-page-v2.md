# Landing Page v2 (a partir do modelo guia) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enriquecer a landing page do Matriz Central com as seções do modelo guia (`landing-clone.html`) — demo widget com abas, seção de vantagens com gráfico, cards de feature com visual, CTA final — mantendo violeta como cor primária e sem conteúdo fabricado (depoimentos/logos/comparações de concorrente falsos).

**Architecture:** Componentes novos em `src/components/marketing/`, reaproveitando `GlassCard`/`CategoryBadge` já existentes. Sem lógica de negócio nova — só JSX/CSS e um componente client mínimo (abas do demo widget).

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, componentes já existentes de `src/components/ui/`.

## Global Constraints

- Cor primária: violeta (`violet-600`), não o verde-menta do modelo guia.
- Sem "confiado por" com logos de empresas reais, sem depoimentos fabricados com nomes
  de empresas reais, sem comparação de concorrente fabricada.
- Preço real: R$47 pagamento único (já implementado em `PricingSection.tsx` — não
  precisa de nova tarefa para isso).
- Demo widget mostra o produto real (Quiz de Perfil / Roadmap / Ebook), não um "AI
  Voice Tutor" fictício.
- Especificação completa: `docs/superpowers/specs/2026-07-03-landing-page-v2-design.md`.
- Arquivo de referência visual: `landing-clone.html` (na raiz do projeto).

---

## Task 1: `DemoWidget` — abas do produto real + wiring no Hero

**Files:**
- Create: `src/components/marketing/DemoWidget.tsx`
- Modify: `src/components/marketing/Hero.tsx`

**Interfaces:**
- Produces: `DemoWidget(): JSX.Element` (client component, sem props) — usado só pelo
  `Hero.tsx` nesta fase.

- [ ] **Step 1: Criar o componente `DemoWidget`**

Create `src/components/marketing/DemoWidget.tsx`:
```tsx
"use client";

import { useState } from "react";

const TABS = [
  { id: "quiz", label: "Quiz de Perfil" },
  { id: "roadmap", label: "Roadmap" },
  { id: "ebook", label: "Ebook" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DemoWidget() {
  const [active, setActive] = useState<TabId>("quiz");

  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-left">
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              active === tab.id
                ? "bg-violet-600 text-white"
                : "border border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        {active === "quiz" && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Questão 3 de 20
            </p>
            <div className="mb-4 h-1.5 w-full rounded-full bg-zinc-100">
              <div className="h-1.5 w-[15%] rounded-full bg-violet-600" />
            </div>
            <p className="mb-4 font-semibold text-zinc-900">
              Qual é sua principal linguagem de programação?
            </p>
            <div className="space-y-2">
              {["Python", "JavaScript/TypeScript", "Go/Rust", "Não programo"].map(
                (option) => (
                  <div
                    key={option}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600"
                  >
                    {option}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {active === "roadmap" && (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Seu roadmap — semana 1
            </p>
            <div className="rounded-xl border-l-4 border-violet-400 bg-violet-50 p-4">
              <p className="font-semibold text-zinc-900">Fundação: Setup Local</p>
              <p className="text-sm text-zinc-600">
                Leia cap. 1-2, instale o Ollama e teste seus próprios prompts.
              </p>
            </div>
            <div className="rounded-xl border-l-4 border-zinc-200 p-4">
              <p className="font-semibold text-zinc-400">Semana 2 — bloqueada</p>
              <p className="text-sm text-zinc-400">
                Libera após concluir a semana 1.
              </p>
            </div>
          </div>
        )}

        {active === "ebook" && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Construa Seu Próprio ChatGPT Particular
            </p>
            <p className="mb-4 text-sm text-zinc-600">
              9 capítulos: da escolha do modelo ao troubleshooting real de
              hardware. Sem enrolação.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                ✓
              </span>
              120+ páginas de conteúdo técnico
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Inserir o `DemoWidget` no `Hero.tsx`**

Em `src/components/marketing/Hero.tsx`, adicione o import no topo:
```tsx
import DemoWidget from "@/components/marketing/DemoWidget";
```

Substitua o final do JSX (o `<p>` de "Pare de Pagar..." seguido do fechamento da
seção) por:
```tsx
      <p className="mt-4 text-sm text-zinc-500">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>

      <DemoWidget />
    </section>
  );
}
```

(mantenha todo o resto do arquivo — `useState`, `handleCheckout`, o formulário de
e-mail e o `id="hero"` na section — inalterados).

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/DemoWidget.tsx src/components/marketing/Hero.tsx
git commit -m "feat: demo widget com abas Quiz/Roadmap/Ebook no hero da landing"
```

---

## Task 2: `AdvantagesSection` — gráfico de XP + 3 benefícios

**Files:**
- Create: `src/components/marketing/AdvantagesSection.tsx`

**Interfaces:**
- Produces: `AdvantagesSection(): JSX.Element` (Server Component, sem props) — usado
  pela Task 6 (`page.tsx`).

- [ ] **Step 1: Criar o componente**

Create `src/components/marketing/AdvantagesSection.tsx`:
```tsx
export default function AdvantagesSection() {
  return (
    <section className="border-y border-zinc-100 bg-zinc-50 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-violet-600">
            Seus resultados
          </span>
          <h2 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            Seu XP cresce a cada semana de estudo real
          </h2>
        </div>
        <p className="text-sm text-zinc-600">
          Cada ebook concluído e cada quiz aprovado somam XP. O roadmap
          personalizado evita que você estude o que já domina — foco só no
          que ainda falta.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <svg viewBox="0 0 800 220" width="100%" preserveAspectRatio="none" className="block">
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15 L800 220 L0 220 Z"
              fill="url(#xpFill)"
            />
            <path
              d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
            />
          </svg>

          <div className="mt-6 grid gap-6 border-t border-zinc-100 pt-6 sm:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold text-zinc-900">Roadmap sob medida</p>
              <p className="text-sm text-zinc-600">
                Sequência definida pelo seu perfil, sem revisitar o que já sabe.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-zinc-900">Validação real</p>
              <p className="text-sm text-zinc-600">
                Quiz de 15 questões com 70% mínimo libera o certificado.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-zinc-900">Progresso visível</p>
              <p className="text-sm text-zinc-600">
                XP acumulado no dashboard a cada etapa concluída.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Note: este gráfico é puramente ilustrativo (uma curva de crescimento genérica) — não
representa dados reais de nenhum usuário nem faz comparação com concorrentes. Não
adicione nenhum texto que implique comparação ("vs. concorrente", "melhor que X").

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/AdvantagesSection.tsx
git commit -m "feat: seção de vantagens com gráfico ilustrativo de XP"
```

---

## Task 3: `FeaturesGrid` — adicionar visual por card

**Files:**
- Modify: `src/components/marketing/FeaturesGrid.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `GlassCard` (`src/components/ui/glass-card.tsx`), `CategoryBadge`
  (`src/components/ui/category-badge.tsx`) — já existentes, mesmas assinaturas de
  antes.
- Produces: nenhuma interface nova — `FeaturesGrid()` continua sem props, usado por
  `page.tsx` (Task 6) como já era usado antes.

- [ ] **Step 1: Reescrever o arquivo com um bloco visual por card**

Replace o conteúdo de `src/components/marketing/FeaturesGrid.tsx`:
```tsx
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

const FEATURES: {
  title: string;
  description: string;
  variant: "ebook" | "quiz" | "roadmap" | "xp";
  icon: string;
}[] = [
  {
    title: "Quiz de Perfil",
    description:
      "Poucos minutos para mapear sua stack, nível e objetivos. Sem generalização — seu ponto de partida real.",
    variant: "roadmap",
    icon: "🧭",
  },
  {
    title: "Roadmap Personalizado",
    description:
      "Sequência de estudo pensada para o seu perfil. Sem revisitar o que já domina, sem pular o que ainda falta.",
    variant: "roadmap",
    icon: "🗺️",
  },
  {
    title: "Sistema de XP",
    description:
      "Ganhe XP a cada ebook concluído e a cada validação de conhecimento aprovada.",
    variant: "xp",
    icon: "⭐",
  },
  {
    title: "Ebook Técnico",
    description:
      "Conteúdo direto sobre rodar LLMs localmente — hardware, ferramentas e troubleshooting real.",
    variant: "ebook",
    icon: "📘",
  },
  {
    title: "Quiz de Validação",
    description:
      "15 perguntas com dica sempre visível. Aprovação a partir de 70% libera seu certificado.",
    variant: "quiz",
    icon: "✅",
  },
  {
    title: "Certificado Verificável",
    description:
      "Certificado com QR code, verificável publicamente em matrizcentral.com.br/verify.",
    variant: "xp",
    icon: "🎓",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-violet-600">
          Plataforma
        </span>
        <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          Um sistema, não um ebook solto.
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <GlassCard key={feature.title} className="overflow-hidden p-0">
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-violet-50 to-violet-100 text-4xl">
              {feature.icon}
            </div>
            <div className="p-6">
              <CategoryBadge variant={feature.variant} className="mb-3">
                {feature.title}
              </CategoryBadge>
              <p className="text-sm text-zinc-600">{feature.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/FeaturesGrid.tsx
git commit -m "feat: adiciona visual (ícone em gradiente) a cada card de feature"
```

---

## Task 4: `FinalCta` — banner de CTA final

**Files:**
- Create: `src/components/marketing/FinalCta.tsx`

**Interfaces:**
- Produces: `FinalCta(): JSX.Element` (Server Component, sem props) — usado pela
  Task 6 (`page.tsx`).

- [ ] **Step 1: Criar o componente**

Create `src/components/marketing/FinalCta.tsx`:
```tsx
export default function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl bg-zinc-900 px-10 py-14 text-center text-white">
        <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
          Comece Sua Trilha de Estudo Hoje
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm text-zinc-400">
          Descubra seu perfil, siga um roadmap sob medida e valide o que
          aprendeu com um certificado verificável.
        </p>
        <a
          href="#hero"
          className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-bold text-white transition hover:bg-violet-700"
        >
          Quero por R$47
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/FinalCta.tsx
git commit -m "feat: banner de CTA final da landing page"
```

---

## Task 5: `Footer` — adicionar nav de links reais

**Files:**
- Modify: `src/components/marketing/Footer.tsx` (arquivo inteiro)

**Interfaces:**
- Produces: nenhuma interface nova — `Footer()` continua sem props.

- [ ] **Step 1: Reescrever o arquivo com a nav**

Replace o conteúdo de `src/components/marketing/Footer.tsx`:
```tsx
export default function Footer() {
  return (
    <footer className="bg-zinc-900 px-6 py-12 text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-lg font-bold text-white">Matriz Central</p>
          <p className="max-w-md text-sm">
            Conteúdo técnico sobre IA e DevTools, sem enrolação. Roadmap
            personalizado para devs, DevOps, gestores e founders brasileiros.
          </p>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#preco" className="transition hover:text-white">
            Preço
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-zinc-500">
        © {new Date().getFullYear()} Matriz Central. Todos os direitos
        reservados.
      </p>
    </footer>
  );
}
```

Note: só dois links (`#features`, `#preco`) — são âncoras que já existem na própria
página (`FeaturesGrid` tem `id="features"`, `PricingSection` tem `id="preco"`). Não
adicione links para páginas que não existem (ex: `/blog`, `/sobre`, `/privacidade`).

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/Footer.tsx
git commit -m "feat: adiciona nav de links reais ao footer"
```

---

## Task 6: Compor a página final

**Files:**
- Modify: `src/app/(marketing)/page.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `Header` (já existe), `Hero` (Task 1), `AdvantagesSection` (Task 2),
  `FeaturesGrid` (Task 3), `PricingSection` (já existe, sem mudanças nesta fase),
  `FinalCta` (Task 4), `Footer` (Task 5) — todos default-exportados sem props.

- [ ] **Step 1: Reescrever `page.tsx` com a nova ordem de seções**

Replace o conteúdo de `src/app/(marketing)/page.tsx`:
```tsx
import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import AdvantagesSection from "@/components/marketing/AdvantagesSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCta from "@/components/marketing/FinalCta";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <AdvantagesSection />
      <FeaturesGrid />
      <PricingSection />
      <FinalCta />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verificar que compila e a suíte de testes continua passando**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npx vitest run`
Expected: 18/18 passando (nenhuma lógica de negócio mudou nesta fase).

- [ ] **Step 3: Verificar visualmente**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` (com o dev
server já rodando)
Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/page.tsx"
git commit -m "feat: compõe a landing page v2 com todas as novas seções"
```

---

## Verificação final manual (não automatizada)

1. `npm run dev`
2. Abrir `/` no navegador — confirmar: hero com demo widget (trocar as 3 abas),
   seção de vantagens com o gráfico, grid de features com ícones, pricing violeta,
   CTA final escuro, footer com os 2 links funcionando (rolam até a seção certa)
3. Confirmar que não há nenhum nome de empresa real, depoimento fabricado, ou
   comparação de concorrente em nenhuma seção
