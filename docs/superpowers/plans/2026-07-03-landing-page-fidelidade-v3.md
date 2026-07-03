# Landing Page — Ajustes de Fidelidade ao Modelo Guia (v3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os gaps de fidelidade visual encontrados numa auditoria comparando a landing page atual (`src/app/(marketing)/`) com o modelo guia (`landing-clone.html`): demo widget estreito demais, footer com peso visual invertido (mais pesado que o CTA final), e fundo com tom creme em vez de branco puro nas seções que o modelo mostra brancas.

**Architecture:** Mudanças pontuais em componentes já existentes (`Hero.tsx`, `DemoWidget.tsx`, `Footer.tsx`) e no layout da rota de marketing (`layout.tsx`). Sem componentes novos, sem lógica de negócio nova — só JSX/CSS.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS.

## Global Constraints

- Cor primária: violeta (`violet-600`), não o verde-menta do modelo guia (decisão já aplicada, mantida).
- Sem depoimentos fabricados, sem logos de empresas reais, sem comparação de concorrente fabricada (decisões já aplicadas, mantidas).
- A seção "What Our Users Are Saying" do modelo guia fica **conscientemente omitida** (decisão desta sessão — ver Task 4), não é lacuna esquecida.
- Arquivo de referência visual: `landing-clone.html` (na raiz do projeto).
- Auditoria completa que originou este plano: comparação de screenshots full-page entre `http://localhost:3000/` e `landing-clone.html` renderizados a 1280px de largura, nesta sessão.

---

## Task 1: `DemoWidget` — largura total do container + painel de progresso real à direita

**Files:**
- Modify: `src/components/marketing/DemoWidget.tsx` (arquivo inteiro)
- Modify: `src/components/marketing/Hero.tsx` (arquivo inteiro)

**Interfaces:**
- Produces: `DemoWidget(): JSX.Element` (client component, sem props) — mesma assinatura de antes, usado só pelo `Hero.tsx`.

**Contexto do gap:** no modelo guia, o demo widget ocupa a largura cheia do container (1120px), em grid de duas colunas (`1.4fr 1fr`) — a coluna da direita mostra um card ilustrativo do "voice tutor". Na landing atual, o `DemoWidget` está limitado a `max-w-2xl` (672px), centralizado, sem a segunda coluna — fica visualmente menor e mais discreto do que no modelo. Como não temos "voice tutor" (produto real é quiz/roadmap/ebook), a coluna da direita vira um preview real de progresso (XP + streak), não uma reinterpretação de recurso que não existe.

- [ ] **Step 1: Reescrever `DemoWidget.tsx` com largura cheia e segunda coluna de progresso**

Replace o conteúdo de `src/components/marketing/DemoWidget.tsx`:
```tsx
"use client";

import { useState } from "react";

const TABS = [
  { id: "quiz", label: "Quiz de Perfil" },
  { id: "roadmap", label: "Roadmap" },
  { id: "ebook", label: "Ebook" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ProgressPreview() {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.62;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-violet-100 p-6">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#ede9fe" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-zinc-900">340</span>
          <span className="font-marketing-mono text-[10px] uppercase tracking-wide text-zinc-500">
            XP
          </span>
        </div>
      </div>
      <p className="font-marketing-mono text-[11px] uppercase tracking-wide text-violet-700">
        🔥 5 dias seguidos
      </p>
    </div>
  );
}

export default function DemoWidget() {
  const [active, setActive] = useState<TabId>("quiz");

  return (
    <div className="mt-11 w-full rounded-[20px] border border-zinc-200 bg-zinc-50 p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex flex-wrap gap-2 font-marketing-mono">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-wide transition ${
              active === tab.id
                ? "border border-zinc-900 bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          {active === "quiz" && (
            <div>
              <p className="mb-1 font-marketing-mono text-[11px] font-medium uppercase tracking-wide text-zinc-400">
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
              <p className="font-marketing-mono text-[11px] font-medium uppercase tracking-wide text-zinc-400">
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
              <p className="mb-2 font-marketing-mono text-[11px] font-medium uppercase tracking-wide text-zinc-400">
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

        <ProgressPreview />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Ajustar `Hero.tsx` para o texto continuar estreito enquanto o widget usa a largura cheia**

Replace o conteúdo de `src/components/marketing/Hero.tsx`:
```tsx
"use client";

