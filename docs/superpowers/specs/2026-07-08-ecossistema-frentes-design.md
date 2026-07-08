# Ecossistema de Frentes — Design

## Contexto

O projeto já tem um embrião de "harness" de continuidade entre sessões: `CLAUDE.md` (regras + ponteiro) → `docs/ECOSSISTEMA.md` (hub com status + mapa + tabela de fases) → memória fora do repo. Pesquisa sobre padrões de harness de agentes de código confirma a direção: memória deve viver em **arquivo**, não em contexto de conversa, e cada unidade de trabalho deve deixar um **handoff explícito** que a próxima sessão lê antes de agir, mantendo a camada de memória fora de qualquer ferramenta específica (Claude Code, Codex, Cursor disparam os mesmos eventos de ciclo de vida).

A lacuna real: `docs/superpowers/specs/` e `docs/superpowers/plans/` são listas planas por data — não há uma unidade "frente" que junte spec + plano + status + próximos passos, e o hub (`docs/ECOSSISTEMA.md`) depende de alguém lembrar de atualizar a tabela manualmente (hoje já está 2 frentes atrasado). O ledger usado durante `subagent-driven-development` (`.superpowers/sdd/progress.md`) é git-ignored e some a qualquer momento — não serve como memória durável entre sessões.

## Decisão técnica

### 1. Estrutura de pastas: `docs/frentes/<slug>/`

Cada frente (iniciativa de produto) ganha uma pasta com até 3 arquivos:
- `spec.md` — o design doc (movido de `docs/superpowers/specs/`).
- `plano.md` (ou `plano-1.md`, `plano-2.md`... quando a frente teve múltiplas iterações de plano ao longo do tempo, numeradas cronologicamente) — movido de `docs/superpowers/plans/`.
- `README.md` — documento de handoff, novo, com o template da seção 3.

`docs/superpowers/specs/` e `docs/superpowers/plans/` deixam de receber arquivos novos — viram apenas o histórico do que ainda não foi migrado (nenhum arquivo, após a migração desta frente).

### 2. Migração retroativa (12 frentes)

Usar `git mv` (preserva histórico) para mover os arquivos existentes segundo o agrupamento abaixo, e criar o `README.md` de cada uma:

| Frente (slug) | `spec.md` (origem) | `plano*.md` (origem, em ordem) |
|---|---|---|
| `fase-1-mvp` | matriz-central-fase1-design.md | matriz-central-fase1.md |
| `identidade-visual` | identidade-visual-design.md | identidade-visual.md |
| `landing-v2-enriquecimento` | landing-page-v2-design.md | landing-page-v2.md, landing-page-fidelidade-v3.md |
| `triagem-democratizada` | triagem-democratizada-design.md, triagem-redesign-REQUISITOS.md (vira `spec-requisitos.md` complementar) | triagem-democratizada.md |
| `landing-redesign-v3-dark` | landing-redesign-design.md, hero-observer-pixelbg-design.md, copy-triagem-roadmap-design.md (viram `spec-hero.md`, `spec-copy.md` complementares) | landing-redesign.md, hero-observer-pixelbg.md, copy-triagem-roadmap.md, landing-visual-animations.md |
| `visual-treatments` | visual-treatments-design.md | visual-treatments.md |
| `polimento-landing-oferta` | oferta-redesign-design.md | polimento-design-ux-cx-ui.md, oferta-redesign.md |
| `conteudo-conversao-hub` | conversao-conteudo-design.md, secoes-metodo-experiencia-design.md (vira `spec-secoes.md` complementar) | conversao-conteudo.md, secoes-metodo-experiencia.md |
| `feed-conteudo-recomendado` | feed-conteudo-recomendado-design.md | feed-conteudo-recomendado.md |
| `gamificacao-avancada` | gamificacao-avancada-design.md | gamificacao-avancada.md |
| `footer-institucional` | footer-institucional-design.md | footer-institucional.md |
| `ecossistema-documentacao` | ecossistema-contexto-design.md | ecossistema-contexto.md |

Regra para frentes com mais de um spec/plano: o primeiro arquivo (cronologicamente) vira `spec.md`/`plano-1.md`; os demais viram `spec-<tema>.md`/`plano-2.md`, `plano-3.md`... — sempre com `git mv`, nunca copiar+apagar (preserva blame).

### 3. Template do `README.md` (handoff)

```markdown
# <Nome da frente>

**Status:** ✅ Concluída | 🔄 Em andamento | 🔜 Planejada

**Objetivo:** <1 frase>

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** `<sha-inicial>`..`<sha-final>` — <mensagem resumida do commit final>

<!-- Só se Status = 🔄 Em andamento: -->
**Próximo passo:** Task <N> de <plano.md> — <descrição curta>. Ledger de execução (se em subagent-driven-development): `.superpowers/sdd/progress.md`.
```

O `README.md` é escrito/atualizado **no mesmo commit** que conclui a frente (ou uma task dela, se for retomada entre sessões) — não é um passo à parte que alguém possa esquecer, entra no fluxo normal de `finishing-a-development-branch`.

### 4. Hub (`docs/ECOSSISTEMA.md`) vira índice fino

A seção "Fases & Checkpoints" (tabela manual) é substituída por uma lista simples, uma linha por frente, ordenada cronologicamente:

```markdown
## Frentes já trabalhadas

- ✅ [fase-1-mvp](frentes/fase-1-mvp/README.md) — MVP: compra → triagem → dashboard → validação → XP
- ✅ [identidade-visual](frentes/identidade-visual/README.md) — paleta violeta + glassmorphism
- ...
- 🔄 [<frente-atual>](frentes/<frente-atual>/README.md) — <objetivo>
```

A seção "Status atual" do hub permanece (é o resumo executivo do que está no ar), mas não duplica o detalhe de cada frente — isso já mora no README de cada uma.

### 5. Convenção para frentes novas

Adicionar ao `CLAUDE.md`, na seção que já aponta pro hub, a instrução: *specs e planos novos vão em `docs/frentes/<slug>/spec.md` e `/plano.md`, não mais em `docs/superpowers/specs|plans/`*. As skills `superpowers:brainstorming` e `superpowers:writing-plans` já respeitam preferência de localização do usuário/projeto — essa linha no `CLAUDE.md` é o que uma sessão nova lê pra saber onde salvar.

Ao concluir uma frente nova, o passo final passa a ser: atualizar `docs/ECOSSISTEMA.md` (uma linha na lista de frentes) + criar/atualizar `docs/frentes/<slug>/README.md` — ambos no commit de finalização.

## Fora de escopo (YAGNI)

- Não criar tooling/script automatizado para gerar o `README.md` (é só um template markdown preenchido manualmente ao final de cada frente).
- Não mudar o mecanismo de memória fora do repo (`memory/`) — esse já funciona e é ortogonal a este ecossistema dentro do repo.
- Não migrar ou alterar o ledger `.superpowers/sdd/progress.md` (continua scratch, git-ignored, escopo de uma única execução de `subagent-driven-development`).
- Não reescrever o conteúdo técnico dos specs/plans movidos — só reposicionar os arquivos e adicionar o README novo.
