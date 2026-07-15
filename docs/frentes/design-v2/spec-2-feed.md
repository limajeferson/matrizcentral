# Spec — Frente 2: Feed (timeline infinita + posts + cards + transição)

> Programa: [`README.md`](README.md). Segunda frente — **visual + backend**.
> Modelos: modern-timeline (`@chow-stack`), image-gallery (`@prebuiltui`),
> post-card (`@preetsuthar17`), video-thumbnail-player (`@ravikatiyar162`),
> expandable-card (`@erikx`). Reconstruídos com framer-motion + Tailwind + ícones
> caseiros. Herda as Global Constraints do programa.

## Estado atual

- `feed/page.tsx` (server): monta `AppShell` com `CenterColumn` (rail "Comece por
  aqui" + lista mista conteúdo/fórum via `mixFeed`). Feed é **estático** (server,
  sem paginação, sem posts de usuário, sem animação de entrada).
- `CenterColumn.tsx`: `RailCard` (rail horizontal com `overflow-x-auto`),
  `ContentListItem`, `ThreadListItem`.
- Não existe entidade "post de usuário".

## Decisões de produto (posts) — travadas no programa, ajustáveis por veto

- **Quem posta:** qualquer usuário **logado**.
- **O que é um post:** `body` (texto, obrigatório, limite ~2000 chars) +
  `link_url?` (URL externa opcional) + `image_url?` (**URL externa** opcional —
  **sem upload/armazenamento**, custo zero). Sem rich-text no MVP.
- **Curtidas/comentários:** o post-card **exibe contadores** (curtidas/comentários/
  compartilhamentos), mas a **persistência de like/comentário fica para item
  futuro** (MVP mostra 0 e o botão de curtir é otimista-local ou desabilitado com
  "em breve"). Sem tabela de likes agora (YAGNI até validar).
- **Moderação:** MVP sem moderação ativa; `feed_posts` tem `user_id` (autoria) e
  RLS (só o autor edita/apaga o próprio; leitura pública para logados). Denúncia/
  moderação = backlog.

## Itens da frente (commit por item; ordem = backend → visual)

### Item 1 — Backend de posts (`feed_posts`)
- **Migration `0024_feed_posts.sql`** (aplicar no remoto via SQL Editor):
  tabela `feed_posts` (`id uuid pk`, `user_id uuid → users`, `body text not null`,
  `link_url text`, `image_url text`, `created_at timestamptz default now()`),
  índice em `created_at desc`. **RLS:** select para autenticados; insert/update/
  delete só `auth.uid() = user_id` (via service_role no server, mas política
  defensiva). Atualizar `src/lib/types` se houver tipos gerados.
- **`src/lib/feed-posts.ts` (puro + data):** `parseNewPost(input)` puro
  (valida/normaliza body/link/image, testável) + `createPost`/`listPosts(limit,
  before?)` usando `getSupabaseServerClient` (service_role). `listPosts` paginado
  por cursor `created_at`.
- **Rota `POST /api/feed/post`:** sessão obrigatória (`getSessionUser`), valida
  via `parseNewPost`, insere, retorna o post. Sem sessão → 401.

### Item 2 — Feed como timeline infinita (modern-timeline)
- **Modelo unificado de item de feed:** `FeedEntry` (union: `post` | `content` |
  `thread`) ordenado por recência (posts e threads por `created_at`; conteúdo do
  hub por `publishedAt`/ordem). Helper puro `buildFeedTimeline(...)` (testável)
  intercala e ordena.
- **Paginação/"infinito":** server entrega a **1ª página** (ex.: 15 itens);
  client component `FeedTimeline` revela mais via **IntersectionObserver** num
  sentinela ao fim (chama `GET /api/feed/page?before=<cursor>`), sem lib de
  scroll. Cada item entra com **animação staggered** (framer-motion
  `whileInView`, `initial opacity/y`, `viewport once`).
- Rota `GET /api/feed/page?before=<iso>` retorna a próxima página do timeline
  (posts + threads; conteúdo do hub é finito e vai na 1ª carga).

### Item 3 — "Comece por aqui" como galeria horizontal (image-gallery)
- `RailCard` vira uma **galeria horizontal** que **desliza** (wheel horizontal +
  drag) **sem barra de rolagem visível** (`scrollbar-width:none` +
  `-webkit-scrollbar{display:none}` via classe utilitária `.no-scrollbar` em
  `globals.css`) e com **scroll-snap** (`snap-x snap-mandatory`, itens
  `snap-start`). Drag opcional via framer-motion (`drag="x"` com `dragConstraints`)
  — ou scroll nativo horizontal com snap (mais simples, custo zero). Preferir
  **scroll nativo + snap + no-scrollbar**; wheel vertical→horizontal via handler.

### Item 4 — Cards de postagem no feed (post-card)
- `PostCard` (client): avatar (inicial do e-mail/autor), autor, timestamp
  relativo (`há X min`), corpo, imagem opcional (`<img>` de URL externa,
  `loading="lazy"`), rodapé de ações (curtir/comentar/compartilhar com ícones
  caseiros + contadores). Curtir = otimista-local (MVP) ou selo "em breve".
  Usado para itens `post` do timeline. Itens `content`/`thread` mantêm cards
  próprios (ou um card unificado com a mesma linguagem visual).
- Helper puro `relativeTime(from, now)` testável (pt-BR: "agora", "há 5 min",
  "há 2 h", "há 3 d", data).

### Item 5 — Thumbnail de vídeo no feed (video-thumbnail-player)
- `VideoThumb` (client): capa (thumbnail; para YouTube dá pra derivar de
  `embedUrl`), **botão play central**, **selo de duração** (canto), título
  overlay. Clique → troca a capa pelo **iframe do embed** (`embedUrl` +
  `autoplay=1`) inline. Enquanto `embedUrl===null` → estado "em breve" (sem play).
  Usado quando um item de conteúdo `video` aparece no feed.

### Item 6 — Transição feed → conteúdo (expandable-card)
- Card de conteúdo no feed usa **shared-layout** (framer-motion `layoutId` único
  por item) que **expande** para uma **camada de detalhe** (overlay) com título,
  descrição e CTA "Abrir conteúdo" (`Link` para a rota real do conteúdo, que
  respeita o gating). `Escape`/clique fora fecha. `layoutId` **único por item**
  (`content-<id>`) para não colidir. Prévia rica sem sair do feed; o clique no CTA
  navega de fato.

## Não-objetivos / diferido

- Upload de imagem (só URL externa). Likes/comentários persistidos. Moderação.
- Busca/filtro do feed. Paginação real do conteúdo do hub (é finito).
- Realtime (novos posts aparecem no próximo carregamento).

## Verificação

- Gate: `tsc` 0 + `npm run test` (novos testes: `parseNewPost`,
  `buildFeedTimeline`, `relativeTime`) + `next lint` sem erros.
- Migration `0024` aplicada no remoto (SQL Editor) — hand-off.
- App logado (`/feed`): postar texto aparece no topo do feed; rolar carrega mais
  (infinito) com entrada animada; rail desliza sem scrollbar; card de vídeo toca
  inline; clicar num conteúdo expande a prévia e o CTA navega.
- Dark-aware; insulamento de escopo; a11y (form com labels, dialog na expansão).
