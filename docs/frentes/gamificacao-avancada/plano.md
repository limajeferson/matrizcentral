# Gamificação Avançada Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar níveis, badges, certificado verificável, leaderboard, desafios semanais e notificações de conquista, adaptando a arquitetura antiga (`arquitetura-2/`, baseada em login) ao modelo real de acesso por token.

**Architecture:** Cada frente segue o padrão já usado no repo: catálogo de dados estático em `src/data/*.ts`, lógica pura testável em `src/lib/*.ts` (sem I/O), e um ponto de integração server-side (rota ou helper) que chama a lógica pura e persiste no Supabase. UI nova entra em `src/app/dashboard/[token]/*` e `src/components/dashboard/*`.

**Tech Stack:** Next.js (App Router), Supabase (Postgres + service role client), Vitest (`environment: "node"` — só lógica pura em `src/lib`/`src/data` é testada automaticamente), Brevo (e-mail transacional).

## Global Constraints

- Custo zero: nenhuma dependência npm nova, nenhum serviço externo novo (reaproveitar Brevo, `nanoid` já instalado, sem geração de PDF server-side).
- Vitest roda em `environment: "node"` (sem jsdom) — só testar lógica pura em `src/lib`/`src/data`. Rotas que só orquestram chamadas Supabase seguem o padrão já existente no repo (ex.: `content-xp.ts`, `email.ts`) de **não ter teste automatizado** quando a integração é só encadeamento de queries; nesses casos a verificação é manual via `npm run dev`.
- Gate real antes de qualquer commit: `npx tsc --noEmit` (exit 0) + `npm run test`.
- Migrations Supabase vão numeradas sequencialmente a partir de `0012` em `supabase/migrations/`, aplicadas via a tool MCP `mcp__plugin_supabase_supabase__apply_migration` com `project_id=rzolsrzyafijaogjcjjb` (mesmo fluxo usado nesta sessão).
- Comunicação e nomes de variável/UI em português do Brasil, seguindo o padrão do restante do dashboard.

---

### Task 1: Fundação — migration + tipos Supabase

**Files:**
- Create: `supabase/migrations/0012_gamificacao_fundacao.sql`
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: colunas `users.display_name` (`string | null`), `users.leaderboard_opt_in` (`boolean`); tabelas `badges_earned`, `certificates`, `challenge_claims` tipadas em `Database["public"]["Tables"]`; `XpActionType` passa a incluir `"desafio"`.

- [ ] **Step 1: Escrever a migration**

Criar `supabase/migrations/0012_gamificacao_fundacao.sql`:

```sql
-- Fundação da gamificação avançada: mantém users.total_xp em sincronia via
-- trigger (hoje a coluna existe mas nunca é incrementada), faz o backfill do
-- que já foi acumulado em xp_events, e cria as tabelas de badges, certificado,
-- leaderboard (opt-in) e desafios.

update users set total_xp = coalesce(
  (select sum(xp_amount) from xp_events where xp_events.user_id = users.id),
  0
);

create or replace function sync_users_total_xp()
returns trigger as $$
begin
  update users set total_xp = total_xp + new.xp_amount where id = new.user_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists xp_events_sync_total_xp on xp_events;
create trigger xp_events_sync_total_xp
after insert on xp_events
for each row
execute function sync_users_total_xp();

alter table xp_events drop constraint xp_events_action_type_check;
alter table xp_events add constraint xp_events_action_type_check
  check (action_type in ('compra', 'triagem', 'download', 'validacao', 'conteudo', 'roadmap', 'desafio'));

alter table users add column if not exists display_name text;
alter table users add column if not exists leaderboard_opt_in boolean not null default false;

create table if not exists badges_earned (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table badges_earned enable row level security;

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  certificate_type text not null,
  reference_id text not null,
  title text not null,
  issued_at timestamptz not null default now(),
  verification_code text not null unique
);

alter table certificates enable row level security;

create table if not exists challenge_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  week_key text not null,
  challenge_id text not null,
  claimed_at timestamptz not null default now(),
  unique (user_id, week_key)
);

alter table challenge_claims enable row level security;
-- Default-deny: sem policies novas, acesso só via service role key (mesmo padrão das demais tabelas).
```

- [ ] **Step 2: Aplicar a migration no Supabase**

Use a tool `mcp__plugin_supabase_supabase__apply_migration` com:
- `project_id`: `rzolsrzyafijaogjcjjb`
- `name`: `gamificacao_fundacao`
- `query`: o conteúdo do SQL acima

Confirme que a resposta é `{"success": true}`.

- [ ] **Step 3: Atualizar `src/types/index.ts`**

No topo do arquivo, altere a linha:

```ts
export type XpActionType = "compra" | "triagem" | "download" | "validacao" | "conteudo" | "roadmap";
```

para:

```ts
export type XpActionType = "compra" | "triagem" | "download" | "validacao" | "conteudo" | "roadmap" | "desafio";
```

Na tabela `users`, adicione os dois campos novos em `Row` e `Insert`:

```ts
      users: {
        Row: {
          id: string;
          email: string;
          stripe_customer_id: string | null;
          total_xp: number;
          display_name: string | null;
          leaderboard_opt_in: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          stripe_customer_id?: string | null;
          total_xp?: number;
          display_name?: string | null;
          leaderboard_opt_in?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
```

Depois da definição da tabela `roadmap_progress` (última tabela do arquivo antes de `Views`), adicione as três tabelas novas:

```ts
      badges_earned: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["badges_earned"]["Insert"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          certificate_type: string;
          reference_id: string;
          title: string;
          issued_at: string;
          verification_code: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          certificate_type: string;
          reference_id: string;
          title: string;
          issued_at?: string;
          verification_code: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
        Relationships: [];
      };
      challenge_claims: {
        Row: {
          id: string;
          user_id: string;
          week_key: string;
          challenge_id: string;
          claimed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_key: string;
          challenge_id: string;
          claimed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["challenge_claims"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0, sem erros.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0012_gamificacao_fundacao.sql src/types/index.ts
git commit -m "feat(gamificacao): fundacao - trigger de total_xp, badges_earned, certificates, challenge_claims"
```

---

### Task 2: Níveis — lógica pura

**Files:**
- Create: `src/data/levels.ts`
- Create: `src/lib/levels.ts`
- Test: `src/lib/levels.test.ts`

**Interfaces:**
- Consumes: nenhuma (função pura, sem dependências de outras tasks).
- Produces: `getLevelProgress(totalXp: number): LevelProgress` onde `LevelProgress = { level: number; name: string; xpIntoLevel: number; xpToNext: number | null; nextLevelName: string | null; progressPercent: number }`. Usado pela Task 3 (dashboard) e futuramente por notificações (Task 12).

- [ ] **Step 1: Criar o catálogo de níveis**

Criar `src/data/levels.ts`:

```ts
export interface LevelDefinition {
  level: number;
  name: string;
  requiredXp: number;
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: "Aprendiz", requiredXp: 0 },
  { level: 2, name: "Iniciado", requiredXp: 500 },
  { level: 3, name: "Praticante", requiredXp: 1000 },
  { level: 4, name: "Especialista", requiredXp: 2000 },
  { level: 5, name: "Mestre", requiredXp: 4000 },
];
```

