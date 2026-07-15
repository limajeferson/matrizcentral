# Spec — Barra de Histórias do Feed (Stories) — Backlog Stage 2 / item 1

> Primeiro item do backlog de design (pós-baseline do redesign do feed).
> Modelo de referência: `21st.dev/@osiris-balonga/components/story-viewer`
> (framer-motion + lucide-react — **ambos já instalados**, custo zero mantido).
> Método: `brainstorming` (feito) → este spec → `writing-plans` →
> `subagent-driven-development`. Frente **isolada, com rollback ao baseline**.

## Objetivo

Adicionar ao topo do feed logado uma **barra de histórias** (stories) no estilo
Instagram: uma linha horizontal de **círculos por categoria de conteúdo**
(Relatórios · Podcasts · Vídeos · Pesquisas) que, ao serem tocados, abrem um
**viewer fullscreen** com barrinhas de progresso e **auto-avanço de 15s por
slide**, apresentando os conteúdos **publicados nos últimos 7 dias** daquela
categoria como teaser chamativo.

## Decisões-âncora (travadas no brainstorm)

1. **Histórias derivadas do conteúdo** (não autorais). Círculo = categoria;
   slides = itens do `CONTENT_HUB` com `publishedAt` dentro de **7 dias**. Sem
   tabela nova, sem upload, sem painel admin. "Só o gestor + agentes adicionam
   histórias" é atendido de graça: uma história só surge quando um conteúdo é
   publicado no código (`publishedAt` + disponibilização), o que já é controlado
   por você e pelos agentes.
2. **Histórias de até 15s**, auto-avanço:
   - **podcast/vídeo** → tocam os primeiros ~15s do embed (quando `embedUrl`
     existe); enquanto `embedUrl === null` ("em breve"), mostram o card de marca.
   - **relatório/material redatório** → card com o **gancho do texto**
     (título + chamada/descrição atrativa).
   - **qualquer outro tipo** → mesmo modelo de card chamativo.
3. **Viewer fullscreen** fiel ao modelo: overlay escuro, barrinhas de progresso
   (uma por slide do grupo), toque à direita/esquerda para navegar, segurar para
   pausar, X para fechar, avança ao próximo grupo ao terminar.
4. **Visível a todos com acesso à plataforma** (área logada). O teaser aparece
   para qualquer logado; o **gating existente é respeitado no clique** do CTA
   "Acessar" (que já roteia para o conteúdo ou `/oferta` via a convenção atual).
5. **Custo zero / rollback-able**: sem deps npm novas (framer-motion e
   lucide-react já existem; ícones SVG caseiros já criados na Frente D). Frente
   isolada em componentes próprios — reverter = remover o mount + os arquivos.

## Modelo de dados (derivado, puro e testável)

Novo campo opcional em `ContentItem` (`src/data/content-hub.ts`):

```ts
/** Data de publicação (ISO). Ausente = não publicado ainda. Um item entra
 *  nas histórias se publishedAt estiver dentro de STORY_WINDOW_DAYS. */
publishedAt?: string;
```

Seed inicial (conteúdo genuinamente disponível hoje): os **2 relatórios** e a
**1 pesquisa** recebem `publishedAt` dentro dos últimos 7 dias (datas relativas
a 2026-07-14). Podcasts/vídeos seguem "em breve" (sem `publishedAt`) → sem
círculo ainda. Assim a barra nasce com **Relatórios** e **Pesquisas**, honesta
("o que é novo de verdade"), e ganha as demais categorias conforme forem
publicadas.

Camada de lógica pura `src/lib/stories.ts`:

```ts
export const STORY_WINDOW_DAYS = 7;
export const STORY_DURATION_MS = 15_000;

export type StorySlide = {
  contentId: string;
  type: ContentType;
  title: string;
  hook: string;          // chamada/manchete atrativa (description por ora)
  href: string;          // CTA — respeita gating (contentHref)
  ctaLabel: string;      // "Ler agora" | "Ouvir" | "Assistir" | "Responder"
  embedUrl: string | null;
  emBreve: boolean;
};
export type StoryGroup = { type: ContentType; label: string; slides: StorySlide[] };

// now injetado (determinístico p/ teste; Date.now() só no server component)
export function buildStories(items: ContentItem[], now: Date, token?: string): StoryGroup[];
```

