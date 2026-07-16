# Frente 4 — Fórum (portal de tópicos)

**Status:** ✅ **Concluída** (na master, `tsc` 0 / 158 testes na época).
Migration 0020 **aplicada em produção (2026-07-13; `/forum` respondeu 200)** +
`forum.ts` (puro) + `forum-data.ts` + rotas de escrita (sessão+passe+validação)
+ páginas `/forum` e `/forum/[id]` + forms + links. **Revisão final: Ready to
merge, sem Critical/Important.** Evolução futura: respostas aninhadas
(`parent_reply_id`) na **design v2 Frente 5**. Minors deferidos (fetch em
gated view; reply a topicId inexistente → 500).

MVP: `/forum` (lista de tópicos, prévia p/ todos) + `/forum/[id]` (thread). Criar
tópicos/responder exige **passe ativo** (Regular/Advanced); view/Start veem prévia
+ `ContentGate`. Escrita gated server-side (sessão + passe + validação nas rotas).
**Sem XP no MVP** (anti-farming). Decisões com autonomia, documentadas no spec.

Depende de: login (✅), entitlement/`resolveAccess`/`ContentGate` (✅). Migration nova `0020`.

## Próximo passo
Executar [`plano.md`](plano.md) (7 tasks) via `subagent-driven-development`.
