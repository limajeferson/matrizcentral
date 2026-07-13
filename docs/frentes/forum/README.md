# Frente 4 — Fórum (portal de tópicos)

**Status:** ✅ **Código completo e revisado** (na master, `tsc` 0 / 158 testes).
Migration 0020 + `forum.ts` (puro) + `forum-data.ts` + rotas de escrita (sessão+
passe+validação) + páginas `/forum` e `/forum/[id]` + forms + links. **Revisão
final (sonnet): Ready to merge, sem Critical/Important.** Pendente: aplicar 0020 no
remoto + verificação visual (coordenação de runtime). Minors deferidos (fetch em
gated view; reply a topicId inexistente → 500).

MVP: `/forum` (lista de tópicos, prévia p/ todos) + `/forum/[id]` (thread). Criar
tópicos/responder exige **passe ativo** (Regular/Advanced); view/Start veem prévia
+ `ContentGate`. Escrita gated server-side (sessão + passe + validação nas rotas).
**Sem XP no MVP** (anti-farming). Decisões com autonomia, documentadas no spec.

Depende de: login (✅), entitlement/`resolveAccess`/`ContentGate` (✅). Migration nova `0020`.

## Próximo passo
Executar [`plano.md`](plano.md) (7 tasks) via `subagent-driven-development`.
