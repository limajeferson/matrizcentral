# Segmentação de Público (capacity tier) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar o eixo de capacidade (3 tiers: `performance`/`equilibrio`/`essencial`) ao diagnóstico, ao feed, à landing e aos e-mails — ortogonal aos 8 perfis existentes.

**Architecture:** Fonte única `src/lib/capacity.ts` (tipo, perguntas, scorer puro, copy dos caminhos) consumida por: rota `/api/diagnostico` (grava `users.capacity_tier`, migration 0029), `DiagnosticoInline` (modo completo e mini), bloco "Seu caminho" no feed, ordenação por afinidade em `buildContentFeed`, seção "Qual é o seu momento?" na landing v2 e dica por tier nos e-mails de ciclo/conteúdo.

**Tech Stack:** Next.js 14 App Router + TS + Supabase + Vitest (node, só lógica pura). Zero dependência nova.

## Global Constraints

- **Custo zero:** sem dependência npm nova, sem asset externo.
- **Nomes públicos:** Performance / Equilíbrio / Essencial — **"limitado" NUNCA aparece em UI/copy/e-mail.**
- **Preços/planos/oferta: intocados.** Nenhuma mudança em `stripe.ts`, checkout ou `OfferPricing`.
- **XP anti-forja preservado:** o claim atômico de `diagnosed_at` (50 XP, 1x) não muda; modo só-capacidade **não** concede XP.
- **Landing:** CSS novo escopado em `.mcv2` (arquivo `landing-v2.css`); tokens de cor existentes (`--mc-accent` etc.); dark é padrão da área logada (classes `dark:` no feed).
- **Gate por task:** `npx tsc --noEmit` 0 · `npm run test` (322+ verdes) · `npx next lint` 0 erros (2 warnings `<img>` pré-existentes). Visual da frente: dark+claro, desktop+mobile.
- **Ordem de deploy (L-023):** migration `0029` aplicada e verificada no remoto (`npx supabase db query --linked`) **antes** de qualquer push.
- Comunicação/copy em **português do Brasil**. Nunca commitar `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`, `texto-para-salvar-prompt-temporario.md`, `erro.png`, `proxima-tarefa.md`.

---

### Task S1: `src/lib/capacity.ts` — tipo, perguntas, scorer e caminhos (TDD)

**Files:**
- Create: `src/lib/capacity.ts`
- Test: `src/lib/capacity.test.ts`

**Interfaces:**
- Consumes: `TriagemAnswer` de `@/lib/quiz-scoring` (só o tipo).
- Produces (tasks S3–S8 dependem): `CapacityTier = "performance" | "equilibrio" | "essencial"`; `CAPACITY_QUESTIONS: CapacityQuestion[]` (ids **8** e **9**, formato compatível com o render do `DiagnosticoInline`: `{ id, text, type: "radio", options: [{ text, ... }] }`); `scoreCapacity(answers: TriagemAnswer[]): CapacityTier`; `hasCapacityAnswers(answers): boolean`; `CAPACITY_PATHS: Record<CapacityTier, CapacityPath>` com `CapacityPath = { tier, publicName, tagline, setup, primeiroPasso }`.

