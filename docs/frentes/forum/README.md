# Frente 4 — Fórum (portal de tópicos)

**Status:** 🔄 Spec + plano prontos ([`spec.md`](spec.md) · [`plano.md`](plano.md)) — em execução (SDD).

MVP: `/forum` (lista de tópicos, prévia p/ todos) + `/forum/[id]` (thread). Criar
tópicos/responder exige **passe ativo** (Regular/Advanced); view/Start veem prévia
+ `ContentGate`. Escrita gated server-side (sessão + passe + validação nas rotas).
**Sem XP no MVP** (anti-farming). Decisões com autonomia, documentadas no spec.

Depende de: login (✅), entitlement/`resolveAccess`/`ContentGate` (✅). Migration nova `0020`.

## Próximo passo
Executar [`plano.md`](plano.md) (7 tasks) via `subagent-driven-development`.
