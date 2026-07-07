# Ecossistema de Contexto (Hub Neural) — Design

**Data:** 2026-07-07
**Status:** Aprovado para implementação
**Escopo:** Criar um hub de contexto único (`docs/ECOSSISTEMA.md`) que indexa e conecta toda a documentação do projeto, atualizar os arquivos de contexto (CLAUDE.md, memória) para refletir o estado atual, e criar `.env.example` para destravar o deploy. Objetivo: um novo início de sessão entende o projeto e navega o histórico com custo mínimo de tokens, sem alucinar.

---

## 1. Problema

Ao iniciar uma sessão do zero, o Claude precisa reconstruir o contexto lendo arquivos espalhados. Hoje:
- **CLAUDE.md está desatualizado** (07-05): não menciona footer institucional, `/sobre`, `/legal`, newsletter, nem as seções método/experiência (todos de 07-07).
- **Docs espalhados** sem um índice de entrada: `docs/superpowers/{specs,plans}` (30 arquivos), `arquitetura-1/`, `arquitetura-2/`, `descricao/`, memória (12 arquivos).
- **Sem mapa de "leia quando…"** → o agente ou lê demais (gasta tokens) ou alucina (não sabe onde confirmar).
- **Sem `.env.example`** → deploy no domínio depende de conhecimento tácito das env vars.

## 2. Princípio de design (context engineering)

Baseado em boas práticas de agentes (progressive disclosure):
- **Hub pequeno + links** — o hub não contém o detalhe, aponta para ele. O agente lê o hub primeiro e segue só os links necessários.
- **CLAUDE.md enxuto** — mantém-se leve (modelos seguem ~150-200 instruções bem; acima disso a aderência cai). O detalhe vive no ecossistema.
- **Fonte única por assunto** — cada fato tem UM lugar canônico; o hub diz onde. Isso evita alucinação (o agente confirma no arquivo linkado) e duplicação.
- **Fases/checkpoints reusam os specs/plans existentes** — o hub os indexa; não cria arquivos redundantes.

Fontes: HumanLayer "Writing a good CLAUDE.md", ClaudeLog, Claude Code Docs (sub-agents/memory).

---

## 3. Entregáveis

### 3.1 CRIAR `docs/ECOSSISTEMA.md` (o hub neural)

Ponto de entrada único. Estrutura (nesta ordem):

1. **🧭 Comece aqui** — 3-5 linhas: o que é este arquivo, como usá-lo (ler o hub → seguir só os links necessários → confirmar fatos no arquivo linkado, nunca alucinar), e a regra de economia de tokens (não abrir tudo; abrir sob demanda).

2. **📊 Status atual** — bloco curto:
   - Fase atual e o que está **no ar** (landing v2 completa: hero, seções método/experiência, footer institucional, /sobre, /legal, newsletter).
   - **Bloqueios de deploy:** (a) aplicar migration `0011_newsletter_subscribers.sql` no Supabase; (b) configurar env vars na hospedagem; (c) deploy no domínio.
   - Repo: link; branch `master`; tag de checkpoint mais recente.

3. **🗺️ Mapa neural** — índice linkado por categoria. Cada item = link relativo + uma linha "leia quando…":
   - **Produto & Visão:** `CLAUDE.md`, `descricao/VERSAO-CONCISA.md`, `descricao/VERSAO-COMPLETA.md`, `contextocentral.md`.
   - **Arquitetura:** `arquitetura-1/` (técnica/triagem/e-mail/dashboard), `arquitetura-2/` (gamificação/XP/certificados).
   - **Código fonte-de-verdade:** `src/data/content-hub.ts` (CONTENT_HUB — nunca inventar títulos), `src/lib/content-stats.ts`, `notebooklm/` (assets brutos de conteúdo).
   - **Specs & Plans (por fase):** apontar para `docs/superpowers/specs/` e `docs/superpowers/plans/` e para a tabela da seção 4.
   - **Memória:** `~/.claude/.../memory/MEMORY.md` (índice de memórias persistentes).
   - **Deploy:** `.env.example`, `supabase/migrations/`, seção "Fluxo de necessidades" abaixo.

