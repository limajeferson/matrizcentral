# Feed (MVP) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Uma página `/feed` (timeline de descoberta de IA): cards de conteúdo (prévia p/ todos) + strip de atividade da comunidade (badges recentes de quem optou), gated a Advanced.

**Architecture:** Lógica pura (`feed.ts`) mapeia `CONTENT_HUB`→cards e formata atividade; camada de dados (`feed-data.ts`) lê badges+users (opt-in); a página compõe usando login (`getSessionUser`) + entitlement (`resolveAccess`) + `ContentGate`. Sem migration nova.

**Tech Stack:** Next 14 (App Router, server components), Supabase (service_role), Tailwind, Vitest.

## Global Constraints
- Custo zero (sem deps novas). pt-BR. Gate: `tsc` 0 + `npm run test`. `npm run build` falha sem STRIPE_SECRET_KEY (pré-existente).
- **Nunca inventar títulos** — mapear do `CONTENT_HUB` (regra do projeto).
- Regra "prévia sempre, consumo travado"; strip de comunidade = Advanced.

## File Structure
**Criar:** `src/lib/feed.ts`(+test), `src/lib/feed-data.ts`, `src/app/feed/page.tsx`.
**Modificar:** `src/components/marketing/v2/LandingHeader.tsx` (ou o header do app) — link p/ `/feed`; `docs/frentes/feed/README.md` + `docs/ESTADO-ATUAL.md` (ao fim).

---

## Task 1: `feed.ts` — lógica pura (TDD)

**Files:** Create `src/lib/feed.ts`, `src/lib/feed.test.ts`.

**Interfaces — Produces:** `buildContentFeed(items, token?) : FeedCard[]`; `formatActivity(rows, badgeLabel) : ActivityItem[]`.

- [ ] **Step 1: testes que falham** — Create `src/lib/feed.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildContentFeed, formatActivity } from "./feed";
import type { ContentItem } from "@/data/content-hub";

const rel: ContentItem = { id: "r1", type: "relatorio", title: "Rel", description: "d", durationMinutes: 5, xpReward: 10, embedUrl: null };
const pod: ContentItem = { id: "p1", type: "podcast", title: "Pod", description: "d", durationMinutes: 5, xpReward: 10, embedUrl: null };
const podPub: ContentItem = { ...pod, id: "p2", embedUrl: "https://x" };

describe("buildContentFeed", () => {
  it("mapeia título e href com token", () => {
    const [c] = buildContentFeed([rel], "TOK");
    expect(c.title).toBe("Rel");
    expect(c.href).toBe("/dashboard/TOK/conteudo/r1");
  });
  it("sem token → href para /oferta", () => {
    expect(buildContentFeed([rel])[0].href).toBe("/oferta");
  });
  it("relatorio/pesquisa nunca 'em breve'; podcast sem embed = em breve", () => {
    expect(buildContentFeed([rel])[0].emBreve).toBe(false);
    expect(buildContentFeed([pod])[0].emBreve).toBe(true);
    expect(buildContentFeed([podPub])[0].emBreve).toBe(false);
  });
});

describe("formatActivity", () => {
  const label = (id: string) => (id === "b1" ? "Validador" : id);
  it("filtra sem display_name, formata e ordena desc", () => {
    const rows = [
      { display_name: "Ana", badge_id: "b1", earned_at: "2026-01-01T00:00:00Z" },
      { display_name: null, badge_id: "b1", earned_at: "2026-02-01T00:00:00Z" },
      { display_name: "Beto", badge_id: "b1", earned_at: "2026-03-01T00:00:00Z" },
    ];
    const out = formatActivity(rows, label);
    expect(out).toHaveLength(2);
    expect(out[0].text).toContain("Beto");
    expect(out[0].text).toContain("Validador");
  });
});
```

