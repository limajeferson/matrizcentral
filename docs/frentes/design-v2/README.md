# Programa — Design v2 do App (17 modelos 21st.dev)

> Backlog de design do usuário: reconstruir 17 tratamentos visuais/animações a
> partir de componentes do 21st.dev, **com as features de backend que faltam**.
> Decisões de escopo travadas no brainstorm (2026-07-15):
> **(1) visual + backend juntos**; **(2) 5 frentes por área, commit por item**.

## Regras do programa (Global Constraints — valem para TODAS as frentes)

- **Custo zero:** sem dependência npm nova. Reconstruir cada modelo 21st.dev com
  **framer-motion** (já instalado), **Tailwind** e **ícones caseiros**
  (`src/components/ui/icons`) — nunca copiar o código do 21st.dev verbatim (puxa
  embla/react-player/etc.). O *look e comportamento* ficam fiéis; a implementação
  é nossa.
- **Mídia = embeds gratuitos.** "Players de vídeo/áudio reais" são players
  **customizados sobre `embedUrl`** (YouTube/Spotify). **Sem upload/armazenamento
  pago.** Enquanto `embedUrl === null`, o player mostra estado "em breve".
- **Marca:** violeta `#7c5cff` como único acento alto; **nunca rosa**. Área
  logada é **dark-aware** (tokens semânticos `bg-card`/`text-foreground` + violeta).
- **Commit por item:** cada um dos 17 itens vira **um commit próprio**
  (rollback individual). Cada frente tem `spec-N.md` + `plano-N.md`; execução via
  `subagent-driven-development` com revisão por item.
- **Gate:** `npx tsc --noEmit` (0) + `npm run test` (verde) + `npx next lint` sem
  erros. Lógica pura testada (vitest node-env); componentes verificados rodando o
  app + browser. Migrations aplicadas no Supabase remoto via SQL Editor (MCP sem
  permissão nesta conta).
- **pt-BR.** Nunca commitar `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`.

## As 5 frentes (ordem de execução)

Ordenadas por **risco crescente / dependência**: moldura (sem backend) → feed →
comunidade → conteúdo/mídia → fórum.

| # | Frente | Itens (modelo 21st.dev) | Backend novo |
|---|--------|--------------------------|--------------|
| 1 | **Moldura** | header-3 (menu) · sidebar-showcase (lateral) · footer (rodapé) | — (só visual) |
| 2 | **Feed** | modern-timeline (feed infinito) · image-gallery (rail) · post-card (cards) · video-thumbnail (thumb) · expandable-card (transição→conteúdo) | posts de usuário; paginação |
| 3 | **Comunidade** | swipeable-list (atividades) · animated-list (ranking mensal) | ranking por mês (temporada) |
| 4 | **Conteúdo/mídia** | video-player · music-player-card (áudio) · dynamic-island-toc (artigos) · table-of-contents (jornada) · social-links (compartilhar) | players sobre embed; share |
| 5 | **Fórum** | stack-overflow-q-a (pergunta) · reddit-nested-thread (respostas) | respostas aninhadas (`parent_id`) |

## Modelo de dados compartilhado (planejado, aplicado na frente que precisa)

Decisões de produto tomadas no brainstorm (autonomia do usuário; ajustáveis por
veto ao ver cada frente):

- **Posts de usuário (Frente 2):** tabela `feed_posts` (`id`, `user_id`,
  `body` texto, `link_url?`, `image_url?` [somente URL externa, sem upload],
  `created_at`). Qualquer **logado** posta; entra no feed intercalado com
  conteúdo do hub e threads. Reações/curtidas ficam para um item futuro (o
  post-card exibe contadores; a persistência de like é fase 2 se trivial).
- **Paginação do feed (Frente 2):** server-side por `range`/cursor
  (`created_at`), consumida por revelação progressiva client-side ("feed
  infinito" via IntersectionObserver, sem lib).
- **Ranking mensal / temporada (Frente 3):** "temporada" = **mês-calendário**.
  XP do mês corrente derivado de eventos com timestamp no mês (fonte a confirmar
  na frente; se o XP hoje é só acumulado, adiciona-se agregação por mês). Reset
  visual a cada mês.
- **Respostas aninhadas do fórum (Frente 5):** `forum_replies.parent_reply_id`
  (nullable) + render recursivo com indentação (estilo Reddit). Migração
  aditiva; respostas atuais viram raiz (`parent_reply_id = null`).
- **Players (Frente 4):** popular `embedUrl` (YouTube/Spotify) nos itens do
  `CONTENT_HUB` conforme a mídia for publicada; player custom lê `embedUrl`.

## Não-objetivos

- Upload/hospedagem de mídia própria (custo). Só embeds gratuitos.
- Likes/comentários persistidos além do MVP do post-card (fase posterior se não
  for trivial).
- Migrar dark para o marketing/`/oferta` (fora do app logado).