4. **🔀 Fases & Checkpoints** — tabela das fases concluídas (reusa specs/plans; não duplica conteúdo). Colunas: Fase | Status | Spec/Plan (link) | Commit/Tag. Linhas (das fases reais no git):
   - Fase 1 / triagem + /oferta redesign — ✅ — `specs/2026-07-05-oferta-redesign-design.md` — `3500f6a`
   - Hero esfera ASCII + pixel bg — ✅ — (commits `0c7d3e2`→`a82266d`)
   - Footer institucional (/sobre, /legal, newsletter) — ✅ — `specs/2026-07-07-footer-institucional-design.md` — tag `checkpoint-footer-institucional`
   - Seções método × experiência + fascinations — ✅ — `specs/2026-07-07-secoes-metodo-experiencia-design.md` — `72b87a1`
   - Ecossistema de contexto (este) — ✅ — `specs/2026-07-07-ecossistema-contexto-design.md`
   - Deploy no domínio — 🔜 pendente

5. **➡️ Fluxo de necessidades (próximos passos)** — lista ordenada até o site no ar:
   1. Aplicar migration `0011` no Supabase (`supabase db push` — projeto já linkado).
   2. Configurar env vars na hospedagem (ver `.env.example`).
   3. Deploy (Vercel é o caminho natural p/ Next.js; `npm run build` só passa com as env vars, por causa de `src/lib/stripe.ts`).
   4. Apontar o domínio comprado.

O hub usa **links relativos markdown** (`[texto](caminho)`) para arquivos do repo. Para a memória (fora do repo), referencia o caminho absoluto do `MEMORY.md`.

### 3.2 ATUALIZAR `CLAUDE.md`

- Adicionar, logo após o título, um bloco curto: **"› Contexto completo e navegação: leia `docs/ECOSSISTEMA.md` primeiro."**
- Atualizar a seção **Produto** para refletir o estado atual: landing v2 com seções método (SystemSection) e experiência (ContentLibrarySection), footer institucional, páginas `/sobre` e `/legal/{privacidade,termos}`, newsletter (`/api/newsletter` + tabela `newsletter_subscribers`).
- **Manter enxuto:** não colar detalhe que já vive no ecossistema/specs. Preservar as seções Verificação, CSS por página, Restrições como estão (ainda válidas). Não adicionar regras de estilo (linter faz isso).

### 3.3 ATUALIZAR memória

- **CRIAR** `memory/matrizcentral-ecossistema.md` (type: reference) — aponta `docs/ECOSSISTEMA.md` como a entrada canônica de contexto; explica a regra de navegação (hub → links sob demanda). Linka `[[matrizcentral-status-footer-institucional]]` e as memórias de status.
- **ATUALIZAR** `MEMORY.md` — adicionar a linha de índice da nova memória, no topo do grupo de projeto, marcando-a como o ponto de partida.
- Não apagar memórias antigas; o hub e a nova memória as referenciam.

### 3.4 CRIAR `.env.example`

Arquivo na raiz com as env vars referenciadas no código, com **placeholders** (sem segredos), agrupadas e comentadas:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# E-mail (Brevo)
BREVO_API_KEY=
# App
NEXT_PUBLIC_URL=
```
Confirmar a lista exata fazendo `grep -rho "process.env.[A-Z_]*" src/` antes de finalizar (a fonte da verdade são os usos reais no código). Não ler valores de `.env.local` (segredos).

---

## 4. Arquivos afetados

**Novos:**
- `docs/ECOSSISTEMA.md`
- `memory/matrizcentral-ecossistema.md` (fora do repo — dir de memória do usuário)
- `.env.example`

**Modificados:**
- `CLAUDE.md`
- `memory/MEMORY.md` (índice)

**Não muda:** specs/plans existentes (só são linkados), código-fonte, arquitetura-1/2.

## 5. Verificação

- **Links:** todo link relativo em `ECOSSISTEMA.md` e `CLAUDE.md` deve resolver para um arquivo que existe (checar cada caminho com `ls`/`test -f`). Zero link quebrado.
- **Segredos:** `.env.example` só tem placeholders vazios; nenhum valor real de `.env.local`.
- **CLAUDE.md enxuto:** não cresceu descontroladamente (o detalhe foi pro ecossistema, não pro CLAUDE.md).
- **Consistência de status:** o "Status atual" e "Fases" do hub batem com o git real (`git log`, tag `checkpoint-footer-institucional`) e com a memória.
- Não há gate de tsc/test aqui (é documentação), mas rodar `npx tsc --noEmit` no fim para garantir que nada de código foi tocado por engano.

## 6. Execução (subagent-driven-development)

Fases:
1. **`.env.example` + confirmação das env vars** (grep no código) — rápido, isolado.
2. **`docs/ECOSSISTEMA.md`** — o hub, com todos os links verificados.
3. **CLAUDE.md + memória** — ponteiro, refresh do Produto, nova memória + índice.
4. **Verificação de links** — checar cada caminho linkado; corrigir quebrados.
