# Identidade Visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a identidade visual sintetizada das 5 referências (paleta violeta + pastéis por categoria, glassmorphism, tipografia bold) sobre as 3 telas existentes da Fase 1 (landing, dashboard, quiz de triagem), via tokens de design e componentes primitivos compartilhados.

**Architecture:** Tokens de cor no `globals.css` (CSS vars já usadas pelo shadcn) + dois componentes primitivos novos (`GlassCard`, `CategoryBadge`) em `src/components/ui/`, aplicados nas telas existentes. Sem lógica de negócio nova — só CSS/JSX.

**Tech Stack:** Tailwind CSS (classes utilitárias + CSS vars existentes), shadcn/ui (`cn` helper já existente em `src/lib/utils.ts`), lucide-react (ícones, já instalado na Fase 1).

## Global Constraints

- Fundo: off-white quente (não branco puro). Primária: violeta. Cores de categoria pastéis de
  baixo contraste: rosa (ebook), âmbar (quiz), lavanda (roadmap/perfil), menta (XP/conquistas).
- Sem Figma — direto para código (decisão do usuário).
- Sem inventar dados de gamificação (streak, comunidade, atividade semanal) que a Fase 2 ainda
  não implementou — só usa o XP total que já existe.
- `QuizValidacao.tsx` **não deve ser modificado** nesta fase — ver "Decisão de escopo" abaixo.
- Sidebar do dashboard: só os itens que já existem hoje (Home), sem links mortos para seções
  futuras.
- Especificação completa: `docs/superpowers/specs/2026-07-03-identidade-visual-design.md`.

## Decisão de escopo: `QuizValidacao.tsx` fica intocado

O spec original previa aplicar os novos tokens de cor a esse componente "onde a mudança
permitir sem tocar na lógica". Na prática, `QuizValidacao.tsx` usa um tema escuro internamente
(fundos `bg-gray-900`/`bg-gray-800`, texto branco) em dezenas de classes de cor espalhadas pelo
arquivo (389 linhas). Uma reskin mecânica de claro↔escuro sem testes de regressão visual
automatizados arrisca bugs reais de contraste (ex: texto branco sobre fundo claro por engano),
sem rede de segurança para pegar isso — esta fase não adiciona testes novos (só verificação
manual). Por isso, esta implementação **não altera `QuizValidacao.tsx`**: ele mantém seu tema
escuro como um "modo foco" intencional e contido para o momento do quiz, e só ganha um contêiner
`GlassCard` por fora (Task 5) para consistência de espaçamento com o resto do dashboard.

---

## Task 1: Tokens de design (paleta violeta + fundo quente)

**Files:**
- Modify: `src/app/globals.css:7-24` (bloco `:root`)

**Interfaces:**
- Produces: variáveis CSS `--background`, `--primary`, `--ring`, `--accent`,
  `--accent-foreground` atualizadas — consumidas via classes Tailwind (`bg-background`,
  `bg-primary`, `text-primary`, etc.) por qualquer componente que as use. Componentes desta fase
  usam principalmente classes diretas do Tailwind (`bg-violet-600`, `bg-rose-100`, etc.), não
  essas variáveis — mas atualizá-las mantém o restante do app (ex: `Button` do shadcn) coerente
  com a nova paleta.

- [ ] **Step 1: Atualizar as variáveis de cor no bloco `:root`**

Em `src/app/globals.css`, dentro do bloco `:root` (linhas 7-24), altere exatamente estas 5
linhas:

De:
```css
    --background: oklch(1 0 0);
```
Para:
```css
    --background: oklch(0.985 0.004 90);
```

De:
```css
    --primary: oklch(0.21 0.006 285.885);
```
Para:
```css
    --primary: oklch(0.541 0.281 293.009);
```

De:
```css
    --accent: oklch(0.967 0.001 286.375);
    --accent-foreground: oklch(0.21 0.006 285.885);
```
Para:
```css
    --accent: oklch(0.943 0.029 294.588);
    --accent-foreground: oklch(0.541 0.281 293.009);
```

De:
```css
    --ring: oklch(0.705 0.015 286.067);
```
Para:
```css
    --ring: oklch(0.541 0.281 293.009);
```

Não altere nenhuma outra linha do bloco `:root`, nem o bloco `.dark` (fora de escopo — o app não
tem toggle de dark mode).

