# Feed de Conteúdo Recomendado — Design

## Contexto

O hub de conteúdo (`/dashboard/[token]/conteudo`) hoje é um grid estático: todos os 9 itens do `CONTENT_HUB` lado a lado, sem indicar o que o usuário deveria fazer a seguir. O problema identificado não é falta de filtro ou de novidade — é **falta de direção**: o usuário não sabe se deve seguir a ordem do roadmap, escolher por tipo, ou o que priorizar.

Hoje não existe nenhuma ligação entre as 5 etapas do roadmap (`profiles.study_roadmap`, checklists em texto livre) e os itens do `CONTENT_HUB` — são dois catálogos independentes.

## Decisão técnica

### 1. Mapeamento etapa → conteúdo

Cada `ContentItem` ganha um campo novo opcional `recommendedStage?: RoadmapStageKey` (import de `@/data/roadmap-stages`). Atribuição editorial:

| Etapa (`RoadmapStageKey`) | Itens |
|---|---|
| `fundacao_local` | `relatorio-panorama-llms-locais`, `podcast-rode-ia-potente` |
| `modelos_performance` | `relatorio-comparativo-modelos`, `podcast-melhor-ia-hardware` |
| `fluxo_trabalho` | `video-verdade-ia-local`, `podcast-ias-poderosas` |
| `automacoes` | `video-evolucao-ia-local`, `podcast-escolher-ias-sem-travar` |
| `missao_final` | `pesquisa-hardware-atual` |

### 2. Lógica pura: `src/lib/content-feed.ts`

Função `getRecommendedContent(items, activeStageKey, completedContentIds): ContentItem[]`:
- Filtra itens cujo `recommendedStage === activeStageKey`.
- Exclui itens já concluídos (`completedContentIds`).
- Exclui itens ainda não publicados (mesma regra de "em breve" já usada na página: `embedUrl === null && type !== "relatorio" && type !== "pesquisa"`).
- `activeStageKey` pode ser `null` (roadmap 100% concluído) — nesse caso retorna `[]`.

Testável sem Supabase, mesmo padrão de `levels.ts`/`badges.ts`.

### 3. Integração na página

`src/app/dashboard/[token]/conteudo/page.tsx` passa a buscar também `roadmap_progress` (mesma query já usada em `dashboard/[token]/page.tsx`) e computar a etapa ativa via `deriveRoadmapView(completedStages)` (já existe em `src/lib/roadmap-progress.ts`) — `ROADMAP_STAGE_KEYS[activeIndex]`, ou `null` se `activeIndex === -1`.

A página renderiza, nesta ordem:
1. **"Recomendado pra você agora"** (só se `getRecommendedContent(...)` retornar itens não-vazio) — cards em destaque visual (ex.: borda/fundo diferenciado), mostrando o nome da etapa atual.
2. **"Explore mais"** — o grid atual, inalterado (todos os itens, incluindo "em breve").

### 4. Casos de borda

- Roadmap 100% concluído → seção "Recomendado" não renderiza (sem mensagem vazia).
- Itens da etapa atual todos já concluídos ou todos "em breve" → seção não renderiza nesta visita.
- Nenhuma mudança na lógica de conclusão de conteúdo (`content-xp.ts`) nem na regra visual de "em breve" já existente.

## Fora de escopo (YAGNI)

- Filtros por tipo/duração/status no hub de conteúdo (não é o problema identificado agora).
- Qualquer mudança na estrutura de dados do roadmap (`profiles.study_roadmap` continua texto livre).
- Reordenar ou remover itens "em breve" da seção "Explore mais".
