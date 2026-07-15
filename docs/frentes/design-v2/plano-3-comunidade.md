# Frente 3 (Comunidade) — Plano de Implementação

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: `docs/frentes/design-v2/spec-3-comunidade.md`. Programa: `README.md`.
> **Um commit por item.**

**Goal:** Atividades da comunidade como swipeable-list + ranking mensal da
temporada como animated-list, na `RightSidebar`.

**Architecture:** Helper puro `leaderboard.ts` (mês/agregação/ranking) +
`leaderboard-data.ts` (query). Componentes client `SwipeableActivityList` e
`RankingList`. `feed/page.tsx` resolve o ranking e passa à `RightSidebar`.

## Global Constraints (do programa — verbatim)
- Custo zero (sem dep npm; framer-motion + Tailwind + ícones caseiros). Violeta
  único acento alto (ouro/prata/bronze do pódio via `--mc-gold`/tons neutros),
  nunca rosa. Dark-aware (tokens). Commit por item; gate `tsc` 0 + `npm run test`
  + `next lint` sem erros. A11y (swipe também por botão; teclado). pt-BR.

---

### Task 1 — Ranking mensal: lógica pura + query

**Files:**
- Create: `src/lib/leaderboard.ts` + `src/lib/leaderboard.test.ts`
- Create: `src/lib/leaderboard-data.ts`

**Interfaces (produz):**
```ts
export function monthStartIso(now: Date): string;
export function aggregateMonthlyXp(
  events: { user_id: string; xp_amount: number; created_at: string }[],
  monthStartIso: string,
): Map<string, number>;
export type RankRow = { rank: number; name: string; xp: number };
export function rankLeaderboard(
  totals: { userId: string; name: string; xp: number }[],
  limit: number,
): RankRow[];
// data:
export function getMonthlyLeaderboard(now: Date, limit?: number): Promise<RankRow[]>;
```

- [ ] **Step 1: Teste (falha primeiro)** — `leaderboard.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { monthStartIso, aggregateMonthlyXp, rankLeaderboard } from "./leaderboard";

describe("monthStartIso", () => {
  it("1º dia do mês corrente (UTC)", () => {
    expect(monthStartIso(new Date("2026-07-15T12:00:00Z"))).toBe("2026-07-01T00:00:00.000Z");
  });
});
describe("aggregateMonthlyXp", () => {
  const ms = "2026-07-01T00:00:00.000Z";
  it("soma xp por user só no mês", () => {
    const m = aggregateMonthlyXp([
      { user_id: "a", xp_amount: 10, created_at: "2026-07-10T00:00:00Z" },
      { user_id: "a", xp_amount: 5, created_at: "2026-07-12T00:00:00Z" },
      { user_id: "b", xp_amount: 20, created_at: "2026-07-11T00:00:00Z" },
      { user_id: "a", xp_amount: 99, created_at: "2026-06-30T00:00:00Z" }, // fora do mês
    ], ms);
    expect(m.get("a")).toBe(15);
    expect(m.get("b")).toBe(20);
  });
});
describe("rankLeaderboard", () => {
  it("ordena desc, atribui rank, corta no limite", () => {
    const r = rankLeaderboard([
      { userId: "a", name: "Ana", xp: 15 },
      { userId: "b", name: "Bia", xp: 20 },
      { userId: "c", name: "Cid", xp: 5 },
    ], 2);
    expect(r).toEqual([
      { rank: 1, name: "Bia", xp: 20 },
      { rank: 2, name: "Ana", xp: 15 },
    ]);
  });
});
```

- [ ] **Step 2: Rodar/ver falhar.**

- [ ] **Step 3: Implementar `leaderboard.ts`:**
```ts
export function monthStartIso(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function aggregateMonthlyXp(
  events: { user_id: string; xp_amount: number; created_at: string }[],
  monthStartIso: string,
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const e of events) {
    if (e.created_at < monthStartIso) continue;
    totals.set(e.user_id, (totals.get(e.user_id) ?? 0) + e.xp_amount);
  }
  return totals;
}

export type RankRow = { rank: number; name: string; xp: number };
export function rankLeaderboard(
  totals: { userId: string; name: string; xp: number }[],
  limit: number,
): RankRow[] {
  return [...totals]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
    .map((t, i) => ({ rank: i + 1, name: t.name, xp: t.xp }));
}
```