- [ ] **Step 2: Verificar que o projeto compila e o dev server sobe sem erro visual óbvio**

Run: `npx tsc --noEmit`
Expected: sem erros (CSS não é verificado pelo tsc, mas confirma que nada quebrou o build de tipos).

Run: `npm run build`
Expected: build compila (pode falhar depois em "Collecting page data" por falta de
`STRIPE_SECRET_KEY` — isso é esperado e não relacionado a esta mudança, ver
`docs/superpowers/plans/2026-07-03-matriz-central-fase1.md` seção final).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: tokens de design (paleta violeta + fundo off-white)"
```

---

## Task 2: Componente `GlassCard`

**Files:**
- Create: `src/components/ui/glass-card.tsx`

**Interfaces:**
- Consumes: `cn` de `@/lib/utils` (já existe, criado no Task 1 da Fase 1 pelo shadcn init)
- Produces: `GlassCard({ children, className? }): JSX.Element` — usado pelas Tasks 4 e 5.

- [ ] **Step 1: Criar o componente**

Create `src/components/ui/glass-card.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/40 bg-white/70 shadow-md backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/glass-card.tsx
git commit -m "feat: componente primitivo GlassCard"
```

---

## Task 3: Componente `CategoryBadge`

**Files:**
- Create: `src/components/ui/category-badge.tsx`

**Interfaces:**
- Consumes: `cn` de `@/lib/utils`
- Produces: `CategoryBadge({ variant, children, className? }): JSX.Element`, tipo
  `CategoryBadgeVariant = "ebook" | "quiz" | "roadmap" | "xp"` — usados pelas Tasks 4 e 5.

- [ ] **Step 1: Criar o componente**

Create `src/components/ui/category-badge.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CategoryBadgeVariant = "ebook" | "quiz" | "roadmap" | "xp";

const VARIANT_CLASSES: Record<CategoryBadgeVariant, string> = {
  ebook: "bg-rose-100 text-rose-900",
  quiz: "bg-amber-100 text-amber-900",
  roadmap: "bg-violet-100 text-violet-900",
  xp: "bg-emerald-100 text-emerald-900",
};

interface CategoryBadgeProps {
  variant: CategoryBadgeVariant;
  children: ReactNode;
  className?: string;
}

