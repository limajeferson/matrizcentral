# Programa — Lançamento Final

> Guarda-chuva que sequencia as frentes finais até a "versão final" da Matriz
> Central. Decidido no brainstorm de 2026-07-16. **Escopo (decisão do usuário):**
> deixar **tudo que o Claude controla pronto, polido e no ar**; encher a
> biblioteca com o conteúdo de **texto** possível; isolar o genuinamente externo
> como hand-off. **Mídia (podcasts/vídeos):** o Claude gera os audio/video
> overviews no NotebookLM do usuário e organiza; o usuário sobe no Spotify/YouTube
> e devolve as URLs; o Claude pluga os `embedUrl`.

**Método (entrega padronizada):** cada trilha é uma frente com `spec-*.md` +
`plano-*.md`, executada via `subagent-driven-development` (commit por item, gate
`tsc`+`test`+`lint`, revisão por task + revisão final opus, deploy, `ESTADO-ATUAL`
atualizado). Fonte de verdade do andamento: [`../../ESTADO-ATUAL.md`](../../ESTADO-ATUAL.md).

**Status:** Trilha A parcial (Brevo ✅, Stripe live pendente com o usuário) e
Trilha B completa e no ar; Trilhas C–G planejadas. **Bloqueada agora** pela
frente fora-de-fila **leitor-protegido** (construída, não pushada) — ver
`## Próximo passo` abaixo.

## Próximo passo

1. **Destravar a frente [leitor-protegido](../leitor-protegido/README.md)**
   primeiro: aplicar a migration `0028`, auditar `purchases` legadas e fazer a
   verificação visual (os 3 bloqueadores estão detalhados no bloco 🚨 de
   [`../../ESTADO-ATUAL.md`](../../ESTADO-ATUAL.md)) — só depois dar `git push`.
2. **Então seguir a fila deste programa** pela **Trilha C (dark-aware)**, a
   próxima trilha planejada (ver tabela abaixo).

## Trilhas (ordem por dependência/risco)

| # | Trilha | Dono | Status | Docs |
|---|--------|------|--------|------|
| A | Go-live de receita (Stripe live, BREVO no Vercel) | **Usuário** (externo) | 🔄 **BREVO ✓ resolvido e verificado** (delivered em prod 2026-07-16); **Stripe live pendente** (verificação de empresa) | hand-off |
| B | **Segurança do dinheiro** (reembolso→revoga, XP dedup, rate limit, validações, testes do caminho pago) | Claude | ✅ **COMPLETA e no ar** (6/6, revisão final Ready-to-merge; migrations 0025/0026 aplicadas; 268 testes **no fechamento da trilha** — hoje a suíte tem 322) | [spec-B](spec-B-seguranca-dinheiro.md) · [plano-B](plano-B-seguranca-dinheiro.md) |
| C | Dark-aware (27 arquivos; blog force-light + logado→tokens; glass-card cascateia) | Claude | 📐 spec+plano prontos — **próxima** | [spec-C](spec-C-dark-aware.md) · [plano-C](plano-C-dark-aware.md) |
| D | Design v2 Frente 5 (Fórum: respostas aninhadas `parent_reply_id`) | Claude | 📐 spec+plano prontos | [spec-D](spec-D-forum.md) · plano-D |
| E | Conteúdo (texto agora; mídia via NotebookLM→hand-off) | Claude + Usuário | 📐 spec+plano prontos (contínuo, paralelo) | [spec-E](spec-E-conteudo.md) · plano-E |
| F | UX / a11y / CX polish (+ herdados nunca fechados) | Claude (+ RightSidebar do usuário) | 📐 spec+plano prontos | [spec-F](spec-F-polish.md) · plano-F |
| G | Tech-debt / limpeza (SP2, resolveTokenRow DRY, tiebreak, dead code) | Claude | 📐 spec+plano prontos | [spec-G](spec-G-techdebt.md) · plano-G |

**Numeração de migrations do programa:** `0025_xp_dedup` (B) · `0026_waitlist_unique`
(B) · `0027_forum_nested_replies` (D). Aplicadas juntas no SQL Editor antes de pushar.
| — | 🔍 **Auditoria final** + dogfooding da jornada | Claude | 🔜 ao fim | — |

