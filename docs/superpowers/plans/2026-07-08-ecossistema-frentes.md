# Ecossistema de Frentes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar as 12 frentes históricas de `docs/superpowers/specs|plans/` (listas planas por data) para `docs/frentes/<slug>/` (spec + plano + README de handoff), reescrever o hub `docs/ECOSSISTEMA.md` como índice fino, e adicionar ao `CLAUDE.md` o gatilho automático que faz uma sessão nova consultar o ecossistema quando o usuário pedir para continuar o trabalho.

**Architecture:** `git mv` preserva histórico ao mover os 34 arquivos existentes para as 12 pastas novas; um `README.md` por frente (handoff) é escrito com status/objetivo/commits/próximos-passos; o hub vira uma lista que só aponta pros READMEs; `CLAUDE.md` ganha uma seção de "retomada entre sessões" que instrui a consulta automática.

**Tech Stack:** Markdown, git (`git mv`, `git log --follow`). Nenhum código de aplicação é alterado — é só reorganização de documentação.

## Global Constraints

- Usar sempre `git mv` (nunca copiar+apagar) para preservar `git blame`/histórico.
- Não alterar o conteúdo técnico dos specs/plans movidos — só a localização e, quando indicado, o nome do arquivo.
- `docs/superpowers/specs/` e `docs/superpowers/plans/` devem ficar vazios ao final (todo conteúdo migrado).
- Nenhuma dependência nova, nenhuma mudança em código de aplicação.
- Comunicação em português do Brasil.

---

### Task 1: Criar `docs/frentes/` e mover os 34 arquivos históricos

**Files:**
- Create: `docs/frentes/fase-1-mvp/spec.md`, `docs/frentes/fase-1-mvp/plano.md`
- Create: `docs/frentes/identidade-visual/spec.md`, `docs/frentes/identidade-visual/plano.md`
- Create: `docs/frentes/landing-v2-enriquecimento/spec.md`, `docs/frentes/landing-v2-enriquecimento/plano-1.md`, `docs/frentes/landing-v2-enriquecimento/plano-2.md`
- Create: `docs/frentes/triagem-democratizada/spec.md`, `docs/frentes/triagem-democratizada/spec-requisitos.md`, `docs/frentes/triagem-democratizada/plano.md`
- Create: `docs/frentes/landing-redesign-v3-dark/spec.md`, `docs/frentes/landing-redesign-v3-dark/spec-hero.md`, `docs/frentes/landing-redesign-v3-dark/spec-copy.md`, `docs/frentes/landing-redesign-v3-dark/plano-1.md`, `docs/frentes/landing-redesign-v3-dark/plano-2.md`, `docs/frentes/landing-redesign-v3-dark/plano-3.md`, `docs/frentes/landing-redesign-v3-dark/plano-4.md`
- Create: `docs/frentes/visual-treatments/spec.md`, `docs/frentes/visual-treatments/plano.md`
- Create: `docs/frentes/polimento-landing-oferta/spec.md`, `docs/frentes/polimento-landing-oferta/plano-1.md`, `docs/frentes/polimento-landing-oferta/plano-2.md`
- Create: `docs/frentes/conteudo-conversao-hub/spec.md`, `docs/frentes/conteudo-conversao-hub/spec-secoes.md`, `docs/frentes/conteudo-conversao-hub/plano-1.md`, `docs/frentes/conteudo-conversao-hub/plano-2.md`
- Create: `docs/frentes/feed-conteudo-recomendado/spec.md`, `docs/frentes/feed-conteudo-recomendado/plano.md`
- Create: `docs/frentes/gamificacao-avancada/spec.md`, `docs/frentes/gamificacao-avancada/plano.md`
- Create: `docs/frentes/footer-institucional/spec.md`, `docs/frentes/footer-institucional/plano.md`
- Create: `docs/frentes/ecossistema-documentacao/spec.md`, `docs/frentes/ecossistema-documentacao/plano.md`
- Delete (via `git mv`, origem): todos os 34 arquivos em `docs/superpowers/specs/` e `docs/superpowers/plans/` (exceto `2026-07-08-ecossistema-frentes-design.md`, que fica pra Task 6)

