# Frente — Leitor Protegido

**Status:** 🟡 **CÓDIGO COMPLETO E REVISADO — NÃO PUSHADO, NÃO NO AR.**

| | |
|---|---|
| Docs | [`spec.md`](spec.md) · [`politica-reembolso.md`](politica-reembolso.md) · [`plano.md`](plano.md) |
| Commits | `f02a910`..`HEAD` — **todos locais** (`origin/master` = `b0a66cb`) |
| Gate | `tsc` 0 · **322 testes** · `next lint` limpo |
| Migration | **`0028_reading_progress.sql` — CRIADA, NÃO APLICADA no remoto** |
| Ledger | `.superpowers/sdd/progress.md` (seção "Leitor Protegido") |

---

## 🚨 LEIA ANTES DE FAZER QUALQUER COISA

**NÃO DÊ `git push` NESTE ESTADO.**

A `master` tem auto-deploy na Vercel. Pushar antes de aplicar a migration `0028`
coloca no ar um leitor que **parece funcionar**: `getProgress` devolve `null`
(sem retomada) e `recordRead` engole o erro logando `AUDIT-LOSS`. Resultado: a
frente roda com o **livro-razão vazio** — exatamente o sinal do qual a política
de garantia depende. A falha é **silenciosa**.

### Os 3 bloqueadores, na ordem

**1. Aplicar a migration `0028` no Supabase remoto** (projeto `rzolsrzyafijaogjcjjb`).
   Arquivo: `supabase/migrations/0028_reading_progress.sql`.
   Verificar depois:
   ```sql
   select tablename, relrowsecurity from pg_tables t
     join pg_class c on c.relname = t.tablename
     where tablename in ('reading_progress','reading_events');
   ```
   Esperado: 2 linhas, `relrowsecurity = true` nas duas.

**2. Conferir compras legadas — o risco mais caro da frente.**
   ```sql
   select status, product_id, count(*) from purchases group by 1,2 order by 3 desc;
   ```
   Toda compra real precisa ter `status = 'paid'` e `product_id` ∈
   {`ebook_llm_local`, `regular_pass`, `advanced_pass`}. **O default da coluna
   `status` é `'pending'`** — qualquer linha criada fora do webhook (seed,
   inserção manual) fica **trancada** pelo gate novo. E como o download foi
   aposentado, essa pessoa pagou e fica **sem acesso a nada**.
   Se aparecer qualquer linha fora do esperado: **corrigir os dados antes do push.**

**3. Verificação visual** — nunca executada (o navegador caiu na sessão de
   2026-07-20). Roteiros numerados prontos em
   `.superpowers/sdd/task-4-report.md`, `task-5-report.md`, `task-6-report.md`.
   O item mais importante: `Ctrl+U` no leitor e confirmar que **o markdown das
   outras seções não aparece no HTML** (é o invariante central da frente).

> ⚠️ **O MCP do Supabase NÃO tem permissão nesta conta** (testado e confirmado em
> 2026-07-20 — não é suposição). O caminho é o **navegador** → SQL Editor, método
> documentado no `CLAUDE.md`.

---

## O que a frente faz

O ebook era um arquivo baixável. Isso criava duas dores: reembolso devolvia o
dinheiro mas **não o produto** (assimetria), e o rastro de auditoria era um
`boolean` sem timestamp.

A frente troca o download por um **leitor server-side** — uma seção por vez,
posição salva, acesso revogável, e um livro-razão de leitura que serve de prova
de consumo. **A revogação passa a ser real**, o que dissolve o problema que a
política de reembolso tentava resolver por cláusula.

### Entregue (6 tasks, todas revisadas)

| # | O quê |
|---|---|
| 1 | `src/lib/reader.ts` — corte do markdown em seções (puro, testado) |
| 2 | Migration `0028` + `src/data/reader-docs.ts` (registro slug→arquivo→regra) |
| 3 | `src/lib/reader-data.ts` — `canRead` (revogável, fail-closed), progresso, livro-razão |
| 4 | `/biblioteca/[slug]` + `ReaderShell`/`ReaderToc`/`Watermark` |
| 5 | `POST /api/leitura` + `ReadTracker` + aviso de retomada |
| 6 | `/api/download` → **410** + ponte `/entrar/resgate` + ponto de entrada em `/conta` |

**Fora do plano, no mesmo bloco:** cupom de upgrade deixou de valer após reembolso
do Start (`f8561f0`), e `product_id` virou fonte única em `reader-docs.ts`
(webhook e checkout passaram a importar — antes um rename silencioso quebraria a
criação de entitlement).

---

## Decisão aberta (a única que resta)

**C3 — os relatórios ainda têm um segundo caminho de entrega.**
`src/app/dashboard/[token]/conteudo/[id]/page.tsx` entrega o markdown **inteiro
numa resposta**, por token, sem registrar leitura. Contradiz o invariante da
spec.

- **(a)** Redirecionar essa página para o leitor. Fecha o invariante de verdade;
  risco de mexer no acesso por token mais uma vez.
- **(b) [recomendado]** Aceitar por escrito e fechar junto com a **Trilha G**, que
  já vai aposentar o fluxo de token — assim mexe uma vez, não duas.

## Próximo passo

1. Destravar os 3 bloqueadores acima (precisa de navegador).
2. `git push` → deploy.
3. Decidir o C3.
4. Voltar para o **programa de lançamento final** — a fila era
   [Trilha C (dark-aware)](../lancamento-final/README.md).

> A Trilha C ficou **parcialmente adiantada** por esta frente: `Markdown.tsx`
> virou dark-aware (com prop `surface` para superfícies claras fixas). O resto do
> `plano-C` segue válido.
