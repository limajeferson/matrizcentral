# Trilha E (Conteúdo) — Plano de Implementação (REVISADO 2026-07-22)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.
> Spec: [`spec-E-conteudo.md`](spec-E-conteudo.md) + **realidade nova** em
> [`insumos/2026-07-22-inventario-estudio.md`](insumos/2026-07-22-inventario-estudio.md)
> (5 artefatos recomendados JÁ GERADOS no Estúdio; 9 mídias prontas; insumo das
> 26 fontes recuperado em `insumos/2026-07-22-chat-completo-66-fontes.md`).
> Parte é produção de conteúdo (curadoria, não TDD); parte é browser (só o
> coordenador opera o Chrome); parte é hand-off ao usuário. **Um commit por task.**

**Goal:** Encher a biblioteca para o lançamento: +2 relatórios, +3 posts,
+2 pesquisas, 3 novos itens de mídia na vitrine, e as 9 mídias baixadas com
hand-off de upload pronto.

**Architecture:** Texto entra por markdown em `content/` + entrada no manifesto
(`CONTENT_HUB`/`BLOG_POSTS`) — pipeline existente, zero infra nova. Mídia:
download local (gitignored) + doc de hand-off; `embedUrl` só quando o usuário
devolver as URLs (E5, diferido).

**Tech Stack:** Next.js 14 / markdown via `src/lib/markdown.ts` / vitest.

## Global Constraints

- Custo zero: sem dependência npm nova, sem asset externo; mídia só como embed
  YouTube/Spotify (quando chegar).
- Fonte única: `CONTENT_HUB` (`src/data/content-hub.ts`) e `BLOG_POSTS`
  (`src/data/blog.ts`). Nunca inventar título fora do manifesto.
- Item com `embedUrl: null` (exceto relatorio/pesquisa) = selo "em breve" — a
  vitrine é "em expansão", nunca "tudo disponível".
- `publishedAt` escalonado nos últimos ~7 dias (janela de histórias) — nunca
  tudo no mesmo dia. Itens de mídia SEM `publishedAt` até a URL chegar.
- pt-BR. Gate por task: `npx tsc --noEmit` 0 · `npm run test` (345+) ·
  `npx next lint` 0 erros. `npm run build` falha por design (não é gate).
- Relatório novo: markdown com `##`/`###` e tabelas pipe (o `Markdown.tsx` da
  F4 renderiza; conferir no app depois — L-041: rota que lê arquivo em runtime
  precisa do `outputFileTracingIncludes`, que já cobre `content/**`).
- Tom da marca: direto, sem hype, foco em custo zero/privacidade/autonomia
  (voz dos 2 relatórios e 2 posts existentes).

## Estado real (revalidado 2026-07-22 contra o código)

- `CONTENT_HUB` = 9 itens: 2 relatórios publicados + 1 pesquisa + 4 podcasts e
  2 vídeos "em breve" — estes 6 batem **1:1** com artefatos prontos do Estúdio.
- Blog: 2 posts (`por-que-ia-local` = pilares IA local/custo; `quanto-hardware`
  = pilar hardware). Pilares sem post dedicado: **privacidade**, **custo**,
  **casos de uso** (rotação do `marketing.md` §Pilares).
- CSV do E1 existe: `notebooklm/textos/Modelos e Ferramentas de IA para
  Automação e Produtividade - Table 1.csv`.
