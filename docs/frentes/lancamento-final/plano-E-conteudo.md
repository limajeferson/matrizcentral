# Trilha E (Conteúdo) — Plano de Implementação

> Spec: [`spec-E-conteudo.md`](spec-E-conteudo.md). Roda **em paralelo** às demais.
> Parte é produção de conteúdo (Claude escreve/gera direto, não é TDD); parte é
> hand-off ao usuário. **Um commit por item de código.**

**Goal:** Encher a biblioteca (texto agora; mídia via NotebookLM→hand-off) pra o
lançamento não parecer vazio.

## Global Constraints
- Custo zero (só embeds YouTube/Spotify; markdown no repo). `publishedAt`
  escalonado (janela de histórias = 7 dias). Gate após itens de código: `tsc` 0 +
  `test` + `lint`. pt-BR. Fonte única = `CONTENT_HUB`/`BLOG_POSTS`.

---

### Task E1 — 3º relatório (do CSV)
**Files:** Create `content/relatorios/ferramentas-automacao-ia.md`; Modify
`src/data/content-hub.ts`.
- [ ] Escrever o relatório em markdown a partir de `notebooklm/textos/…Automação
  e Produtividade…csv` (curar a tabela: Gemma, Qwen, Ollama, GLM, Ministral,
  Omnistack, etc.), com `##`/`###` + tabela pipe. Título "Ferramentas de IA Local
  para Automação e Produtividade". Estrutura como os relatórios existentes.
- [ ] Adicionar ao `CONTENT_HUB`: `id:"relatorio-ferramentas-automacao"`, type
  `relatorio`, `bodyPath`, `recommendedStage:"automacoes"`, `durationMinutes:10`,
  `xpReward:30`, `publishedAt` (data escalonada, ex.: 2 dias atrás).
- [ ] Gate (tsc/test/lint — feed/stories consomem o hub) + verificar no app.
  Commit `feat(conteudo): 3o relatorio (ferramentas de automacao) do CSV`.

### Task E2 — Blog (2→5 posts)
**Files:** Create 3× `content/blog/<slug>.md`; Modify `src/data/blog.ts`.
- [ ] Escrever 3 posts (pilares faltantes: **casos de uso**, **hardware/setup
  prático**, e 1 de reforço), markdown. Datas escalonadas semanais.
- [ ] Adicionar as 3 entradas em `BLOG_POSTS` (slug/title/excerpt/date/author/
  bodyPath/tags).
- [ ] Gate + verificar `/blog` e cada `/blog/[slug]`. Commit `feat(conteudo): +3 posts de blog (cadencia 5 pilares)`.

### Task E3 — Pesquisas (1→2–3)
**Files:** Modify `src/data/content-hub.ts`.
- [ ] Adicionar 1–2 itens `pesquisa` (só `surveyOptions` + `publishedAt`), ex.:
  "Qual sua maior dificuldade com IA local hoje?" / "Que formato você quer mais?".
- [ ] Gate + verificar no feed/histórias. Commit `feat(conteudo): +pesquisas de engajamento`.

### Task E4 — Mídia via NotebookLM (browser) + hand-off
**Files:** (browser) baixar p/ `C:\Users\Grazi\Downloads\` → mover p/
`notebooklm/audio/`, `notebooklm/video/` (gitignored); Create
`docs/frentes/lancamento-final/handoff-midia.md`.
- [ ] **Claude (browser):** no NotebookLM do usuário (aba Estúdio), gerar os
  audio/video overviews dos 6 tópicos (usar os títulos/descrições dos itens
  em-breve como guia). Baixar e organizar. Registrar o que foi gerado vs o que
  ficou de roteiro (se o Estúdio limitar a quantidade).
- [ ] Escrever `handoff-midia.md`: por item, o passo a passo pro usuário subir no
  **Spotify** (podcast) / **YouTube** (vídeo) e **devolver a URL**. Incluir os
  roteiros dos itens não gerados automaticamente.
- [ ] (Sem commit de código; commit só do handoff-midia.md.) Este item **não
  bloqueia** o lançamento (a biblioteca já fica cheia de texto).

### Task E5 — Ligar embeds (após hand-off) — DIFERIDO
**Files:** Modify `src/data/content-hub.ts`.
- [ ] Quando o usuário devolver as URLs: setar `embedUrl` (+ `publishedAt`) nos 6
  itens de mídia. Os players/`parseMediaSource` já tratam YouTube/Spotify.
- [ ] Gate + verificar os players tocando. Commit `feat(conteudo): publica midia (embeds YouTube/Spotify)`.
  **Diferido** até o hand-off; fora do caminho crítico do lançamento.

## Self-Review
- Cobertura: E1 relatório ✓; E2 blog ✓; E3 pesquisas ✓; E4 mídia+handoff ✓; E5
  embeds (diferido) ✓. Texto = custo zero; mídia = hand-off. `publishedAt`
  escalonado documentado. Cadência pós-lançamento registrada no `marketing.md`/ESTADO.