- [ ] **Step 1: teste que falha** — `src/lib/capacity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CAPACITY_QUESTIONS, CAPACITY_PATHS, hasCapacityAnswers, scoreCapacity } from "./capacity";

describe("scoreCapacity", () => {
  it("classifica performance quando investimento e equipamento apontam pra cima", () => {
    expect(scoreCapacity([
      { questionId: 8, selectedOptionIndexes: [0] },
      { questionId: 9, selectedOptionIndexes: [0] },
    ])).toBe("performance");
  });
  it("classifica essencial quando só tem smartphone e não quer gastar", () => {
    expect(scoreCapacity([
      { questionId: 8, selectedOptionIndexes: [2] },
      { questionId: 9, selectedOptionIndexes: [3] },
    ])).toBe("essencial");
  });
  it("empate resolve para o tier mais conservador (nunca recomendar acima do recurso)", () => {
    // investimento aponta performance (2), equipamento aponta essencial (2)
    expect(scoreCapacity([
      { questionId: 8, selectedOptionIndexes: [0] },
      { questionId: 9, selectedOptionIndexes: [3] },
    ])).toBe("essencial");
  });
  it("sem respostas de capacidade cai no conservador", () => {
    expect(scoreCapacity([{ questionId: 1, selectedOptionIndexes: [0] }])).toBe("essencial");
  });
  it("ignora ids fora do banco de capacidade e índices inválidos", () => {
    expect(scoreCapacity([
      { questionId: 9, selectedOptionIndexes: [99] },
      { questionId: 8, selectedOptionIndexes: [1] },
    ])).toBe("equilibrio");
  });
});

describe("hasCapacityAnswers", () => {
  it("true só quando há resposta para as perguntas 8/9", () => {
    expect(hasCapacityAnswers([{ questionId: 8, selectedOptionIndexes: [0] }])).toBe(true);
    expect(hasCapacityAnswers([{ questionId: 3, selectedOptionIndexes: [0] }])).toBe(false);
  });
});

describe("CAPACITY_PATHS", () => {
  it("tem os 3 tiers, nomes públicos dignos e nunca a palavra 'limitado'", () => {
    const tiers = Object.keys(CAPACITY_PATHS).sort();
    expect(tiers).toEqual(["equilibrio", "essencial", "performance"]);
    const all = JSON.stringify(CAPACITY_PATHS).toLowerCase();
    expect(all).not.toContain("limitado");
    expect(CAPACITY_PATHS.essencial.publicName).toBe("Essencial");
  });
  it("perguntas têm ids 8 e 9 e formato radio", () => {
    expect(CAPACITY_QUESTIONS.map((q) => q.id)).toEqual([8, 9]);
    expect(CAPACITY_QUESTIONS.every((q) => q.type === "radio")).toBe(true);
  });
});
```

- [ ] **Step 2:** Run: `npx vitest run src/lib/capacity.test.ts` → Expected: FAIL (módulo não existe).

- [ ] **Step 3: implementação** — `src/lib/capacity.ts`:

