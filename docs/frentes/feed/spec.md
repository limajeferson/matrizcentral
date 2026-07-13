# Feed (rede social de IA) — Design (MVP)

> Decisões tomadas com autonomia autorizada e recomendadas — documentadas aqui
> (não pausadas para aprovação). Ajustáveis na revisão.

## Contexto

O produto se posiciona como **plataforma-feed** (rede social de aprendizado de
IA). Hoje o consumo de conteúdo vive em `/dashboard/[token]/conteudo` (grade
estática, token-based) e há gamificação (badges, níveis, `display_name`,
`leaderboard_opt_in`). A fundação de identidade (login, Frente 1) e o entitlement
(Frente 2) já existem, e o `ContentGate` já enforce consumo por nível. Falta a
**superfície de feed** em si — uma timeline no modelo rede social.

O modelo canônico (travado na Frente 2): **leitura do feed = Advanced**; a prévia
(manchete + capa + "ler mais") é aberta a todos; consumir/abrir é travado.

## Escopo do MVP (o que ENTRA)

Uma página **`/feed`** (identidade via login) que é uma **timeline de descoberta
de IA**, montada de duas fontes que já existem (custo zero, sem UGC/moderação
ainda):

1. **Cards de conteúdo** (do `CONTENT_HUB`): cada item vira um "post" com
   manchete/título, **capa**, descrição curta e **"ler mais"**. Aberto a todos
   como **prévia**; "ler mais" leva à página de detalhe do conteúdo, que **já é
   gated** pelo entitlement (Frente 2) — Start vê prévia, paga consome conforme
   plano. Reusa a regra "prévia sempre, consumo travado".
2. **Strip de atividade da comunidade** (prova social): **badges recentes**
   (`badges_earned`) de usuários que optaram por aparecer
   (`leaderboard_opt_in = true`), mostrando `display_name`. **Ler o strip da
   comunidade exige Advanced** (o "feed de usuários" do modelo); Start/Regular
   veem o `ContentGate` ("vire Advanced para acompanhar a comunidade").
   > **MVP = só badges.** "Subidas de nível" ficam para v2 — hoje o nível é
   > derivado de `total_xp` (não há evento persistido do momento da subida), então
   > surfaçá-las exige reconstruir os cruzamentos do histórico de `xp_events`.

Ou seja: o feed é **read-only e curado** (conteúdo + atividade), no formato
timeline. É a rede social "em modo leitura" — postagem por usuário (UGC) fica
para uma v2 (precisa moderação/anti-spam, fora do MVP).

## Fora de escopo (YAGNI / v2)

- **Posts gerados por usuário (UGC)**, curtidas, comentários, seguir — v2, exige
  moderação, anti-spam e decisões de produto próprias.
- **Algoritmo de ranqueamento/personalização** do feed — MVP é cronológico +
  recomendado simples.
- Novas tabelas de conteúdo — o MVP lê `CONTENT_HUB` + gamificação existentes.

## Decisão técnica

### 1. Rota e identidade

- **`src/app/feed/page.tsx`** (server component). Resolve o usuário via
  `getSessionUser()` (login). Se deslogado → mostra a timeline de **prévias de
  conteúdo** (aberto, marketing) + um convite a entrar/adquirir para a comunidade;
  não redireciona (é superfície de descoberta/conversão).
- Nível de acesso via `getAccessContext(userId)`/`resolveAccess` (Frente 2) para
  decidir o strip de comunidade.

### 2. Fonte de dados (lógica pura testável)

- **`src/lib/feed.ts`**:
  - `buildContentFeed(items: ContentItem[]): FeedCard[]` — mapeia `CONTENT_HUB`
    para cards de feed (id, título, capa/emoji por tipo, descrição, `type`,
    `href` para o detalhe, flag `emBreve` reusando a regra existente
    `embedUrl === null && type !== 'relatorio' && type !== 'pesquisa'`). **Nunca
    inventar títulos** — mapear do array (regra do projeto).
  - `formatActivity(rows): ActivityItem[]` — dado badges/level-ups + display_names,
    formata frases de atividade ("Fulano alcançou o nível Especialista",
    "Fulano ganhou o badge X"), ordenadas por data desc, limitadas a N.
  - Testes: mapeamento de conteúdo (em breve/publicado), formatação de atividade,
    exclusão de quem não optou.

### 3. Camada de dados (server, I/O)

- **`src/lib/feed-data.ts`**: `getCommunityActivity(limit)` — lê `badges_earned`
  + `xp_events` (level-ups) juntando `users` (só `leaderboard_opt_in = true`,
  com `display_name`), retorna as linhas cruas para `formatActivity`.

### 4. Enforcement

- **Cards de conteúdo:** sem gate na listagem (é prévia); o gate vive no detalhe
  (Frente 2, já feito). Item "em breve" mostra selo, não link.
- **Strip de comunidade:** se `resolveAccess !== "advanced"` → renderiza
  `<ContentGate reason="gated" title="Feed da comunidade" nextPath="/feed" />`
  no lugar da atividade. Advanced vê a atividade real.

### 5. UI

- Timeline responsiva (cards empilhados). Reusa componentes de card/badge
  existentes (`GlassCard`, `CategoryBadge`) onde couber. CSS no escopo da página
  (Tailwind, como as páginas app). Link no header/menu para `/feed`.

## Casos de borda

- **Deslogado:** vê prévias de conteúdo + convite; sem strip de comunidade.
- **Logado sem passe (view):** prévias + gate no strip de comunidade + gate no
  consumo (Frente 2).
- **Advanced:** feed completo (prévias + comunidade + consumo liberado no detalhe).
- **Comunidade vazia / ninguém opt-in:** strip some (sem estado vazio ruidoso).
- **Item "em breve":** selo, sem "ler mais" ativo.

## Verificação

- Lógica pura (`buildContentFeed`, `formatActivity`) → testes Vitest.
- `tsc` 0 + `npm run test`. Visual: rodar o app e conferir `/feed` nos 3 estados
  (deslogado, view, advanced) — com dados de teste (SQL) para a comunidade.

## Dependências

Login (✅), entitlement/`ContentGate` (✅), gamificação (`badges_earned`,
`xp_events`, `users.display_name`/`leaderboard_opt_in`) (✅). **Sem migration nova**
no MVP.
