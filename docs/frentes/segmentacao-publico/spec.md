# Spec — Segmentação de Público (eixo de capacidade em 3 níveis)

> **Frente:** `segmentacao-publico` · **Origem:** [`pedido.md`](pedido.md) (verbatim
> do usuário, 2026-07-21). Autonomia e poder de decisão/expansão delegados ao
> Claude no próprio pedido; decisões de **preço/plano não são tocadas**.
> **Base de código mapeada antes do desenho** (Explore 2026-07-21): quiz/perfis,
> feed, CONTENT_HUB, e-mails, oferta, landing v2, migration 0022.

## A decisão de arquitetura (registrada para não reabrir)

Os 3 modelos do pedido (avançados/equilibrados/limitado) são um **eixo novo e
ortogonal** aos 8 perfis internos existentes:

| Eixo | Pergunta que responde | Onde vive hoje | O que dirige |
|---|---|---|---|
| **Caso de uso** (8 perfis, `ProfileId`) | "O que você quer fazer?" | `users.profile_id` (0022) + `profiles.study_roadmap` | Trilha/roadmap por perfil |
| **Capacidade** (3 tiers — NOVO) | "Com que recursos você vai rodar?" | `users.capacity_tier` (migration **0029**) | Qual LLM/setup recomendar; ênfase de conteúdo; tom de CRM |

- ❌ **Rejeitado: substituir os 8 perfis por 3** — perderia os roadmaps por
  perfil já semeados (`0007`) e a granularidade de trilha.
- ❌ **Rejeitado: derivar o tier do perfil sem coluna** — perfil não prediz
  recurso (estudante pode ter GPU top; empresário pode ter só smartphone); o
  "limitado" do pedido é sobre o hardware que a pessoa TEM.
- ✅ **Adotado: eixo ortogonal leve** — coluna nova + 2 perguntas novas no
  diagnóstico + scorer puro separado; recomendação final = f(perfil, tier).

## Nomes (decisão de copy — dignidade primeiro)

"Limitado" NUNCA aparece na UI (ninguém se auto-identifica assim). IDs internos
e nomes públicos:

| ID (`CapacityTier`) | Público | Promessa |
|---|---|---|
| `performance` | **Performance** | "Monte a melhor infra local/VPS e rode o topo de linha" |
| `equilibrio` | **Equilíbrio** | "Projeto definido → o modelo certo para o seu caso" |
| `essencial` | **Essencial** | "Comece com o que você já tem — smartphone, notebook, com ou sem GPU" |

## Entregáveis (4 blocos, viram tasks no plano)

### 1. Núcleo (dados + score + gravação)

- **Migration `0029_capacity_tier.sql`:** `alter table users add column if not
  exists capacity_tier text;` (texto validado em código, padrão da 0022; NULL =
  ainda não respondeu — é o gate de UX, sem coluna de data extra).
- **`src/lib/capacity.ts` (puro, TDD):** tipo `CapacityTier`, perguntas de
  capacidade com `capacityPoints`, `scoreCapacity(answers): CapacityTier`
  (empate resolve para o tier mais conservador: `essencial` > `equilibrio` >
  `performance` — nunca recomendar acima do recurso real) e
  `CAPACITY_PATHS`: copy por tier (título público, promessa, setup recomendado,
  primeiro passo) — **fonte única** para feed/landing/e-mails.
- **Quiz:** `QUIZ_TRIAGEM` ganha 2 perguntas novas (8: disposição/possibilidade
  de investimento; 9: o que já tem hoje — smartphone / notebook sem GPU /
  notebook-desktop com GPU / desktop potente ou VPS). Elas pontuam SÓ o eixo de
  capacidade (`capacityPoints`); as 7 atuais ficam **intactas** (Q4 continua só
  no eixo de perfil — sobreposição leve aceita e registrada).