**Interfaces:**
- Produces: a árvore `docs/frentes/<slug>/{spec,plano}*.md` completa, consumida pelas Tasks 2 e 3 (para escrever os READMEs) e pela Task 4 (para linkar do hub).

- [ ] **Step 1: Criar as 12 pastas**

```bash
mkdir -p docs/frentes/fase-1-mvp docs/frentes/identidade-visual \
  docs/frentes/landing-v2-enriquecimento docs/frentes/triagem-democratizada \
  docs/frentes/landing-redesign-v3-dark docs/frentes/visual-treatments \
  docs/frentes/polimento-landing-oferta docs/frentes/conteudo-conversao-hub \
  docs/frentes/feed-conteudo-recomendado docs/frentes/gamificacao-avancada \
  docs/frentes/footer-institucional docs/frentes/ecossistema-documentacao
```

- [ ] **Step 2: Mover os arquivos com `git mv`**

```bash
git mv docs/superpowers/specs/2026-07-03-matriz-central-fase1-design.md docs/frentes/fase-1-mvp/spec.md
git mv docs/superpowers/plans/2026-07-03-matriz-central-fase1.md docs/frentes/fase-1-mvp/plano.md

git mv docs/superpowers/specs/2026-07-03-identidade-visual-design.md docs/frentes/identidade-visual/spec.md
git mv docs/superpowers/plans/2026-07-03-identidade-visual.md docs/frentes/identidade-visual/plano.md

git mv docs/superpowers/specs/2026-07-03-landing-page-v2-design.md docs/frentes/landing-v2-enriquecimento/spec.md
git mv docs/superpowers/plans/2026-07-03-landing-page-v2.md docs/frentes/landing-v2-enriquecimento/plano-1.md
git mv docs/superpowers/plans/2026-07-03-landing-page-fidelidade-v3.md docs/frentes/landing-v2-enriquecimento/plano-2.md

git mv docs/superpowers/specs/2026-07-03-triagem-democratizada-design.md docs/frentes/triagem-democratizada/spec.md
git mv docs/superpowers/specs/2026-07-05-triagem-redesign-REQUISITOS.md docs/frentes/triagem-democratizada/spec-requisitos.md
git mv docs/superpowers/plans/2026-07-03-triagem-democratizada.md docs/frentes/triagem-democratizada/plano.md

git mv docs/superpowers/specs/2026-07-05-landing-redesign-design.md docs/frentes/landing-redesign-v3-dark/spec.md
git mv docs/superpowers/specs/2026-07-05-hero-observer-pixelbg-design.md docs/frentes/landing-redesign-v3-dark/spec-hero.md
git mv docs/superpowers/specs/2026-07-05-copy-triagem-roadmap-design.md docs/frentes/landing-redesign-v3-dark/spec-copy.md
git mv docs/superpowers/plans/2026-07-05-landing-redesign.md docs/frentes/landing-redesign-v3-dark/plano-1.md
git mv docs/superpowers/plans/2026-07-05-hero-observer-pixelbg.md docs/frentes/landing-redesign-v3-dark/plano-2.md
git mv docs/superpowers/plans/2026-07-05-copy-triagem-roadmap.md docs/frentes/landing-redesign-v3-dark/plano-3.md
git mv docs/superpowers/plans/2026-07-05-landing-visual-animations.md docs/frentes/landing-redesign-v3-dark/plano-4.md

git mv docs/superpowers/specs/2026-07-05-visual-treatments-design.md docs/frentes/visual-treatments/spec.md
git mv docs/superpowers/plans/2026-07-05-visual-treatments.md docs/frentes/visual-treatments/plano.md

git mv docs/superpowers/specs/2026-07-05-oferta-redesign-design.md docs/frentes/polimento-landing-oferta/spec.md
git mv docs/superpowers/plans/2026-07-04-polimento-design-ux-cx-ui.md docs/frentes/polimento-landing-oferta/plano-1.md
git mv docs/superpowers/plans/2026-07-05-oferta-redesign.md docs/frentes/polimento-landing-oferta/plano-2.md

git mv docs/superpowers/specs/2026-07-05-conversao-conteudo-design.md docs/frentes/conteudo-conversao-hub/spec.md
git mv docs/superpowers/specs/2026-07-07-secoes-metodo-experiencia-design.md docs/frentes/conteudo-conversao-hub/spec-secoes.md
git mv docs/superpowers/plans/2026-07-05-conversao-conteudo.md docs/frentes/conteudo-conversao-hub/plano-1.md
git mv docs/superpowers/plans/2026-07-07-secoes-metodo-experiencia.md docs/frentes/conteudo-conversao-hub/plano-2.md

git mv docs/superpowers/specs/2026-07-08-feed-conteudo-recomendado-design.md docs/frentes/feed-conteudo-recomendado/spec.md
git mv docs/superpowers/plans/2026-07-08-feed-conteudo-recomendado.md docs/frentes/feed-conteudo-recomendado/plano.md

git mv docs/superpowers/specs/2026-07-07-gamificacao-avancada-design.md docs/frentes/gamificacao-avancada/spec.md
git mv docs/superpowers/plans/2026-07-07-gamificacao-avancada.md docs/frentes/gamificacao-avancada/plano.md

git mv docs/superpowers/specs/2026-07-07-footer-institucional-design.md docs/frentes/footer-institucional/spec.md
git mv docs/superpowers/plans/2026-07-07-footer-institucional.md docs/frentes/footer-institucional/plano.md

git mv docs/superpowers/specs/2026-07-07-ecossistema-contexto-design.md docs/frentes/ecossistema-documentacao/spec.md
git mv docs/superpowers/plans/2026-07-07-ecossistema-contexto.md docs/frentes/ecossistema-documentacao/plano.md
```

