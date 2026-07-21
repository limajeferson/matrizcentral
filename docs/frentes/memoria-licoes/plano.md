# Memória de Lições — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `docs/LICOES.md` (base de lições destiladas dos erros reais do projeto, indexada por gatilho) e integrá-la ao processo — a arquitetura offline/runtime do EMG aplicada ao fluxo de trabalho.

**Architecture:** Fase offline em duas mineração paralelas (reports do SDD; docs de continuidade) que produzem arquivos de candidatas → uma curadoria única que deduplica e grava o `LICOES.md` final → integração no PLAYBOOK/CLAUDE.md/ECOSSISTEMA para a injeção em runtime (briefs de task e retomada).

**Tech Stack:** Markdown puro. Zero código de produto, zero dependências, zero migrations.

## Global Constraints

- **Frente só de docs:** nenhum arquivo em `src/`, `supabase/` ou config é tocado.
- **Gate:** `npx tsc --noEmit` (exit 0) + `npm run test` (322+ verdes) devem permanecer intocados — rodar uma vez na Task 5 como prova.
- **Tags de gatilho (taxonomia fixa, usar verbatim):** `migration` · `acesso-dinheiro` · `spec` · `visual` · `deploy` · `subagentes` · `docs-continuidade` · `stripe-webhook`.
- **Lição ≠ log:** só entra o que mudaria uma decisão futura; fato pontual não entra. Toda lição tem **Fonte** rastreável (commit, report ou sessão do log).
- **Nunca commitar:** `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`, `texto-para-salvar-prompt-temporario.md`, `erro.png`.
- Comunicação e conteúdo em **português do Brasil**.

---

### Task 1: Esqueleto do `docs/LICOES.md` (o contrato)

**Files:**
- Create: `docs/LICOES.md`

**Interfaces:**
- Produces: o arquivo com as regras de uso e as 8 seções de gatilho vazias, nas quais as Tasks 2–4 vão inserir lições no formato `### L-NNN`.

- [ ] **Step 1: Criar `docs/LICOES.md`** com exatamente este conteúdo:

```markdown
# 📚 LIÇÕES — Matriz Central

> Base de lições destiladas de erros e acertos REAIS deste projeto (arquitetura
> inspirada no EMG — ver `docs/frentes/memoria-licoes/spec.md`). A fase cara
> (minerar reviews, reports e sessões) acontece **offline**, ao fim de cada
> frente; em execução, consulta-se só a seção do gatilho relevante.

## Como usar (runtime)

- **Montando um brief de task (SDD):** copie para o brief as lições da seção do
  gatilho da task (ex.: task com migration → seção `migration`). Máx. ~6 lições
  por brief; se houver mais, escolha as mais específicas ao caso.
- **Retomando sessão / iniciando frente:** leia o índice e as seções dos
  gatilhos que a frente vai tocar.
- A tabela "🚩 Sinais" do `PLAYBOOK-EXECUCAO.md` continua sendo o resumo de alto
  risco lido sempre; este arquivo é a base completa, consultada por gatilho.

## Como manter (offline — etapa 7 do fluxo de frente no PLAYBOOK)

1. Ao fechar uma frente, varra os findings das revisões (reports em
   `.superpowers/sdd/`) e o que a sessão registrou de erro/correção.
2. **Dedup antes de adicionar:** se uma lição existente cobre o caso, edite-a
   em vez de criar outra.
3. **Contradição resolve-se apagando:** lição invalidada pela realidade é
   removida (explicar no commit), nunca empilhada.
4. Formato obrigatório (uma lição = um bloco):

    ### L-NNN · Título curto
    - **Gatilho:** `tag` (1–2 da taxonomia abaixo)
    - **Não faça:** o erro observado, específico.
    - **Faça:** a correção, prescritiva.
    - **Fonte:** commit/report/sessão.

5. Numeração `L-NNN` sequencial global, nunca reutilizada (mesmo após remoção).

**Taxonomia de gatilhos (fixa):** `migration` · `acesso-dinheiro` · `spec` ·
`visual` · `deploy` · `subagentes` · `docs-continuidade` · `stripe-webhook`.
Criar tag nova exige editar este arquivo e o PLAYBOOK juntos.

---

## `migration`

## `acesso-dinheiro`

## `spec`

## `visual`

## `deploy`

## `subagentes`

## `docs-continuidade`

## `stripe-webhook`
```