```ts
import type { TriagemAnswer } from "@/lib/quiz-scoring";

/** Eixo de CAPACIDADE (recursos/infra) — ortogonal aos 8 perfis de caso de uso.
 *  Interno: performance | equilibrio | essencial. Público: ver CAPACITY_PATHS
 *  ("limitado" do pedido virou "Essencial" — nunca rotular o usuário por falta). */
export type CapacityTier = "performance" | "equilibrio" | "essencial";

export interface CapacityOption {
  text: string;
  capacityPoints: Partial<Record<CapacityTier, number>>;
}
export interface CapacityQuestion {
  id: number;
  text: string;
  type: "radio";
  options: CapacityOption[];
}

/** Ids continuam a numeração do QUIZ_TRIAGEM (1–7). Estas perguntas pontuam
 *  SÓ o eixo de capacidade — as 7 do perfil ficam intactas. */
export const CAPACITY_QUESTIONS: CapacityQuestion[] = [
  {
    id: 8,
    text: "Se precisar investir para rodar IA local, qual é o seu momento?",
    type: "radio",
    options: [
      { text: "Posso montar o melhor setup (GPU dedicada ou servidor/VPS robusta)", capacityPoints: { performance: 2 } },
      { text: "Invisto no que fizer sentido para o meu projeto", capacityPoints: { equilibrio: 2 } },
      { text: "Quero começar com o que já tenho, sem gastar agora", capacityPoints: { essencial: 2 } },
    ],
  },
  {
    id: 9,
    text: "Qual equipamento você tem disponível hoje?",
    type: "radio",
    options: [
      { text: "Desktop potente com GPU dedicada (ou VPS/servidor)", capacityPoints: { performance: 2 } },
      { text: "Notebook ou desktop com GPU dedicada", capacityPoints: { performance: 1, equilibrio: 1 } },
      { text: "Notebook comum, sem GPU dedicada", capacityPoints: { equilibrio: 1, essencial: 1 } },
      { text: "Só smartphone (ou um computador bem antigo)", capacityPoints: { essencial: 2 } },
    ],
  },
];

/** Desempate/zero → mais conservador PRIMEIRO: nunca recomendar acima do
 *  recurso real (frustra e gera suporte); subir de tier é 1 clique no refazer. */
const TIE_ORDER: CapacityTier[] = ["essencial", "equilibrio", "performance"];

export function hasCapacityAnswers(answers: TriagemAnswer[]): boolean {
  return answers.some((a) => CAPACITY_QUESTIONS.some((q) => q.id === a.questionId));
}

export function scoreCapacity(answers: TriagemAnswer[]): CapacityTier {
  const scores: Record<CapacityTier, number> = { performance: 0, equilibrio: 0, essencial: 0 };
  for (const answer of answers) {
    const question = CAPACITY_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;
    for (const index of answer.selectedOptionIndexes) {
      const option = question.options[index];
      if (!option) continue;
      for (const tier of TIE_ORDER) scores[tier] += option.capacityPoints[tier] ?? 0;
    }
  }
  return TIE_ORDER.reduce((winner, tier) => (scores[tier] > scores[winner] ? tier : winner));
}

export interface CapacityPath {
  tier: CapacityTier;
  publicName: string;
  /** Promessa curta (landing/feed). */
  tagline: string;
  /** Setup recomendado (feed/e-mail). */
  setup: string;
  /** Primeiro passo concreto dentro da plataforma. */
  primeiroPasso: string;
}

/** FONTE ÚNICA de copy dos 3 caminhos — landing, feed e e-mails leem daqui
 *  (evita drift de mensagem entre canais). */
export const CAPACITY_PATHS: Record<CapacityTier, CapacityPath> = {
  performance: {
    tier: "performance",
    publicName: "Performance",
    tagline: "Você pode montar a melhor infra — vamos direto ao topo de linha.",
    setup: "GPU dedicada ou VPS robusta rodando os modelos mais performáticos, ajustados ao uso que você definir.",
    primeiroPasso: "Comece pelo relatório de benchmark e monte seu setup de referência.",
  },
  equilibrio: {
    tier: "equilibrio",
    publicName: "Equilíbrio",
    tagline: "Projeto definido — o modelo certo para o seu caso, sem excesso.",
    setup: "Estruturas prontas: a triagem direciona o melhor modelo para o formato do seu projeto.",
    primeiroPasso: "Siga a trilha recomendada do seu diagnóstico — ela já aponta o modelo do seu caso.",
  },
  essencial: {
    tier: "essencial",
    publicName: "Essencial",
    tagline: "Comece com o que você já tem — smartphone ou notebook, com ou sem GPU.",
    setup: "Modelos leves calibrados para rodar sem travar no equipamento que você já possui.",
    primeiroPasso: "Comece pela jornada básica: um modelo leve rodando hoje vale mais que um setup ideal amanhã.",
  },
};
```

- [ ] **Step 4:** Run: `npx vitest run src/lib/capacity.test.ts` → Expected: PASS (8 testes).
- [ ] **Step 5:** `npx tsc --noEmit` → exit 0. Commit:

```bash
git add src/lib/capacity.ts src/lib/capacity.test.ts
git commit -m "feat(segmentacao): eixo de capacidade - tipo, perguntas 8/9, scorer conservador e caminhos (fonte unica)"
```

---

### Task S2: Migration `0029` + tipos do banco

**Files:**
- Create: `supabase/migrations/0029_capacity_tier.sql`
- Modify: `src/types/index.ts` (blocos Row/Insert/Update da tabela **`users`** — adjacentes a `profile_id`, linhas ~17/28; NÃO tocar os blocos de `tokens`)

**Interfaces:**
- Produces: coluna `users.capacity_tier text NULL` no remoto; tipo `capacity_tier: string | null` em `users.Row` (+ opcional em Insert/Update).

- [ ] **Step 1:** criar `supabase/migrations/0029_capacity_tier.sql`:

```sql
-- 0029: eixo de capacidade (segmentacao de publico).
-- Texto validado em codigo como CapacityTier (mesmo padrao do profile_id/0022).
-- NULL = usuario ainda nao respondeu as perguntas de capacidade (gate de UX
-- para a versao mini do diagnostico).
alter table users add column if not exists capacity_tier text;
```

- [ ] **Step 2: aplicar no remoto** (responsabilidade do Claude — L-023, migration ANTES de qualquer push):

Run: `npx supabase db query --linked -f supabase/migrations/0029_capacity_tier.sql`
Depois: `npx supabase db query --linked "select column_name from information_schema.columns where table_name='users' and column_name='capacity_tier';"`
Expected: 1 linha com `capacity_tier`.