- [ ] **Step 3: Verificar que as pastas antigas ficaram vazias (exceto o spec desta própria frente)**

Run: `ls docs/superpowers/specs/ docs/superpowers/plans/`
Expected: `docs/superpowers/specs/` mostra só `2026-07-08-ecossistema-frentes-design.md`; `docs/superpowers/plans/` mostra só `2026-07-08-ecossistema-frentes.md` (este próprio plano, ainda sendo escrito/executado — normal, tratado na Task 6).

- [ ] **Step 4: Verificar `git status`**

Run: `git status`
Expected: 34 arquivos aparecem como renamed (`R`), nada como deleted+untracked separadamente (confirma que foi `git mv`, não copiar+apagar).

- [ ] **Step 5: Commit**

```bash
git add docs/frentes docs/superpowers/specs docs/superpowers/plans
git commit -m "docs: migra 12 frentes historicas para docs/frentes/<slug>/ (spec+plano)"
```

---

### Task 2: README.md das 7 frentes simples (1 spec : 1 plano)

**Files:**
- Create: `docs/frentes/fase-1-mvp/README.md`
- Create: `docs/frentes/identidade-visual/README.md`
- Create: `docs/frentes/visual-treatments/README.md`
- Create: `docs/frentes/feed-conteudo-recomendado/README.md`
- Create: `docs/frentes/gamificacao-avancada/README.md`
- Create: `docs/frentes/footer-institucional/README.md`
- Create: `docs/frentes/ecossistema-documentacao/README.md`

**Interfaces:**
- Consumes: arquivos movidos na Task 1.

- [ ] **Step 1: Descobrir o range de commits de cada frente**

Para cada uma das 7 frentes desta task, rode (substituindo o slug):

```bash
git log --oneline --follow -- docs/frentes/<slug>/spec.md
```

Anote o SHA do commit mais antigo (criação do spec) e o mais recente relacionado (normalmente o commit de implementação final da frente — cross-referencie com `git log --oneline` geral do período, já visto nesta sessão, para achar o commit de código que fechou a frente).

- [ ] **Step 2: Escrever `docs/frentes/fase-1-mvp/README.md`**

