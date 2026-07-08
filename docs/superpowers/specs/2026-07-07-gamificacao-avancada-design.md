# Gamificação Avançada — Design

## Contexto

O produto hoje já rastreia XP (`xp_events`) e progresso de roadmap (`roadmap_progress`), mas não tem níveis, badges, certificado, leaderboard, desafios ou notificações — a visão de "plataforma gamificada" do `CLAUDE.md` ainda não existe em código. Existe um documento de arquitetura antigo (`arquitetura-2/`) que assume um modelo com login/sessão de usuário; o produto real usa **acesso por token** (sem conta/senha), então os conceitos abaixo adaptam aquela visão ao schema real.

Peças, da mais simples à mais complexa: **Níveis → Badges → Certificado → Leaderboard → Desafios → Notificações**.

## Decisões técnicas

### 0. Fundação compartilhada
- `users.total_xp` já existe na tabela mas não é mantido em sincronia (o dashboard soma `xp_events` a cada request). Migration nova adiciona um **trigger** em `xp_events` (AFTER INSERT) que incrementa `users.total_xp` — necessário pro leaderboard não precisar agregar toda a tabela a cada leitura.
- `src/types/index.ts` ganha as tabelas novas (`badges_earned`, `certificates`, `challenge_claims`) e os campos novos em `users`.

### 1. Níveis
- Config estática `src/data/levels.ts`: lista `{level, name, requiredXp}` (1 Aprendiz/0, 2 Iniciado/500, 3 Praticante/1000, 4 Especialista/2000, 5 Mestre/4000).
- `src/lib/levels.ts`: função pura `getLevelProgress(totalXp)` → `{level, name, xpIntoLevel, xpToNext, nextLevelName}`. Sem tabela nova — deriva de `total_xp`.
- Dashboard: badge de XP vira "Nível X — Nome" + barra de progresso até o próximo nível.

### 2. Badges / Conquistas
- Catálogo em código `src/data/badges.ts`: `{id, name, description, icon (emoji), rarity, condition}`, onde `condition` é uma união tipada (`xp_total`, `content_type_count`, `roadmap_stage`, `quiz_validacao_passed`, `purchase_count`).
- `src/lib/badges.ts`: função pura `evaluateBadges(stats) -> badgeId[]` dado um snapshot de stats do usuário. Testável sem banco.
- Tabela nova `badges_earned (user_id, badge_id, earned_at)`, unique `(user_id, badge_id)`.
- `src/lib/grant-badges.ts`: helper server-side que monta o `stats` via queries Supabase, chama `evaluateBadges`, e insere (idempotente, `ON CONFLICT DO NOTHING`) os badges novos. Chamado a partir dos pontos que já concedem XP (`/api/quiz`, `content-xp.ts`, `/api/roadmap`).
- Dashboard: prateleira de badges conquistados + "silhueta" dos ainda não conquistados.

### 3. Certificado verificável
- Tabela nova `certificates (id, user_id, certificate_type, reference_id, title, issued_at, verification_code unique)`.
- Emissão automática quando o estágio `missao_final` do roadmap é concluído **e** o quiz de validação foi aprovado (reaproveita os eventos já existentes, sem nova UI de admin).
- **Sem geração de PDF server-side** (custo zero, zero deps novas): página `/dashboard/[token]/certificado` com CSS `@media print` para o usuário salvar como PDF pelo navegador.
- Página pública `/certificado/[code]` (sem token, sem e-mail exposto) mostra só título, perfil/trilha e data de emissão — verificação de autenticidade sem vazar dado pessoal.

### 4. Leaderboard
- Sem leaderboard público por padrão: precisa de **opt-in** (não há nome de usuário hoje, só e-mail). Migration adiciona `users.display_name` (nullable) e `users.leaderboard_opt_in` (default false).
- Toggle + campo de nome em `/dashboard/[token]/ranking`, via API nova `PATCH /api/leaderboard/opt-in`.
- Ranking usa `users.total_xp` (mantido pelo trigger da fundação) ordenado desc, só quem tem opt-in — top 20 + posição do usuário atual (mesmo sem opt-in, aparece como "Você" anônimo).

### 5. Desafios automáticos
- Sem infra de cron (custo zero): desafio da semana é **determinístico**, calculado a partir do número da semana ISO (`src/data/challenges.ts` + `src/lib/challenges.ts`, rotação por `weekNumber % challenges.length`).
- Progresso é calculado on-the-fly a partir de `xp_events`/`content_completions` dentro da janela da semana corrente — não precisa de tabela de progresso.
- Tabela nova `challenge_claims (user_id, week_key, challenge_id, claimed_at)`, unique `(user_id, week_key)` — só pra evitar reivindicar o XP bônus duas vezes.
- Widget no dashboard: "Desafio da Semana" com progresso e botão de resgatar quando completo.

### 6. Notificações
- Escopo v1 **só e-mail** (reaproveita Brevo já integrado), e só para os dois momentos de maior valor: **level up** e **certificado emitido**. Badges e desafios ficam só in-app (evita fadiga de inbox) — pode expandir depois.
- Sem sistema de notificação in-app persistente nesta fase (YAGNI) — o próprio dashboard já mostra o estado atual (nível, badges, certificados) a cada visita.

## Fora de escopo (YAGNI)
- Painel admin para criar/editar badges ou desafios manualmente (catálogo fica em código).
- PDF gerado no servidor.
- Notificação in-app com histórico/marcação de lido.
- Leaderboard por perfil/segmento (só ranking geral).