- [ ] **Step 2:** `npm run test -- feed` → FAIL.
- [ ] **Step 3: implementar** — Create `src/lib/feed.ts`:
```ts
import type { ContentItem, ContentType } from "@/data/content-hub";

export type FeedCard = {
  id: string; title: string; description: string; type: ContentType;
  emoji: string; href: string; emBreve: boolean;
};

const EMOJI: Record<ContentType, string> = {
  relatorio: "📄", podcast: "🎧", video: "🎬", pesquisa: "📊",
};

function isEmBreve(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

export function buildContentFeed(items: ContentItem[], token?: string): FeedCard[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    emoji: EMOJI[item.type],
    emBreve: isEmBreve(item),
    href: token ? `/dashboard/${token}/conteudo/${item.id}` : "/oferta",
  }));
}

export type ActivityRow = { display_name: string | null; badge_id: string; earned_at: string };
export type ActivityItem = { text: string; at: string };

export function formatActivity(rows: ActivityRow[], badgeLabel: (id: string) => string): ActivityItem[] {
  return rows
    .filter((r) => r.display_name)
    .map((r) => ({ text: `${r.display_name} conquistou o selo "${badgeLabel(r.badge_id)}"`, at: r.earned_at }))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
```

- [ ] **Step 4:** `npm run test -- feed` → PASS.
- [ ] **Step 5: commit** — `git add src/lib/feed.ts src/lib/feed.test.ts && git commit -m "feat(feed): logica pura buildContentFeed + formatActivity"`

---

## Task 2: `feed-data.ts` — atividade da comunidade

**Files:** Create `src/lib/feed-data.ts`.

**Interfaces — Produces:** `getCommunityActivity(limit?): Promise<ActivityRow[]>` (badges recentes de usuários opt-in).

- [ ] **Step 1: implementar** — Create `src/lib/feed-data.ts` (duas queries, robusto ao tipo `Relationships: []`):
```ts
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ActivityRow } from "@/lib/feed";

export async function getCommunityActivity(limit = 20): Promise<ActivityRow[]> {
  const supabase = getSupabaseServerClient();
  const { data: badges } = await supabase
    .from("badges_earned")
    .select("user_id, badge_id, earned_at")
    .order("earned_at", { ascending: false })
    .limit(limit * 3); // folga para filtrar por opt-in depois

  const rows = badges ?? [];
  if (rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: users } = await supabase
    .from("users")
    .select("id, display_name, leaderboard_opt_in")
    .in("id", userIds);

  const byId = new Map((users ?? []).map((u) => [u.id, u]));
  return rows
    .filter((r) => byId.get(r.user_id)?.leaderboard_opt_in && byId.get(r.user_id)?.display_name)
    .slice(0, limit)
    .map((r) => ({ display_name: byId.get(r.user_id)!.display_name, badge_id: r.badge_id, earned_at: r.earned_at }));
}
```

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git add src/lib/feed-data.ts && git commit -m "feat(feed): getCommunityActivity (badges de usuarios opt-in)"`

---

## Task 3: página `/feed`

**Files:** Create `src/app/feed/page.tsx`.

**Interfaces — Consumes:** `buildContentFeed`/`formatActivity` (Task 1), `getCommunityActivity` (Task 2), `getSessionUser`/`getAccessContext` (Frente 2), `CONTENT_HUB`, o catálogo de badges (`src/data/badges.ts`, para o `badgeLabel`), `ContentGate`.

- [ ] **Step 1: implementar** — Create `src/app/feed/page.tsx` (server component):
```tsx
import { CONTENT_HUB } from "@/data/content-hub";
import { buildContentFeed, formatActivity } from "@/lib/feed";
import { getCommunityActivity } from "@/lib/feed-data";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext, resolveUserIdByToken } from "@/lib/entitlement-access";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ContentGate from "@/components/auth/ContentGate";
import { BADGES } from "@/data/badges"; // catálogo id->label; ajustar o import ao export real

async function resolveToken(userId: string): Promise<string | undefined> {
  const supabase = getSupabaseServerClient();
  const { data: p } = await supabase.from("purchases").select("id").eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!p) return undefined;
  const { data: t } = await supabase.from("tokens").select("token").eq("purchase_id", p.id).maybeSingle();
  return t?.token ?? undefined;
}

