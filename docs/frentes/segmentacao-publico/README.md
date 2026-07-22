# Frente: Segmentação de Público (eixo de capacidade)

**Status: ✅ CONCLUÍDA (código + revisões) — 2026-07-21.** Push feito com
verificação visual deslogada completa; passos logados de submit ficaram como
roteiro para o usuário (ver "Pendências" abaixo).

## O que é

O pedido original (versionado em [`pedido.md`](pedido.md)) trazia 3 modelos de
usuário: **avançados / equilibrados / limitado**. A decisão central da spec
([`spec.md`](spec.md)): isso é um **eixo de capacidade** (recursos/infra)
**ortogonal** aos 8 perfis de caso de uso que já existiam — não um terceiro
sistema de perfis. Nomes públicos: **Performance / Equilíbrio / Essencial**
("limitado" **nunca** aparece em UI/copy/e-mail — não se rotula usuário por
falta).

## O que foi entregue (8 tasks S1–S8, plano em [`plano.md`](plano.md))

- **S1** `src/lib/capacity.ts` — fonte única: tipo `CapacityTier`, perguntas
  8/9, scorer conservador (empate → tier mais baixo; nunca recomendar acima do
  recurso), `CAPACITY_PATHS` (copy dos 3 caminhos), `toCapacityTier`
  (validador; ver L-036).
- **S2** migration `0029` `users.capacity_tier` (**aplicada e verificada no
  remoto**) + tipos.
- **S3** `/api/diagnostico` grava os dois eixos; **modo só-capacidade não
  concede XP** (claim atômico de `diagnosed_at` intacto — review opus).
- **S4** `DiagnosticoInline` com 9 perguntas (modo completo) e **modo mini**
  (2 perguntas de capacidade, para quem já tem perfil).
- **S5** bloco **"Seu caminho"** no feed (`SeuCaminhoCard`: dismiss local,
  "meu setup mudou" → mini-quiz com reset via `onDone`).
- **S6** `capacityFit` no `CONTENT_HUB` + vitrine **ordenada** por afinidade
  (ordenação estável fit-first; **nunca filtro** — nenhum item some).
- **S7** landing v2: seção **"Qual é o seu momento?"** (3 cards, mesmo CTA
  `/oferta`), CSS escopado `.mcv2`, 1 coluna ≤800px.
- **S8** e-mails de ciclo/conteúdo com dica por tier (sem tier → e-mail
  byte-idêntico ao anterior) + seção de segmentação no
  [`crm.md`](../suporte-crm/crm.md).

## Revisões

- Por task: todas aprovadas (S3 e revisão final em **opus**; demais sonnet).
- Re-review S8 pegou 2 Importants reais (import morto quebrando lint; lista de
  tiers duplicada) → fix `76c2095` (L-039).
- **Revisão final whole-branch (opus, base `752c25e`): Ready to merge — Yes**,
  após 2 fixes (`b2ea9e5`): cast cego de `capacity_tier` no feed (L-036) e
  fluxo "meu setup mudou" preso pós-`router.refresh()` (L-037).
- Gate no fechamento: `tsc` 0 · **340 testes / 55 arquivos** · lint 0 erros.

## Verificação visual (executada em 2026-07-21, pós-deploy)

- ✅ **Deslogado (dev local):** landing com a seção nova na posição certa
  (entre jornada e "Você não precisa saber programar"), 3 cards
  Performance/Equilíbrio/Essencial, CTAs → `/oferta`, zero "limitado", grid
  1 coluna ≤800px (regra CSS conferida).
- ✅ **Logado (PRODUÇÃO, conta de teste `stripe-e2e@` que já estava logada no
  Chrome):**
  - Conta com perfil antigo e sem tier → **modo mini (2 perguntas)** rendeu no
    feed ("Complete seu diagnóstico", "Pergunta 1 de 2"); concluído →
    **"Seu caminho — Essencial"** apareceu com setup + primeiro passo.
  - **Sem XP novo:** `xp_events` `triagem` continuou **1** (conferido por SQL
    antes/depois). `users.capacity_tier` gravado (`essencial`).
  - **Vitrine reordenou** por afinidade (Comparativo/performance desceu;
    podcasts essencial/equilíbrio subiram) e **nenhum item sumiu**.
  - **"meu setup mudou"** reabriu o mini-quiz; respondido diferente → card
    **voltou sozinho** exibindo **Equilíbrio** (fix `onDone`/`b2ea9e5`
    funcionando; a janela de prop stale foi de ~3s, auto-corretiva, como a
    revisão avaliou). DB conferido: `equilibrio`.
  - **Dispensar (X)** → card some e **não volta no F5**.
- Estado final da conta de teste: `profile_id=devops_infra`,
  `capacity_tier=equilibrio` (dado sintético, sem impacto).

## Pendência única (usuário, quando quiser)

- **Quiz completo de 9 perguntas + 50 XP única vez** exige conta **nova** (sem
  `diagnosed_at`): entrar com uma conta fresca → `/feed` → quiz completo
  ("Pergunta 1 de 9") → concluir → perfil + tier gravados e +50 XP uma única
  vez. (O modo completo é o mesmo maquinário do mini já provado em produção;
  a seleção do banco de 9 perguntas é coberta por teste unitário. O reset de
  conta existente via SQL foi bloqueado pelo classificador — L-038.)

## Decisões travadas

- Eixo ortogonal, não terceiro sistema de perfis.
- "Limitado" → **Essencial**; público nunca vê a palavra.
- Vitrine **ordena, nunca filtra**.
- Modo só-capacidade **sem XP**.
- Preços/planos/oferta intocados nesta frente.