## Hand-offs externos (rastreados, não bloqueiam o Claude)

- [ ] **Stripe:** verificação de empresa → chaves live → recriar produtos live + webhook live (Claude guia/roteiriza a virada).
- [x] **BREVO_API_KEY no Vercel:** usuário colou o valor válido; **resolvido e verificado ao vivo em 2026-07-16** (evento `delivered` em produção).
- [ ] **Upload de mídia:** usuário sobe no Spotify/YouTube o que o Claude gerar; devolve URLs.

### 📻 Insumo da Trilha E já existe (registrado em 2026-07-20)

O usuário já rodou o NotebookLM sobre 26 fontes e **o plano de conteúdo está
pronto** — 5 artefatos recomendados, com tema e foco definidos:

| # | Formato | Tema |
|---|---|---|
| 1 | Relatório | A Fronteira Open Source: Kimi K3 vs Modelos Proprietários (2026) |
| 2 | Podcast (audio overview) | Vibe Coding e o Fim do Programador Tradicional? |
| 3 | Vídeo (video overview) | A Máquina de Fazer Dinheiro com IA Local |
| 4 | Slides | Homelab Definitivo: Privacidade e Produtividade Offline |
| 5 | Infográfico | A Anatomia da Otimização de Tokens (PTC) |

O diálogo completo está em **`texto-para-salvar-prompt-temporario.md`** (raiz,
não versionado — é arquivo local do usuário). **Ao executar a Trilha E, ler esse
arquivo primeiro**: o artefato 1 (relatório) é texto e o Claude consegue produzir/
integrar direto; 2 e 3 dependem do upload do usuário (hand-off); 4 e 5 precisam de
decisão sobre onde entram na plataforma (não há vitrine para slides/infográfico
hoje — avaliar na spec-E).

## 📌 Rastreadas, sem dono

Pendências reais que nenhuma trilha/task cobre hoje — registradas aqui para não
se perderem. Não são zumbis (não foram resolvidas); são órfãs (sem plano).