- [ ] **Step 2: Verificar estrutura**

Run: `grep -c "^## \`" docs/LICOES.md`
Expected: `8`

- [ ] **Step 3: Commit**

```bash
git add docs/LICOES.md
git commit -m "docs(licoes): esqueleto da base de licoes (contrato + taxonomia de gatilhos)"
```

---

### Task 2: Mineração A — reports do SDD (paralelizável com a Task 3)

**Files:**
- Create: `docs/frentes/memoria-licoes/candidatas-A-reports.md`
- Read (corpus): `.superpowers/sdd/task-*-report.md`, `.superpowers/sdd/final-*-report.md`, `.superpowers/sdd/frente-*-report.md`, `.superpowers/sdd/fix-cupom-report.md`, `.superpowers/sdd/progress.md`

**Interfaces:**
- Consumes: formato de lição definido na Task 1 (Step 1).
- Produces: `candidatas-A-reports.md` — lista de candidatas SEM numeração `L-NNN` (numeração é da curadoria, Task 4), cada uma no formato:

```markdown
### CAND · Título curto
- **Gatilho:** `tag`
- **Não faça:** …
- **Faça:** …
- **Fonte:** .superpowers/sdd/<arquivo> (+ commit se citado no report)
```

- [ ] **Step 1: Ler o corpus e extrair candidatas.** Critérios de extração (aplicar a cada finding de revisão encontrado nos reports):
  - Extrair QUANDO o finding revela um **padrão de erro repetível** — ex.: "revogação por usuário em vez de por produto" → lição de `acesso-dinheiro` sobre granularidade de revogação; "endpoint grava prova de consumo sem checar acesso" → lição de `acesso-dinheiro` sobre validar acesso antes de gravar; "on delete cascade apagava a auditoria" → lição de `migration`.
  - NÃO extrair findings pontuais sem generalização (typo, nome de variável) nem elogios ("Ready to merge").
  - Se o report mostrar que o erro veio **da spec/plano** e não do código, a lição ganha gatilho `spec` (é o padrão mais valioso do corpus — o PLAYBOOK já registra que "quase todos os furos vieram do plano").
  - Cada candidata cita o report-fonte pelo caminho exato.

- [ ] **Step 2: Gravar `candidatas-A-reports.md`** com as candidatas (esperado: 10–25; qualidade > quantidade) e uma linha final: `Total: N candidatas de M reports lidos.`

- [ ] **Step 3: Verificar formato**

Run: `grep -c "^### CAND" docs/frentes/memoria-licoes/candidatas-A-reports.md`
Expected: número ≥ 8 (igual ao N declarado no arquivo)

- [ ] **Step 4: Commit**

```bash
git add docs/frentes/memoria-licoes/candidatas-A-reports.md
git commit -m "docs(licoes): mineracao A - candidatas extraidas dos reports do SDD"
```

---

### Task 3: Mineração B — docs de continuidade (paralelizável com a Task 2)

**Files:**
- Create: `docs/frentes/memoria-licoes/candidatas-B-docs.md`
- Read (corpus): `docs/ESTADO-ATUAL.md` (SÓ a seção "📓 Log de sessões"), `docs/frentes/hardening-criticos/README.md`, `docs/frentes/leitor-protegido/README.md`, `docs/frentes/lancamento-final/README.md`, `docs/frentes/design-v2/README.md`

**Interfaces:**
- Consumes: formato de candidata da Task 2 (mesmo formato, mesmo cabeçalho `### CAND`).
- Produces: `candidatas-B-docs.md`, mesmo contrato da Task 2.