- **`POST /api/diagnostico`:** passa a gravar os dois eixos. Aceita também o
  modo **só-capacidade** (usuário já diagnosticado respondendo as 2 novas):
  grava `capacity_tier` sem tocar `profile_id` e **sem XP novo** (o claim
  atômico de `diagnosed_at`/50 XP continua único — anti-forja preservado).

### 2. Feed / experiência logada

- **`DiagnosticoInline`:** novo usuário responde 9 perguntas (dois eixos de uma
  vez). Usuário com `profile_id` e sem `capacity_tier` vê a versão **mini** (só
  as 2 novas, copy "complete seu diagnóstico").
- **Bloco "Seu caminho" no feed** (novo, some quando descartado ou já lido):
  renderiza o `CAPACITY_PATHS[tier]` — o setup recomendado e o primeiro passo.
  É a resposta visível ao "afeta o feed?".
- **Vitrine com afinidade:** `ContentItem` ganha `capacityFit?: CapacityTier[]`
  (opcional; itens dos 9 atuais são tagueados onde fizer sentido óbvio). Rail e
  cards ordenam itens `fit` do tier do usuário primeiro — ordenação, **não**
  filtro (nada some de ninguém).

### 3. Marketing / landing (funil pré-compra)

- **Seção nova de auto-identificação** na landing v2 (entre `ProcessSteps` e
  `StrategySection`): "Qual é o seu momento?" com 3 cards (Performance /
  Equilíbrio / Essencial), cada um com a promessa e o mesmo CTA (`/oferta`,
  R$47) — âncora de conversão **sem quiz pré-compra** (atrito zero mantido; a
  triagem real continua pós-compra/login).
- `StrategySection`/FAQ: copy encosta nos 3 nomes públicos onde couber (leve).
- Escopo `.mcv2` respeitado; tokens de cor existentes; custo zero.

### 4. CRM / e-mails

- `sendNewCycleEmail` e `sendNewContentEmail` aceitam `tier?` e acrescentam 1
  linha de dica por setup (do `CAPACITY_PATHS`); o cron/endpoint passam o tier
  lido de `users`. Sem e-mail novo, sem mudança no `computeDueEmails`.
- `docs/frentes/suporte-crm/crm.md` ganha a seção "Segmentação por capacidade"
  (como o tier muda onboarding/retenção/win-back).

## Não-objetivos (YAGNI explícito)

- **Preços/planos/oferta de produto: intocados** (dinheiro = decisão do usuário).
- Dashboard do token e `profiles.study_roadmap`: intocados (fluxo em
  aposentadoria no SP2/Trilha G).
- Sem quiz pré-compra; sem filtro exclusivo de conteúdo por tier; sem coluna de
  histórico de respostas; sem dependência nova.
- Os 8 perfis continuam internos (nunca exibidos como "perfil").

## Critérios de sucesso

1. Usuário novo sai do diagnóstico com `profile_id` **e** `capacity_tier`; o
   feed mostra o bloco "Seu caminho" do tier dele.
2. Usuário antigo (diagnosticado) vê a versão mini e ganha `capacity_tier` sem
   XP duplicado (verificável em `xp_events`).
3. Landing tem a seção dos 3 momentos, com os nomes públicos (nunca "limitado").
4. E-mails de ciclo/conteúdo carregam a dica do tier quando ele existir.
5. Gate: `tsc` 0 · testes (novos p/ `scoreCapacity` e ordenação por afinidade) ·
   lint · **verificação visual** (dark+claro, desktop+mobile) na landing e no feed.
6. Migration `0029` aplicada no remoto ANTES do push (L-023).

## Riscos e mitigação

- **Tier errado frustra** → empate/dúvida resolve para baixo (`essencial`);
  copy do bloco permite refazer ("meu setup mudou" → mini-quiz de novo).
- **Sobreposição Q4×Q9** → registrada; Q4 fica no eixo de perfil, Q9 no de
  capacidade; unificação futura é candidata da Trilha G, não desta frente.
- **Drift de copy entre landing/feed/e-mail** → `CAPACITY_PATHS` é fonte única.
