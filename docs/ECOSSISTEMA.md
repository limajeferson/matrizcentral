# 🧠 Ecossistema — Matriz Central

> **Este é o ponto de entrada de contexto.** Leia-o primeiro ao iniciar uma sessão.

## 🧭 Comece aqui (regras de navegação)

- **Retomando trabalho / "continue de onde paramos"?** Leia [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md) — é o pino "você está aqui" (frente ativa + próxima ação + estado do git). Ele tem prioridade sobre este hub na retomada.
- Leia este hub e **siga apenas os links necessários** para a tarefa atual. Não abra tudo — abrir sob demanda economiza tokens.
- Cada fato tem **um lugar canônico** (indicado abaixo). Ao precisar de um detalhe, **confirme no arquivo linkado** em vez de supor — isso evita alucinação.
- Ordem recomendada num início do zero: [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md) → este hub → `CLAUDE.md` → o README da frente ativa → o código fonte-de-verdade.

## 📊 Status atual (2026-07-20)

- **No ar (produção):** **`www.matrizcentral.com.br`** (Vercel, auto-deploy a cada push na `master`; último deploy READY). Muito além da landing: **todas as 6 frentes do roadmap** (login real, assinaturas, feed, fórum, blog/marketing, suporte/CRM), **SP1** (casa unificada + diagnóstico por sessão), o **redesign do feed** (baseline + barra de histórias), o **programa design v2** (Frentes 1–4) e a **Trilha B do lançamento** (segurança do dinheiro) estão entregues e deployados.
- **Fase atual:** **PROGRAMA DE LANÇAMENTO FINAL** ([`frentes/lancamento-final/`](frentes/lancamento-final/README.md)) — 7 trilhas (A–G) que levam à versão final. **Planejadas inteiras** (6 specs + 6 planos); **A** (Brevo ✅ / Stripe com o usuário) e **B** ✅ fechadas; **C (dark-aware) é a próxima**.
- **Repo:** https://github.com/limajeferson/matrizcentral · branch `master` · ⚠️ **HEAD `da0ce5d` está 23 commits À FRENTE de `origin/master` (`b0a66cb`)** — a frente [leitor-protegido](frentes/leitor-protegido/README.md) está local de propósito. **Não pushar antes de destravá-la.**
- **Saúde:** `npx tsc --noEmit` 0 · `npm run test` **322 testes** verdes (54 arquivos) · `npx next lint` **0 erros** (2 warnings `no-img-element` pré-existentes em `VideoPlayer.tsx:52` e `SystemSection.tsx:92`). (`npm run build` falha só ao coletar `/api/checkout` por falta de `STRIPE_SECRET_KEY` no shell — pré-existente, ver `CLAUDE.md`.)
- **Fonte de verdade do andamento e da próxima ação:** [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md).
- **Pendências ativas (detalhe em `ESTADO-ATUAL.md`):**
  1. **Trilhas C→G do lançamento** (dark-aware, fórum, conteúdo, polish, tech-debt) + auditoria final.
  2. Stripe em modo **teste** (verificação de empresa pendente); go-live financeiro depende disso. **Único bloqueio externo real.**
  3. Revisão de design da `RightSidebar` — o usuário está anotando e vai enviar (entra na Trilha F).
  4. Upload da mídia gerada no NotebookLM (Spotify/YouTube) — hand-off do usuário; o Claude pluga os `embedUrl` (Trilha E).

## 🗺️ Mapa neural (leia quando…)

**Produto & Visão**
- [`CLAUDE.md`](../CLAUDE.md) — regras do projeto; leia sempre no início.
- [`descricao/VERSAO-CONCISA.md`](../descricao/VERSAO-CONCISA.md) — pitch curto do produto.
- [`descricao/VERSAO-COMPLETA.md`](../descricao/VERSAO-COMPLETA.md) — visão completa.
- [`contextocentral.md`](../contextocentral.md) — contexto de negócio consolidado.

**Arquitetura**
- [`arquitetura-1/`](../arquitetura-1/) — arquitetura técnica: triagem, perfis/roadmaps, reembolso, e-mail, dashboard admin, integrações, timeline, KPIs.
- [`arquitetura-2/`](../arquitetura-2/) — gamificação: DB Supabase, XP, badges, níveis, certificados, leaderboard, desafios, notificações.