- [ ] **Step 2: Escrever o teste (falhando)**

Criar `src/lib/levels.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getLevelProgress } from "@/lib/levels";

describe("getLevelProgress", () => {
  it("nível 1 com 0 XP", () => {
    const progress = getLevelProgress(0);
    expect(progress.level).toBe(1);
    expect(progress.name).toBe("Aprendiz");
    expect(progress.xpToNext).toBe(500);
    expect(progress.progressPercent).toBe(0);
  });

  it("nível 2 ao atingir exatamente 500 XP", () => {
    const progress = getLevelProgress(500);
    expect(progress.level).toBe(2);
    expect(progress.name).toBe("Iniciado");
    expect(progress.xpIntoLevel).toBe(0);
  });

  it("progresso parcial dentro do nível", () => {
    const progress = getLevelProgress(750);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(250);
    expect(progress.xpToNext).toBe(250);
    expect(progress.progressPercent).toBe(50);
  });

  it("nível máximo não tem próximo nível", () => {
    const progress = getLevelProgress(10000);
    expect(progress.level).toBe(5);
    expect(progress.name).toBe("Mestre");
    expect(progress.xpToNext).toBeNull();
    expect(progress.nextLevelName).toBeNull();
    expect(progress.progressPercent).toBe(100);
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/levels.test.ts`
Expected: FAIL com `Cannot find module '@/lib/levels'` (o módulo ainda não existe).

- [ ] **Step 4: Implementar `src/lib/levels.ts`**

```ts
import { LEVELS } from "@/data/levels";

export interface LevelProgress {
  level: number;
  name: string;
  xpIntoLevel: number;
  xpToNext: number | null;
  nextLevelName: string | null;
  progressPercent: number;
}

export function getLevelProgress(totalXp: number): LevelProgress {
  let current = LEVELS[0];
  for (const definition of LEVELS) {
    if (totalXp >= definition.requiredXp) {
      current = definition;
    }
  }

  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[currentIndex + 1] ?? null;

  const xpIntoLevel = totalXp - current.requiredXp;
  const xpToNext = next ? next.requiredXp - totalXp : null;
  const levelSpan = next ? next.requiredXp - current.requiredXp : null;
  const progressPercent = levelSpan ? Math.round((xpIntoLevel / levelSpan) * 100) : 100;

  return {
    level: current.level,
    name: current.name,
    xpIntoLevel,
    xpToNext,
    nextLevelName: next?.name ?? null,
    progressPercent,
  };
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/levels.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 6: Commit**

```bash
git add src/data/levels.ts src/lib/levels.ts src/lib/levels.test.ts
git commit -m "feat(gamificacao): niveis - catalogo e getLevelProgress"
```

---

### Task 3: Níveis — UI no dashboard

**Files:**
- Modify: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Consumes: `getLevelProgress` de `src/lib/levels.ts` (Task 2).

- [ ] **Step 1: Trocar o cálculo de XP para ler a coluna `users.total_xp`**

Em `src/app/dashboard/[token]/page.tsx`, localize o bloco:

```tsx
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
```

e substitua por:

```tsx
  let totalXp = 0;
  if (purchase) {
    const { data: userRow } = await supabase
      .from("users")
      .select("total_xp")
      .eq("id", purchase.user_id)
      .single();

    totalXp = userRow?.total_xp ?? 0;
  }

  const levelProgress = getLevelProgress(totalXp);
```

Adicione o import no topo do arquivo (junto aos outros imports de `@/lib` e `@/data`):

```tsx
import { getLevelProgress } from "@/lib/levels";
```

- [ ] **Step 2: Substituir o badge de XP por nível + barra de progresso**

Localize:

```tsx
      <CategoryBadge variant="xp" className="text-sm">
        ⭐ {totalXp} XP
      </CategoryBadge>
```

e substitua por:

```tsx
      <GlassCard className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <CategoryBadge variant="xp">
            Nível {levelProgress.level} — {levelProgress.name}
          </CategoryBadge>
          <span className="text-xs text-zinc-500">{totalXp} XP total</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${levelProgress.progressPercent}%` }}
          />
        </div>
        {levelProgress.nextLevelName ? (
          <p className="mt-1 text-xs text-zinc-500">
            {levelProgress.xpToNext} XP para o nível {levelProgress.level + 1} —{" "}
            {levelProgress.nextLevelName}
          </p>
        ) : (
          <p className="mt-1 text-xs text-zinc-500">Nível máximo alcançado!</p>
        )}
      </GlassCard>
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Verificação manual**

Run: `npm run dev -- -p 3000`

Acesse `/dashboard/<token-de-teste>` (use um token válido existente no Supabase) e confirme visualmente que aparece "Nível X — Nome" com a barra de progresso preenchida proporcionalmente ao XP.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/\[token\]/page.tsx
git commit -m "feat(gamificacao): niveis - exibe nivel e progresso no dashboard"
```

---

### Task 4: Badges — catálogo e avaliador (lógica pura)

**Files:**
- Create: `src/data/badges.ts`
- Create: `src/lib/badges.ts`
- Test: `src/lib/badges.test.ts`

**Interfaces:**
- Consumes: `ContentType` de `src/data/content-hub.ts` (já existe).
- Produces: `evaluateBadges(stats: UserGamificationStats): string[]` (ids dos badges elegíveis) e `UserGamificationStats`. Usado pela Task 5.

- [ ] **Step 1: Criar o catálogo de badges**

Criar `src/data/badges.ts`:

```ts
import type { ContentType } from "@/data/content-hub";

export type BadgeCondition =
  | { type: "xp_total"; value: number }
  | { type: "content_type_count"; contentType: ContentType; value: number }
  | { type: "roadmap_stage"; stageKey: string }
  | { type: "quiz_validacao_passed" }
  | { type: "purchase_count"; value: number };

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: BadgeCondition;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "autoconhecimento",
    name: "Autoconhecimento",
    description: "Completou o diagnóstico inicial.",
    icon: "🧭",
    rarity: "common",
    condition: { type: "xp_total", value: 50 },
  },
  {
    id: "primeiro_relatorio",
    name: "Primeira Leitura",
    description: "Concluiu o primeiro relatório do hub de conteúdo.",
    icon: "📄",
    rarity: "common",
    condition: { type: "content_type_count", contentType: "relatorio", value: 1 },
  },
  {
    id: "ouvinte_dedicado",
    name: "Ouvinte Dedicado",
    description: "Concluiu 3 podcasts do hub de conteúdo.",
    icon: "🎧",
    rarity: "rare",
    condition: { type: "content_type_count", contentType: "podcast", value: 3 },
  },
  {
    id: "iniciado",
    name: "Iniciado",
    description: "Atingiu 500 XP.",
    icon: "⭐",
    rarity: "rare",
    condition: { type: "xp_total", value: 500 },
  },
  {
    id: "missao_cumprida",
    name: "Missão Cumprida",
    description: "Concluiu a etapa final do roadmap.",
    icon: "🏁",
    rarity: "epic",
    condition: { type: "roadmap_stage", stageKey: "missao_final" },
  },
  {
    id: "validado",
    name: "Conhecimento Validado",
    description: "Foi aprovado no quiz de validação.",
    icon: "✅",
    rarity: "epic",
    condition: { type: "quiz_validacao_passed" },
  },
  {
    id: "especialista",
    name: "Especialista",
    description: "Atingiu 2000 XP.",
    icon: "🔥",
    rarity: "legendary",
    condition: { type: "xp_total", value: 2000 },
  },
];
```

