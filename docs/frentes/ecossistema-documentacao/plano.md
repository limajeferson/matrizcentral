# Ecossistema de Contexto (Hub Neural) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um hub de contexto único (`docs/ECOSSISTEMA.md`) que indexa/conecta toda a documentação, atualizar CLAUDE.md e a memória, e criar `.env.example`, para que um novo início de sessão entenda o projeto e navegue o histórico com custo mínimo de tokens.

**Architecture:** Progressive disclosure — um hub pequeno que aponta para o detalhe (lido sob demanda). CLAUDE.md fica enxuto com um ponteiro para o hub. As fases reusam os specs/plans existentes (o hub os indexa, sem duplicar). `.env.example` documenta as env vars reais do código.

**Tech Stack:** Markdown puro. Sem código de app. Verificação = links resolvem + `npx tsc --noEmit` no fim (garantir que nenhum código foi tocado).

## Global Constraints

- **pt-BR** em toda a documentação.
- **Progressive disclosure:** o hub não contém o detalhe, aponta para ele. CLAUDE.md permanece enxuto (o detalhe vive no ecossistema/specs).
- **Fonte única por assunto:** cada fato tem um lugar canônico; o hub diz onde. Sem duplicar conteúdo dos specs/plans.
- **Links relativos markdown** (`[texto](caminho)`) para arquivos do repo; caminho absoluto só para a memória (fora do repo).
- **Segredos:** `.env.example` só com placeholders vazios; NUNCA ler valores de `.env.local`.
- **Env vars reais** (confirmadas via `grep -rhoE "process\.env\.[A-Z_]+" src/`): `BREVO_API_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`. (NÃO incluir `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — não é referenciado no código.)
- Windows/Git Bash; caminhos com `(marketing)` precisam de aspas.
- Todo link relativo criado DEVE resolver para um arquivo existente (verificar com `test -f`/`ls`).

---

## File Structure

**Novos:**
- `.env.example` (raiz) — env vars com placeholders.
- `docs/ECOSSISTEMA.md` — o hub neural.
- `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\matrizcentral-ecossistema.md` — memória apontando o hub.

**Modificados:**
- `CLAUDE.md` — ponteiro para o hub + refresh da seção Produto.
- `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md` — linha de índice da nova memória.

---

## Task 1: `.env.example`

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Reconfirmar as env vars reais**

Run: `grep -rhoE "process\.env\.[A-Z_]+" src/ | sort -u`
Expected: exatamente as 7 vars listadas nas Global Constraints. Se aparecer alguma nova, incluí-la; se `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` NÃO aparecer, mantê-la fora.

- [ ] **Step 2: Criar `.env.example`**

Conteúdo exato (placeholders vazios, agrupados e comentados):
```
# ------------------------------------------------------------------
# Matriz Central — variáveis de ambiente (copie para .env.local e preencha)
# NUNCA commite .env.local com valores reais. Este arquivo só documenta as chaves.
# ------------------------------------------------------------------

# Supabase (banco + auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (pagamento) — o build de /api/checkout exige STRIPE_SECRET_KEY
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# E-mail transacional (Brevo)
BREVO_API_KEY=

# App — URL pública base (ex.: https://seudominio.com)
NEXT_PUBLIC_URL=
```

- [ ] **Step 3: Confirmar que `.env.example` não é ignorado**

Run: `git check-ignore .env.example || echo "NAO_IGNORADO_OK"`
Expected: `NAO_IGNORADO_OK` (deve ser versionado). Se estiver ignorado, ajustar `.gitignore` para permitir `.env.example` (ex.: `!.env.example`).

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "docs: .env.example com as env vars necessarias para deploy"
```

---

## Task 2: `docs/ECOSSISTEMA.md` (o hub neural)

**Files:**
- Create: `docs/ECOSSISTEMA.md`

**Interfaces:**
- Produces: o ponto de entrada canônico de contexto, linkado por CLAUDE.md (Task 3) e pela memória (Task 3).

- [ ] **Step 1: Criar `docs/ECOSSISTEMA.md`**

Conteúdo (ajustar apenas se algum caminho não existir — ver Step 2):
```markdown
# 🧠 Ecossistema — Matriz Central

> **Este é o ponto de entrada de contexto.** Leia-o primeiro ao iniciar uma sessão.

## 🧭 Comece aqui (regras de navegação)

- Leia este hub e **siga apenas os links necessários** para a tarefa atual. Não abra tudo — abrir sob demanda economiza tokens.
- Cada fato tem **um lugar canônico** (indicado abaixo). Ao precisar de um detalhe, **confirme no arquivo linkado** em vez de supor — isso evita alucinação.
- Ordem recomendada num início do zero: este hub → `CLAUDE.md` → o spec da fase atual → o código fonte-de-verdade.

## 📊 Status atual

- **No ar (master, GitHub):** landing v2 completa — hero (esfera ASCII + pixel bg), Seção 2 "método" (`SystemSection`), Seção 3 "experiência" (`ContentLibrarySection`), footer institucional, páginas `/sobre` e `/legal/{privacidade,termos}`, newsletter.
- **Repo:** https://github.com/limajeferson/matrizcentral · branch `master` · checkpoint mais recente: tag `checkpoint-footer-institucional`.
- **Bloqueios para ir ao ar no domínio:**
  1. Aplicar a migration `supabase/migrations/0011_newsletter_subscribers.sql` no Supabase (senão `/api/newsletter` retorna 500).
  2. Configurar as env vars na hospedagem (ver [`.env.example`](../.env.example)).
  3. Deploy + apontar o domínio (comprado).

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

**Specs & Plans (por fase)** — ver tabela em "Fases & Checkpoints".
- [`docs/superpowers/specs/`](superpowers/specs/) — o "porquê/o quê" de cada fase.
- [`docs/superpowers/plans/`](superpowers/plans/) — o "como" (passo a passo).

**Memória (fora do repo, persiste entre sessões)**
- `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md` — índice das memórias persistentes.

**Deploy**
- [`.env.example`](../.env.example) — env vars necessárias.
- [`supabase/migrations/`](../supabase/migrations/) — migrations (0001→0011).

## 🔀 Fases & Checkpoints

| Fase | Status | Spec / Plan | Commit / Tag |
|---|---|---|---|
| Fase 1 — triagem + /oferta redesign | ✅ | [spec](superpowers/specs/2026-07-05-oferta-redesign-design.md) | `3500f6a` |
| Hero — esfera ASCII + pixel bg | ✅ | (commits) | `a82266d` |
| Footer institucional — /sobre, /legal, newsletter | ✅ | [spec](superpowers/specs/2026-07-07-footer-institucional-design.md) | tag `checkpoint-footer-institucional` |
| Seções método × experiência + fascinations | ✅ | [spec](superpowers/specs/2026-07-07-secoes-metodo-experiencia-design.md) | `72b87a1` |
| Ecossistema de contexto (este) | ✅ | [spec](superpowers/specs/2026-07-07-ecossistema-contexto-design.md) | — |
| Deploy no domínio | 🔜 | — | — |

## ➡️ Fluxo de necessidades (próximos passos até o site no ar)

1. **Migration:** aplicar `0011_newsletter_subscribers.sql` no Supabase (`supabase db push` — projeto já linkado em `supabase/.temp/linked-project.json`).
2. **Env vars:** configurar na hospedagem as chaves de [`.env.example`](../.env.example).
3. **Deploy:** Vercel é o caminho natural para Next.js. `npm run build` só passa com as env vars presentes (por causa de `src/lib/stripe.ts`, que instancia o Stripe no topo do módulo).
4. **Domínio:** apontar o domínio comprado para o deploy.

---

_Ao concluir uma nova fase, adicione uma linha em "Fases & Checkpoints" e atualize "Status atual"._
```

- [ ] **Step 2: Verificar que cada caminho linkado existe**

Rodar a partir da raiz do repo:
```bash
cd "C:/Users/jefer/Documents/Projetos/matrizcentral"
for p in CLAUDE.md descricao/VERSAO-CONCISA.md descricao/VERSAO-COMPLETA.md contextocentral.md arquitetura-1 arquitetura-2 src/data/content-hub.ts src/lib/content-stats.ts notebooklm docs/superpowers/specs docs/superpowers/plans .env.example supabase/migrations docs/superpowers/specs/2026-07-05-oferta-redesign-design.md docs/superpowers/specs/2026-07-07-footer-institucional-design.md docs/superpowers/specs/2026-07-07-secoes-metodo-experiencia-design.md docs/superpowers/specs/2026-07-07-ecossistema-contexto-design.md; do [ -e "$p" ] && echo "OK  $p" || echo "FALTA $p"; done
```
Expected: todas as linhas `OK`. Para cada `FALTA`, corrigir o link no `ECOSSISTEMA.md` (achar o nome real com `ls`) — ex.: se `descricao/VERSAO-CONCISA.md` não existir com esse nome, ajustar para o nome real.

- [ ] **Step 3: Commit**

```bash
git add docs/ECOSSISTEMA.md
git commit -m "docs: hub neural docs/ECOSSISTEMA.md (status + mapa + fases + fluxo de deploy)"
```

---

## Task 3: Atualizar CLAUDE.md e a memória

**Files:**
- Modify: `CLAUDE.md`
- Create: `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\matrizcentral-ecossistema.md`
- Modify: `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md`

**Interfaces:**
- Consumes: `docs/ECOSSISTEMA.md` (Task 2).

- [ ] **Step 1: Adicionar o ponteiro no topo do CLAUDE.md**

Logo após a linha de intro `Contexto para sessões do Claude Code neste repositório. Mantenha conciso.`, inserir uma linha em branco e:
```markdown
> **› Contexto completo e navegação:** leia [`docs/ECOSSISTEMA.md`](docs/ECOSSISTEMA.md) primeiro — é o hub que indexa specs, arquitetura, memória e o fluxo de deploy.
```

- [ ] **Step 2: Refrescar a seção Produto do CLAUDE.md**

Na seção `## Produto (não é um ebook)`, adicionar ao final da lista de bullets (sem remover os existentes) um bullet que reflita o estado atual:
```markdown
- **Estado da landing (07/2026):** landing v2 completa em `src/app/(marketing)`. Seção 2 (`SystemSection`) vende o **método** (4 cards com imagens locais em `public/system/`); Seção 3 (`ContentLibrarySection`) vende a **experiência** (cards NOVO/em breve). Há footer institucional, páginas `/sobre` e `/legal/{privacidade,termos}`, e newsletter (`/api/newsletter` → tabela `newsletter_subscribers`, migration `0011` pendente de aplicar). Detalhe e histórico: ver `docs/ECOSSISTEMA.md`.
```
Manter as demais seções (Verificação, CSS por página, Restrições) inalteradas. Não adicionar regras de estilo.

- [ ] **Step 3: Criar a memória `matrizcentral-ecossistema.md`**

Arquivo `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\matrizcentral-ecossistema.md`:
```markdown
---
name: matrizcentral-ecossistema
description: Ponto de entrada de contexto do projeto — hub que indexa docs, specs, arquitetura e deploy
metadata:
  type: reference
---

O contexto do projeto Matriz Central é centralizado em `docs/ECOSSISTEMA.md` (no repo). É o **hub neural**: status atual, mapa linkado de toda a documentação ("leia quando…"), tabela de fases/checkpoints e o fluxo de necessidades até o deploy.

Regra de navegação: ler o hub primeiro, seguir só os links necessários (progressive disclosure — economiza tokens), e confirmar fatos no arquivo linkado em vez de supor. `CLAUDE.md` aponta para ele no topo.

Ver também [[matrizcentral-status-footer-institucional]], [[matrizcentral-biblioteca-conteudo]] e [[matrizcentral-repo-git]].
```

- [ ] **Step 4: Adicionar a memória ao índice `MEMORY.md`**

No arquivo `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md`, adicionar como PRIMEIRA linha do grupo de projeto (logo após `# Memory Index` e a linha de idioma, antes de "Custo Zero"):
```markdown
- [Matriz Central - Ecossistema (comece aqui)](matrizcentral-ecossistema.md) — hub de contexto em docs/ECOSSISTEMA.md; ponto de entrada para novas sessões
```

- [ ] **Step 5: Verificar o ponteiro do CLAUDE.md**

Run: `cd "C:/Users/jefer/Documents/Projetos/matrizcentral" && grep -q "docs/ECOSSISTEMA.md" CLAUDE.md && test -f docs/ECOSSISTEMA.md && echo "PONTEIRO_OK"`
Expected: `PONTEIRO_OK`.

- [ ] **Step 6: Commit (só os arquivos do repo; a memória fica fora do git)**

```bash
cd "C:/Users/jefer/Documents/Projetos/matrizcentral"
git add CLAUDE.md
git commit -m "docs: CLAUDE.md aponta para o ecossistema + refresh do estado da landing"
```
(As memórias em `~/.claude/...` não fazem parte deste repo; não entram no commit.)

---

## Task 4: Verificação final de links e integridade

**Files:** nenhum (verificação).

- [ ] **Step 1: Revisar todos os links do ECOSSISTEMA.md**

Rodar o loop do Task 2 Step 2 novamente e confirmar zero `FALTA`.

- [ ] **Step 2: Confirmar que nenhum código foi tocado**

Run: `cd "C:/Users/jefer/Documents/Projetos/matrizcentral" && npx tsc --noEmit 2>&1 | tail -3; echo "tsc: $?"`
Expected: `tsc: 0` (só docs mudaram; nada de código).

- [ ] **Step 3: Confirmar ausência de segredos no `.env.example`**

Run: `grep -E "=[^[:space:]]" .env.example || echo "SEM_VALORES_OK"`
Expected: `SEM_VALORES_OK` (todas as chaves têm o lado direito vazio).

- [ ] **Step 4: Commit final (se algum ajuste de link foi feito)**

```bash
cd "C:/Users/jefer/Documents/Projetos/matrizcentral"
git add -A docs/ CLAUDE.md .env.example
git commit -m "docs: ajustes finais de links do ecossistema" || echo "nada a commitar"
```

---

## Self-Review (autor do plano)

- **Cobertura do spec:** hub ECOSSISTEMA.md (Task 2) ✓; CLAUDE.md ponteiro+refresh (Task 3) ✓; memória nova + índice (Task 3) ✓; .env.example (Task 1) ✓; verificação de links + tsc (Task 4) ✓; fases reusam specs/plans, sem duplicar (Task 2, tabela) ✓; progressive disclosure / regras de navegação (Task 2, "Comece aqui") ✓.
- **Placeholders:** conteúdo completo em cada task; os "vazios" do `.env.example` são intencionais (documentação de chaves).
- **Consistência:** o caminho da memória é o mesmo em Task 3 e nas Global Constraints; a tag `checkpoint-footer-institucional` e os SHAs batem com o git real; env vars = as 7 confirmadas por grep.
- **Risco:** links relativos podem apontar para nomes ligeiramente diferentes (ex.: `descricao/VERSAO-CONCISA.md`) — mitigado pelo loop de verificação em Task 2 Step 2 e Task 4 Step 1, que corrige qualquer `FALTA`.
