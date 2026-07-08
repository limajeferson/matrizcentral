# Feed de Conteúdo Recomendado Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma seção "Recomendado pra você agora" ao hub de conteúdo, destacando os itens do `CONTENT_HUB` ligados à etapa ativa do roadmap do usuário, resolvendo a falta de direção do grid estático atual.

**Architecture:** Um campo novo (`recommendedStage`) liga cada item do catálogo estático a uma etapa do roadmap; uma função pura (`getRecommendedContent`) filtra o que recomendar dado a etapa ativa e o progresso do usuário; a página do hub de conteúdo passa a calcular a etapa ativa (reaproveitando `deriveRoadmapView`, já usado no dashboard) e renderizar a nova seção acima do grid existente, que permanece inalterado como "Explore mais".

**Tech Stack:** Next.js (App Router), TypeScript, Supabase, Vitest (`environment: "node"` — só lógica pura em `src/lib`/`src/data` tem teste automatizado).

## Global Constraints

- Custo zero: nenhuma dependência npm nova.
- Itens ainda "em breve" (não publicados) continuam aparecendo na seção "Explore mais", sem mudança nessa regra.
- Se o roadmap estiver 100% concluído, ou se todos os itens da etapa atual já estiverem concluídos/"em breve", a seção "Recomendado" simplesmente não renderiza (sem mensagem de vazio).
- Gate real: `npx tsc --noEmit` (exit 0) + `npm run test` + `npx next lint` (sem erros — só warnings pré-existentes são aceitáveis).
- UI em português do Brasil, seguindo os componentes visuais existentes (`GlassCard`, `CategoryBadge`).

---

### Task 1: Catálogo — campo `recommendedStage`

**Files:**
- Modify: `src/data/content-hub.ts`

**Interfaces:**
- Produces: `ContentItem.recommendedStage?: RoadmapStageKey` — usado pela Task 2.

- [ ] **Step 1: Adicionar o import e o campo na interface**

Em `src/data/content-hub.ts`, no topo do arquivo, adicione o import:

```ts
import type { RoadmapStageKey } from "@/data/roadmap-stages";
```

Na interface `ContentItem`, adicione o campo novo (após `xpReward`):

```ts
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  durationMinutes: number;
  xpReward: number;
  /** Etapa do roadmap em que este item é recomendado como próximo passo. */
  recommendedStage?: RoadmapStageKey;
  /** Caminho do arquivo markdown (só para type="relatorio"). */
  bodyPath?: string;
  /** URL de embed (Spotify/YouTube). null = ainda não publicado ("em breve"). */
  embedUrl: string | null;
  /** Opções de resposta (só para type="pesquisa"). */
  surveyOptions?: SurveyOption[];
}
```

- [ ] **Step 2: Atribuir `recommendedStage` aos 9 itens existentes**

Edite cada item de `CONTENT_HUB` adicionando o campo `recommendedStage` conforme a tabela do spec. Os itens e valores exatos:

- `relatorio-panorama-llms-locais` → `recommendedStage: "fundacao_local"`
- `relatorio-comparativo-modelos` → `recommendedStage: "modelos_performance"`
- `podcast-rode-ia-potente` → `recommendedStage: "fundacao_local"`
- `podcast-ias-poderosas` → `recommendedStage: "fluxo_trabalho"`
- `podcast-melhor-ia-hardware` → `recommendedStage: "modelos_performance"`
- `podcast-escolher-ias-sem-travar` → `recommendedStage: "automacoes"`
- `video-verdade-ia-local` → `recommendedStage: "fluxo_trabalho"`
- `video-evolucao-ia-local` → `recommendedStage: "automacoes"`
- `pesquisa-hardware-atual` → `recommendedStage: "missao_final"`

Exemplo de como o primeiro item fica depois da edição (adicione a linha `recommendedStage` logo após `xpReward` em cada objeto, na mesma posição relativa em todos os 9):

```ts
  {
    id: "relatorio-panorama-llms-locais",
    type: "relatorio",
    title: "Panorama Estratégico de LLMs Locais",
    description:
      "O mapa dos modelos locais que mais entregam em 2026 — e quais já não valem o seu tempo.",
    durationMinutes: 12,
    xpReward: 30,
    recommendedStage: "fundacao_local",
    bodyPath: "content/relatorios/panorama-estrategico-llms-locais.md",
    embedUrl: null,
  },
```