- [ ] **Step 4: Rodar/ver passar.**

- [ ] **Step 5: `leaderboard-data.ts`** — `getMonthlyLeaderboard`:
  - `const ms = monthStartIso(now)`; busca `xp_events` (`user_id, xp_amount,
    created_at`) com `.gte("created_at", ms)` (via `getSupabaseServerClient`).
  - `aggregateMonthlyXp(rows, ms)` → totals por user; busca `users`
    (`id, display_name`) `.in("id", userIds)`; monta `{userId, name, xp}` **só
    para quem tem `display_name` não-nulo** (opt-in); `rankLeaderboard(_, limit)`.

- [ ] **Step 6: Gate + Commit** `feat(design-v2): ranking mensal (agregacao XP + query)`.

---

### Task 2 — `RankingList` animado (modelo animated-list)

**Files:**
- Create: `src/components/app/feed/RankingList.tsx`

- [ ] **Step 1: `RankingList.tsx` (client).** Props: `{ rows: RankRow[] }`.
  - Lista com entrada **staggered** (framer-motion: container com
    `staggerChildren`, cada linha `initial={{opacity:0, x:12}} animate={{opacity:1,
    x:0}}` spring). Cada linha: posição (`#{rank}`; top-3 com destaque — 1º ouro
    `text-[--mc-gold]`/medalha, 2º/3º tons), nome (truncate), XP (`{xp} XP`).
  - Estado vazio: "Ninguém pontuou este mês ainda."
  - A11y: `ol`/`li` com ordem semântica.

- [ ] **Step 2: Gate + Commit** `feat(design-v2): RankingList animado (top scorers do mes)`.

---

### Task 3 — `SwipeableActivityList` (modelo swipeable-list) + montagem

**Files:**
- Create: `src/components/app/feed/SwipeableActivityList.tsx`
- Modify: `src/lib/feed.ts` (garantir `at` no `ActivityItem` — já existe)
- Modify: `src/components/app/feed/RightSidebar.tsx` (usar os 2 blocos)
- Modify: `src/app/feed/page.tsx` (resolver `getMonthlyLeaderboard`, passar rows)

- [ ] **Step 1: `SwipeableActivityList.tsx` (client).** Props: `{ items:
  ActivityItem[] }` (`{ text; at }`).
  - Estado local `dismissed: Set<number>` (índices escondidos).
  - Cada item num `motion.div` `drag="x"` `dragConstraints={{left:-96, right:0}}`
    `dragElastic={0.15}`; ao soltar além de ~-64px, revela/aciona **"Dispensar"**
    (adiciona ao `dismissed`, `AnimatePresence` remove com `exit`). Fundo revelado
    à direita com rótulo "Dispensar" (tom neutro/danger suave).
  - Leading: `IconBadge` em quadrado arredondado violeta; texto = `item.text`;
    meta = `relativeTime(item.at, new Date())`.
  - **Botão "Dispensar"** visível (não só swipe) para acesso por teclado
    (`aria-label`).
  - Estado vazio: "Ainda sem atividade por aqui."

- [ ] **Step 2: `RightSidebar.tsx`** — receber `ranking: RankRow[]`; render:
  bloco "Comunidade" (mantém gating Advanced; usa `SwipeableActivityList` no lugar
  da `<ul>`) + novo bloco "Ranking da temporada" (`RankingList rows={ranking}`,
  visível a todos os logados).

- [ ] **Step 3: `feed/page.tsx`** — `const ranking = user ? await
  getMonthlyLeaderboard(new Date()) : []`; passar `ranking` à `RightSidebar`.

- [ ] **Step 4: Gate + Commit** `feat(design-v2): atividades swipeable + ranking na RightSidebar`.

---

## Self-Review
- Cobertura: ranking backend+puro (T1) ✓; RankingList animado (T2) ✓; atividades
  swipeable + montagem (T3) ✓. Puros testados: `monthStartIso`,
  `aggregateMonthlyXp`, `rankLeaderboard`. Sem migration nova.
- Consistência: `RankRow` (T1) consumido por RankingList/RightSidebar/page;
  `ActivityItem` já tem `at`.
