# Spec — Frente 4: Conteúdo/mídia (players + TOC de artigo + jornada + share)

> Programa: [`README.md`](README.md). Quarta frente — **visual + backend leve
> (sem migration)**. Modelos 21st.dev: video-player · music-player-card ·
> dynamic-island-toc (artigos) · table-of-contents (jornada) · social-links
> (compartilhar). Reconstruídos com framer-motion + Tailwind + ícones caseiros.
> Herda as Global Constraints do programa.

## Estado atual (mapeado 2026-07-16)

- **Página por item:** `src/app/dashboard/[token]/conteudo/[id]/page.tsx` — a
  única página per-item. `relatorio` renderiza markdown de `bodyPath`;
  `pesquisa` renderiza form/results; `podcast`/`video` caem num **`<iframe>` cru**
  quando `embedUrl` existe, ou num card "Em breve" quando `null`. Hoje **todos os
  9 itens do `CONTENT_HUB` têm `embedUrl: null`** — os players nascem no estado
  "em breve" e ficam prontos para quando a mídia for publicada.
- **Precedente de player:** `VideoThumb.tsx` (feed) tem `youtubeId()` (regex),
  thumb `img.youtube.com/vi/<id>/hqdefault.jpg` e swap thumb→iframe com
  `autoplay=1`. É YouTube-only; **não existe parsing de Spotify** em lugar nenhum.
- **Markdown:** `src/components/ui/Markdown.tsx` é um renderer caseiro
  linha-a-linha que só entende `#`/`##`/`###`/`-`/parágrafo. **Os relatórios
  publicados usam `####` e tabelas pipe — hoje renderizam como texto cru** (bug
  real). Não existe `id` em heading (pré-requisito de TOC).
- **Jornada:** `RoadmapCard.tsx` (dashboard) renderiza as 5 etapas
  (`ROADMAP_STAGE_KEYS` + `deriveRoadmapView(completedStages)` →
  done/active/locked). Sem navegação/TOC.
- **Share:** inexistente. O botão "Compartilhar" do `PostCard` é placeholder
  (`title="Em breve"`). Ícones sociais (WhatsApp/X/LinkedIn) não existem em
  `src/components/ui/icons` — criar via `makeIcon`.

## Invariante de segurança (trava desta frente)

**Nunca compartilhar URL que contenha token** (`/dashboard/<token>/...` dá acesso
à conta). O share de um conteúdo do hub compartilha a **home pública**
(`https://www.matrizcentral.com.br`) com o título do conteúdo no texto; o share
de um post do blog compartilha a URL pública do post (`/blog/<slug>`). O helper
puro tem guarda `isTokenizedPath()` e o componente **se recusa a renderizar**
com URL tokenizada.

## Item 1 — Fundação de mídia: `parseMediaSource` (puro)

`src/lib/media.ts` (+ teste): fonte única de parsing de `embedUrl`
(YouTube/Spotify/genérico), consumida pelos dois players novos e pelo
`VideoThumb` (refactor DRY, comportamento preservado — recomendação da auditoria
de arquitetura).

- `MediaSource = { kind:"youtube"; id; embedSrc; thumbnailUrl } |
  { kind:"spotify"; embedSrc; height } | { kind:"generic"; embedSrc }`.
- `parseMediaSource(embedUrl: string | null): MediaSource | null` — YouTube via
  regex do `VideoThumb` (movida pra cá); Spotify normaliza
  `open.spotify.com/(embed/)?<tipo>/<id>` → `open.spotify.com/embed/<tipo>/<id>`
  (height 152 p/ track/episode, 232 senão); qualquer outra URL → `generic`.
- `withAutoplay(src)` — anexa `autoplay=1` com `?`/`&` (lógica atual do
  `VideoThumb`, movida pra cá).

## Item 2 — Fundação de artigo: `parseMarkdown` (puro) + Markdown v2

`src/lib/markdown.ts` (+ teste): parser puro linha-a-linha → blocos tipados;
`Markdown.tsx` passa a renderizar os blocos (visual igual para conteúdo já
suportado, e **corrige** `####` + tabelas dos relatórios publicados).

- Blocos: `heading` (níveis 1–4, com `id` slugificado, dedupe `-2`, `-3`…),
  `paragraph`, `list` (itens `- ` agrupados), `table` (linhas pipe; separador
  `|---|` ignorado). Desescapa `\.` → `.` (usado nos relatórios).
- `extractHeadings(blocks, maxLevel=4)` → `{ level; text; id }[]` — insumo do TOC.
- Inline formatting (`**bold**`, links) **fora do escopo** (comportamento atual
  mantido; backlog).

## Item 3 — Players: `VideoPlayer` + `MusicPlayerCard`