function badgeLabel(id: string): string {
  const b = (BADGES as Array<{ id: string; name?: string; label?: string }>).find((x) => x.id === id);
  return b?.name ?? b?.label ?? id;
}

export default async function FeedPage() {
  const user = await getSessionUser();
  const token = user ? await resolveToken(user.id) : undefined;
  const access = user ? (await getAccessContext(user.id)).access : "view";

  const cards = buildContentFeed(CONTENT_HUB, token);

  let activity: { text: string; at: string }[] = [];
  if (access === "advanced") {
    activity = formatActivity(await getCommunityActivity(20), badgeLabel);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Feed</h1>

      {/* Atividade da comunidade — só Advanced */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Comunidade</h2>
        {access === "advanced" ? (
          activity.length > 0 ? (
            <ul className="space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="rounded-lg border border-zinc-200 bg-white/60 px-4 py-2 text-sm text-zinc-700">
                  🏅 {a.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">Ainda sem atividade por aqui.</p>
          )
        ) : (
          <ContentGate title="Feed da comunidade" nextPath="/feed" />
        )}
      </section>

      {/* Cards de conteúdo — prévia para todos */}
      <section className="space-y-3">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Descubra</h2>
        {cards.map((c) => (
          <article key={c.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-1 text-sm text-zinc-500">{c.emoji} {c.type}{c.emBreve ? " · em breve" : ""}</div>
            <h3 className="font-semibold text-zinc-900">{c.title}</h3>
            <p className="mt-1 text-sm text-zinc-600">{c.description}</p>
            {!c.emBreve && (
              <a href={c.href} className="mt-2 inline-block text-sm font-medium text-violet-600">
                Ler mais →
              </a>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
```
> Nota ao implementar: conferir o **export real** do catálogo em `src/data/badges.ts` e ajustar `import { BADGES }` + o shape em `badgeLabel` (pode ser um objeto/record em vez de array). Se não houver catálogo com nome, usar o `badge_id` prettificado como fallback (a lógica pura já aceita qualquer `badgeLabel`).

- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: verificar no navegador** — `/feed`: deslogado (cards + gate comunidade); view (cards + gate); advanced (cards + atividade, se houver dados de teste). *(Controller conduz.)*
- [ ] **Step 4: commit** — `git add "src/app/feed/page.tsx" && git commit -m "feat(feed): pagina /feed (cards + comunidade gated a Advanced)"`

---

## Task 4: link para `/feed` no header

**Files:** Modify o header do marketing (`src/components/marketing/v2/LandingHeader.tsx`) ou o menu.

- [ ] **Step 1:** adicionar um link "Feed" (`/feed`) na navegação (`LINKS` do `LandingHeader`, ou no header do app). Manter o escopo/estilo existente.
- [ ] **Step 2:** `npx tsc --noEmit` → exit 0.
- [ ] **Step 3: commit** — `git commit -am "feat(feed): link para /feed no header"`

---

## Task 5: verificação + continuidade

- [ ] **Step 1: gate** — `npx tsc --noEmit && npm run test` (inclui `feed`).
- [ ] **Step 2: E2E navegador** — os 3 estados de `/feed` (com dado de comunidade via SQL de teste, opt-in).
- [ ] **Step 3: continuidade** — atualizar `docs/frentes/feed/README.md`, `docs/ESTADO-ATUAL.md`, `docs/ROADMAP-EXECUCAO.md` (Frente 3 ✅).
- [ ] **Step 4: commit** — `git add docs/ && git commit -m "docs(feed): Frente 3 concluida"`

## Notas de execução
- Sem migration nova. `BADGES` catalog: ajustar ao export real de `src/data/badges.ts` na Task 3.
- Enforcement de consumo dos conteúdos é o da Frente 2 (o "ler mais" leva ao detalhe já gated).
