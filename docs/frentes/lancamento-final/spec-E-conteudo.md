# Spec — Trilha E: Conteúdo (encher a biblioteca)

> Programa: [`README.md`](README.md). Roda **em paralelo** às trilhas de código.
> **Objetivo:** sair de "67% em breve" (3 de 9 consumíveis) para uma biblioteca
> que parece viva e valiosa no lançamento, sem custo e sem depender das contas
> do usuário para o que dá pra fazer sozinho.

## Estado atual (inventário 2026-07-16)

- **CONTENT_HUB = 9 itens; 3 consumíveis** (2 relatórios + 1 pesquisa). 6 "em
  breve" (4 podcasts, 2 vídeos) — `embedUrl: null`, **sem mídia bruta no repo**.
- **Texto = custo zero:** relatório precisa de `content/relatorios/<slug>.md` +
  entrada no `CONTENT_HUB`; pesquisa precisa só de `surveyOptions`; blog precisa
  de `content/blog/<slug>.md` + entrada no `BLOG_POSTS`.
- **Mídia = embed grátis:** só YouTube/Spotify (players da Frente 4 prontos);
  precisa produzir + subir + colar `embedUrl`.
- **Material bruto:** CSV não usado (`notebooklm/textos/…Automação e
  Produtividade…csv`) → vira 3º relatório. NotebookLM do usuário (Estúdio) gera
  os audio/video overviews.
- **`publishedAt` acende as histórias** (janela de 7 dias) → datas escalonadas.

## Item E1 — 3º relatório (do CSV, custo zero)

- Escrever `content/relatorios/ferramentas-automacao-ia.md` a partir do CSV
  (tabela de modelos/ferramentas: Gemma, Qwen, Ollama, GLM, Ministral, etc.),
  em prosa curada com a estrutura dos relatórios existentes (headings `##`/`###`,
  tabelas pipe — o `Markdown.tsx` da Frente 4 já renderiza tabelas). Título:
  "Ferramentas de IA Local para Automação e Produtividade".
- Entrada no `CONTENT_HUB`: `id: "relatorio-ferramentas-automacao"`, `type:
  "relatorio"`, `bodyPath`, `recommendedStage: "automacoes"` (preenche uma etapa
  do roadmap hoje coberta só por em-breve), `durationMinutes: 10`, `xpReward: 30`,
  `publishedAt` escalonado. Sem `startIncluded` (biblioteca paga).

## Item E2 — Blog (2 → 5 posts)

- Escrever **3 posts** markdown em `content/blog/`, rotacionando os 5 pilares do
  `marketing.md` (já tem "ia-local/privacidade/custo"; faltam **casos de uso** e
  **hardware/setup prático**). Cada um: `content/blog/<slug>.md` + entrada em
  `BLOG_POSTS` (slug, title, excerpt, date, author "Matriz Central", bodyPath,
  tags). Datas escalonadas (semanais, retroativas até hoje) pra sugerir cadência.
- Reusa o pipeline existente (`src/lib/blog.ts`); zero infra.

## Item E3 — Pesquisas (1 → 2–3)

- Adicionar **1–2 itens `pesquisa`** ao `CONTENT_HUB` (só `surveyOptions` +
  `publishedAt`), ex.: "Qual sua maior dificuldade com IA local hoje?",
  "Que formato de conteúdo você quer mais?". Custo zero, gera engajamento + dado
  de CRM. Aparecem no feed e nas histórias.

## Item E4 — Mídia via NotebookLM (browser) + hand-off

- **Claude (browser):** no NotebookLM do usuário
  (`notebooklm.google.com/notebook/10e73de4-…`, aba **Estúdio**), gerar os
  **audio overviews** (para os 4 tópicos de podcast) e **video overviews** (para
  os 2 de vídeo), usando os tópicos dos 6 itens em-breve como guia. Baixar para
  `C:\Users\Grazi\Downloads\` e mover para `notebooklm/audio/` e
  `notebooklm/video/` (gitignored — destino Spotify/YouTube, não versionado).
- **Hand-off (usuário):** documento com o passo a passo para **subir cada áudio
  no Spotify** (for Podcasters) e **cada vídeo no YouTube**, e **devolver as
  URLs**. Claude não sobe (contas do usuário).
- **Restrição:** o NotebookLM pode não gerar exatamente 6 peças distintas; se o
  Estúdio limitar, priorizar os tópicos de maior valor e o resto vira roteiro
  para o usuário produzir. Registrar o que foi gerado vs o que ficou de roteiro.

## Item E5 — Ligar os embeds (após hand-off)

- Quando o usuário devolver as URLs: setar `embedUrl` (+ `publishedAt`) nos 6
  itens de mídia do `CONTENT_HUB`. Os players (`VideoPlayer`/`MusicPlayerCard`) e
  o `parseMediaSource` já tratam YouTube/Spotify — é só o dado. **Diferido** até
  o hand-off; não bloqueia o resto da Trilha E nem o lançamento (a biblioteca já
  fica cheia de texto).

## Escalonamento de `publishedAt` (histórias vivas)

- Distribuir as datas dos itens novos ao longo dos últimos ~7 dias (não tudo
  "hoje"), pra a barra de histórias mostrar variedade e não esvaziar de uma vez.
- Deixar registrado no `marketing.md`/`ESTADO` a **cadência pós-lançamento**
  (1 blog/semana; conteúdo conforme produzido) — a barra se re-alimenta com cada
  publicação nova.

## Não-objetivos / diferido

- Upload de mídia às contas do usuário (hand-off). Hospedagem paga (só embeds).
- CMS/admin de conteúdo — segue por arquivo markdown + manifesto.

## Verificação

- Gate após E1–E3: `npx tsc --noEmit` 0 + `npm run test` (feed/stories/blog
  testes verdes com os itens novos) + `npx next lint`. Rodar o app: os itens
  novos aparecem no `/feed`, `/conteudo`, `/blog` e nas histórias; relatório novo
  renderiza tabelas.
- E4: registrar o que o NotebookLM gerou + o doc de hand-off. E5: após URLs,
  confirmar os players tocando.
- Sem migration. Sem dependência npm nova.