- [ ] **Step 1: Ler o corpus e extrair candidatas.** Critérios específicos deste corpus:
  - O log de sessões narra erros de **processo** — ex.: "seções de estado tratadas como append-only causaram drift" (`docs-continuidade`); "pushar antes da migration teria quebrado XP em produção" (`deploy`/`migration`); "política de garantia decidida sem checar o CDC teve que ser revogada" (`spec`).
  - Os READMEs de frente registram decisões revertidas e follow-ups órfãos — cada reversão com causa identificável vira candidata.
  - NÃO duplicar o que é só estado ("X foi aplicado em Y") — procurar o **porquê generalizável**.

- [ ] **Step 2: Gravar `candidatas-B-docs.md`** (esperado: 8–20) com a linha final `Total: N candidatas.`

- [ ] **Step 3: Verificar formato**

Run: `grep -c "^### CAND" docs/frentes/memoria-licoes/candidatas-B-docs.md`
Expected: número ≥ 5 (igual ao N declarado)

- [ ] **Step 4: Commit**

```bash
git add docs/frentes/memoria-licoes/candidatas-B-docs.md
git commit -m "docs(licoes): mineracao B - candidatas extraidas dos docs de continuidade"
```

---

### Task 4: Curadoria — merge, dedup e gravação final

**Files:**
- Modify: `docs/LICOES.md` (preencher as 8 seções)
- Delete: `docs/frentes/memoria-licoes/candidatas-A-reports.md`, `docs/frentes/memoria-licoes/candidatas-B-docs.md`
- Read: `docs/PLAYBOOK-EXECUCAO.md` (para reconciliação)

**Interfaces:**
- Consumes: os dois arquivos de candidatas (Tasks 2–3) e o formato da Task 1.
- Produces: `docs/LICOES.md` final com lições `L-001…L-0NN` distribuídas nas seções de gatilho.

- [ ] **Step 1: Merge com dedup.** Regras de curadoria (aplicar nesta ordem):
  1. Candidatas que descrevem o mesmo padrão (mesmo erro-raiz, ainda que em frentes diferentes) fundem-se numa lição só — a fonte lista os dois casos (2 ocorrências = lição mais forte, não duas lições).
  2. **Reconciliar com o PLAYBOOK:** se a lição já está integralmente na tabela "🚩 Sinais" ou nas regras do PLAYBOOK (ex.: "migration primeiro, push depois"), a lição no `LICOES.md` DEVE existir mesmo assim (o LICOES é a base completa), mas em 1 linha extra aponta: `— resumida também no PLAYBOOK`.
  3. Cortar candidata genérica que não sobreviveria ao teste: "um implementador que lesse só esta lição mudaria seu comportamento de forma verificável?" Se não, corta.
  4. Numerar `L-001` em diante, agrupadas por seção de gatilho, ordem de importância dentro da seção.
- [ ] **Step 2: Gravar o `LICOES.md` final** (esperado: 15–40 lições) e **deletar os dois arquivos de candidatas** (`git rm`).

- [ ] **Step 3: Verificar**

Run: `grep -c "^### L-" docs/LICOES.md && grep -c "Fonte:" docs/LICOES.md`
Expected: dois números iguais (toda lição tem fonte), entre 15 e 40

Run: `ls docs/frentes/memoria-licoes/`
Expected: apenas `spec.md` e `plano.md`

- [ ] **Step 4: Commit**

```bash
git add -A docs/LICOES.md docs/frentes/memoria-licoes/
git commit -m "docs(licoes): base curada - licoes L-001+ mineradas de reports e docs, com dedup"
```

---

### Task 5: Integração no processo (o runtime leve)

**Files:**
- Modify: `docs/PLAYBOOK-EXECUCAO.md` (duas edições)
- Modify: `CLAUDE.md` (uma linha)
- Modify: `docs/ECOSSISTEMA.md` (grupo "Specs & Plans" do Mapa neural)
- Modify: `docs/ESTADO-ATUAL.md` (topo + log) — feito pelo orquestrador no fechamento
- Create: `docs/frentes/memoria-licoes/README.md`

**Interfaces:**
- Consumes: `docs/LICOES.md` final (Task 4).
- Produces: processo documentado; nenhum consumidor posterior.