```markdown
# Fase 1 — MVP

**Status:** ✅ Concluída

**Objetivo:** Entregar o fluxo ponta a ponta do MVP: compra (Stripe) → e-mail (Brevo) → quiz de triagem → dashboard → quiz de validação → XP.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** `ad7baf4`..`982c77f` — bootstrap Next.js + schema Supabase + checkout Stripe + quiz + dashboard + e-mail transacional.
```

- [ ] **Step 3: Escrever `docs/frentes/identidade-visual/README.md`**

```markdown
# Identidade Visual

**Status:** ✅ Concluída

**Objetivo:** Aplicar a identidade visual sintetizada (paleta violeta + pastéis, glassmorphism, tipografia) nas telas da Fase 1.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** `6622418`..`00bed6f` — tokens de design, componentes `GlassCard`/`CategoryBadge`, redesign de landing/quiz/dashboard.
```

- [ ] **Step 4: Escrever `docs/frentes/visual-treatments/README.md`**

```markdown
# Visual Treatments

**Status:** ✅ Concluída

**Objetivo:** Aplicar 6 tratamentos visuais inspirados em referências do 21st.dev (botões, fundo, blobs, rede, stack, scramble) à landing.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** ver `git log --oneline --follow -- docs/frentes/visual-treatments/spec.md` para o range exato.
```

- [ ] **Step 5: Escrever `docs/frentes/feed-conteudo-recomendado/README.md`**

```markdown
# Feed de Conteúdo Recomendado

**Status:** ✅ Concluída

**Objetivo:** Adicionar ao hub de conteúdo uma seção "Recomendado pra você agora", destacando itens do catálogo ligados à etapa ativa do roadmap do usuário.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** `e61d427`..`63bc076` — campo `recommendedStage` no catálogo, `getRecommendedContent` (lógica pura), integração na página do hub de conteúdo. Deploy confirmado em produção (`matrizcentral.com.br`).
```

- [ ] **Step 6: Escrever `docs/frentes/gamificacao-avancada/README.md`**

```markdown
# Gamificação Avançada

**Status:** ✅ Concluída

**Objetivo:** Implementar níveis, badges, certificado verificável, leaderboard opt-in, desafios semanais e notificações por e-mail, adaptando a arquitetura antiga (login) ao modelo real de acesso por token.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** `3d9c1b4`..`c604300` (branch `feature/gamificacao-avancada`, mesclada em `master`) + fix de lint pós-deploy `b8af753`. Deploy confirmado em produção (`matrizcentral.com.br`).
```

- [ ] **Step 7: Escrever `docs/frentes/footer-institucional/README.md`**

```markdown
# Footer Institucional

**Status:** ✅ Concluída

**Objetivo:** Reconstruir o rodapé como hub institucional (6 colunas + newsletter) e criar as páginas `/sobre` e `/legal/{privacidade,termos}`.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** ver `git log --oneline --follow -- docs/frentes/footer-institucional/spec.md` para o range exato. Tag `checkpoint-footer-institucional`.
```

- [ ] **Step 8: Escrever `docs/frentes/ecossistema-documentacao/README.md`**

```markdown
# Ecossistema de Documentação (v1)

**Status:** ✅ Concluída (substituída/expandida pela frente `ecossistema-frentes`)

**Objetivo:** Criar o hub de contexto único (`docs/ECOSSISTEMA.md`) indexando toda a documentação, atualizar `CLAUDE.md` e criar `.env.example`.

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** ver `git log --oneline --follow -- docs/frentes/ecossistema-documentacao/spec.md` para o range exato.

**Nota:** esta foi a primeira versão do hub — a estrutura de `docs/frentes/<slug>/` (esta mesma pasta que você está lendo) é a evolução dela, ver [../ecossistema-frentes/README.md](../ecossistema-frentes/README.md).
```

- [ ] **Step 9: Verificar links**

Run: `grep -l "\](spec" docs/frentes/*/README.md | wc -l`
Expected: `7` (as 7 READMEs desta task, cada um com pelo menos 1 link relativo pro próprio `spec.md`).

