# Triagem Democratizada (Fase A) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abrir a triagem para todos os públicos: 2 perfis novos (estudante/curioso e profissional não-técnico), quiz ramificado (perguntas técnicas só para quem programa), e copy sem jargão excludente.

**Architecture:** Sem tabelas novas — migration de seed para 2 perfis; extensão do tipo `ProfileId`; novo módulo puro `lib/quiz-branching.ts` (filtro `showIf`); reescrita do banco de perguntas com ramos técnico/não-técnico; `QuizTriagem.tsx` passa a navegar sobre as perguntas visíveis; ajustes de copy na landing e na página do quiz.

**Tech Stack:** Next.js 14, TypeScript, Supabase (migration via CLI já vinculada), Vitest.

## Global Constraints

- Princípios vinculantes do spec: XP ancorado em produção; zero dark patterns; honestidade no copy; autonomia do usuário.
- A pergunta de programação deve ter opção acolhedora explícita ("Não programo — sem problema, o quiz se adapta a você").
- Perguntas com `showIf` só referenciam perguntas ANTERIORES (sem referência futura/circular) — coberto por teste de sanidade.
- Tie-break de `scoreTriagem` preservado: perfis originais primeiro em `PROFILE_ORDER`, novos ao final.
- A migration 0003 deve ser aplicada no Supabase remoto ANTES do deploy do quiz (FK `tokens.profile_id → profiles.id`).
- Spec: `docs/superpowers/specs/2026-07-03-triagem-democratizada-design.md`.

---

### Task 1: Migration 0003 (2 perfis novos) + extensão de `ProfileId`

**Files:**
- Create: `supabase/migrations/0003_seed_novos_perfis.sql`
- Modify: `src/lib/quiz-scoring.ts` (tipo `ProfileId` + `PROFILE_ORDER` + objeto `scores`)
- Test: `src/lib/quiz-scoring.test.ts` (novo caso cobrindo os perfis novos)

**Interfaces:**
- Produces: `ProfileId` com 8 literais (`... | "estudante_curioso" | "profissional_produtividade"`); perfis `estudante_curioso` e `profissional_produtividade` no banco.

Passos: escrever teste do novo perfil vencendo (RED), estender tipo/order/scores (GREEN), criar a migration com os 2 seeds completos (name, description, recommended_ebooks com o NotebookLM+Obsidian grátis, study_roadmap de 4 semanas), aplicar com `supabase db push`, commit.

### Task 2: `lib/quiz-branching.ts` (TDD)

**Files:**
- Create: `src/lib/quiz-branching.ts`
- Test: `src/lib/quiz-branching.test.ts`

**Interfaces:**
- Consumes: `TriagemQuestion`, `TriagemAnswer` de `lib/quiz-scoring` (o tipo `TriagemQuestion` ganha campo opcional `showIf?: { questionId: number; optionIndexes: number[] }`).
- Produces: `visibleQuestions(questions: TriagemQuestion[], answers: TriagemAnswer[]): TriagemQuestion[]`.

Regras: sem `showIf` → sempre visível; com `showIf` → visível só se existir resposta à pergunta referenciada contendo ao menos um dos `optionIndexes`; resposta ausente → oculta.

### Task 3: Novo banco de perguntas ramificado + teste de sanidade

**Files:**
- Modify: `src/data/quiz-triagem.ts` (reescrita completa: Q1 seletor de caminho, Q2 "Você programa?", ramo técnico com `showIf`, ramo não-técnico com `showIf`, cauda comum)
- Test: `src/data/quiz-triagem.test.ts` (sanidade: `showIf` só referencia pergunta anterior existente com índice de opção válido; ids únicos e crescentes)

### Task 4: `QuizTriagem.tsx` navega sobre perguntas visíveis

**Files:**
- Modify: `src/components/quiz/QuizTriagem.tsx`

Troca `QUIZ_TRIAGEM[currentQ]` por navegação sobre `visibleQuestions(QUIZ_TRIAGEM, answers)`; decisão de "acabou" recalculada em `handleNext` com as respostas atualizadas. Lógica de seleção radio/checkbox e o POST para `/api/quiz` permanecem idênticos.

### Task 5: Copy democratizada (landing + página do quiz)

**Files:**
- Modify: `src/components/marketing/Hero.tsx` (badge e subtítulo sem jargão)
- Modify: `src/components/marketing/FeaturesGrid.tsx` (descrição do ebook sem jargão)
- Modify: `src/app/quiz/[token]/page.tsx` (texto de boas-vindas acima do quiz)

### Task 6: Verificação integrada

`npx tsc --noEmit` limpo; suíte completa passando (incluindo os testes novos); migration aplicada no remoto confirmada (`supabase migration list`); fluxo manual no dev server (ramo técnico e ramo não-técnico).
