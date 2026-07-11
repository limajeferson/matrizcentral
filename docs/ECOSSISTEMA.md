# 🧠 Ecossistema — Matriz Central

> **Este é o ponto de entrada de contexto.** Leia-o primeiro ao iniciar uma sessão.

## 🧭 Comece aqui (regras de navegação)

- **Retomando trabalho / "continue de onde paramos"?** Leia [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md) — é o pino "você está aqui" (frente ativa + próxima ação + estado do git). Ele tem prioridade sobre este hub na retomada.
- Leia este hub e **siga apenas os links necessários** para a tarefa atual. Não abra tudo — abrir sob demanda economiza tokens.
- Cada fato tem **um lugar canônico** (indicado abaixo). Ao precisar de um detalhe, **confirme no arquivo linkado** em vez de supor — isso evita alucinação.
- Ordem recomendada num início do zero: [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md) → este hub → `CLAUDE.md` → o README da frente ativa → o código fonte-de-verdade.

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
- ✅ [hardening-criticos](frentes/hardening-criticos/README.md) — auditoria completa (5 subagentes) + conserto dos 4 críticos (certificado forjável, paga-e-não-recebe, certificado inalcançável, promessa desalinhada). Na master, verificado.

### 🔄 / 🔜 Roadmap por frentes (receita primeiro)

> Fonte de verdade do andamento: [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md).

- 🔄 [login-real](frentes/login-real/README.md) — **código completo e revisado** (na master, `tsc` 0 / 118 testes): magic link **próprio** (zero deps, `crypto` nativo — reabriu a decisão "Supabase Auth"), token+login convivem, sessão revogável, `ContentGate`. **Pendente aceitação ao vivo** (aplicar migrations 0015/0016 + E2E do e-mail real + decidir landing dinâmica).
- 🔜 Assinaturas (Regular/Advanced) + e-mails de ciclo/CRM — depende de login-real.
- 🔜 Feed central (rede social de IA) — depende de login-real.
- 🔜 Fórum (portal de tópicos) — depende de login-real.
- 🔜 Blog + Marketing (calendário/sazonalidade/funil).
- 🔜 Suporte/autoatendimento + CRM/pós-venda.

> A frente antiga [comunidade-identidade-feed](frentes/comunidade-identidade-feed/README.md) foi **desmembrada**: a fundação virou `login-real`; feed e fórum são frentes próprias acima.

## ➡️ Fluxo de necessidades (próximos passos até o site no ar)

1. **Migration:** aplicar `0011_newsletter_subscribers.sql` no Supabase (`supabase db push` — projeto já linkado em `supabase/.temp/linked-project.json`).
2. **Env vars:** configurar na hospedagem as chaves de [`.env.example`](../.env.example).
3. **Deploy:** Vercel é o caminho natural para Next.js. `npm run build` só passa com as env vars presentes (por causa de `src/lib/stripe.ts`, que instancia o Stripe no topo do módulo).
4. **Domínio:** apontar o domínio comprado para o deploy.

---

_Ao concluir uma nova frente: crie `docs/frentes/<slug>/README.md`, adicione uma linha nesta lista, e atualize "Status atual" se algo novo foi ao ar. Tudo no mesmo commit de finalização._