Repita o padrão (adicionar a linha `recommendedStage: "<etapa>",` logo após `xpReward: <valor>,`) para os outros 8 itens, usando os valores da lista acima. Não altere nenhum outro campo.

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/data/content-hub.ts
git commit -m "feat(feed-conteudo): adiciona recommendedStage ao catalogo de conteudo"
```

---

### Task 2: Lógica pura de recomendação

**Files:**
- Create: `src/lib/content-feed.ts`
- Test: `src/lib/content-feed.test.ts`

**Interfaces:**
- Consumes: `ContentItem` (com `recommendedStage`, Task 1), `RoadmapStageKey` de `@/data/roadmap-stages`.
- Produces: `getRecommendedContent(items: ContentItem[], activeStageKey: RoadmapStageKey | null, completedContentIds: string[]): ContentItem[]`. Usado pela Task 3.

- [ ] **Step 1: Escrever o teste (falhando)**

Criar `src/lib/content-feed.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getRecommendedContent } from "@/lib/content-feed";
import type { ContentItem } from "@/data/content-hub";

const items: ContentItem[] = [
  {
    id: "relatorio-a",
    type: "relatorio",
    title: "Relatório A",
    description: "desc",
    durationMinutes: 10,
    xpReward: 30,
    bodyPath: "content/a.md",
    embedUrl: null,
    recommendedStage: "fundacao_local",
  },
  {
    id: "podcast-b",
    type: "podcast",
    title: "Podcast B",
    description: "desc",
    durationMinutes: 15,
    xpReward: 20,
    embedUrl: null,
    recommendedStage: "fundacao_local",
  },
  {
    id: "podcast-c",
    type: "podcast",
    title: "Podcast C",
    description: "desc",
    durationMinutes: 15,
    xpReward: 20,
    embedUrl: "https://open.spotify.com/embed/episode/xyz",
    recommendedStage: "fundacao_local",
  },
  {
    id: "video-d",
    type: "video",
    title: "Vídeo D",
    description: "desc",
    durationMinutes: 10,
    xpReward: 25,
    embedUrl: "https://youtube.com/embed/xyz",
    recommendedStage: "modelos_performance",
  },
];