- [ ] **Step 2: Escrever o teste (falhando)**

Criar `src/lib/badges.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { evaluateBadges, type UserGamificationStats } from "@/lib/badges";

const baseStats: UserGamificationStats = {
  totalXp: 0,
  contentCompletedByType: {},
  roadmapStagesCompleted: [],
  quizValidacaoPassed: false,
  purchaseCount: 0,
};

describe("evaluateBadges", () => {
  it("nenhum badge com stats zerados", () => {
    expect(evaluateBadges(baseStats)).toEqual([]);
  });

  it("badges de xp_total quando atinge o valor", () => {
    const badges = evaluateBadges({ ...baseStats, totalXp: 500 });
    expect(badges).toContain("autoconhecimento");
    expect(badges).toContain("iniciado");
  });

  it("badge de content_type_count por tipo de conteúdo", () => {
    const badges = evaluateBadges({
      ...baseStats,
      contentCompletedByType: { podcast: 3 },
    });
    expect(badges).toContain("ouvinte_dedicado");
  });

  it("não concede content_type_count antes de atingir o valor", () => {
    const badges = evaluateBadges({
      ...baseStats,
      contentCompletedByType: { podcast: 2 },
    });
    expect(badges).not.toContain("ouvinte_dedicado");
  });

  it("badge de roadmap_stage quando a etapa está na lista", () => {
    const badges = evaluateBadges({
      ...baseStats,
      roadmapStagesCompleted: ["missao_final"],
    });
    expect(badges).toContain("missao_cumprida");
  });

  it("badge de quiz_validacao_passed", () => {
    const badges = evaluateBadges({ ...baseStats, quizValidacaoPassed: true });
    expect(badges).toContain("validado");
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/badges.test.ts`
Expected: FAIL com `Cannot find module '@/lib/badges'`.

- [ ] **Step 4: Implementar `src/lib/badges.ts`**

```ts
import { BADGES, type BadgeDefinition } from "@/data/badges";
import type { ContentType } from "@/data/content-hub";

export interface UserGamificationStats {
  totalXp: number;
  contentCompletedByType: Partial<Record<ContentType, number>>;
  roadmapStagesCompleted: string[];
  quizValidacaoPassed: boolean;
  purchaseCount: number;
}

function meetsCondition(
  condition: BadgeDefinition["condition"],
  stats: UserGamificationStats
): boolean {
  switch (condition.type) {
    case "xp_total":
      return stats.totalXp >= condition.value;
    case "content_type_count":
      return (stats.contentCompletedByType[condition.contentType] ?? 0) >= condition.value;
    case "roadmap_stage":
      return stats.roadmapStagesCompleted.includes(condition.stageKey);
    case "quiz_validacao_passed":
      return stats.quizValidacaoPassed;
    case "purchase_count":
      return stats.purchaseCount >= condition.value;
  }
}

export function evaluateBadges(stats: UserGamificationStats): string[] {
  return BADGES.filter((badge) => meetsCondition(badge.condition, stats)).map(
    (badge) => badge.id
  );
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/badges.test.ts`
Expected: PASS (6 testes).

- [ ] **Step 6: Commit**

```bash
git add src/data/badges.ts src/lib/badges.ts src/lib/badges.test.ts
git commit -m "feat(gamificacao): badges - catalogo e evaluateBadges"
```

---

### Task 5: Badges — concessão server-side e integração nas rotas de XP

**Files:**
- Create: `src/lib/grant-badges.ts`
- Modify: `src/app/api/quiz/route.ts`
- Modify: `src/lib/content-xp.ts`
- Modify: `src/app/api/roadmap/complete/route.ts`

**Interfaces:**
- Consumes: `evaluateBadges`, `UserGamificationStats` (Task 4).
- Produces: `grantBadges(supabase: SupabaseClient<Database>, userId: string): Promise<string[]>` (retorna ids dos badges recém-concedidos). Usado pela Task 6 (UI) e Task 12 (notificação, opcionalmente).

- [ ] **Step 1: Implementar `src/lib/grant-badges.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";
import { evaluateBadges, type UserGamificationStats } from "@/lib/badges";
import { CONTENT_HUB, type ContentType } from "@/data/content-hub";

async function buildStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserGamificationStats> {
  const { data: userRow } = await supabase
    .from("users")
    .select("total_xp")
    .eq("id", userId)
    .single();

  const { data: purchases } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId);

  const purchaseIds = (purchases ?? []).map((p) => p.id);

  const tokenRows = purchaseIds.length
    ? (await supabase.from("tokens").select("token").in("purchase_id", purchaseIds)).data
    : [];

  const tokens = (tokenRows ?? []).map((t) => t.token);

  const completions = tokens.length
    ? (await supabase.from("content_completions").select("content_id").in("token", tokens)).data
    : [];

  const contentTypeById = new Map(CONTENT_HUB.map((item) => [item.id, item.type]));
  const contentCompletedByType: Partial<Record<ContentType, number>> = {};
  for (const completion of completions ?? []) {
    const type = contentTypeById.get(completion.content_id);
    if (!type) continue;
    contentCompletedByType[type] = (contentCompletedByType[type] ?? 0) + 1;
  }

  const roadmapRows = tokens.length
    ? (await supabase.from("roadmap_progress").select("stage_key").in("token", tokens)).data
    : [];

  const roadmapStagesCompleted = (roadmapRows ?? []).map((r) => r.stage_key);

  const { data: validacaoEvents } = await supabase
    .from("xp_events")
    .select("id")
    .eq("user_id", userId)
    .eq("action_type", "validacao")
    .limit(1);

  return {
    totalXp: userRow?.total_xp ?? 0,
    contentCompletedByType,
    roadmapStagesCompleted,
    quizValidacaoPassed: (validacaoEvents ?? []).length > 0,
    purchaseCount: purchaseIds.length,
  };
}

export async function grantBadges(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const stats = await buildStats(supabase, userId);
  const eligibleBadgeIds = evaluateBadges(stats);

  if (eligibleBadgeIds.length === 0) {
    return [];
  }

  const { data: alreadyEarned } = await supabase
    .from("badges_earned")
    .select("badge_id")
    .eq("user_id", userId);

  const earnedIds = new Set((alreadyEarned ?? []).map((b) => b.badge_id));
  const newBadgeIds = eligibleBadgeIds.filter((id) => !earnedIds.has(id));

  if (newBadgeIds.length === 0) {
    return [];
  }

  await supabase
    .from("badges_earned")
    .insert(newBadgeIds.map((badgeId) => ({ user_id: userId, badge_id: badgeId })));

  return newBadgeIds;
}
```

> Nota: `grantBadges` não tem teste automatizado, seguindo o mesmo padrão já usado no repo para helpers que só orquestram queries Supabase (ex.: `src/lib/content-xp.ts`, `src/lib/email.ts` também não têm). A lógica de decisão (`evaluateBadges`) já está 100% coberta na Task 4. A verificação é manual (Step 5 abaixo).

