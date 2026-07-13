# Frente 3 — Feed (rede social de IA)

**Status:** 🔄 Spec + plano prontos ([`spec.md`](spec.md) · [`plano.md`](plano.md)) — em execução (SDD).

MVP: página `/feed` (timeline de descoberta) = cards de conteúdo (prévia p/ todos,
"ler mais" → detalhe já gated pela Frente 2) + strip de atividade da comunidade
(badges recentes de usuários opt-in) **gated a Advanced**. Custo zero, sem migration.
Decisões tomadas com autonomia (documentadas no spec). UGC/curtidas/comentários = v2.

Depende de: login (✅), entitlement/`ContentGate` (✅), gamificação (✅).

## Próximo passo
Executar [`plano.md`](plano.md) (5 tasks) via `subagent-driven-development`.
