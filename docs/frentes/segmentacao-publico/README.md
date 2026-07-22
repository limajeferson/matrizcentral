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

## Verificação visual

- ✅ **Deslogado (executada pelo Claude, dev server local):** landing com a
  seção nova na posição certa (entre jornada e "Você não precisa saber
  programar"), 3 cards Performance/Equilíbrio/Essencial, CTAs → `/oferta`,
  zero "limitado", grid 1 coluna ≤800px (regra CSS conferida).
- ⚠️ **Logado:** sessão de teste não pôde ser criada (mintar credencial é
  bloqueado — L-038). Verificação de rendering feita em produção pós-deploy;
  fluxos de **submit** ficam para o usuário (abaixo).

## Pendências (roteiro logado para o usuário — 5 min)

1. `/feed` sem diagnóstico: quiz aparece com **9 perguntas** → concluir →
   bloco "Seu caminho" com o tier calculado.
2. Conta com perfil antigo (`update users set capacity_tier = null where email
   = '<conta>'`): versão **mini** (2 perguntas) → concluir → bloco aparece;
   **sem XP novo** (`select count(*) from xp_events where user_id='...' and
   action_type='triagem'` continua 1).
3. Dispensar o bloco → some e não volta no F5; **"meu setup mudou"** → mini-quiz
   de novo → ao concluir, o card volta sozinho (fix `b2ea9e5`).
4. Vitrine com tier `essencial`: itens tagueados essencial primeiro; nenhum
   item sumiu.

## Decisões travadas

- Eixo ortogonal, não terceiro sistema de perfis.
- "Limitado" → **Essencial**; público nunca vê a palavra.
- Vitrine **ordena, nunca filtra**.
- Modo só-capacidade **sem XP**.
- Preços/planos/oferta intocados nesta frente.