- [ ] **Step 2: Chamar `grantBadges` em `src/app/api/quiz/route.ts`**

No bloco de `quizType === "triagem"`, logo após o `await supabase.from("xp_events").insert(...)` dentro do `if (purchase) { ... }`, adicione a chamada:

```ts
    if (purchase) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "triagem",
        reference_id: token,
      });
      await grantBadges(supabase, purchase.user_id);
    }
```

No bloco de validação (`if (passed)`), dentro do `if (!existingXpEvent)`, após o insert:

```ts
      if (!existingXpEvent) {
        await supabase.from("xp_events").insert({
          user_id: purchase.user_id,
          xp_amount: 100,
          action_type: "validacao",
          reference_id: token,
        });
        await grantBadges(supabase, purchase.user_id);
      }
```

Adicione o import no topo do arquivo:

```ts
import { grantBadges } from "@/lib/grant-badges";
```

- [ ] **Step 3: Chamar `grantBadges` em `src/lib/content-xp.ts`**

No final de `grantContentXp`, antes do `return xpReward;`, adicione:

```ts
  await supabase.from("xp_events").insert({
    user_id: purchase.user_id,
    xp_amount: xpReward,
    action_type: "conteudo",
    reference_id: contentId,
  });

  await grantBadges(supabase, purchase.user_id);

  return xpReward;
```

Adicione o import no topo do arquivo:

```ts
import { grantBadges } from "@/lib/grant-badges";
```

- [ ] **Step 4: Chamar `grantBadges` em `src/app/api/roadmap/complete/route.ts`**

Dentro do `if (purchase) { ... }`, após o `if (!existingXpEvent) { ... }`, adicione a chamada (fora do `if`, pois o badge de `roadmap_stage` depende de `roadmap_progress`, que já foi salvo antes, não do XP):

```ts
  if (purchase) {
    const referenceId = `${token}:${stageKey}`;

    const { data: existingXpEvent } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("action_type", "roadmap")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (!existingXpEvent) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "roadmap",
        reference_id: referenceId,
      });
    }

    await grantBadges(supabase, purchase.user_id);
  }
```

Adicione o import no topo do arquivo:

```ts
import { grantBadges } from "@/lib/grant-badges";
```

- [ ] **Step 5: Ajustar o mock de `src/app/api/roadmap/complete/route.test.ts` para cobrir as tabelas usadas por `grantBadges`**

O mock `buildSupabaseMock` desse arquivo lança `throw new Error("tabela não mockada")` para qualquer tabela fora de `tokens`, `roadmap_progress`, `purchases`, `xp_events`. Como a rota agora também chama `grantBadges` (que consulta `users`, `tokens`, `content_completions`, `roadmap_progress`, `badges_earned`), adicione branches para essas tabelas retornando dados vazios/zero. Localize a função `buildSupabaseMock` e, antes da linha `throw new Error(\`tabela não mockada: ${table}\`);`, adicione:

```ts
    if (table === "users") {
      return {
        select: () => ({
          eq: () => ({ single: async () => ({ data: { total_xp: 0 }, error: null }) }),
        }),
      };
    }
    if (table === "content_completions") {
      return {
        select: () => ({ in: async () => ({ data: [], error: null }) }),
      };
    }
    if (table === "badges_earned") {
      return {
        select: () => ({ eq: async () => ({ data: [], error: null }) }),
        insert: async () => ({ data: null, error: null }),
      };
    }
```

Note que `table === "roadmap_progress"` e `table === "purchases"` já existem no mock (usados pela própria rota) — reaproveite-os; o método `.select().in(...)` usado por `grantBadges` para `tokens` precisa ser adicionado ao branch `tokens` já existente (que hoje só implementa `.select().eq().maybeSingle()`). Localize o branch `if (table === "tokens")` e adicione o método `in`:

```ts
    if (table === "tokens") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: tokenRow, error: null }) }),
          in: async () => ({ data: [], error: null }),
        }),
      };
    }
```

- [ ] **Step 6: Rodar os testes existentes e confirmar que continuam passando**

Run: `npx vitest run src/app/api/roadmap/complete/route.test.ts`
Expected: PASS (todos os testes já existentes antes desta task).

- [ ] **Step 7: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 8: Verificação manual**

Run: `npm run dev -- -p 3000`. Complete a triagem e o quiz de validação de um token de teste; confirme no Supabase (`select * from badges_earned`) que os badges esperados foram inseridos.

- [ ] **Step 9: Commit**

```bash
git add src/lib/grant-badges.ts src/app/api/quiz/route.ts src/lib/content-xp.ts src/app/api/roadmap/complete/route.ts src/app/api/roadmap/complete/route.test.ts
git commit -m "feat(gamificacao): badges - concessao automatica nas rotas de XP"
```

---

### Task 6: Badges — prateleira no dashboard

**Files:**
- Create: `src/components/dashboard/BadgeShelf.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Consumes: `BADGES` de `src/data/badges.ts` (Task 4); tabela `badges_earned` (Task 1).

- [ ] **Step 1: Criar `src/components/dashboard/BadgeShelf.tsx`**

```tsx
import { BADGES } from "@/data/badges";
import GlassCard from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface BadgeShelfProps {
  earnedBadgeIds: string[];
}

