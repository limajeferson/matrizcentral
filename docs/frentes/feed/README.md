# Frente 3 — Feed (rede social de IA)

**Status:** ✅ **Código completo e revisado** (na master, `tsc` 0 / 149 testes).
`feed.ts` (puro, TDD) + `feed-data.ts` + `/feed` page + link no header (anônimo) e
no `/conta`. Revisão final (sonnet) OK após 2 fixes (link anônimo; strip=badges,
níveis v2). **Pendente:** verificação visual dos 3 estados de `/feed` (deslogado/
view/advanced) — com dado de comunidade de teste; entra na coordenação de runtime.
Minors rastreados no ledger.

MVP: página `/feed` (timeline de descoberta) = cards de conteúdo (prévia p/ todos,
"ler mais" → detalhe já gated pela Frente 2) + strip de atividade da comunidade
(badges recentes de usuários opt-in) **gated a Advanced**. Custo zero, sem migration.
Decisões tomadas com autonomia (documentadas no spec). UGC/curtidas/comentários = v2.

Depende de: login (✅), entitlement/`ContentGate` (✅), gamificação (✅).

## Próximo passo
Nada a executar — frente concluída (plano já executado). Pendência real
restante: verificação visual dos 3 estados de `/feed` (deslogado/view/advanced),
que segue coordenada com o restante da checagem de runtime.