- [ ] **Step 1: PLAYBOOK — etapa 7.5 no fluxo padrão.** Em `docs/PLAYBOOK-EXECUCAO.md`, no bloco "📋 Fluxo padrão de uma frente", substituir a linha `7. Atualizar ESTADO-ATUAL (topo + log) + README da frente, e commitar junto` por:

```
7. Destilar lições  → varrer os findings da frente em .superpowers/sdd/ e
                      atualizar docs/LICOES.md (dedup primeiro; regras no
                      próprio arquivo). Frente sem finding novo: etapa vazia, ok.
8. Atualizar ESTADO-ATUAL (topo + log) + README da frente, e commitar junto
```

- [ ] **Step 2: PLAYBOOK — injeção nos briefs.** Na seção "Como escrever o prompt de um subagente", após o item 2 (o do task-brief), inserir:

```
2b. **As lições do gatilho da task** (`docs/LICOES.md`): copie para o brief as
    lições da(s) seção(ões) que a task toca (migration, acesso-dinheiro, visual…).
    Máx. ~6; escolha as mais específicas. É a defesa contra repetir erro já pago.
```

- [ ] **Step 3: CLAUDE.md — ponteiro.** Na seção "## Verificação (gotcha importante)", adicionar ao final da lista:

```markdown
- **Lições de erros já pagos:** [`docs/LICOES.md`](docs/LICOES.md) — consultar a
  seção do gatilho antes de tasks de migration/acesso/deploy; alimentar ao fechar
  cada frente (etapa 7 do playbook).
```

- [ ] **Step 4: ECOSSISTEMA — mapa.** No grupo `**Specs & Plans (por frente)**` do Mapa neural, adicionar após a linha de `plano*.md`:

```markdown
- [`PLAYBOOK-EXECUCAO.md`](PLAYBOOK-EXECUCAO.md) — método: skills, agentes, modelos, gate, ordem de deploy.
- [`LICOES.md`](LICOES.md) — lições destiladas de erros reais, por gatilho; injetar nos briefs (etapa 7).
```

- [ ] **Step 5: README da frente.** Criar `docs/frentes/memoria-licoes/README.md`:

```markdown
# Frente: Memória de Lições (EMG no fluxo de trabalho)

**Status:** ✅ concluída (2026-07-21).

Avaliação do paper *Experience Memory Graph* trazido pelo usuário → implementação
literal rejeitada (produto não tem agentes em runtime; ver `spec.md`), e a
arquitetura offline/runtime do paper aplicada ao processo: [`docs/LICOES.md`](../../LICOES.md)
(base por gatilho) + etapa 7.5 no [`PLAYBOOK-EXECUCAO.md`](../../PLAYBOOK-EXECUCAO.md)
(destilação ao fim de cada frente) + injeção de lições nos briefs de task.

- **EMG como conteúdo do produto** ("Loops vs Grafos") ficou como candidato da
  **Trilha E** — não executado aqui.
- ⚠️ O insumo anterior da Trilha E (diálogo NotebookLM das 26 fontes) foi
  sobrescrito no `texto-para-salvar-prompt-temporario.md` pela discussão do EMG;
  a tabela dos 5 artefatos sobrevive no README da lancamento-final. Ao rodar a
  Trilha E, pedir ao usuário para reexportar o diálogo, se ainda existir.
```

- [ ] **Step 6: Gate (prova de que docs não quebraram nada)**

Run: `npx tsc --noEmit && npm run test 2>&1 | tail -3`
Expected: exit 0 e `322 passed` (ou mais)

- [ ] **Step 7: Verificar links**

Run: `grep -o "docs/LICOES.md" CLAUDE.md docs/ECOSSISTEMA.md | sort -u | wc -l`
Expected: `2` (ambos apontam) — e `ls docs/LICOES.md` existe

- [ ] **Step 8: Commit**

```bash
git add docs/PLAYBOOK-EXECUCAO.md CLAUDE.md docs/ECOSSISTEMA.md docs/frentes/memoria-licoes/README.md
git commit -m "docs(licoes): integracao no processo - etapa 7.5, injecao nos briefs, mapa e ponteiros"
```