export default function BadgeShelf({ earnedBadgeIds }: BadgeShelfProps) {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <GlassCard className="p-6">
      <h2 className="mb-3 font-bold text-zinc-900">Conquistas</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {BADGES.map((badge) => {
          const earned = earnedSet.has(badge.id);
          return (
            <div
              key={badge.id}
              title={badge.description}
              className={cn(
                "flex flex-col items-center rounded-xl border p-3 text-center",
                earned
                  ? "border-violet-300 bg-violet-50"
                  : "border-zinc-200 bg-zinc-50 opacity-40 grayscale"
              )}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="mt-1 text-xs font-semibold text-zinc-800">{badge.name}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Buscar `badges_earned` no dashboard e renderizar o componente**

Em `src/app/dashboard/[token]/page.tsx`, adicione o import:

```tsx
import BadgeShelf from "@/components/dashboard/BadgeShelf";
```

Após o bloco que busca `progressRows`/`completedStages`, adicione:

```tsx
  let earnedBadgeIds: string[] = [];
  if (purchase) {
    const { data: badgeRows } = await supabase
      .from("badges_earned")
      .select("badge_id")
      .eq("user_id", purchase.user_id);

    earnedBadgeIds = (badgeRows ?? []).map((row) => row.badge_id);
  }
```

Adicione `<BadgeShelf earnedBadgeIds={earnedBadgeIds} />` dentro do `<div className="mx-auto max-w-4xl space-y-8 p-6">`, logo depois do `GlassCard` de nível criado na Task 3.

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Verificação manual**

Run: `npm run dev -- -p 3000`. Acesse o dashboard de um token com badges concedidos (Task 5) e confirme que os badges conquistados aparecem coloridos e os não conquistados aparecem em escala de cinza.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/BadgeShelf.tsx src/app/dashboard/\[token\]/page.tsx
git commit -m "feat(gamificacao): badges - prateleira de conquistas no dashboard"
```

---

### Task 7: Certificado — emissão automática

**Files:**
- Create: `src/lib/certificates.ts`
- Modify: `src/app/api/roadmap/complete/route.ts`

**Interfaces:**
- Consumes: `nanoid` (já instalado, usado em `src/lib/tokens.ts`).
- Produces: `buildVerificationCode(): string`, `issueCertificateIfEligible(supabase, params): Promise<{ verificationCode: string } | null>` onde `params = { userId: string; profileId: string | null; profileName: string; roadmapStagesCompleted: string[]; quizValidacaoPassed: boolean }`. Usado pela Task 8 (páginas) e Task 12 (notificação).

- [ ] **Step 1: Escrever o teste da parte pura (falhando)**

Criar `src/lib/certificates.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isEligibleForCertificate } from "@/lib/certificates";

describe("isEligibleForCertificate", () => {
  it("não é elegível sem a etapa final do roadmap", () => {
    expect(
      isEligibleForCertificate({
        roadmapStagesCompleted: ["fundacao_local"],
        quizValidacaoPassed: true,
      })
    ).toBe(false);
  });

  it("não é elegível sem o quiz de validação aprovado", () => {
    expect(
      isEligibleForCertificate({
        roadmapStagesCompleted: ["missao_final"],
        quizValidacaoPassed: false,
      })
    ).toBe(false);
  });

  it("é elegível com a etapa final concluída e quiz aprovado", () => {
    expect(
      isEligibleForCertificate({
        roadmapStagesCompleted: ["fundacao_local", "missao_final"],
        quizValidacaoPassed: true,
      })
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/certificates.test.ts`
Expected: FAIL com `Cannot find module '@/lib/certificates'`.

- [ ] **Step 3: Implementar `src/lib/certificates.ts`**

```ts
import { customAlphabet } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const generateCode = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

export function buildVerificationCode(): string {
  return generateCode();
}

export function isEligibleForCertificate(params: {
  roadmapStagesCompleted: string[];
  quizValidacaoPassed: boolean;
}): boolean {
  return (
    params.roadmapStagesCompleted.includes("missao_final") && params.quizValidacaoPassed
  );
}

export async function issueCertificateIfEligible(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    profileName: string;
    roadmapStagesCompleted: string[];
    quizValidacaoPassed: boolean;
  }
): Promise<{ verificationCode: string } | null> {
  if (!isEligibleForCertificate(params)) {
    return null;
  }

  const { data: existing } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("user_id", params.userId)
    .eq("certificate_type", "roadmap_completion")
    .maybeSingle();

  if (existing) {
    return { verificationCode: existing.verification_code };
  }

  const verificationCode = buildVerificationCode();

  await supabase.from("certificates").insert({
    user_id: params.userId,
    certificate_type: "roadmap_completion",
    reference_id: params.profileName,
    title: `Certificado de Conclusão — Trilha ${params.profileName}`,
    verification_code: verificationCode,
  });

  return { verificationCode };
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/certificates.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Integrar em `src/app/api/roadmap/complete/route.ts`**

Após a chamada de `grantBadges` adicionada na Task 5, e assumindo que a rota já tem acesso a `tokenRow.profile_id` e a `profile` (se não tiver, busque `profiles` por `tokenRow.profile_id`), adicione:

```ts
  if (purchase) {
    const referenceId = `${token}:${stageKey}`;

    const { data: existingXpEvent } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("action_type", "roadmap")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (!existingXpEvent) {
      await supabase.from("xp_events").insert({
        user_id: purchase.user_id,
        xp_amount: 50,
        action_type: "roadmap",
        reference_id: referenceId,
      });
    }

    await grantBadges(supabase, purchase.user_id);

    if (stageKey === "missao_final") {
      const { data: allProgress } = await supabase
        .from("roadmap_progress")
        .select("stage_key")
        .eq("token", token);

      const { data: validacaoEvent } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", purchase.user_id)
        .eq("action_type", "validacao")
        .limit(1);

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", tokenRow.profile_id ?? "")
        .maybeSingle();

      await issueCertificateIfEligible(supabase, {
        userId: purchase.user_id,
        profileName: profileRow?.name ?? "Matriz Central",
        roadmapStagesCompleted: (allProgress ?? []).map((p) => p.stage_key),
        quizValidacaoPassed: (validacaoEvent ?? []).length > 0,
      });
    }
  }
```

Adicione o import no topo do arquivo:

```ts
import { issueCertificateIfEligible } from "@/lib/certificates";
```

- [ ] **Step 6: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 7: Verificação manual**

Complete todas as 5 etapas do roadmap de um token de teste (incluindo o quiz de validação antes ou depois) e confirme no Supabase (`select * from certificates`) que um certificado foi emitido com `verification_code` preenchido.

- [ ] **Step 8: Commit**

```bash
git add src/lib/certificates.ts src/lib/certificates.test.ts src/app/api/roadmap/complete/route.ts
git commit -m "feat(gamificacao): certificado - emissao automatica ao concluir o roadmap"
```

---

### Task 8: Certificado — páginas de visualização e verificação pública

**Files:**
- Create: `src/app/dashboard/[token]/certificado/page.tsx`
- Create: `src/app/certificado/[code]/page.tsx`

**Interfaces:**
- Consumes: tabela `certificates` (Task 1/7).

- [ ] **Step 1: Criar a página do dashboard `src/app/dashboard/[token]/certificado/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

export default async function CertificadoPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (!purchase) {
    notFound();
  }

  const { data: certificate } = await supabase
    .from("certificates")
    .select("title, issued_at, verification_code")
    .eq("user_id", purchase.user_id)
    .eq("certificate_type", "roadmap_completion")
    .maybeSingle();

  if (!certificate) {
    return (
      <p className="max-w-md mx-auto p-8 text-center">
        Você ainda não concluiu os requisitos para o certificado (roadmap completo + quiz de
        validação aprovado).
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 print:p-0">
      <div className="rounded-2xl border-4 border-violet-600 p-10 text-center print:border-2">
        <p className="text-sm uppercase tracking-widest text-zinc-500">Matriz Central</p>
        <h1 className="mt-4 text-3xl font-bold text-zinc-900">{certificate.title}</h1>
        <p className="mt-4 text-zinc-600">
          Emitido em{" "}
          {new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-6 text-xs text-zinc-400">
          Código de verificação: {certificate.verification_code}
        </p>
        <p className="text-xs text-zinc-400">
          Verifique em matrizcentral.com.br/certificado/{certificate.verification_code}
        </p>
      </div>
      <p className="text-center text-sm text-zinc-500 print:hidden">
        Use Ctrl+P (ou Cmd+P) para salvar este certificado como PDF.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Criar a página pública `src/app/certificado/[code]/page.tsx`**

```tsx
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function VerificacaoCertificadoPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = getSupabaseServerClient();
  const { data: certificate } = await supabase
    .from("certificates")
    .select("title, issued_at")
    .eq("verification_code", params.code)
    .maybeSingle();

  if (!certificate) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-bold text-zinc-900">Certificado não encontrado</h1>
        <p className="mt-2 text-zinc-600">
          O código informado não corresponde a nenhum certificado emitido.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-8 text-center">
      <p className="text-sm uppercase tracking-widest text-emerald-600">Certificado válido ✓</p>
      <h1 className="text-2xl font-bold text-zinc-900">{certificate.title}</h1>
      <p className="text-zinc-600">
        Emitido em{" "}
        {new Date(certificate.issued_at).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Verificação manual**

Acesse `/dashboard/<token>/certificado` para um token com certificado emitido (Task 7) e confirme a renderização. Copie o `verification_code` exibido e acesse `/certificado/<code>` — confirme que mostra "Certificado válido ✓". Acesse `/certificado/codigo-invalido` e confirme a mensagem de não encontrado.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/\[token\]/certificado/page.tsx src/app/certificado/\[code\]/page.tsx
git commit -m "feat(gamificacao): certificado - pagina de visualizacao e verificacao publica"
```

---

### Task 9: Leaderboard — opt-in e ranking

**Files:**
- Create: `src/app/api/leaderboard/opt-in/route.ts`
- Create: `src/app/dashboard/[token]/ranking/page.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Consumes: `users.total_xp`, `users.display_name`, `users.leaderboard_opt_in` (Task 1).

- [ ] **Step 1: Criar a rota de opt-in `src/app/api/leaderboard/opt-in/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const optIn = body?.optIn as boolean | undefined;
  const displayName = (body?.displayName as string | undefined)?.trim();

  if (!token || typeof optIn !== "boolean") {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  if (optIn && (!displayName || displayName.length < 2)) {
    return NextResponse.json(
      { error: "informe um nome de exibição com pelo menos 2 caracteres" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: "compra não encontrada" }, { status: 404 });
  }

  await supabase
    .from("users")
    .update({
      leaderboard_opt_in: optIn,
      display_name: optIn ? displayName : null,
    })
    .eq("id", purchase.user_id);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Criar a página `src/app/dashboard/[token]/ranking/page.tsx`**

```tsx
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import GlassCard from "@/components/ui/glass-card";

export default async function RankingPage({ params }: { params: { token: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", params.token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return <p className="max-w-md mx-auto p-8 text-center">Token inválido ou expirado.</p>;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  const { data: topUsers } = await supabase
    .from("users")
    .select("id, display_name, total_xp")
    .eq("leaderboard_opt_in", true)
    .order("total_xp", { ascending: false })
    .limit(20);

  const currentUserId = purchase?.user_id;
  const isCurrentUserInList = (topUsers ?? []).some((u) => u.id === currentUserId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Ranking</h1>
        <p className="text-zinc-600">
          Top 20 alunos que optaram por aparecer publicamente no ranking.
        </p>
      </div>

      <GlassCard className="p-4">
        <ol className="space-y-2">
          {(topUsers ?? []).map((user, index) => (
            <li
              key={user.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                user.id === currentUserId ? "bg-violet-100 font-semibold" : ""
              }`}
            >
              <span>
                #{index + 1} {user.display_name ?? "Anônimo"}
                {user.id === currentUserId ? " (você)" : ""}
              </span>
              <span>{user.total_xp} XP</span>
            </li>
          ))}
          {(topUsers ?? []).length === 0 && (
            <li className="text-zinc-500">Ninguém optou por aparecer no ranking ainda.</li>
          )}
        </ol>
        {!isCurrentUserInList && (
          <p className="mt-4 text-sm text-zinc-500">
            Você não está no ranking público. Ative isso no seu dashboard para aparecer aqui.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 3: Adicionar link para o ranking no dashboard**

Em `src/app/dashboard/[token]/page.tsx`, adicione dentro do `GlassCard` de hub de conteúdo (ou em um novo `GlassCard` simples), um link:

```tsx
      <GlassCard className="p-6">
        <div className="mb-2">
          <CategoryBadge variant="xp">Ranking</CategoryBadge>
        </div>
        <h2 className="mb-3 font-bold text-zinc-900">Veja sua posição</h2>
        <a
          href={`/dashboard/${params.token}/ranking`}
          className="inline-block rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
        >
          🏆 Ver ranking
        </a>
      </GlassCard>
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 5: Verificação manual**

Rode `npm run dev -- -p 3000`, chame `POST /api/leaderboard/opt-in` com `{"token": "<token-teste>", "optIn": true, "displayName": "Teste"}` via curl/Postman, e confirme que `/dashboard/<token>/ranking` mostra o usuário na lista.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/leaderboard/opt-in/route.ts src/app/dashboard/\[token\]/ranking/page.tsx src/app/dashboard/\[token\]/page.tsx
git commit -m "feat(gamificacao): leaderboard - opt-in e pagina de ranking"
```

---

### Task 10: Desafios — catálogo e lógica pura

**Files:**
- Create: `src/data/challenges.ts`
- Create: `src/lib/challenges.ts`
- Test: `src/lib/challenges.test.ts`

**Interfaces:**
- Produces: `getCurrentChallenge(date: Date): ChallengeDefinition`, `getIsoWeekKey(date: Date): string`. Usado pela Task 11.

- [ ] **Step 1: Criar o catálogo de desafios**

Criar `src/data/challenges.ts`:

```ts
export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetActionType: "conteudo" | "roadmap" | "validacao";
  targetCount: number;
}

export const CHALLENGES: ChallengeDefinition[] = [
  {
    id: "tres_conteudos",
    title: "Maratona de Conteúdo",
    description: "Conclua 3 itens do hub de conteúdo nesta semana.",
    xpReward: 100,
    targetActionType: "conteudo",
    targetCount: 3,
  },
  {
    id: "avanco_roadmap",
    title: "Passo Firme",
    description: "Conclua 2 etapas do roadmap nesta semana.",
    xpReward: 150,
    targetActionType: "roadmap",
    targetCount: 2,
  },
  {
    id: "um_conteudo_rapido",
    title: "Comece Leve",
    description: "Conclua 1 item do hub de conteúdo nesta semana.",
    xpReward: 50,
    targetActionType: "conteudo",
    targetCount: 1,
  },
];
```

- [ ] **Step 2: Escrever o teste (falhando)**

Criar `src/lib/challenges.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getCurrentChallenge, getIsoWeekKey } from "@/lib/challenges";
import { CHALLENGES } from "@/data/challenges";

describe("getIsoWeekKey", () => {
  it("gera a mesma chave para datas na mesma semana ISO", () => {
    const segunda = new Date("2026-07-06T10:00:00Z");
    const sexta = new Date("2026-07-10T10:00:00Z");
    expect(getIsoWeekKey(segunda)).toBe(getIsoWeekKey(sexta));
  });

  it("gera chaves diferentes para semanas diferentes", () => {
    const semana1 = new Date("2026-07-06T10:00:00Z");
    const semana2 = new Date("2026-07-13T10:00:00Z");
    expect(getIsoWeekKey(semana1)).not.toBe(getIsoWeekKey(semana2));
  });
});

describe("getCurrentChallenge", () => {
  it("retorna sempre um desafio válido do catálogo", () => {
    const challenge = getCurrentChallenge(new Date("2026-07-06T10:00:00Z"));
    expect(CHALLENGES.map((c) => c.id)).toContain(challenge.id);
  });

  it("é determinístico para a mesma semana", () => {
    const segunda = getCurrentChallenge(new Date("2026-07-06T10:00:00Z"));
    const sexta = getCurrentChallenge(new Date("2026-07-10T10:00:00Z"));
    expect(segunda.id).toBe(sexta.id);
  });
});
```

- [ ] **Step 3: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/challenges.test.ts`
Expected: FAIL com `Cannot find module '@/lib/challenges'`.

- [ ] **Step 4: Implementar `src/lib/challenges.ts`**

```ts
import { CHALLENGES, type ChallengeDefinition } from "@/data/challenges";

export function getIsoWeekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const weekNumber =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export function getCurrentChallenge(date: Date): ChallengeDefinition {
  const weekKey = getIsoWeekKey(date);
  const weekNumber = parseInt(weekKey.split("-W")[1], 10);
  return CHALLENGES[weekNumber % CHALLENGES.length];
}
```

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/challenges.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 6: Commit**

```bash
git add src/data/challenges.ts src/lib/challenges.ts src/lib/challenges.test.ts
git commit -m "feat(gamificacao): desafios - catalogo e rotacao semanal deterministica"
```

---

### Task 11: Desafios — resgate e widget no dashboard

**Files:**
- Create: `src/app/api/challenges/claim/route.ts`
- Create: `src/components/dashboard/ChallengeWidget.tsx`
- Modify: `src/app/dashboard/[token]/page.tsx`

**Interfaces:**
- Consumes: `getCurrentChallenge`, `getIsoWeekKey` (Task 10); tabela `challenge_claims` (Task 1).

- [ ] **Step 1: Criar a rota de resgate `src/app/api/challenges/claim/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isTokenExpired } from "@/lib/tokens";
import { getCurrentChallenge, getIsoWeekKey } from "@/lib/challenges";
import { grantBadges } from "@/lib/grant-badges";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;

  if (!token) {
    return NextResponse.json({ error: "payload inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: tokenRow } = await supabase
    .from("tokens")
    .select("purchase_id, valid_until")
    .eq("token", token)
    .maybeSingle();

  if (!tokenRow || isTokenExpired(tokenRow.valid_until)) {
    return NextResponse.json({ error: "token não encontrado" }, { status: 404 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("id", tokenRow.purchase_id)
    .single();

  if (!purchase) {
    return NextResponse.json({ error: "compra não encontrada" }, { status: 404 });
  }

  const now = new Date();
  const weekKey = getIsoWeekKey(now);
  const challenge = getCurrentChallenge(now);

  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - 7);

  const { data: relevantEvents } = await supabase
    .from("xp_events")
    .select("id, action_type, created_at")
    .eq("user_id", purchase.user_id)
    .eq("action_type", challenge.targetActionType)
    .gte("created_at", weekStart.toISOString());

  const progress = (relevantEvents ?? []).length;

  if (progress < challenge.targetCount) {
    return NextResponse.json(
      { error: "desafio ainda não concluído", progress, target: challenge.targetCount },
      { status: 409 }
    );
  }

  const { data: existingClaim } = await supabase
    .from("challenge_claims")
    .select("id")
    .eq("user_id", purchase.user_id)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existingClaim) {
    return NextResponse.json({ error: "desafio já resgatado esta semana" }, { status: 409 });
  }

  await supabase.from("challenge_claims").insert({
    user_id: purchase.user_id,
    week_key: weekKey,
    challenge_id: challenge.id,
  });

  await supabase.from("xp_events").insert({
    user_id: purchase.user_id,
    xp_amount: challenge.xpReward,
    action_type: "desafio",
    reference_id: `${weekKey}:${challenge.id}`,
  });

  await grantBadges(supabase, purchase.user_id);

  return NextResponse.json({ ok: true, xpAwarded: challenge.xpReward });
}
```

- [ ] **Step 2: Criar `src/components/dashboard/ChallengeWidget.tsx`**

```tsx
"use client";

import { useState } from "react";
import GlassCard from "@/components/ui/glass-card";
import CategoryBadge from "@/components/ui/category-badge";

interface ChallengeWidgetProps {
  token: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  alreadyClaimed: boolean;
}

export default function ChallengeWidget({
  token,
  title,
  description,
  xpReward,
  progress,
  target,
  alreadyClaimed,
}: ChallengeWidgetProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "claimed" | "error">(
    alreadyClaimed ? "claimed" : "idle"
  );

  const complete = progress >= target;

  const handleClaim = async () => {
    setStatus("loading");
    const response = await fetch("/api/challenges/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setStatus(response.ok ? "claimed" : "error");
  };

  return (
    <GlassCard className="p-6">
      <div className="mb-2">
        <CategoryBadge variant="roadmap">Desafio da Semana</CategoryBadge>
      </div>
      <h2 className="font-bold text-zinc-900">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600">{description}</p>
      <p className="mt-2 text-xs text-zinc-500">
        Progresso: {Math.min(progress, target)}/{target} · Recompensa: +{xpReward} XP
      </p>
      {status === "claimed" ? (
        <p className="mt-3 text-sm font-semibold text-emerald-600">✔ Resgatado</p>
      ) : (
        <button
          onClick={handleClaim}
          disabled={!complete || status === "loading"}
          className="mt-3 rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? "Resgatando..." : "Resgatar recompensa"}
        </button>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">Não foi possível resgatar. Tente novamente.</p>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 3: Buscar progresso do desafio no dashboard e renderizar o widget**

Em `src/app/dashboard/[token]/page.tsx`, adicione os imports:

```tsx
import ChallengeWidget from "@/components/dashboard/ChallengeWidget";
import { getCurrentChallenge, getIsoWeekKey } from "@/lib/challenges";
```

Após o bloco de `earnedBadgeIds` (Task 6), adicione:

```tsx
  const now = new Date();
  const currentChallenge = getCurrentChallenge(now);
  const weekKey = getIsoWeekKey(now);
  let challengeProgress = 0;
  let challengeClaimed = false;

  if (purchase) {
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);

    const { data: relevantEvents } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("action_type", currentChallenge.targetActionType)
      .gte("created_at", weekStart.toISOString());

    challengeProgress = (relevantEvents ?? []).length;

    const { data: claimRow } = await supabase
      .from("challenge_claims")
      .select("id")
      .eq("user_id", purchase.user_id)
      .eq("week_key", weekKey)
      .maybeSingle();

    challengeClaimed = !!claimRow;
  }
```

Adicione o componente dentro do `<div className="mx-auto max-w-4xl space-y-8 p-6">`:

```tsx
      <ChallengeWidget
        token={params.token}
        title={currentChallenge.title}
        description={currentChallenge.description}
        xpReward={currentChallenge.xpReward}
        progress={challengeProgress}
        target={currentChallenge.targetCount}
        alreadyClaimed={challengeClaimed}
      />
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 5: Verificação manual**

Complete conteúdos suficientes para bater a meta do desafio da semana corrente com um token de teste, acesse o dashboard e confirme que o botão "Resgatar recompensa" fica habilitado; clique e confirme que vira "✔ Resgatado" e que um novo `xp_events` com `action_type = 'desafio'` foi criado.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/challenges/claim/route.ts src/components/dashboard/ChallengeWidget.tsx src/app/dashboard/\[token\]/page.tsx
git commit -m "feat(gamificacao): desafios - resgate de recompensa e widget no dashboard"
```

---

### Task 12: Notificações — e-mail de level up e certificado

**Files:**
- Modify: `src/lib/email.ts`
- Modify: `src/app/api/quiz/route.ts`
- Modify: `src/app/api/roadmap/complete/route.ts`

**Interfaces:**
- Consumes: `getLevelProgress` (Task 2), `issueCertificateIfEligible` (Task 7).
- Produces: `sendLevelUpEmail(params: { to: string; levelName: string; level: number }): Promise<void>`, `sendCertificateEmail(params: { to: string; verificationCode: string; title: string }): Promise<void>`.

- [ ] **Step 1: Adicionar as funções de e-mail em `src/lib/email.ts`**

Ao final do arquivo, adicione:

```ts
export async function sendLevelUpEmail(params: {
  to: string;
  level: number;
  levelName: string;
}): Promise<void> {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: `Você subiu de nível! Agora você é ${params.levelName} 🎉`,
      htmlContent: `
        <p>Parabéns! Você atingiu o Nível ${params.level} — ${params.levelName}.</p>
        <p>Continue estudando para desbloquear o próximo nível.</p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar e-mail de level up via Brevo: ${response.status} ${responseBody}`);
  }
}

export async function sendCertificateEmail(params: {
  to: string;
  title: string;
  verificationCode: string;
}): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/certificado/${params.verificationCode}`;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Matriz Central", email: "contato@matrizcentral.com.br" },
      to: [{ email: params.to }],
      subject: `Seu certificado está pronto: ${params.title} 🏆`,
      htmlContent: `
        <p>Parabéns por concluir sua trilha!</p>
        <p>Certificado: ${params.title}</p>
        <p>Verifique a autenticidade em: <a href="${verificationUrl}">${verificationUrl}</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Falha ao enviar e-mail de certificado via Brevo: ${response.status} ${responseBody}`);
  }
}
```

- [ ] **Step 2: Disparar `sendLevelUpEmail` nos pontos que concedem XP**

Como o cálculo de "subiu de nível" exige comparar o XP antes/depois do evento, crie um helper local dentro de `src/lib/grant-badges.ts`... **não** — para manter a responsabilidade de `grant-badges.ts` restrita a badges, adicione a lógica de level-up diretamente em `src/app/api/quiz/route.ts`, no bloco de validação (`if (passed)`), após o insert do XP:

```ts
    if (purchase) {
      const { data: existingXpEvent } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", purchase.user_id)
        .eq("action_type", "validacao")
        .eq("reference_id", token)
        .maybeSingle();

      if (!existingXpEvent) {
        const { data: userBefore } = await supabase
          .from("users")
          .select("total_xp, email")
          .eq("id", purchase.user_id)
          .single();

        const levelBefore = userBefore ? getLevelProgress(userBefore.total_xp).level : 1;

        await supabase.from("xp_events").insert({
          user_id: purchase.user_id,
          xp_amount: 100,
          action_type: "validacao",
          reference_id: token,
        });
        await grantBadges(supabase, purchase.user_id);

        if (userBefore) {
          const { data: userAfter } = await supabase
            .from("users")
            .select("total_xp")
            .eq("id", purchase.user_id)
            .single();

          const progressAfter = getLevelProgress(userAfter?.total_xp ?? 0);
          if (progressAfter.level > levelBefore) {
            await sendLevelUpEmail({
              to: userBefore.email,
              level: progressAfter.level,
              levelName: progressAfter.name,
            }).catch((err) => console.error("Falha ao enviar e-mail de level up:", err));
          }
        }
      }
    }
```

Adicione os imports no topo de `src/app/api/quiz/route.ts`:

```ts
import { getLevelProgress } from "@/lib/levels";
import { sendLevelUpEmail } from "@/lib/email";
```

- [ ] **Step 3: Disparar `sendCertificateEmail` ao emitir o certificado**

Em `src/app/api/roadmap/complete/route.ts`, no bloco `if (stageKey === "missao_final") { ... }` criado na Task 7, capture o retorno de `issueCertificateIfEligible` e, se não for `null`, envie o e-mail. Também é necessário buscar o e-mail do usuário:

```ts
    if (stageKey === "missao_final") {
      const { data: allProgress } = await supabase
        .from("roadmap_progress")
        .select("stage_key")
        .eq("token", token);

      const { data: validacaoEvent } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", purchase.user_id)
        .eq("action_type", "validacao")
        .limit(1);

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", tokenRow.profile_id ?? "")
        .maybeSingle();

      const result = await issueCertificateIfEligible(supabase, {
        userId: purchase.user_id,
        profileName: profileRow?.name ?? "Matriz Central",
        roadmapStagesCompleted: (allProgress ?? []).map((p) => p.stage_key),
        quizValidacaoPassed: (validacaoEvent ?? []).length > 0,
      });

      if (result) {
        const { data: userRow } = await supabase
          .from("users")
          .select("email")
          .eq("id", purchase.user_id)
          .single();

        if (userRow) {
          await sendCertificateEmail({
            to: userRow.email,
            title: `Certificado de Conclusão — Trilha ${profileRow?.name ?? "Matriz Central"}`,
            verificationCode: result.verificationCode,
          }).catch((err) => console.error("Falha ao enviar e-mail de certificado:", err));
        }
      }
    }
```

Adicione o import no topo do arquivo:

```ts
import { sendCertificateEmail } from "@/lib/email";
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 5: Rodar a suíte completa de testes**

Run: `npm run test`
Expected: todos os testes passam (incluindo os ajustes de mock feitos na Task 5).

- [ ] **Step 6: Verificação manual**

Complete um quiz de validação que faça o usuário cruzar um threshold de nível (ex.: de 450 para 550 XP) e confirme que o e-mail de level up chega (verifique nos logs da Brevo, aba "Transacional"). Complete o roadmap inteiro e confirme o e-mail de certificado.

- [ ] **Step 7: Commit**

```bash
git add src/lib/email.ts src/app/api/quiz/route.ts src/app/api/roadmap/complete/route.ts
git commit -m "feat(gamificacao): notificacoes - email de level up e certificado emitido"
```

---

## Ordem de execução recomendada para subagent-driven-development

1. **Task 1** sequencial primeiro (fundação compartilhada — migration + tipos).
2. Depois, em paralelo (não tocam nos mesmos arquivos): **Task 2** (níveis pure), **Task 4** (badges pure), **Task 10** (desafios pure).
3. Depois, sequencial por causa de dependência direta: **Task 3** (depende de 2) → pode rodar em paralelo com **Task 5** (depende de 4) e **Task 7** (depende de 1).
4. **Task 6** depende de 5. **Task 8** depende de 7. **Task 9** depende só de 1 (pode rodar em paralelo com as anteriores assim que a Task 1 terminar). **Task 11** depende de 10 e de 5 (usa `grantBadges`).
5. **Task 12** por último — toca `src/app/api/quiz/route.ts` e `src/app/api/roadmap/complete/route.ts`, os mesmos arquivos de várias tasks anteriores; rodar sozinha para evitar conflito de merge.