import { useState } from "react";
import DemoWidget from "@/components/marketing/DemoWidget";
import Eyebrow from "@/components/marketing/Eyebrow";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email) {
      setError("Informe seu e-mail para continuar.");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setLoading(false);
      setError("Não foi possível iniciar o checkout. Tente novamente.");
      return;
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <section id="hero" className="mx-auto max-w-6xl px-6 pb-10 pt-16 text-center sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <Eyebrow className="mb-6">Para quem quer dominar IA — programando ou não</Eyebrow>
        <h1 className="mx-auto mb-5 max-w-xl text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-zinc-900">
          Construa Seu Próprio ChatGPT Particular em Poucos Minutos
        </h1>
        <p className="mx-auto mb-7 max-w-md text-[15px] text-zinc-600">
          O guia definitivo para ter sua própria IA rodando no seu computador —
          sem pagar mensalidade, sem depender da nuvem e sem precisar ser
          especialista.
        </p>

        <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-full border border-zinc-200 px-5 py-3 text-sm focus:border-violet-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Redirecionando..." : "Quero por R$47"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <p className="mt-4 text-sm text-zinc-500">
          Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
        </p>
      </div>

      <DemoWidget />
    </section>
  );
}
```

(a única mudança estrutural: o conteúdo textual entra num `<div className="mx-auto max-w-3xl">` interno, e `<DemoWidget />` sai desse `div`, ficando direto dentro da `<section>` que agora é `max-w-6xl` — assim o widget usa a largura cheia da seção, igual ao modelo guia).

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificar visualmente**

Com o dev server rodando (`npm run dev`), abrir `http://localhost:3000/` e confirmar:
- o card do demo widget ocupa a largura toda da seção (não fica mais estreito que o resto do conteúdo da página);
- a coluna da direita mostra o anel de progresso com "340 XP" e "🔥 5 dias seguidos";
- trocar as 3 abas (Quiz de Perfil / Roadmap / Ebook) continua funcionando.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/DemoWidget.tsx src/components/marketing/Hero.tsx
git commit -m "style: demo widget ocupa largura total da secao e ganha painel de progresso"
```

---

## Task 2: `Footer` — estilo leve (barra clara, não bloco escuro)

**Files:**
- Modify: `src/components/marketing/Footer.tsx` (arquivo inteiro)

**Interfaces:**
- Produces: nenhuma interface nova — `Footer()` continua sem props, mesma assinatura de antes.

**Contexto do gap:** no modelo guia o footer é uma barra clara e minimalista (fundo branco, `border-top`, uma linha com logo + nav + copyright). Na landing atual o footer é um bloco escuro cheio (`bg-zinc-900`), quase repetindo o peso visual do `FinalCta` logo acima — os dois blocos escuros seguidos criam redundância que o modelo guia não tem.

- [ ] **Step 1: Reescrever o arquivo com o estilo leve**

Replace o conteúdo de `src/components/marketing/Footer.tsx`:
```tsx
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-100 bg-white px-6 py-9">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
        <span className="text-base font-bold tracking-tight text-zinc-900">
          Matriz<span className="text-violet-500">/</span>Central
        </span>
        <nav className="flex gap-6">
          <a href="#features" className="text-zinc-600 transition hover:text-zinc-900">
            Features
          </a>
          <a href="#preco" className="text-zinc-600 transition hover:text-zinc-900">
            Preço
          </a>
        </nav>
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
```

Note: só dois links (`#features`, `#preco`) — mesmas âncoras já existentes na página, igual antes. A descrição longa que existia antes ("Conteúdo técnico sobre IA e DevTools...") sai — o modelo guia não tem parágrafo de descrição no footer, só logo + nav + copyright numa linha só.

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificar visualmente**