Na página `conteudo/[id]` (trecho que hoje é iframe cru/"em breve"):
`type==="video"` → **`VideoPlayer`**; `type==="podcast"` → **`MusicPlayerCard`**.
Relatório/pesquisa não mudam. Gating (`tryConsume`/`ContentGate`) intocado.

- **`VideoPlayer`** (client, modelo video-player): facade 16:9 — poster (thumb
  do YouTube ou gradiente violeta), botão play central (círculo violeta), barra
  inferior com título + duração; clique → iframe com `withAutoplay`
  (`allow="autoplay; encrypted-media"`, `allowFullScreen`). `embedUrl null` →
  estado "Em breve" (mesma moldura, selo âmbar, sem play).
- **`MusicPlayerCard`** (client, modelo music-player-card): card horizontal —
  artwork quadrado (gradiente violeta + `IconHeadphones`), título/descrição/
  duração, botão play; tocar → substitui o corpo pelo iframe do Spotify
  (`height` do `MediaSource`) ou YouTube. `embedUrl null` → "Em breve".

## Item 4 — `ArticleToc` (dynamic-island-toc)

TOC flutuante para páginas de leitura longa: **relatório** (`conteudo/[id]` com
`bodyPath`) e **blog** (`/blog/[slug]`). Server extrai
`extractHeadings(parseMarkdown(body))` e monta o client `ArticleToc`.

- Pill fixa no topo-centro (dynamic island): recolhida mostra a seção ativa
  (IntersectionObserver nos `id`s dos headings); clique expande a lista
  (animação framer-motion de expansão da ilha); clique em item → smooth scroll;
  Escape/click-fora recolhe. Só renderiza com **≥ 3 headings**. Dark-aware,
  `bg-card/90 + backdrop-blur`, borda `border`. A11y: `<nav aria-label="Sumário">`,
  itens são `<a href="#id">`.

## Item 5 — `JornadaToc` (table-of-contents da jornada)

No dashboard (`/dashboard/[token]`), navegação lateral das 5 etapas do roadmap,
consumindo `deriveRoadmapView` + `ROADMAP_STAGE_LABELS` (dados que já existem).

- Coluna sticky (só `xl:`; escondida abaixo) com as 5 etapas: ícone por status
  (`done` = `IconCheck` violeta, `active` = ponto pulsante, `locked` =
  `IconLock` muted), label, link âncora `#etapa-<key>` (o `RoadmapCard` ganha
  `id` por etapa); etapa ativa destacada. Barra de progresso fina no topo
  (`progressPercent`).

## Item 6 — `ShareLinks` (social-links)

Compartilhar em WhatsApp / X / LinkedIn + **copiar link** (feedback "Copiado!").

- `src/lib/share.ts` (+ teste): `buildShareUrl(platform, url, text)` (wa.me /
  twitter intent / linkedin share-offsite, tudo URL-encoded) e
  `isTokenizedPath(url)` (detecta `/dashboard/<algo>` → bloqueia).
- Ícones novos via `makeIcon`: `IconWhatsApp`, `IconXTwitter`, `IconLinkedIn`
  (mesmo estilo stroke 1.7 do set atual).
- `ShareLinks` (client): linha de botões-ícone; usa `navigator.share` quando
  disponível (botão "Compartilhar" nativo primeiro no mobile); "copiar" usa
  `navigator.clipboard`. **Se `isTokenizedPath(url)` → não renderiza.**
- Montagem: `/blog/[slug]` (URL pública do post, título como texto) e
  `conteudo/[id]` (home pública + título do conteúdo). O botão do `PostCard`
  fica para depois (backlog; reaproveitará o mesmo componente).

## Não-objetivos / diferido

- Upload/hospedagem de mídia própria; players com controles frame-a-frame
  (seek/volume custom) — o embed é quem toca.
- Popular `embedUrl` dos itens (publicação de conteúdo é decisão do usuário;
  os players nascem "em breve" e ligam sozinhos quando a URL entrar).
- Inline markdown (bold/links) no renderer; share no `PostCard`; reuso de
  `parseMediaSource` no `StoryViewer` (backlog DRY).
- Página pública por conteúdo (share aponta pra home por segurança/simplicidade).

## Verificação

- Gate: `tsc` 0 + `npm run test` (novos: `parseMediaSource`, `withAutoplay`,
  `parseMarkdown`, `slugify`, `extractHeadings`, `buildShareUrl`,
  `isTokenizedPath`) + `next lint` sem erros.
- App: relatório publicado renderiza `####`/tabelas corretamente + ilha de TOC;
  vídeo/podcast mostram players "em breve" (nenhum item tem embed hoje) — testar
  player real setando temporariamente um `embedUrl` de teste em dev; dashboard
  mostra a jornada com âncoras; blog tem share funcional (URLs corretas).
- Sem migration nova. Sem dependência npm nova.