describe("getRecommendedContent", () => {
  it("retorna vazio quando não há etapa ativa (roadmap concluído)", () => {
    expect(getRecommendedContent(items, null, [])).toEqual([]);
  });

  it("filtra só itens da etapa ativa", () => {
    const result = getRecommendedContent(items, "modelos_performance", []);
    expect(result.map((i) => i.id)).toEqual(["video-d"]);
  });

  it("exclui itens ainda não publicados (podcast/video com embedUrl null)", () => {
    const result = getRecommendedContent(items, "fundacao_local", []);
    expect(result.map((i) => i.id)).toEqual(["relatorio-a", "podcast-c"]);
  });

  it("exclui itens já concluídos", () => {
    const result = getRecommendedContent(items, "fundacao_local", ["relatorio-a"]);
    expect(result.map((i) => i.id)).toEqual(["podcast-c"]);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npx vitest run src/lib/content-feed.test.ts`
Expected: FAIL com `Cannot find module '@/lib/content-feed'`.

- [ ] **Step 3: Implementar `src/lib/content-feed.ts`**

```ts
import type { ContentItem } from "@/data/content-hub";
import type { RoadmapStageKey } from "@/data/roadmap-stages";

function isPublished(item: ContentItem): boolean {
  return item.embedUrl !== null || item.type === "relatorio" || item.type === "pesquisa";
}

export function getRecommendedContent(
  items: ContentItem[],
  activeStageKey: RoadmapStageKey | null,
  completedContentIds: string[]
): ContentItem[] {
  if (!activeStageKey) {
    return [];
  }

  const completedSet = new Set(completedContentIds);

  return items.filter(
    (item) =>
      item.recommendedStage === activeStageKey &&
      isPublished(item) &&
      !completedSet.has(item.id)
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npx vitest run src/lib/content-feed.test.ts`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-feed.ts src/lib/content-feed.test.ts
git commit -m "feat(feed-conteudo): getRecommendedContent - logica pura de recomendacao"
```

---

### Task 3: Integração na página do hub de conteúdo

**Files:**
- Modify: `src/app/dashboard/[token]/conteudo/page.tsx`

**Interfaces:**
- Consumes: `getRecommendedContent` (Task 2); `deriveRoadmapView` de `src/lib/roadmap-progress.ts` (já existe, usado em `dashboard/[token]/page.tsx`); `ROADMAP_STAGE_KEYS`, `ROADMAP_STAGE_LABELS` de `@/data/roadmap-stages` (já existem).

- [ ] **Step 1: Adicionar os imports novos**

No topo de `src/app/dashboard/[token]/conteudo/page.tsx`, adicione:

```tsx
import { deriveRoadmapView } from "@/lib/roadmap-progress";
import { ROADMAP_STAGE_KEYS, ROADMAP_STAGE_LABELS } from "@/data/roadmap-stages";
import { getRecommendedContent } from "@/lib/content-feed";
```

- [ ] **Step 2: Buscar `roadmap_progress` e computar a etapa ativa**

Localize o bloco existente:

```tsx
  const { data: completions } = await supabase
    .from("content_completions")
    .select("content_id")
    .eq("token", params.token);

  const completedIds = new Set((completions ?? []).map((c: { content_id: string }) => c.content_id));
```

e adicione logo depois:

```tsx
  const { data: progressRows } = await supabase
    .from("roadmap_progress")
    .select("stage_key")
    .eq("token", params.token);

  const completedStages = (progressRows ?? []).map((row: { stage_key: string }) => row.stage_key);
  const roadmapView = deriveRoadmapView(completedStages);
  const activeStageKey =
    roadmapView.activeIndex === -1 ? null : ROADMAP_STAGE_KEYS[roadmapView.activeIndex];

  const recommended = getRecommendedContent(
    CONTENT_HUB,
    activeStageKey,
    Array.from(completedIds)
  );
```

- [ ] **Step 3: Renderizar a seção "Recomendado pra você agora"**

Localize o início do JSX retornado:

```tsx
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <CategoryBadge variant="hub">Hub de conteúdo</CategoryBadge>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Aprenda no seu ritmo</h1>
        <p className="text-zinc-600">
          Relatórios, podcasts, vídeos e pesquisas com a comunidade sobre IA local — cada conteúdo
          concluído gera XP.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
```

e substitua por (inserindo a nova seção condicional e o título "Explore mais" antes do grid existente):

```tsx
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <CategoryBadge variant="hub">Hub de conteúdo</CategoryBadge>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Aprenda no seu ritmo</h1>
        <p className="text-zinc-600">
          Relatórios, podcasts, vídeos e pesquisas com a comunidade sobre IA local — cada conteúdo
          concluído gera XP.
        </p>
      </div>

      {recommended.length > 0 && activeStageKey && (
        <div>
          <CategoryBadge variant="roadmap">
            Recomendado pra você agora — {ROADMAP_STAGE_LABELS[activeStageKey]}
          </CategoryBadge>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {recommended.map((item) => (
              <Link key={item.id} href={`/dashboard/${params.token}/conteudo/${item.id}`}>
                <GlassCard className="h-full border-2 border-violet-300 bg-violet-50 p-5 transition hover:-translate-y-0.5">
                  <div className="mb-2 flex items-center justify-between">
                    <CategoryBadge variant="hub">{TYPE_LABEL[item.type]}</CategoryBadge>
                  </div>
                  <h2 className="font-bold text-zinc-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{item.description}</p>
                  <div className="mt-3 text-xs text-zinc-500">
                    {item.durationMinutes} min · +{item.xpReward} XP
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Explore mais
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
```

- [ ] **Step 4: Fechar as duas divs novas ao final do grid**

Localize o final do JSX:

```tsx
        })}
      </div>
    </div>
  );
}
```

e substitua por (fechando a `<div>` do "Explore mais" que foi aberta no Step 3, além da já existente):

```tsx
        })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 6: Rodar lint (gate real do build de produção)**

Run: `npx next lint`
Expected: sem novos erros (só os 2 warnings pré-existentes em `SystemSection.tsx`/`QuizValidacao.tsx` são aceitáveis).

- [ ] **Step 7: Rodar a suíte completa**

Run: `npm run test`
Expected: todos os testes passam (nenhum teste automatizado cobre esta página especificamente — é componente React server, verificado manualmente — mas a suíte completa não deve ter regressão).

- [ ] **Step 8: Verificação manual**

Run: `npm run dev -- -p 3000`. Acesse `/dashboard/<token>/conteudo` com um token cuja etapa ativa tenha itens publicados recomendados (ex.: `fundacao_local`, que tem `relatorio-panorama-llms-locais` publicado) e confirme que a seção "Recomendado pra você agora" aparece acima do "Explore mais", com destaque visual (borda violeta). Complete o item recomendado e confirme que ele some da seção na próxima visita (mas continua em "Explore mais").

- [ ] **Step 9: Commit**

```bash
git add src/app/dashboard/\[token\]/conteudo/page.tsx
git commit -m "feat(feed-conteudo): secao recomendado pra voce agora no hub de conteudo"
```
