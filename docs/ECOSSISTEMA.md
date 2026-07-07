# 🧠 Ecossistema — Matriz Central

> **Este é o ponto de entrada de contexto.** Leia-o primeiro ao iniciar uma sessão.

## 🧭 Comece aqui (regras de navegação)

- Leia este hub e **siga apenas os links necessários** para a tarefa atual. Não abra tudo — abrir sob demanda economiza tokens.
- Cada fato tem **um lugar canônico** (indicado abaixo). Ao precisar de um detalhe, **confirme no arquivo linkado** em vez de supor — isso evita alucinação.
- Ordem recomendada num início do zero: este hub → `CLAUDE.md` → o spec da fase atual → o código fonte-de-verdade.

## 📊 Status atual

- **No ar (master, GitHub):** landing v2 completa — hero (esfera ASCII + pixel bg), Seção 2 "método" (`SystemSection`), Seção 3 "experiência" (`ContentLibrarySection`), footer institucional, páginas `/sobre` e `/legal/{privacidade,termos}`, newsletter.
- **Repo:** https://github.com/limajeferson/matrizcentral · branch `master` · checkpoint mais recente: tag `checkpoint-footer-institucional`.
- **Bloqueios para ir ao ar no domínio:**
  1. Aplicar a migration `supabase/migrations/0011_newsletter_subscribers.sql` no Supabase (senão `/api/newsletter` retorna 500).
  2. Configurar as env vars na hospedagem (ver [`.env.example`](../.env.example)).
  3. Deploy + apontar o domínio (comprado).

## 🗺️ Mapa neural (leia quando…)

**Produto & Visão**
- [`CLAUDE.md`](../CLAUDE.md) — regras do projeto; leia sempre no início.
- [`descricao/VERSAO-CONCISA.md`](../descricao/VERSAO-CONCISA.md) — pitch curto do produto.
- [`descricao/VERSAO-COMPLETA.md`](../descricao/VERSAO-COMPLETA.md) — visão completa.
- [`contextocentral.md`](../contextocentral.md) — contexto de negócio consolidado.

**Arquitetura**
- [`arquitetura-1/`](../arquitetura-1/) — arquitetura técnica: triagem, perfis/roadmaps, reembolso, e-mail, dashboard admin, integrações, timeline, KPIs.
- [`arquitetura-2/`](../arquitetura-2/) — gamificação: DB Supabase, XP, badges, níveis, certificados, leaderboard, desafios, notificações.

**Código fonte-de-verdade**
- [`src/data/content-hub.ts`](../src/data/content-hub.ts) — `CONTENT_HUB`, a biblioteca de conteúdo. **Nunca inventar títulos numa vitrine — mapear deste array.**
- [`src/lib/content-stats.ts`](../src/lib/content-stats.ts) — contagem de formatos.
- [`notebooklm/`](../notebooklm/) — assets brutos (áudios `.m4a`, vídeos `.mp4`, relatórios `.md`, apresentações). O que já está produzido vs "em breve".

**Specs & Plans (por fase)** — ver tabela em "Fases & Checkpoints".
- [`docs/superpowers/specs/`](superpowers/specs/) — o "porquê/o quê" de cada fase.
- [`docs/superpowers/plans/`](superpowers/plans/) — o "como" (passo a passo).

**Memória (fora do repo, persiste entre sessões)**
- `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md` — índice das memórias persistentes.

**Deploy**
- [`.env.example`](../.env.example) — env vars necessárias.
- [`supabase/migrations/`](../supabase/migrations/) — migrations (0001→0011).

## 🔀 Fases & Checkpoints

| Fase | Status | Spec / Plan | Commit / Tag |
|---|---|---|---|
| Fase 1 — triagem + /oferta redesign | ✅ | [spec](superpowers/specs/2026-07-05-oferta-redesign-design.md) | `3500f6a` |
| Hero — esfera ASCII + pixel bg | ✅ | (commits) | `a82266d` |
| Footer institucional — /sobre, /legal, newsletter | ✅ | [spec](superpowers/specs/2026-07-07-footer-institucional-design.md) | tag `checkpoint-footer-institucional` |
| Seções método × experiência + fascinations | ✅ | [spec](superpowers/specs/2026-07-07-secoes-metodo-experiencia-design.md) | `72b87a1` |
| Ecossistema de contexto (este) | ✅ | [spec](superpowers/specs/2026-07-07-ecossistema-contexto-design.md) | — |
| Deploy no domínio | 🔜 | — | — |

## ➡️ Fluxo de necessidades (próximos passos até o site no ar)

1. **Migration:** aplicar `0011_newsletter_subscribers.sql` no Supabase (`supabase db push` — projeto já linkado em `supabase/.temp/linked-project.json`).
2. **Env vars:** configurar na hospedagem as chaves de [`.env.example`](../.env.example).
3. **Deploy:** Vercel é o caminho natural para Next.js. `npm run build` só passa com as env vars presentes (por causa de `src/lib/stripe.ts`, que instancia o Stripe no topo do módulo).
4. **Domínio:** apontar o domínio comprado para o deploy.

---

_Ao concluir uma nova fase, adicione uma linha em "Fases & Checkpoints" e atualize "Status atual"._