export default function CategoryBadge({ variant, children, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/category-badge.tsx
git commit -m "feat: componente primitivo CategoryBadge"
```

---

## Task 4: Landing page (Hero + Pricing)

**Files:**
- Modify: `src/components/marketing/Hero.tsx` (arquivo inteiro)
- Modify: `src/components/marketing/PricingSection.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `GlassCard` (Task 2), `CategoryBadge` (Task 3)
- Produces: nenhuma interface nova — os dois componentes continuam sendo usados exatamente como
  hoje em `src/app/(marketing)/page.tsx` (`<Hero />` + `<PricingSection />`, sem props).

- [ ] **Step 1: Reescrever `Hero.tsx`**

Replace o conteúdo de `src/components/marketing/Hero.tsx`:
```tsx
"use client";

import { useState } from "react";

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
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <span className="mb-6 inline-block rounded-full bg-violet-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
        Guia prático de IA local
      </span>
      <h1 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
        Construa Seu Próprio ChatGPT Particular em Poucos Minutos
      </h1>
      <p className="mb-8 text-lg text-zinc-600">
        O Guia Definitivo para Rodar LLMs Localmente e Nunca Mais Pagar por
        Tokens ou Mensalidades.
      </p>

      <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border-2 border-zinc-200 px-4 py-3 focus:border-violet-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-xl bg-violet-600 px-6 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Redirecionando..." : "Quero por R$47"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <p className="mt-4 text-sm text-zinc-500">
        Pare de Pagar por IA — Monte sua própria IA Local em menos de uma hora.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Reescrever `PricingSection.tsx`**

Replace o conteúdo de `src/components/marketing/PricingSection.tsx`:
```tsx
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

const FEATURES: { label: string; variant: "ebook" | "quiz" | "roadmap" }[] = [
  { label: "Ebook completo (9 capítulos) sobre rodar LLMs localmente", variant: "ebook" },
  { label: "Triagem de perfil personalizada", variant: "roadmap" },
  { label: "Roadmap de estudo sob medida para o seu perfil", variant: "roadmap" },
  { label: "Um segundo ebook grátis, escolhido pelo seu perfil", variant: "ebook" },
  { label: "Quiz de validação com certificado de conclusão", variant: "quiz" },
];

export default function PricingSection() {
  return (
    <section className="mx-auto max-w-2xl border-t border-zinc-100 px-6 py-16">
      <h2 className="mb-8 text-center text-3xl font-bold text-zinc-900">
        O que você recebe
      </h2>
      <GlassCard className="p-8">
        <ul className="space-y-4">
          {FEATURES.map((feature) => (
            <li key={feature.label} className="flex items-center gap-3">
              <CategoryBadge variant={feature.variant}>✓</CategoryBadge>
              <span className="text-zinc-700">{feature.label}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <p className="mt-8 text-center text-4xl font-bold text-zinc-900">R$47</p>
      <p className="text-center text-sm text-zinc-500">
        Pagamento único via PIX, cartão ou boleto
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Verificar que compila e a home renderiza**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run dev` (em background), depois `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/`
Expected: `200`.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/Hero.tsx src/components/marketing/PricingSection.tsx
git commit -m "feat: redesign da landing page com tokens de identidade visual"
```

---

## Task 5: Dashboard (rail lateral + cards glass + badges)

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx` (arquivo inteiro)
- Modify: `src/components/dashboard/RoadmapCard.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: `GlassCard` (Task 2), `CategoryBadge` (Task 3), `RoadmapCard` (reescrito nesta task),
  `QuizValidacaoContainer` (já existe, Task 12 da Fase 1, sem alteração de interface)
- Produces: layout `src/app/dashboard/layout.tsx` envolve toda a árvore `/dashboard/*` (hoje só
  `/dashboard/[token]`) com o rail lateral.

- [ ] **Step 1: Criar o layout do dashboard com o rail lateral**

Create `src/app/dashboard/layout.tsx`:
```tsx
import { Home, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-16 flex-col items-center gap-6 border-r border-zinc-200 bg-white/70 py-6 backdrop-blur-md">
        <div className="h-8 w-8 rounded-lg bg-violet-600" aria-hidden="true" />
        <nav className="flex flex-1 flex-col items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Home className="h-5 w-5" />
          </span>
        </nav>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400">
          <LogOut className="h-5 w-5" />
        </span>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Reescrever `RoadmapCard.tsx`**

Replace o conteúdo de `src/components/dashboard/RoadmapCard.tsx`:
```tsx
interface RoadmapWeek {
  title: string;
  items: string[];
}

interface Props {
  roadmap: Record<string, RoadmapWeek>;
}

export default function RoadmapCard({ roadmap }: Props) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-zinc-900">Seu Roadmap</h2>
      <div className="space-y-4">
        {Object.entries(roadmap).map(([weekKey, week]) => (
          <div key={weekKey} className="border-l-4 border-violet-400 pl-4">
            <h3 className="font-semibold text-zinc-900">{week.title}</h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600">
              {week.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Reescrever `page.tsx`**

Replace o conteúdo de `src/app/dashboard/[token]/page.tsx`:
```tsx
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import RoadmapCard from "@/components/dashboard/RoadmapCard";
import QuizValidacaoContainer from "@/components/quiz/QuizValidacaoContainer";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

export default async function DashboardPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  if (!tokenRow.triaged || !tokenRow.profile_id) {
    return (
      <p className="max-w-md mx-auto p-8 text-center">
        Complete primeiro a{" "}
        <a href={`/quiz/${params.token}`} className="text-violet-600 underline">
          triagem de perfil
        </a>
        .
      </p>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", tokenRow.profile_id)
    .single();

  if (!profile) {
    return <p className="max-w-md mx-auto p-8 text-center">Perfil não encontrado.</p>;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  let totalXp = 0;
  if (purchase) {
    const { data: xpEvents } = await supabase
      .from("xp_events")
      .select("xp_amount")
      .eq("user_id", purchase.user_id);

    totalXp = (xpEvents ?? []).reduce(
      (sum: number, event: { xp_amount: number }) => sum + event.xp_amount,
      0
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <CategoryBadge variant="xp" className="text-sm">
        ⭐ {totalXp} XP
      </CategoryBadge>

      <GlassCard className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <CategoryBadge variant="roadmap">Perfil</CategoryBadge>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">{profile.name}</h1>
        <p className="text-zinc-600">{profile.description}</p>
      </GlassCard>

      <GlassCard className="p-6">
        <RoadmapCard roadmap={profile.study_roadmap} />
      </GlassCard>

      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="ebook">Ebook</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-zinc-900">Seu primeiro ebook</h2>
        <a
          href={`/api/download?token=${params.token}`}
          className="inline-block rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          📥 Baixar Ebook LLM Local
        </a>
      </GlassCard>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <CategoryBadge variant="quiz">Validação</CategoryBadge>
          <h2 className="text-xl font-bold text-zinc-900">Quiz de Validação</h2>
        </div>
        <QuizValidacaoContainer token={params.token} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar que compila e a rota responde**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/dashboard/QUALQUERTOKEN`
Expected: `200` (mostra "Token inválido ou expirado." para um token inexistente — comportamento
correto, não é um erro).

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/[token]/page.tsx src/components/dashboard/RoadmapCard.tsx
git commit -m "feat: redesign do dashboard com rail lateral, GlassCard e CategoryBadge"
```

---

## Task 6: Quiz de triagem (paleta violeta)

**Files:**
- Modify: `src/components/quiz/QuizTriagem.tsx` (arquivo inteiro)

**Interfaces:**
- Consumes: nenhuma nova — mesmas props (`{ token: string }`) e mesmo comportamento de antes.
- Produces: nenhuma interface nova.

- [ ] **Step 1: Reescrever `QuizTriagem.tsx` trocando as cores azuis/cinzas por violeta/zinc**

Replace o conteúdo de `src/components/quiz/QuizTriagem.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_TRIAGEM } from "@/data/quiz-triagem";

interface Props {
  token: string;
}

export default function QuizTriagem({ token }: Props) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; selectedOptionIndexes: number[] }[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUIZ_TRIAGEM[currentQ];
  const isLast = currentQ === QUIZ_TRIAGEM.length - 1;

  const toggleOption = (index: number) => {
    if (question.type === "radio") {
      setSelectedIndexes([index]);
    } else {
      setSelectedIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    }
  };

  const handleNext = async () => {
    const updatedAnswers = [...answers, { questionId: question.id, selectedOptionIndexes: selectedIndexes }];
    setAnswers(updatedAnswers);
    setSelectedIndexes([]);
    setError(null);

    if (!isLast) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, quizType: "triagem", answers: updatedAnswers }),
    });

    if (response.ok) {
      router.push(`/dashboard/${token}`);
      return;
    }

    setSubmitting(false);
    setError("Não foi possível calcular seu perfil agora. Tente novamente.");
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="mb-2 text-sm text-zinc-500">
        Pergunta {currentQ + 1} de {QUIZ_TRIAGEM.length}
      </p>
      <div className="mb-6 h-2 w-full rounded-full bg-zinc-200">
        <div
          className="h-2 rounded-full bg-violet-600 transition-all"
          style={{ width: `${((currentQ + 1) / QUIZ_TRIAGEM.length) * 100}%` }}
        />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={option.text}
            type="button"
            onClick={() => toggleOption(index)}
            className={`w-full rounded-lg border-2 p-3 text-left transition ${
              selectedIndexes.includes(index)
                ? "border-violet-500 bg-violet-50"
                : "border-zinc-300 hover:border-violet-300"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleNext}
        disabled={selectedIndexes.length === 0 || submitting}
        className="mt-6 w-full rounded-lg bg-violet-600 py-3 font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {isLast ? (submitting ? "Calculando seu perfil..." : "Ver meu perfil") : "Próxima"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/quiz/QuizTriagem.tsx
git commit -m "feat: aplica paleta violeta ao quiz de triagem"
```

---

## Verificação final manual (não automatizada)

Depois da Task 6:

1. `npm run dev`
2. Abrir `/` no navegador — confirmar visual da nova landing (headline, badge violeta, CTA, cards
   de feature com glass)
3. Abrir `/dashboard/<qualquer-token>` — confirmar rail lateral, mensagem de erro amigável (token
   não existe de verdade ainda)
4. Abrir `/quiz/<qualquer-token>` — confirmar barra de progresso e botões em violeta
5. Rodar a suíte completa: `npx vitest run` (deve continuar em 18/18 — nenhuma lógica mudou) e
   `npx tsc --noEmit` (limpo)