- [ ] **Step 3:** em `src/types/index.ts`, nos blocos da tabela `users`, adicionar ao lado de `profile_id`: `capacity_tier: string | null;` (Row) e `capacity_tier?: string | null;` (Insert/Update conforme o padrão do arquivo).
- [ ] **Step 4:** `npx tsc --noEmit` → exit 0 · `npm run test` → verde. Commit:

```bash
git add supabase/migrations/0029_capacity_tier.sql src/types/index.ts
git commit -m "feat(segmentacao): migration 0029 users.capacity_tier (aplicada no remoto) + tipos"
```

---

### Task S3: rota `/api/diagnostico` grava os dois eixos (modo completo e só-capacidade)

**Files:**
- Modify: `src/app/api/diagnostico/route.ts`
- Test: `src/app/api/diagnostico/route.test.ts` (casos novos)

**Interfaces:**
- Consumes: `scoreCapacity`, `hasCapacityAnswers` (S1); coluna `capacity_tier` (S2).
- Produces: contrato novo da rota — request igual (`{ answers }`); response `{ profileId?: ProfileId, capacityTier?: CapacityTier }`; regras: respostas 1–7 presentes → fluxo de perfil (update + claim XP) como hoje; respostas 8/9 presentes → grava `capacity_tier`; **modo só-capacidade** (nenhuma resposta 1–7) **não** toca `profile_id` **nem** concede XP.

- [ ] **Step 1: testes que falham** — adicionar ao `route.test.ts` existente (seguir os mocks do arquivo; ler antes):
  - `modo só-capacidade grava capacity_tier e NÃO chama update de profile_id nem xp_events` (answers só com ids 8/9);
  - `modo completo grava os dois e responde { profileId, capacityTier }`;
  - `payload sem respostas de capacidade não sobrescreve capacity_tier` (answers só 1–7 → nenhum update de `capacity_tier`).
- [ ] **Step 2:** Run: `npx vitest run src/app/api/diagnostico/route.test.ts` → FAIL.
- [ ] **Step 3: implementação** — reestruturar o handler mantendo TUDO que existe (checagem de erro do update de perfil; claim atômico; upsert de XP com `onConflict`):

```ts
import { scoreCapacity, hasCapacityAnswers, type CapacityTier } from "@/lib/capacity";
// ... imports existentes intactos

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const answers = parseTriagemAnswers(body?.answers);
  if (!answers) return NextResponse.json({ error: "respostas inválidas" }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const temPerfil = answers.some((a) => a.questionId >= 1 && a.questionId <= 7);
  const temCapacidade = hasCapacityAnswers(answers);
  if (!temPerfil && !temCapacidade) {
    return NextResponse.json({ error: "respostas inválidas" }, { status: 400 });
  }

  let profileId: ReturnType<typeof scoreTriagem> | undefined;
  let capacityTier: CapacityTier | undefined;

  if (temPerfil) {
    profileId = scoreTriagem(QUIZ_TRIAGEM, answers);
    // [bloco existente de update de profile_id com checagem de erro — inalterado]
    // [bloco existente do claim atômico de diagnosed_at + upsert de 50 XP — inalterado]
  }

  if (temCapacidade) {
    capacityTier = scoreCapacity(answers);
    const { error: capError } = await supabase
      .from("users").update({ capacity_tier: capacityTier }).eq("id", user.id);
    if (capError) {
      console.error("Falha ao gravar capacity_tier:", capError);
      // Só-capacidade: falhou o único objetivo → 500. Modo completo: perfil já
      // salvo com sucesso — não desfaz; responde sem capacityTier.
      if (!temPerfil) return NextResponse.json({ error: "não foi possível salvar" }, { status: 500 });
      capacityTier = undefined;
    }
  }

  return NextResponse.json({ profileId, capacityTier });
}
```

(Os blocos marcados `[...inalterado]` são movidos verbatim do arquivo atual para dentro do `if (temPerfil)` — sem reescrever a lógica de XP.)

- [ ] **Step 4:** Run: `npx vitest run src/app/api/diagnostico/route.test.ts` → PASS · suíte inteira verde · `tsc` 0. Commit:

```bash
git add src/app/api/diagnostico/route.ts src/app/api/diagnostico/route.test.ts
git commit -m "feat(segmentacao): /api/diagnostico grava os dois eixos; modo so-capacidade sem XP"
```

