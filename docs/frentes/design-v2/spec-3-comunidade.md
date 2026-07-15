# Spec — Frente 3: Comunidade (atividades + ranking mensal)

> Programa: [`README.md`](README.md). Terceira frente — **visual + backend leve**.
> Modelos: swipeable-list (`@saurra3h`) para as atividades; animated-list
> (`@shadcnspace`) para o ranking. Reconstruídos com framer-motion + Tailwind +
> ícones caseiros. Herda as Global Constraints do programa.

## Estado atual

- `RightSidebar.tsx` (server): bloco "Comunidade" = lista de atividades
  (`formatActivity(getCommunityActivity(20))` = selos conquistados), gated a
  Advanced (senão `ContentGate`). Sem swipe, sem animação, sem ranking.
- Ranking existe só na página `dashboard/[token]/ranking` (separada). XP: tabela
  `xp_events` (`user_id`, `xp_amount`, `action_type`, `created_at`) + `total_xp`
  acumulado em `users`. `display_name` marca quem optou por aparecer publicamente.

## Item 1 — Atividades como swipeable-list

`RightSidebar` "Comunidade" vira `SwipeableActivityList` (client), fiel ao modelo:
- Cada item: **ícone leading** (selo, em quadrado arredondado violeta), **texto**
  (o `item.text` atual, ex.: "Fulano conquistou o selo X"), **meta** (tempo
  relativo via `relativeTime`, reusando o helper da Frente 2).
- **Swipe** (framer-motion `drag="x"`): arrastar à esquerda revela uma ação
  **"Dispensar"** (esconde o item **localmente**, sem backend — é feed read-only
  de terceiros; ações destrutivas/pessoais não se aplicam). Soltar sem passar do
  limiar volta à posição. Custo zero, sem persistência.
- Mantém o **gating a Advanced** (senão `ContentGate`), como hoje.
- A11y: item com `aria-label`; a ação "Dispensar" também acessível por um botão
  (não só swipe) para teclado.
- **Ajuste de dados:** `getCommunityActivity` já traz `earned_at`; expor o
  timestamp no `ActivityItem` (`formatActivity` já tem `at`) para o meta.

## Item 2 — Ranking mensal da temporada (animated-list)

Novo bloco "Ranking da temporada" na `RightSidebar`, visível a **todos os
logados** (XP é gamificação geral). Modelo animated-list: itens entram com
**stagger/spring** (framer-motion).

### Backend leve (agregação por mês)
- **`src/lib/leaderboard.ts` (puro, testável):**
  - `monthStartIso(now: Date): string` — 1º dia do mês corrente (UTC) em ISO.
  - `aggregateMonthlyXp(events: {user_id; xp_amount; created_at}[], monthStartIso):
    Map<string, number>` — soma `xp_amount` por `user_id` para eventos com
    `created_at >= monthStartIso`.
  - `rankLeaderboard(totals: {userId; name; xp}[], limit): {rank; name; xp}[]` —
    ordena por `xp` desc, atribui `rank` (1..N), corta em `limit`.
- **`src/lib/leaderboard-data.ts`:** `getMonthlyLeaderboard(now: Date, limit=10):
  Promise<{rank; name; xp}[]>` — busca `xp_events` do mês (`created_at >=
  monthStart`), agrega, junta `display_name` (só **opted-in**: quem tem
  `display_name` não nulo), aplica `rankLeaderboard`. Escala pequena → agrega em
  JS (sem rpc).

### Visual
- `RankingList` (client): lista com entrada animada (stagger). Cada linha:
  posição (`#1..#N`, top 3 com destaque **ouro/prata/bronze** via
  `--mc-gold`/tons), nome, XP do mês. Estado vazio: "Ninguém pontuou este mês
  ainda." Montado na `RightSidebar` (server passa os dados já resolvidos).

## Montagem

`feed/page.tsx` resolve `getMonthlyLeaderboard(new Date())` (para logados) e
passa à `RightSidebar` junto de `activity`. `RightSidebar` compõe os dois blocos
(atividades swipeable + ranking animado).

## Não-objetivos / diferido

- Persistir "dispensar" atividade (é local). Reações/curtidas na atividade.
- Reset/premiação automática de temporada (só exibição do mês corrente).
- Paginação do ranking (top N basta). Opt-in novo (reusa `display_name`).

## Verificação

- Gate: `tsc` 0 + `npm run test` (novos: `monthStartIso`, `aggregateMonthlyXp`,
  `rankLeaderboard`) + `next lint` sem erros.
- App logado (`/feed`): atividades com swipe→dispensar (Advanced); bloco de
  ranking do mês com entrada animada e top-3 destacado; dark-aware.
- Sem migration nova (usa `xp_events`/`users` existentes).