**Código fonte-de-verdade**
- [`src/data/content-hub.ts`](../src/data/content-hub.ts) — `CONTENT_HUB`, a biblioteca de conteúdo. **Nunca inventar títulos numa vitrine — mapear deste array.**
- [`src/lib/content-stats.ts`](../src/lib/content-stats.ts) — contagem de formatos.
- [`notebooklm/`](../notebooklm/) — assets brutos (áudios `.m4a`, vídeos `.mp4`, relatórios `.md`, apresentações). O que já está produzido vs "em breve".

**Specs & Plans (por frente)** — ver lista em "Frentes já trabalhadas".
- [`docs/frentes/<slug>/spec.md`](frentes/) — o "porquê/o quê" de cada frente.
- [`docs/frentes/<slug>/plano*.md`](frentes/) — o "como" (passo a passo).
- [`PLAYBOOK-EXECUCAO.md`](PLAYBOOK-EXECUCAO.md) — método: skills, agentes, modelos, gate, ordem de deploy.
- [`LICOES.md`](LICOES.md) — lições destiladas de erros reais, por gatilho; injetar nos briefs (etapa 7).

**Memória automática (fora do repo — LOCAL de cada máquina, NÃO viaja no `git pull`)**
- O usuário trabalha de **dois computadores**: **`Grazi`** (da esposa, em uso agora)
  e **`jefer`** (o dele, para quando voltar de férias). A memória vive em
  `<home>\.claude\projects\<slug-do-caminho-do-projeto>\memory\MEMORY.md`, que é
  **diferente em cada máquina** (usuário + local do projeto mudam):
  - `Grazi`: `C:\Users\Grazi\.claude\projects\C--Users-Grazi-Claude-Projects-matrizcentral\memory\MEMORY.md`
  - `jefer`: `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md`
  (confirme o slug real com o caminho do projeto na máquina atual).
- **Consequência para a continuidade:** memórias escritas numa máquina **não
  aparecem** na outra (ficam fora do git). A continuidade que **atravessa os
  computadores** é o **repo** — `ESTADO-ATUAL.md`, docs e código, via `git pull`.
  A memória automática é uma conveniência por-máquina, não a fonte de verdade.

**Deploy**
- [`.env.example`](../.env.example) — env vars necessárias.
- [`supabase/migrations/`](../supabase/migrations/) — migrations (0001→**0028**, **todas aplicadas no remoto**; `0027_forum_nested_replies` chega na Trilha D). **O Claude aplica sozinho** via `npx supabase db query --linked -f <arquivo>` (projeto linkado; fallback navegador/Monaco — método no `CLAUDE.md`) — não é hand-off pro usuário. O MCP não tem permissão nesta conta; `supabase db push` tem histórico divergente.
- Auto-deploy: push na `master` → Vercel builda e publica em `www.matrizcentral.com.br`. O ESLint roda no `npm run build` do Vercel e **barra o deploy** se houver erro de lint.

## 🔀 Frentes já trabalhadas

Cada frente vive em `docs/frentes/<slug>/` com `spec.md` (o quê/porquê), `plano*.md` (o como) e `README.md` (status + próximo passo). **Ao retomar trabalho, abra o README da frente relevante antes de perguntar ao usuário o que já foi feito.**

- ✅ [fase-1-mvp](frentes/fase-1-mvp/README.md) — MVP: compra → triagem → dashboard → validação → XP
- ✅ [identidade-visual](frentes/identidade-visual/README.md) — paleta violeta + glassmorphism
- ✅ [landing-v2-enriquecimento](frentes/landing-v2-enriquecimento/README.md) — landing rica a partir do modelo-guia
- ✅ [triagem-democratizada](frentes/triagem-democratizada/README.md) — quiz ramificado, 8 perfis, sem jargão
- ✅ [landing-redesign-v3-dark](frentes/landing-redesign-v3-dark/README.md) — landing dark/violeta, hero + animações
- ✅ [visual-treatments](frentes/visual-treatments/README.md) — 6 tratamentos visuais (21st.dev)
- ✅ [polimento-landing-oferta](frentes/polimento-landing-oferta/README.md) — bugs de conversão + oferta
- ✅ [conteudo-conversao-hub](frentes/conteudo-conversao-hub/README.md) — reposicionamento multi-formato + seções método/experiência
- ✅ [footer-institucional](frentes/footer-institucional/README.md) — rodapé institucional + /sobre + /legal
- ✅ [ecossistema-documentacao](frentes/ecossistema-documentacao/README.md) — hub de contexto v1
- ✅ [gamificacao-avancada](frentes/gamificacao-avancada/README.md) — níveis, badges, certificado, leaderboard, desafios, notificações
- ✅ [feed-conteudo-recomendado](frentes/feed-conteudo-recomendado/README.md) — seção recomendada no hub de conteúdo
- ✅ [ecossistema-frentes](frentes/ecossistema-frentes/README.md) — este próprio reorganização (você está aqui)
- ✅ [hardening-criticos](frentes/hardening-criticos/README.md) — auditoria completa (5 subagentes) + conserto dos 4 críticos (certificado forjável, paga-e-não-recebe, certificado inalcançável, promessa desalinhada). Na master, verificado.