---

### Task S4: `DiagnosticoInline` — quiz completo (9 perguntas) e modo mini

**Files:**
- Modify: `src/components/quiz/DiagnosticoInline.tsx`
- Modify: `src/app/feed/page.tsx` (seleção do modo + carregar `capacity_tier`)

**Interfaces:**
- Consumes: `CAPACITY_QUESTIONS` (S1); rota S3.
- Produces: prop `mode: "completo" | "capacidade"`; no feed: `completo` quando `!profileId`; `capacidade` quando `profileId && !capacityTier`.

- [ ] **Step 1:** no `DiagnosticoInline.tsx`: aceitar `{ mode = "completo" }`. ⚠️ **O cast direto `as TriagemQuestion[]` NÃO compila** (`CapacityOption.capacityPoints` ≠ `TriagemOption.points`, sem overlap estrutural — verificado com `tsc` na revisão da S1). Use a interface mínima de render (o componente só precisa de `id`/`text`/`type`/`options[].text`/`showIf`):

```ts
// Em src/lib/quiz-branching.ts: tornar visibleQuestions genérica —
// export function visibleQuestions<Q extends { id: number; showIf?: TriagemQuestion["showIf"] }>(
//   questions: Q[], answers: TriagemAnswer[]): Q[]
// (o corpo não muda; ela só usa id/showIf.)

// No DiagnosticoInline.tsx:
type AskableQuestion = {
  id: number;
  text: string;
  type: "radio" | "checkbox";
  options: { text: string }[];
  showIf?: TriagemQuestion["showIf"];
};
const bank: AskableQuestion[] = mode === "capacidade"
  ? CAPACITY_QUESTIONS
  : [...QUIZ_TRIAGEM, ...CAPACITY_QUESTIONS];
const visible = visibleQuestions(bank, answers);
```

(`TriagemQuestion[]` e `CapacityQuestion[]` são ambos atribuíveis a `AskableQuestion[]` — atribuição alarga, cast não.) Copy do modo mini: título "Complete seu diagnóstico" e sub "2 perguntas para calibrar as recomendações ao seu equipamento"; botão final "Calibrar recomendações". Modo completo mantém a copy atual ("Pergunta X de N" passa a contar 9).
- [ ] **Step 2:** no `feed/page.tsx`: incluir `capacity_tier` no select de `users` (junto de `profile_id`/`total_xp`); substituir a linha `{user && !profileId && <DiagnosticoInline />}` por:

```tsx
{user && !profileId && <DiagnosticoInline mode="completo" />}
{user && profileId && !capacityTier && <DiagnosticoInline mode="capacidade" />}
```

- [ ] **Step 3:** gate: `tsc` 0 · testes verdes · lint 0. Verificação visual fica no fechamento da frente (roteiro na Task S8). Commit:

```bash
git add src/components/quiz/DiagnosticoInline.tsx src/app/feed/page.tsx
git commit -m "feat(segmentacao): diagnostico com 9 perguntas + modo mini so-capacidade no feed"
```

---

### Task S5: bloco "Seu caminho" no feed

**Files:**
- Create: `src/components/app/SeuCaminhoCard.tsx` (client component)
- Modify: `src/app/feed/page.tsx` (renderizar quando `capacityTier` existe)

**Interfaces:**
- Consumes: `CAPACITY_PATHS`, `CapacityTier` (S1).
- Produces: `<SeuCaminhoCard tier={capacityTier} />` — card dark-aware com `publicName`, `tagline`, `setup`, `primeiroPasso`; botão "Dispensar" (persiste em `localStorage` chave `mc-seu-caminho-dismissed-v1`, padrão do projeto: dismiss é conveniência local, não estado de servidor); link discreto "meu setup mudou" que abre o mini-diagnóstico de novo (limpa o dismiss e chama `router.refresh()` não resolve sozinho — o link só rola/aponta para refazer via `DiagnosticoInline` em modo capacidade num estado local `refazendo`).

- [ ] **Step 1:** criar o componente seguindo o padrão visual do bloco do `DiagnosticoInline` (borda violeta, `dark:` classes), com `aria-label` no botão de dispensar e teclado ok (é `<button>`). Estrutura:

