# Lançamento Público — Plano mestre (índice das 6 ondas)

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development`
> para executar cada onda task-a-task. Os passos usam checkbox (`- [ ]`).

**Goal:** deixar a Matriz Central pronta para receber tráfego pago e orgânico —
sem perder venda, sem perder dado, sem prometer o que o código não entrega.

**Architecture:** seis ondas sequenciais, cada uma com plano próprio detalhado,
escrito **imediatamente antes de executá-la** (lição L-018: plano escrito muito
antes do código nasce inválido). Cada onda é uma fila de tasks pequenas, commit
por task, gate verde antes de cada commit.

**Tech Stack:** Next.js 14.2.35 (App Router) · React 18 · TypeScript · Tailwind ·
Supabase (service role no servidor) · Vitest (`environment: node`) · Vercel.

Spec: [`spec.md`](spec.md) · Backlog editorial: [`backlog-conteudo.md`](backlog-conteudo.md)

## Global Constraints

Valem para **toda** task de **toda** onda:

- **Custo zero: proibido adicionar dependência npm.** Nenhuma. Se uma solução
  exige pacote novo, ela está errada — procurar o caminho nativo (`next/og`,
  `next/font`, Canvas 2D, CSS) ou o que já está instalado.
- **Sem asset externo em runtime** (nenhum CDN, nenhuma fonte remota em request).
- **Gate obrigatório antes de cada commit:** `npx tsc --noEmit` exit 0 ·
  `npm run test` verde · `npx next lint` sem **erros**. `npm run build` **falha
  de propósito** sem `STRIPE_SECRET_KEY` — não é regressão, não tentar consertar.
- **Vitest roda em `environment: "node"`** — sem jsdom, sem testing-library.
  Teste automatizado só para **lógica pura** em `src/lib`/`src/data`. Componente
  se verifica rodando `npm run dev -- -p 3000` e olhando no navegador.
- **Escopo de CSS:** landing v2 = `.mcv2` (dark+violeta) · `/oferta` = `.lp-guide`
  (tema claro) · `/checkout` = `.mc-checkout`. CSS novo vai no escopo certo, nunca
  no global.
- **Tokens de cor** (`.mcv2`): `--mc-accent` `#7c5cff` (único acento alto),
  `--mc-success`, `--mc-trust`, `--mc-gold`, `--mc-warn`. Reusar, não inventar hex.
- **Português do Brasil** em toda copy visível.
- **Migration nova**: criar o arquivo em `supabase/migrations/` **e aplicar no
  remoto na mesma sessão**, via `npx supabase db query --linked -f <arquivo>`,
  verificando com um `select` depois (L-023). Próximo número livre: **`0030`**.
- **Nunca commitar:** `CLAUDE.local-draft.md`, `SETUP.md`, `claude-chat.md`,
  `erro.png`, `texto-para-salvar-prompt-temporario.md`, `proxima-tarefa.md`,
  `erro-de-limite.md`, `youtube-baixar-imagens.md`.
- **Antes de montar o brief de cada task**, consultar a seção do gatilho em
  [`docs/LICOES.md`](../../LICOES.md) (46 lições).

---

## Sequência das ondas

| Onda | Nome | Plano | Estado |
|---|---|---|---|
| 1 | Receita & Descoberta | [`plano-onda1.md`](plano-onda1.md) | ✅ **executada** |
| 2 | Identidade & Polish | [`plano-onda2.md`](plano-onda2.md) | 📋 escrito |
| 3 | Verdade da Oferta *(portão humano)* | `plano-onda3.md` | ✍️ escrever ao iniciar |
| 4 | Tech-debt & Segurança | `plano-onda4.md` | ✍️ escrever ao iniciar |
| 5 | Motor de Marketing | `plano-onda5.md` | ✍️ escrever ao iniciar |
| 6 | Kiwify + Auditoria final | `plano-onda6.md` | ✍️ escrever ao iniciar |

**Por que esta ordem:** Onda 1 é o que permite *anunciar* (medição, indexação,
não perder a venda). Onda 2 é a marca, que precisa existir antes do primeiro
tráfego. Onda 3 é o único bloco com efeito jurídico e precisa do usuário. Onda 4
é dívida que fica cara com usuário real. Onda 5 só faz sentido depois que existe
medição. Onda 6 fecha a receita e audita tudo.

**Rodando em paralelo, sem bloquear:** **E5** (publicar as 9 mídias) entra assim
que o usuário devolver as URLs — ver
[`../lancamento-final/handoff-midia.md`](../lancamento-final/handoff-midia.md).

## Relação com o programa `lancamento-final`

Esta frente **absorve** as Trilhas **F** (vira Onda 2) e **G** (vira Onda 4)
daquele programa, revalidadas contra o código em 2026-07-26 — os planos
`plano-F-polish.md` e `plano-G-techdebt.md` continuam servindo de **fonte de
detalhe**, mas a auditoria corrigiu vários itens deles (ver "Correções aos planos
F e G" abaixo). As Trilhas A–E permanecem lá. Não há fila concorrente: **esta é a
fila ativa.**

### Correções aos planos F e G (achadas na auditoria de 2026-07-26)

Aplicar estas correções ao ler os planos antigos — eles estão **errados** nestes pontos:

- **F5 — "conferir se `Header.tsx`/`Footer.tsx` ainda são importados":** os
  caminhos certos são `src/components/marketing/Header.tsx` e
  `.../marketing/Footer.tsx` (não `src/components/`), e **sim, ainda são
  importados** — por exatamente um consumidor, `src/app/(marketing)/oferta/page.tsx:1-2`.
  **Decisão desta frente: consertar, não repontar** (a `/oferta` é tema claro
  `.lp-guide`; o `FooterV2` é `.mcv2` dark — repontar quebra o visual).
- **F8 — "parcialmente feito":** o que falta é maior do que o plano diz. Na
  `/oferta` **não existe `<form>` nenhum**, o botão é `type="button"`, e
  `handleCheckout` **não tem `try/catch/finally`** — não é só o `finally`.
- **G4 — "o webhook da Stripe é o 14º usuário de `isTokenExpired`":**
  **desatualizado.** `api/webhooks/stripe/route.ts:14` só cita o helper em
  **comentário**; não chama. O 14º call site real é `api/resgate/route.ts:60`,
  que o plano G4 **não lista**.
- **G10 (focus-trap no `AppHeader`) depende de F1**, e `src/lib/use-focus-trap.ts`
  **não existe** — F1 nunca foi executada. G10 está bloqueada até a Onda 2.
- **Item novo, sem task em nenhum plano:** `resolveUserIdByToken`
  (`src/lib/entitlement-access.ts:5-11`) lê `tokens` **sem checar `valid_until`**.
  Entra na Onda 4.
- **Item novo, sem task em nenhum plano:** as 3 APIs de mutação
  (`content/complete`, `pesquisa/responder`, `roadmap/complete`) concedem XP
  **sem checar sessão nem entitlement**. Estava rastreado como "sem dono" no
  README do `lancamento-final`; agora tem dono: Onda 4.

## Definição de pronto (da frente inteira)

Os 8 critérios de sucesso da [`spec.md`](spec.md#critérios-de-sucesso), somados a:
`docs/ESTADO-ATUAL.md` atualizado ao fim de cada onda, `docs/LICOES.md`
alimentado com o que doeu, e auditoria final (Onda 6) sem Critical aberto.