- Estúdio tem ainda (novos, era 26–44 fontes): 2 podcasts extra ("Vibe Coding e
  o fim do programador" 28:33; "Vibe Coding e a engenharia de software" 12:32),
  1 vídeo extra ("Lucrando com IA Local" 6:53) e o relatório texto "Kimi K3 e a
  Disrupção do Ecossistema Open Source" (recomendação nº 1 dos 5 artefatos).
- Slides/infográficos/quiz do Estúdio: **sem vitrine no produto** → ficam FORA
  (backlog registrado; não criar feature nova — YAGNI).

---

### Task E1 — 3º relatório: "Ferramentas de IA Local para Automação e Produtividade" (do CSV)

**Files:**
- Create: `content/relatorios/ferramentas-automacao-ia.md`
- Modify: `src/data/content-hub.ts` (inserir após `relatorio-comparativo-modelos`)

**Interfaces (produz):** item novo `id: "relatorio-ferramentas-automacao"` no
`CONTENT_HUB` (shape `ContentItem` existente — não mudar a interface).

- [ ] **Step 1:** Ler o CSV (`notebooklm/textos/Modelos e Ferramentas de IA para Automação e Produtividade - Table 1.csv`) e os 2 relatórios existentes em `content/relatorios/` (para copiar estrutura/tom).
- [ ] **Step 2:** Escrever `content/relatorios/ferramentas-automacao-ia.md`: intro curta (2 parágrafos, problema→promessa), depois seções `##` por categoria de ferramenta (modelos leves, orquestradores/agentes, automação n8n/terminal), com **tabelas pipe** curadas do CSV (colunas: Ferramenta/Modelo · Para quê · Hardware mínimo · Observação) e um fechamento "como escolher" com 3 critérios. 900–1400 palavras. Sem inventar dados fora do CSV; se uma linha do CSV for ambígua, omitir (não chutar).
- [ ] **Step 3:** Adicionar ao `CONTENT_HUB`:
```ts
{
  id: "relatorio-ferramentas-automacao",
  type: "relatorio",
  title: "Ferramentas de IA Local para Automação e Produtividade",
  description:
    "As ferramentas e modelos locais que automatizam tarefas de verdade — organizados por caso de uso e hardware.",
  durationMinutes: 10,
  xpReward: 30,
  recommendedStage: "automacoes",
  bodyPath: "content/relatorios/ferramentas-automacao-ia.md",
  embedUrl: null,
  publishedAt: "<hoje - 2 dias>",
  capacityFit: ["equilibrio", "essencial"],
},
```
- [ ] **Step 4:** Gate: `npx tsc --noEmit` · `npm run test` · `npx next lint`. Expected: 0 / verde / 0 erros.
- [ ] **Step 5:** Commit `feat(conteudo): 3o relatorio (ferramentas de automacao) do CSV`.

### Task E2 — Blog 2→5 (pilares privacidade, custo, casos de uso)

**Files:**
- Create: `content/blog/privacidade-ia-local.md`, `content/blog/custo-real-assinaturas-ia.md`, `content/blog/casos-de-uso-ia-local.md`
- Modify: `src/data/blog.ts` (3 entradas novas em `BLOG_POSTS`)

**Interfaces (produz):** 3 slugs novos no `BLOG_POSTS` (shape existente:
`slug/title/excerpt/date/author/bodyPath/tags`).

- [ ] **Step 1:** Ler os 2 posts existentes (tom/estrutura) e `docs/frentes/blog-marketing/marketing.md` (§Pilares, §SEO).
- [ ] **Step 2:** Escrever os 3 posts (600–900 palavras cada, pt-BR, tom direto):
  - `privacidade-ia-local.md` — pilar 3: dados que não saem da máquina, LGPD, casos sensíveis (jurídico/saúde/financeiro). CTA para `/oferta`.
  - `custo-real-assinaturas-ia.md` — pilar 4: conta de 12 meses de assinaturas vs passe único (eixo central da marca). CTA para `/oferta`.
  - `casos-de-uso-ia-local.md` — pilar 5: 4–5 aplicações reais (produtividade, estudo, pequeno negócio, automação com n8n — pode citar o caso "estagiário virtual" do insumo `2026-07-22-chat-completo-66-fontes.md`). CTA para `/oferta`.
- [ ] **Step 3:** 3 entradas em `BLOG_POSTS` com `date` escalonado semanal retroativo (ex.: hoje-1d, hoje-8d, hoje-15d), `author: "Matriz Central"`, tags por pilar (`["privacidade","ia-local"]`, `["custo","ia-local"]`, `["casos-de-uso","ia-local"]`).
- [ ] **Step 4:** Gate (tsc/test/lint). Expected: verde.
- [ ] **Step 5:** Commit `feat(conteudo): +3 posts de blog (privacidade, custo, casos de uso)`.

### Task E3 — Pesquisas 1→3

**Files:**
- Modify: `src/data/content-hub.ts` (2 itens `pesquisa` novos)

- [ ] **Step 1:** Adicionar 2 itens após `pesquisa-hardware-atual` (copiar o shape dela; pesquisa não usa `embedUrl` de verdade — manter `embedUrl: null` como no item existente):
```ts
{
  id: "pesquisa-maior-dificuldade",
  type: "pesquisa",
  title: "Qual sua maior dificuldade com IA local hoje?",
  description: "Ajude a comunidade a priorizar os próximos guias e relatórios.",
  durationMinutes: 1,
  xpReward: 10,
  embedUrl: null,
  publishedAt: "<hoje - 1 dia>",
  surveyOptions: [
    { id: "escolher_modelo", label: "Escolher o modelo certo" },
    { id: "configurar", label: "Instalar e configurar sem erro" },
    { id: "hardware", label: "Saber se meu hardware aguenta" },
    { id: "automatizar", label: "Automatizar tarefas com a IA" },
  ],
},
{
  id: "pesquisa-formato-conteudo",
  type: "pesquisa",
  title: "Que formato de conteúdo você quer mais?",
  description: "Vote no formato que a Matriz deve priorizar nas próximas semanas.",
  durationMinutes: 1,
  xpReward: 10,
  embedUrl: null,
  publishedAt: "<hoje - 4 dias>",
  surveyOptions: [
    { id: "relatorios", label: "Relatórios comparativos" },
    { id: "podcasts", label: "Podcasts / debates" },
    { id: "videos", label: "Vídeos explicativos" },
    { id: "tutoriais", label: "Tutoriais passo a passo" },
  ],
},
```
- [ ] **Step 2:** Gate (tsc/test/lint) — os testes de feed/stories consomem o hub. Expected: verde.
- [ ] **Step 3:** Commit `feat(conteudo): +2 pesquisas de engajamento`.

### Task E6 — 4º relatório: "Kimi K3 e a Disrupção do Ecossistema Open Source" + 3 itens de mídia novos na vitrine

> Depende do texto bruto extraído pelo coordenador (E4 Step 1) em
> `docs/frentes/lancamento-final/insumos/2026-07-22-relatorio-kimi-k3-bruto.md`.

**Files:**
- Create: `content/relatorios/kimi-k3-disrupcao-open-source.md`
- Modify: `src/data/content-hub.ts` (1 relatório + 2 podcasts + 1 vídeo novos)

- [ ] **Step 1:** Curar o texto bruto do insumo para markdown do portal (mesma estrutura dos relatórios existentes; remover marcas de "gerado por IA"/citações numéricas do NotebookLM; manter tabelas). 900–1400 palavras.
- [ ] **Step 2:** Adicionar ao `CONTENT_HUB`: o relatório (`id: "relatorio-kimi-k3"`, `recommendedStage: "modelos_performance"`, `capacityFit: ["performance"]`, `publishedAt: <hoje>`, `durationMinutes: 11`, `xpReward: 30`, `bodyPath` novo) e os 3 itens de mídia "em breve" (sem `publishedAt`, `embedUrl: null`):
```ts
{
  id: "podcast-vibe-coding-fim-programador",
  type: "podcast",
  title: "Vibe Coding e o Fim do Programador Tradicional?",
  description:
    "Debate: o que os projetos 100% gerados por IA dizem sobre o futuro de quem programa.",
  durationMinutes: 29,
  xpReward: 20,
  recommendedStage: "automacoes",
  embedUrl: null,
},
{
  id: "podcast-vibe-coding-engenharia",
  type: "podcast",
  title: "Vibe Coding e a Engenharia de Software",
  description:
    "Velocidade de produção vs qualidade: onde a IA acelera e onde ela quebra o design.",
  durationMinutes: 13,
  xpReward: 20,
  recommendedStage: "automacoes",
  embedUrl: null,
},
{
  id: "video-lucrando-ia-local",
  type: "video",
  title: "Lucrando com IA Local",
  description:
    "Como transformar modelos gratuitos rodando em VPS barata num serviço que gera receita.",
  durationMinutes: 7,
  xpReward: 20,
  recommendedStage: "automacoes",
  embedUrl: null,
  capacityFit: ["equilibrio", "performance"],
},
```
- [ ] **Step 3:** Gate (tsc/test/lint). Expected: verde.
- [ ] **Step 4:** Commit `feat(conteudo): 4o relatorio (Kimi K3) + 3 midias novas na vitrine (em breve)`.

### Task E4 — Browser (SÓ o coordenador): extrair relatório bruto + baixar as 9 mídias + hand-off

**Files:** downloads → `notebooklm/audio/` e `notebooklm/video/` (gitignored);
Create: `docs/frentes/lancamento-final/insumos/2026-07-22-relatorio-kimi-k3-bruto.md`
e `docs/frentes/lancamento-final/handoff-midia.md`.

- [ ] **Step 1 (desbloqueia E6):** abrir o artefato "Relatório Técnico: Kimi K3 e a Disrupção do Ecossistema Open Source" no Estúdio, extrair o texto integral (DOM) e salvar em `insumos/2026-07-22-relatorio-kimi-k3-bruto.md`. Commit junto com o Step 4.
- [ ] **Step 2:** baixar os 9 artefatos de mídia (menu ⋮ → download): 6 podcasts (Rode IA Potente 16:05 · IAs Poderosas 18:50 · Melhor IA p/ Hardware 22:56 · Escolher sem Travar 25:14 · Vibe Coding fim do programador 28:33 · Vibe Coding engenharia 12:32) + 3 vídeos (A Verdade 8:16 · A Evolução 9:51 · Lucrando com IA Local 6:53). Mover de `Downloads/` para `notebooklm/audio|video/` com nomes-slug dos ids do hub.
- [ ] **Step 3:** Escrever `handoff-midia.md`: tabela id do hub ↔ arquivo local ↔ destino (Spotify for Creators / YouTube) + passo a passo de upload por plataforma + "devolva as URLs assim: `id → URL`". Registrar que slides/infográficos/quiz do Estúdio ficaram FORA da vitrine (sem formato no produto — backlog).
- [ ] **Step 4:** Commit `docs(conteudo): relatorio kimi-k3 bruto + handoff de midia (9 arquivos prontos)`.

### Task E5 — Ligar embeds — DIFERIDO (após hand-off do usuário)

**Files:** Modify `src/data/content-hub.ts`.
- [ ] Quando as URLs voltarem: setar `embedUrl` + `publishedAt` (escalonado) nos 9 itens de mídia. Gate + conferir players tocando **em produção** (L-041/L-044: dado mutável, conferir pós-deploy). Commit `feat(conteudo): publica midia (embeds YouTube/Spotify)`.

## Ordem de execução

1. **E1 → E2 → E3** via SDD (implementer sonnet, reviewer sonnet, fixes haiku) — sem dependência de browser.
2. **E4** pelo coordenador (Chrome) — pode rodar entre reviews; o Step 1 destrava a E6.
3. **E6** via SDD (depende do E4 Step 1).
4. **E5** diferido (aguarda usuário).
5. Fechamento da trilha: verificação visual (feed/histórias/blog com itens novos, relatórios renderizando tabelas **em produção** — L-041) → lições → ESTADO → push (sem migration nesta trilha).

## Self-Review

- Cobertura da spec: E1 ✓ · E2 ✓ (pilares corrigidos p/ privacidade/custo/casos
  de uso — os que faltam de verdade no manifesto) · E3 ✓ · E4 ✓ (gerar→baixar,
  realidade nova) · E5 ✓ diferido · extra E6 coberto pela recomendação nº 1 dos
  5 artefatos (insumo recuperado). Slides/infográfico: fora por YAGNI, backlog
  registrado no handoff. Sem placeholder; shapes do `ContentItem` copiados do
  código real; sem migration; custo zero mantido.