```tsx
"use client";
// useState p/ dismissed (init de localStorage em useEffect p/ evitar hydration
// mismatch) e p/ refazendo. refazendo === true → renderiza
// <DiagnosticoInline mode="capacidade" /> no lugar do card.
```

- [ ] **Step 2:** montar no `feed/page.tsx` logo APÓS o slot do diagnóstico: `{user && capacityTier && <SeuCaminhoCard tier={capacityTier} />}`.
- [ ] **Step 3:** gate `tsc`/test/lint. Commit:

```bash
git add src/components/app/SeuCaminhoCard.tsx src/app/feed/page.tsx
git commit -m "feat(segmentacao): bloco Seu caminho no feed (copy da fonte unica, dismiss local)"
```

---

### Task S6: afinidade de conteúdo — `capacityFit` + ordenação (TDD)

**Files:**
- Modify: `src/data/content-hub.ts` (campo + tags nos itens)
- Modify: `src/lib/feed.ts` (`buildContentFeed` ganha param opcional)
- Test: `src/lib/feed.test.ts` (casos novos)

**Interfaces:**
- Consumes: `CapacityTier` (S1).
- Produces: `ContentItem.capacityFit?: CapacityTier[]`; `buildContentFeed(items, token?, tier?)` — ordenação estável: itens cujo `capacityFit` inclui o tier vêm primeiro; sem tier ou sem tag, ordem original intacta. **É ordenação, nunca filtro.**

- [ ] **Step 1: testes que falham** em `feed.test.ts`: (a) com `tier="essencial"`, item taggeado `["essencial"]` sobe para a frente mantendo a ordem relativa dos demais (sort estável); (b) sem `tier`, saída idêntica à atual; (c) item sem `capacityFit` nunca é removido.
- [ ] **Step 2:** FAIL → implementar:

```ts
export function buildContentFeed(items: ContentItem[], token?: string, tier?: CapacityTier): FeedCard[] {
  const cards = items.map((item) => ({ /* mapeamento atual inalterado */ }));
  if (!tier) return cards;
  const fits = (id: string) => items.find((i) => i.id === id)?.capacityFit?.includes(tier) ?? false;
  return [...cards.filter((c) => fits(c.id)), ...cards.filter((c) => !fits(c.id))];
}
```

- [ ] **Step 3:** taguear no `CONTENT_HUB` APENAS onde é óbvio pelo título/descrição real do item (o implementador lê os 9 itens e decide com este critério): benchmark/performance → `["performance"]`; conteúdo de fundação/primeiros passos → `["essencial", "equilibrio"]`; específico de projeto/fluxo → `["equilibrio"]`. Item ambíguo fica **sem** tag (neutro). Registrar no report quais itens foram tagueados e por quê.
- [ ] **Step 4:** `feed/page.tsx` passa o tier: `buildContentFeed(CONTENT_HUB, token, capacityTier ?? undefined)` (e o mesmo para o rail, se o call site for separado — verificar `buildFeedTimeline`/stories: **stories NÃO mudam**, só cards/rail).
- [ ] **Step 5:** PASS + suíte + `tsc` + lint. Commit:

```bash
git add src/data/content-hub.ts src/lib/feed.ts src/lib/feed.test.ts src/app/feed/page.tsx
git commit -m "feat(segmentacao): capacityFit no CONTENT_HUB + vitrine ordenada por afinidade (nunca filtro)"
```

---

### Task S7: landing v2 — seção "Qual é o seu momento?"

**Files:**
- Create: `src/components/marketing/v2/MomentSection.tsx`
- Modify: `src/app/(marketing)/page.tsx` (inserir entre `ProcessSteps` e `StrategySection`)
- Modify: `src/app/(marketing)/landing-v2.css` (bloco `.mc-moment*`, escopado `.mcv2`)

**Interfaces:**
- Consumes: `CAPACITY_PATHS` (S1) — importa a copy; NÃO duplicar strings.
- Produces: seção estática (server component, sem estado) com tag `mc-tag` "Qual é o seu momento?", h2 e 3 cards (`publicName` + `tagline` + 1 linha do `setup`), cada card com o MESMO CTA `href="/oferta"` (copy: "Começar por R$47"). Sem quiz, sem ramificação.