- **Histórico de migrations do Supabase divergente** — `supabase db push` falha
  desde 2026-07-12 (remoto usa timestamp, local usa `000N_`). Registrado em
  [`docs/ESTADO-ATUAL.md`](../../ESTADO-ATUAL.md) ("Pendências / decisões em
  aberto"); nenhuma trilha B–G tem task de reconciliação — hoje contorna-se
  aplicando migrations via SQL Editor no navegador.
- **Copy da `/oferta` (Crítico #4)** — o card Start/Advanced precisa de revisão
  de texto (posicionamento/marca) pelo próprio usuário. Registrado em
  [hardening-criticos/README.md](../hardening-criticos/README.md) (item "#4")
  e no `ESTADO-ATUAL.md`. Hand-off sem prazo — é decisão de copy do usuário, não
  task de código do Claude.
- **APIs de mutação não-gated** (`content/complete`, `pesquisa/responder`,
  `roadmap/complete` concedem XP sem checar entitlement) — defesa em
  profundidade. Registrado como "minor rastreado" em
  [assinaturas/README.md](../assinaturas/README.md) e no ledger
  `.superpowers/sdd/progress.md`; nenhuma task de B–G fecha especificamente esse
  gap (a Trilha B fechou dedup de XP, não gating de quem pode chamar a rota).
- **C3 do leitor-protegido** — `dashboard/[token]/conteudo/[id]/page.tsx`
  entrega o markdown inteiro (`<Markdown source={body}/>`) numa resposta só, por
  token, sem registrar leitura — contradiz o invariante "markdown bruto nunca
  vai inteiro ao cliente" da frente leitor-protegido. Registrado como "Decisão
  aberta" em [leitor-protegido/README.md](../leitor-protegido/README.md).
  O **`plano-G-techdebt.md` (Task G1) não menciona esse arquivo** — precisa
  entrar no escopo da G1 (aposentar a triagem por token também deveria tocar
  esse caminho) ou virar task própria.
- **I4 do leitor-protegido** — o resgate (`/entrar/resgate`) não é uso único
  como a spec pede; como o token do dashboard vale 365 dias, uma URL vazada
  pode virar fábrica de sessões de 30 dias por até um ano. Decisão consciente
  registrada em `.superpowers/sdd/progress.md`; a spec já aponta o fechamento
  natural ("fechar quando a Trilha G aposentar o fluxo de token", ver
  `leitor-protegido/spec.md`), mas isso não está escrito como task na
  `plano-G-techdebt.md` hoje.

## Não-objetivos

- Nada que dependa de conta/credencial do usuário é feito pelo Claude (upload
  público, entrada de chaves).
- Custo zero mantido (sem dep npm nova, sem hosting pago; mídia = embeds).

## ✅ Revalidação dos planos (2026-07-20)

Todos os planos C–G foram reconferidos **contra o código real** (dois sweeps).
Veredito: **nenhum plano invalidado**; correções aplicadas nos arquivos:

- **C3:** caminhos errados — as subpáginas do dashboard vivem sob
  `dashboard/[token]/`, não `dashboard/`. Corrigido.
- **F1/F3:** caminhos dos componentes (`src/components/app/feed|stories/`). Corrigido.
- **F4:** ressalva nova — `text-white` sobre botão violeta **não** vira token.
- **F5:** `Header.tsx`/`Footer.tsx` **ainda são usados** por `/oferta` → repontar,
  não remover. +2 âncoras relativas que o plano não listava.
- **F8:** parcialmente feito na Trilha B (`94384d7`); resta o `finally`
  (`loading` trava em exceção de rede), o `<form>` e o label.
- **G4:** o webhook da Stripe é um 14º usuário de `isTokenExpired`, **fora** da
  migração de propósito (escreve tokens expirados; o helper os recusaria).
- **D/E/G:** batem integralmente. `0027` confirmado como próximo número livre;
  `parent_reply_id` não existe; CSV do 3º relatório localizado em
  `notebooklm/textos/`; todos os itens de tech-debt do G ainda presentes.

## ✅ Decisão da garantia — RESOLVIDA em 2026-07-20 (substitui o que havia aqui)

> A decisão antiga ("garantia = **condicional de 7 dias**", com smart gates
> negando reembolso a quem fez triagem/download) **FOI REVOGADA**. Pesquisa
> jurídica mostrou que ela é provavelmente **ilegal**: o art. 49 do CDC é norma
> de ordem pública e os 7 dias são **irrenunciáveis** — condicioná-los tende a
> ser nulo pelo art. 51, I. **Não implemente a versão antiga.**

**A política vigente é esta** — fonte de verdade:
[`../leitor-protegido/politica-reembolso.md`](../leitor-protegido/politica-reembolso.md).

| Janela | Regra |
|---|---|
| **Dias 1–7** | **Incondicional.** Integral, sem justificativa, sem análise. Direito legal. |
| **Dias 8–30** | **Garantia comercial**, condicionada a consumo comprovado. |
| Dia 31+ | Encerrado. |

- Pode-se anunciar **"30 dias de garantia"**, com qualificador **visível no ponto
  da promessa** (não só no T&C).
- **Ausência de registro de leitura NÃO é prova de não-consumo** (regra vinculante,
  ver a política) — o livro-razão é evidência corroborante, nunca portão único.
- A trava contra má-fé é **operacional** (revogação real via leitor + bloqueio de
  recompra por identidade), **não contratual**.

### Impacto na Task F6 (reescrever antes de executar)

O [`plano-F-polish.md`](plano-F-polish.md) ainda descreve a F6 como "alinhar tudo
a 7 dias condicionais". **Isso está desatualizado.** A F6 deve passar a:
- `refundWindowExpiry` **30 → 30** (a janela comercial é 30; **não** reduzir a 7);
- reescrever `arquitetura-1/parte5-…smart-gates.md` (descreve política revogada);
- termos com **as duas janelas separadas** e o qualificador visível;
- criar o link "ver termos" na `/oferta` (hoje é texto puro);
- e-mail "ebook"→"acesso".
- ⚠️ **Revisão por advogado antes de publicar** + aplicar **só a compras novas**.

## Decisões travadas
- **Escopo:** tudo que o Claude controla, pronto e polido; mídia via NotebookLM→hand-off.