Regras de `buildStories`: filtra itens com `publishedAt` em `[now-7d, now]`;
agrupa por tipo na ordem `relatorio, podcast, video, pesquisa`; ordena slides do
mais novo para o mais antigo; **descarta grupos vazios**. O `href` reusa a
convenção existente — extrair `contentHref(id, token)` em `src/lib/feed.ts`
(hoje inline em `buildContentFeed`) e usar nos dois (DRY).

## Componentes (área logada, theme-aware)

- **`src/components/app/stories/StoryBar.tsx`** (client): linha horizontal
  rolável de círculos 72px, um por `StoryGroup`, com `CONTENT_ICON[type]`,
  **anel violeta** quando há slide não-visto e anel apagado quando todos vistos,
  label embaixo. Estado "visto" por `localStorage` (`mc-stories-seen`, conjunto
  de `contentId`). Abre o `StoryViewer` no grupo tocado. **Renderiza `null` se
  não houver grupos.**
- **`src/components/app/stories/StoryViewer.tsx`** (client): overlay fullscreen
  (framer-motion fade), barrinhas de progresso (uma por slide), timer de
  `STORY_DURATION_MS`, navegação (zonas de toque esquerda/direita + setas do
  teclado), segurar-para-pausar, `Escape`/X fecha, avança ao próximo grupo ao
  fim e fecha após o último. Cada slide = **card de marca** (gradiente violeta,
  `CONTENT_ICON`, título, gancho, CTA `Link` para `href` com `ctaLabel`); se
  `emBreve`, mostra selo "Em breve" no lugar do CTA. Slot de embed preparado
  para quando `embedUrl` existir (baseline entrega o card). Marca slides como
  vistos (callback → StoryBar persiste no localStorage).

**Montagem:** `src/app/feed/page.tsx` calcula
`buildStories(CONTENT_HUB, new Date(), token)` e renderiza `<StoryBar>` no topo
da coluna central (acima de "Comece por aqui"), dentro do bloco logado.

## Mapa do modelo (21st.dev → Matriz)

| 21st.dev | Vira na Matriz |
|---|---|
| Círculos por usuário (avatar 72px) | Círculos por **categoria** (ícone SVG do tipo) |
| Story `{id,type:image/video,src}` | `StorySlide` (card de marca / embed 15s) |
| Viewer fullscreen + progress + auto-advance | Idem (15s por slide) |
| `AddStoryButton` (+) | **Removido** — histórias são derivadas do conteúdo |
| framer-motion / lucide-react | framer-motion (já instalado) + ícones SVG caseiros |

## Não-objetivos / diferido (backlog)

- **Histórias autorais** (tabela Supabase, upload de mídia, painel do gestor,
  RLS) — descartado no brainstorm (foge do custo zero).
- **Recorte real de 15s de áudio/vídeo** dentro do embed — quando houver embeds,
  começa do início; recorte fino fica para depois.
- **Sempre exibir as 4 categorias** (mesmo sem conteúdo novo) — baseline mostra
  só categorias com item novo; a variante "4 fixas com anel apagado" é um tweak
  posterior.
- Notificação de "história nova", contagem de visualizações — fora de escopo.

## Restrições / ambiente

- **Custo zero:** sem deps npm novas. framer-motion e ícones já existentes.
- **Gate:** `npx tsc --noEmit` (0) + `npm run test` (verde) — `buildStories` e
  `contentHref` com cobertura pura. Componentes verificados rodando o app
  (`npm run dev -- -p 3000`) — vitest é node-env, sem teste de componente.
  `npm run build` roda ESLint: não deixar `no-unused-vars`/lint quebrar o deploy.
- **CSS por escopo:** tokens semânticos + utilitários violeta; não vazar para
  `.mcv2`/`.lp-guide`. Overlay do viewer é fixed/z-alto próprio.
- **A11y:** círculos são `button` com `aria-label`; viewer `role="dialog"`
  `aria-modal`, foco preso, `Escape` fecha, setas navegam; ícones decorativos
  `aria-hidden`.
- **pt-BR** em toda copy.