- [ ] **Step 10: Commit**

```bash
git add docs/frentes/fase-1-mvp/README.md docs/frentes/identidade-visual/README.md \
  docs/frentes/visual-treatments/README.md docs/frentes/feed-conteudo-recomendado/README.md \
  docs/frentes/gamificacao-avancada/README.md docs/frentes/footer-institucional/README.md \
  docs/frentes/ecossistema-documentacao/README.md
git commit -m "docs: README de handoff para as 7 frentes simples"
```

---

### Task 3: README.md das 5 frentes com múltiplos specs/planos

**Files:**
- Create: `docs/frentes/landing-v2-enriquecimento/README.md`
- Create: `docs/frentes/triagem-democratizada/README.md`
- Create: `docs/frentes/landing-redesign-v3-dark/README.md`
- Create: `docs/frentes/polimento-landing-oferta/README.md`
- Create: `docs/frentes/conteudo-conversao-hub/README.md`

**Interfaces:**
- Consumes: arquivos movidos na Task 1.

- [ ] **Step 1: Escrever `docs/frentes/landing-v2-enriquecimento/README.md`**

```markdown
# Landing v2 — Enriquecimento

**Status:** ✅ Concluída

**Objetivo:** Portar a estrutura mais rica do template-guia (Claude Design) para a landing real do Matriz Central, e depois fechar os gaps de fidelidade visual entre a landing atual e o modelo-guia.

**Documentos:** [spec.md](spec.md) · [plano-1.md](plano-1.md) (enriquecimento) · [plano-2.md](plano-2.md) (fidelidade v3)

**Commits-chave:** `f919b1c`..`87ab6d5` — reconstrução da landing a partir da referência gerada, seções de demo/vantagens/features/CTA, ajustes de fidelidade visual (CSS quase literal do modelo-guia), página de oferta.
```

- [ ] **Step 2: Escrever `docs/frentes/triagem-democratizada/README.md`**

```markdown
# Triagem Democratizada

**Status:** ✅ Concluída

**Objetivo:** Abrir a triagem para todos os públicos, com 2 novos perfis e quiz ramificado sem jargão técnico; depois reposicionar o quiz pra parecer consultoria, não teste seletivo (ver `spec-requisitos.md`).

**Documentos:** [spec.md](spec.md) · [spec-requisitos.md](spec-requisitos.md) · [plano.md](plano.md)

**Commits-chave:** `f881e05`..`697eb7d` — motor de ramificação do quiz, 20 perguntas democratizadas/8 perfis, perfis `estudante_curioso`/`profissional_produtividade`, copy sem jargão.
```

- [ ] **Step 3: Escrever `docs/frentes/landing-redesign-v3-dark/README.md`**

```markdown
# Landing Redesign v3 (Dark/Violeta)

**Status:** ✅ Concluída

**Objetivo:** Redesenhar a landing com identidade dark/violeta e sistema de animações de scroll; adicionar hero com IA observando + fundo pixel glow; reposicionar copy de triagem/roadmap para tom de oportunidade/evolução.

**Documentos:** [spec.md](spec.md) (redesign) · [spec-hero.md](spec-hero.md) (hero) · [spec-copy.md](spec-copy.md) (copy) · [plano-1.md](plano-1.md) · [plano-2.md](plano-2.md) · [plano-3.md](plano-3.md) · [plano-4.md](plano-4.md) (animações visuais)

**Commits-chave:** ver `git log --oneline --follow -- docs/frentes/landing-redesign-v3-dark/spec.md` para o range exato — esta é a landing v2 que está no ar hoje em `matrizcentral.com.br` (seção 2/3 depois redivididas pela frente `conteudo-conversao-hub`).
```

- [ ] **Step 4: Escrever `docs/frentes/polimento-landing-oferta/README.md`**