- [ ] **Step 1:** criar `MomentSection` seguindo o padrão dos irmãos (ver `SystemSection.tsx` para estrutura de seção + `Reveal` de `motion-primitives` para entrada). Grid 3 colunas → 1 no mobile (`@media (max-width: 800px)`), cards com `--mc-surface`/`--mc-line`, hover com realce violeta (`--mc-accent`), sem cor "alta" nova.
- [ ] **Step 2:** inserir `<MomentSection />` em `page.tsx` entre `<ProcessSteps />` e `<StrategySection />`.
- [ ] **Step 3:** CSS no `landing-v2.css` sob `.mcv2` (`.mc-moment-grid`, `.mc-moment-card`), reusando variáveis existentes.
- [ ] **Step 4:** gate `tsc`/test/lint + smoke `curl -s localhost:3000 | grep -c "mc-moment"` ≥ 1 com dev server de pé. Commit:

```bash
git add src/components/marketing/v2/MomentSection.tsx "src/app/(marketing)/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat(segmentacao): secao Qual e o seu momento na landing (3 caminhos, mesmo CTA)"
```

---

### Task S8: e-mails tier-aware + CRM doc + roteiro visual

**Files:**
- Modify: `src/lib/email.ts` (`sendNewCycleEmail`, `sendNewContentEmail`)
- Modify: `src/app/api/cron/emails-diarios/route.ts` e `src/app/api/admin/notify-new-content/route.ts` (buscar e passar o tier)
- Modify: `docs/frentes/suporte-crm/crm.md` (seção nova)

**Interfaces:**
- Consumes: `CAPACITY_PATHS`, `CapacityTier` (S1); coluna S2.
- Produces: `sendNewCycleEmail({ to, tier? })` e `sendNewContentEmail({ to, contentTitle, tier? })` — com `tier`, o HTML ganha o parágrafo `<p>Para o seu caminho <strong>{publicName}</strong>: {setup}</p>`; sem tier, e-mail idêntico ao atual.

- [ ] **Step 1:** alterar as 2 funções (param opcional; sem tier → zero mudança de comportamento). Nos call sites: os selects que montam os destinatários passam a incluir `capacity_tier` do `users` e repassar. (No cron, o e-mail vem de um join com `users` — o implementador lê a rota e estende o select existente; não criar query nova.)
- [ ] **Step 2:** `crm.md`: adicionar seção curta "Segmentação por capacidade (Performance/Equilíbrio/Essencial)" — 1 parágrafo por etapa do funil (onboarding: primeiro passo por tier; retenção: dica de setup nos e-mails de ciclo; win-back: reengajar pelo caminho, ex. Essencial→"seu modelo leve continua aqui").
- [ ] **Step 3:** gate `tsc`/test/lint. Commit:

```bash
git add src/lib/email.ts src/app/api/cron/emails-diarios/route.ts src/app/api/admin/notify-new-content/route.ts docs/frentes/suporte-crm/crm.md
git commit -m "feat(segmentacao): dica por tier nos emails de ciclo/conteudo + crm.md"
```

- [ ] **Step 4 (roteiro da verificação visual da FRENTE — executar no fechamento, antes do push):**
  1. `npm run dev -- -p 3000`.
  2. Landing `/` (claro e dark do SO): seção "Qual é o seu momento?" entre a jornada e o "Para quem quer usar IA"; 3 cards legíveis, CTA leva a `/oferta`; mobile: 1 coluna.
  3. `/feed` logado SEM diagnóstico: quiz completo com 9 perguntas → conclui → bloco "Seu caminho" aparece com o tier calculado.
  4. `/feed` logado com perfil antigo (SQL: `update users set capacity_tier = null where email = '<conta teste>'`): versão mini (2 perguntas) → conclui → bloco aparece; **sem XP novo** (`select count(*) from xp_events where user_id = '...' and action_type = 'triagem'` continua 1).
  5. Dispensar o bloco → some e não volta no F5; "meu setup mudou" → mini-quiz de novo.
  6. Vitrine: com tier `essencial`, itens tagueados essencial vêm primeiro no rail; nenhum item sumiu.

---

**Fechamento da frente (orquestrador):** revisão final whole-branch (opus) → fixes → verificação visual (roteiro acima) → **etapa 7 do playbook** (destilar lições novas no `LICOES.md`) → atualizar `ESTADO-ATUAL.md` + README da frente → push (migration 0029 já aplicada na S2 — conferir antes com um `select`).