### 🔄 / 🔜 Roadmap por frentes

> Fonte de verdade do andamento e da **próxima ação**: [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md).

**Roadmap de produto (receita primeiro) — todas ✅ concluídas, revisadas e deployadas:**

- ✅ [login-real](frentes/login-real/README.md) — magic link próprio (zero deps, `crypto` nativo), sessão revogável, `ContentGate`. Migrations 0015/0016 aplicadas.
- ✅ [assinaturas](frentes/assinaturas/README.md) — Regular/Advanced, entitlement/consumo, Stripe (modo teste), cupom, webhook, `/oferta`, e-mails de ciclo/CRM + cron. Migrations 0017/0018/0019.
- ✅ [feed](frentes/feed/README.md) — MVP do feed central.
- ✅ [forum](frentes/forum/README.md) — portal de tópicos. Migration 0020.
- ✅ [blog-marketing](frentes/blog-marketing/README.md) — `/blog` + estratégia de funil.
- ✅ [suporte-crm](frentes/suporte-crm/README.md) — `/suporte` + doc CRM. Migration 0021.

**Evolução da plataforma (pós-roadmap):**

- ✅ [casa-unificada](frentes/casa-unificada/README.md) (SP1) — plataforma-é-a-casa, diagnóstico por sessão, auto-login pós-compra. Migrations 0022/0023.
- ✅ [feed-redesign](frentes/feed-redesign/README.md) — baseline dark/violeta, shell 3-col, tema, UserMenu, emojis→ícones SVG.
- ✅ [feed-stories](frentes/feed-stories/README.md) — barra de histórias (stories) derivada do conteúdo.
- 🔄 [**design-v2**](frentes/design-v2/README.md) — **programa de 5 frentes** a partir de 17 modelos 21st.dev (visual + backend, commit por item):
  - ✅ Frente 1 (Moldura: header + sidebar + rodapé) — deployada, verificada ao vivo.
  - ✅ Frente 2 (Feed: timeline infinita + posts + cards + players + transição) — deployada, revisada. Migration `0024` **aplicada** (2026-07-16).
  - ✅ Frente 3 (Comunidade: atividades swipeable + ranking mensal) — deployada, revisada (2026-07-15).
  - ✅ Frente 4 (Conteúdo/mídia: players + artigo + jornada + share) — deployada, revisada Ready-to-merge (2026-07-16) + design pass do feed.
  - 🔜 Frente 5 (Fórum: pergunta + respostas aninhadas) — **absorvida pela Trilha D do lançamento-final** (já tem `spec-D-forum.md`); é lá que ela é construída.
- 🔄 [**lancamento-final**](frentes/lancamento-final/README.md) — **programa guarda-chuva atual**: 7 trilhas (A–G) até a versão final. Planejadas inteiras; A e B fechadas; C em diante a executar. **Absorve** o que sobrou do design-v2 (Frente 5 = Trilha D) e os backlogs herdados (a11y, tech-debt, links mortos) na Trilha F/G.

## ➡️ Próximos passos (estado atual)

O site **já está no ar** (`www.matrizcentral.com.br`, auto-deploy). O que resta é o **programa de lançamento final** — a sequência está em [`frentes/lancamento-final/README.md`](frentes/lancamento-final/README.md):

1. **Trilha C (dark-aware)** — próxima a executar (`plano-C-dark-aware.md`).
2. Depois: **D** (fórum aninhado, migration 0027) → **E** (conteúdo, paralelo) → **F** (polish + a11y + garantia 7 dias) → **G** (tech-debt) → **auditoria final**.
3. **Hand-offs do usuário (não bloqueiam o Claude):** Stripe live (verificação de empresa); anotações da `RightSidebar`; upload da mídia do NotebookLM.

---

_Ao concluir uma nova frente: crie/atualize `docs/frentes/<slug>/README.md`, adicione/ajuste a linha nesta lista, atualize "Status atual" e o `ESTADO-ATUAL.md`. Tudo no mesmo commit de finalização._