```markdown
# Polimento Landing + Oferta

**Status:** ✅ Concluída

**Objetivo:** Corrigir bugs de conversão/acessibilidade e copy na landing e em `/oferta`; corrigir o fundo da `/oferta`, trazer os planos para a primeira dobra, reposicionar o preço (R$47).

**Documentos:** [spec.md](spec.md) · [plano-1.md](plano-1.md) (polimento UX/CX/UI) · [plano-2.md](plano-2.md) (redesign da oferta)

**Commits-chave:** ver `git log --oneline --follow -- docs/frentes/polimento-landing-oferta/spec.md` para o range exato.
```

- [ ] **Step 5: Escrever `docs/frentes/conteudo-conversao-hub/README.md`**

```markdown
# Conteúdo — Conversão do Hub

**Status:** ✅ Concluída

**Objetivo:** Reposicionar a landing de "ebook + trilha" para "central viva multi-formato numa plataforma-feed"; depois redividir as seções 2 e 3 da landing (método vs. experiência) e reescrever as descrições do `CONTENT_HUB`.

**Documentos:** [spec.md](spec.md) (conversão) · [spec-secoes.md](spec-secoes.md) (seções método/experiência) · [plano-1.md](plano-1.md) · [plano-2.md](plano-2.md)

**Commits-chave:** `5da9456`..`8877979` (schema + catálogo do hub de conteúdo) e o range de `git log --oneline --follow -- docs/frentes/conteudo-conversao-hub/spec-secoes.md` para a divisão de seções.
```

- [ ] **Step 6: Verificar links**

Run: `grep -c "\.md)" docs/frentes/landing-v2-enriquecimento/README.md docs/frentes/triagem-democratizada/README.md docs/frentes/landing-redesign-v3-dark/README.md docs/frentes/polimento-landing-oferta/README.md docs/frentes/conteudo-conversao-hub/README.md`
Expected: cada arquivo mostra 2+ ocorrências (Documentos + Commits-chave, no mínimo).

- [ ] **Step 7: Commit**

```bash
git add docs/frentes/landing-v2-enriquecimento/README.md docs/frentes/triagem-democratizada/README.md \
  docs/frentes/landing-redesign-v3-dark/README.md docs/frentes/polimento-landing-oferta/README.md \
  docs/frentes/conteudo-conversao-hub/README.md
git commit -m "docs: README de handoff para as 5 frentes com multiplos specs/planos"
```

---

### Task 4: Reescrever `docs/ECOSSISTEMA.md` como índice fino

**Files:**
- Modify: `docs/ECOSSISTEMA.md`

**Interfaces:**
- Consumes: os 12 `docs/frentes/<slug>/README.md` (Tasks 2 e 3).

- [ ] **Step 1: Ler o arquivo atual**

Leia `docs/ECOSSISTEMA.md` por completo antes de editar — ele tem seções "Status atual", "Mapa neural", "Fases & Checkpoints" (tabela) e "Fluxo de necessidades".

- [ ] **Step 2: Substituir a seção "Fases & Checkpoints"**

Localize a seção que começa com `## 🔀 Fases & Checkpoints` (uma tabela markdown) e substitua-a por:

```markdown
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
```

- [ ] **Step 3: Atualizar a nota de rodapé do arquivo**

Localize a linha final `_Ao concluir uma nova fase, adicione uma linha em "Fases & Checkpoints" e atualize "Status atual"._` e substitua por:

```markdown
_Ao concluir uma nova frente: crie `docs/frentes/<slug>/README.md`, adicione uma linha nesta lista, e atualize "Status atual" se algo novo foi ao ar. Tudo no mesmo commit de finalização._
```

- [ ] **Step 4: Verificar que não sobrou referência à estrutura antiga**

Run: `grep -n "superpowers/specs\|superpowers/plans" docs/ECOSSISTEMA.md`
Expected: nenhuma ocorrência (a seção "Specs & Plans (por fase)" do "Mapa neural", se existir apontando pra `docs/superpowers/specs/`/`plans/`, deve ser atualizada para apontar pra `docs/frentes/` — edite se o grep encontrar algo).

- [ ] **Step 5: Commit**