Abrir `http://localhost:3000/`, rolar até o final: footer deve ter fundo branco, borda superior fina, e não mais um bloco escuro cheio.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/Footer.tsx
git commit -m "style: footer com barra clara e minimalista, sem bloco escuro cheio"
```

---

## Task 3: Fundo branco puro escopado à landing (sem mexer no token global)

**Files:**
- Modify: `src/app/(marketing)/layout.tsx`

**Interfaces:**
- Produces: nenhuma — `MarketingLayout` continua com a mesma assinatura (`{ children: React.ReactNode }`).

**Contexto do gap:** `src/app/globals.css:7` define `--background: oklch(0.985 0.004 90)`, um branco levemente amarelado (creme) usado em `body` (`src/app/globals.css:76-78`) — esse token é compartilhado com o dashboard, então não deve mudar globalmente. O modelo guia usa branco puro (`--bg:#ffffff`) nas seções que não são explicitamente cinza (`--bg-soft:#f6f6f4`). A correção é um `bg-white` no wrapper da rota de marketing, que pinta por cima do fundo creme do `body` só dentro dessa subárvore — `AdvantagesSection` já tem seu próprio `bg-zinc-50` explícito (`src/components/marketing/AdvantagesSection.tsx:5`) e continua alternando corretamente por cima desse branco.

- [ ] **Step 1: Adicionar `bg-white` ao wrapper da rota de marketing**

Em `src/app/(marketing)/layout.tsx`, altere a linha do `<main>`:
```tsx
    <main className={`${hankenGrotesk.variable} ${jetBrainsMono.variable} bg-white font-marketing-sans`}>
```

(era `className={\`${hankenGrotesk.variable} ${jetBrainsMono.variable} font-marketing-sans\`}` — só adiciona `bg-white` no meio).

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Verificar visualmente**

Abrir `http://localhost:3000/` — o fundo da hero, features e pricing deve estar branco puro (não mais com tom creme), e a seção de vantagens (`AdvantagesSection`) continua com o cinza-claro dela (`bg-zinc-50`), criando a mesma alternância branco/cinza do modelo guia. Abrir também `/dashboard` (ou qualquer rota fora de `(marketing)`) e confirmar que o fundo creme do design system continua igual — nada deve mudar fora da landing.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/layout.tsx"
git commit -m "style: fundo branco puro na landing, sem alterar o token global do design system"
```

---

## Task 4: Documentar a omissão consciente da seção de depoimentos

**Files:**
- Modify: `docs/superpowers/specs/2026-07-03-landing-page-v2-design.md`

**Interfaces:** nenhuma (mudança só de documentação, sem código).

**Contexto:** o modelo guia tem uma seção inteira "What Our Users Are Saying" (testimonials) entre Pricing e o CTA final. A landing atual não tem essa seção — decisão tomada nesta sessão de manter omitida por ora (sem depoimentos reais disponíveis ainda, e a regra do projeto já proíbe fabricar depoimentos com nomes fictícios). Sem essa nota, a ausência da seção parece uma lacuna esquecida em vez de uma decisão deliberada.

- [ ] **Step 1: Adicionar a decisão ao final da seção "Decisões que adaptam o modelo guia..."**

Em `docs/superpowers/specs/2026-07-03-landing-page-v2-design.md`, após o item 7 (linha 57-58, que termina em "convite para começar o quiz/comprar o ebook."), adicione um novo item:

```
8. **Seção de depoimentos (testimonials) omitida, não adaptada.** O modelo guia tem
   uma seção inteira "What Our Users Are Saying" com dois cards de depoimento entre
   Pricing e o CTA final. Diferente das outras seções (que foram reinterpretadas com
   conteúdo real), esta foi conscientemente omitida — não existem depoimentos reais de
   usuários ainda, e fabricar nomes/citações violaria a mesma regra já aplicada nos
   itens 2 e 3 (sem logos e depoimentos fictícios). Retomar quando houver depoimentos
   reais para usar.
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-07-03-landing-page-v2-design.md
git commit -m "docs: registra omissao consciente da secao de depoimentos no spec da landing"
```

---

## Verificação final manual (não automatizada)

1. `npm run dev`
2. Abrir `/` no navegador em ~1280px de largura e comparar com `landing-clone.html` (pode abrir com `npx serve .` numa porta separada, como feito na auditoria desta sessão):
   - demo widget na hero ocupa a largura cheia da seção, com painel de progresso (XP + streak) na direita;
   - footer é uma barra clara, não um bloco escuro;
   - fundo da hero/features/pricing é branco puro, `AdvantagesSection` continua cinza-claro.
3. Abrir uma rota fora de `(marketing)` (ex.: `/dashboard`) e confirmar que o fundo creme do design system não mudou.
4. `npx tsc --noEmit` limpo.
5. `npx vitest run` — 18/18 continuam passando (nenhuma lógica de negócio mudou nesta fase).
