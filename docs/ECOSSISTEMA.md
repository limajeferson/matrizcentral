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

**Specs & Plans (por frente)** — ver lista em "Frentes já trabalhadas".
- [`docs/frentes/<slug>/spec.md`](frentes/) — o "porquê/o quê" de cada frente.
- [`docs/frentes/<slug>/plano*.md`](frentes/) — o "como" (passo a passo).

**Memória (fora do repo, persiste entre sessões)**
- `C:\Users\jefer\.claude\projects\C--Users-jefer-Documents-Projetos-matrizcentral\memory\MEMORY.md` — índice das memórias persistentes.

**Deploy**
- [`.env.example`](../.env.example) — env vars necessárias.
- [`supabase/migrations/`](../supabase/migrations/) — migrations (0001→0011).

## 🔀 Frentes já trabalhadas

Cada frente vive em `docs/frentes/<slug>/` com `spec.md` (o quê/porquê), `plano*.md` (o como) e `README.md` (status + próximo passo). **Ao retomar trabalho, abra o README da frente relevante antes de perguntar ao usuário o que já foi feito.**

- ✅ [fase-1-mvp](frentes/fase-1-mvp/README.md) — MVP: compra → triagem → dashboard → validação → XP
- ✅ [identidade-visual](frentes/identidade-visual/README.md) — paleta violeta + glassmorphism
- ✅ [landing-v2-enriquecimento](frentes/landing-v2-enriquecimento/README.md) — landing rica a partir do modelo-guia
- ✅ [triagem-democratizada](frentes/triagem-democratizada/README.md) — quiz ramificado, 8 perfis, sem jargão
- ✅ [landing-redesign-v3-dark](frentes/landing-redesign-v3-dark/README.md) — landing dark/violeta, hero + animações
- ✅ [visual-treatments](frentes/visual-treatments/README.md) — 6 tratamentos visuais (21st.dev)
- ✅ [polimento-landing-oferta](frentes/polimento-landing-oferta/README.md) — bugs de conversão + oferta
- ✅ [conteudo-conversao-hub](frentes/conteudo-conversao-hub/README.md) — reposicionamento multi-formato + seções método/experiência
- ✅ [footer-institucional](frentes/footer-institucional/README.md) — rodapé institucional + /sobre + /legal
- ✅ [ecossistema-documentacao](frentes/ecossistema-documentacao/README.md) — hub de contexto v1
- ✅ [gamificacao-avancada](frentes/gamificacao-avancada/README.md) — níveis, badges, certificado, leaderboard, desafios, notificações
- ✅ [feed-conteudo-recomendado](frentes/feed-conteudo-recomendado/README.md) — seção recomendada no hub de conteúdo
- ✅ [ecossistema-frentes](frentes/ecossistema-frentes/README.md) — este próprio reorganização (você está aqui)

## ➡️ Fluxo de necessidades (próximos passos até o site no ar)

1. **Migration:** aplicar `0011_newsletter_subscribers.sql` no Supabase (`supabase db push` — projeto já linkado em `supabase/.temp/linked-project.json`).
2. **Env vars:** configurar na hospedagem as chaves de [`.env.example`](../.env.example).
3. **Deploy:** Vercel é o caminho natural para Next.js. `npm run build` só passa com as env vars presentes (por causa de `src/lib/stripe.ts`, que instancia o Stripe no topo do módulo).
4. **Domínio:** apontar o domínio comprado para o deploy.

---

_Ao concluir uma nova frente: crie `docs/frentes/<slug>/README.md`, adicione uma linha nesta lista, e atualize "Status atual" se algo novo foi ao ar. Tudo no mesmo commit de finalização._