```bash
git add docs/ECOSSISTEMA.md
git commit -m "docs: hub vira indice fino apontando para docs/frentes/<slug>/README.md"
```

---

### Task 5: Gatilho de retomada + convenção de local no `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `docs/ECOSSISTEMA.md` (Task 4).

- [ ] **Step 1: Ler o `CLAUDE.md` atual**

Leia o arquivo completo antes de editar — ele já tem uma linha `> **› Contexto completo e navegação:** leia [`docs/ECOSSISTEMA.md`](docs/ECOSSISTEMA.md) primeiro...` logo no topo.

- [ ] **Step 2: Adicionar a seção de retomada logo após essa linha**

Insira, imediatamente depois do blockquote de navegação (antes da seção `## Produto (não é um ebook)`):

```markdown
## Retomando trabalho entre sessões

Se o usuário pedir para continuar, perguntar "qual a próxima frente/etapa",
ou pedir alinhamento com a última entrega:
1. Leia `docs/ECOSSISTEMA.md`, seção "Frentes já trabalhadas".
2. Identifique a frente mais recente com status 🔄 (em andamento) — se
   nenhuma, a última ✅ concluída (a de data mais recente na lista).
3. Abra o `README.md` dessa frente (`docs/frentes/<slug>/README.md`) — ele
   tem o "Próximo passo" exato (task do plano, ou o que falta decidir).
4. Responda já com esse contexto resumido, sem pedir pro usuário repetir o
   que já está documentado.

**Specs e planos novos vão em `docs/frentes/<slug>/spec.md` e `/plano.md`**
— não mais em `docs/superpowers/specs|plans/` (estrutura antiga, só histórico
já migrado).
```

- [ ] **Step 3: Verificar que o arquivo continua válido**

Run: `head -20 CLAUDE.md`
Expected: a nova seção aparece logo após o blockquote de navegação, antes de "## Produto (não é um ebook)".

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md ganha gatilho de retomada entre sessoes + convencao de docs/frentes"
```

---

### Task 6: Migrar a própria frente `ecossistema-frentes`

**Files:**
- Create: `docs/frentes/ecossistema-frentes/spec.md`, `docs/frentes/ecossistema-frentes/plano.md`, `docs/frentes/ecossistema-frentes/README.md`

**Interfaces:**
- Consumes: nenhuma (última task, fecha o próprio ciclo).

- [ ] **Step 1: Mover o spec e o plano desta própria frente**

```bash
git mv docs/superpowers/specs/2026-07-08-ecossistema-frentes-design.md docs/frentes/ecossistema-frentes/spec.md
git mv docs/superpowers/plans/2026-07-08-ecossistema-frentes.md docs/frentes/ecossistema-frentes/plano.md
```

- [ ] **Step 2: Escrever `docs/frentes/ecossistema-frentes/README.md`**

```markdown
# Ecossistema de Frentes

**Status:** ✅ Concluída

**Objetivo:** Migrar as frentes históricas para `docs/frentes/<slug>/` (spec + plano + README de handoff), reescrever o hub como índice fino, e adicionar ao `CLAUDE.md` o gatilho automático de retomada entre sessões — baseado em pesquisa de padrões de harness de agentes de código (memória em arquivo, handoff explícito por unidade de trabalho).

**Documentos:** [spec.md](spec.md) · [plano.md](plano.md)

**Commits-chave:** ver `git log --oneline --follow -- docs/frentes/ecossistema-frentes/spec.md` para o range completo desta migração.
```

- [ ] **Step 3: Verificar que as pastas antigas estão vazias**

Run: `ls docs/superpowers/specs/ docs/superpowers/plans/`
Expected: ambos os diretórios vazios (ou inexistentes — tudo bem se `ls` reclamar de diretório vazio).

- [ ] **Step 4: Verificar o `git status` final**

Run: `git status`
Expected: working tree limpo após o commit deste step.

- [ ] **Step 5: Commit**

```bash
git add docs/frentes/ecossistema-frentes docs/superpowers
git commit -m "docs: fecha o ciclo - migra a propria frente ecossistema-frentes"
```
