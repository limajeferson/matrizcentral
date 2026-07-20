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
atualizado). Fonte de verdade do andamento: [`../ESTADO-ATUAL.md`](../ESTADO-ATUAL.md).

## Trilhas (ordem por dependência/risco)

| # | Trilha | Dono | Status | Docs |
|---|--------|------|--------|------|
| A | Go-live de receita (Stripe live, BREVO no Vercel) | **Usuário** (externo) | 🔄 **BREVO ✓ resolvido e verificado** (delivered em prod 2026-07-16); **Stripe live pendente** (verificação de empresa) | hand-off |
| B | **Segurança do dinheiro** (reembolso→revoga, XP dedup, rate limit, validações, testes do caminho pago) | Claude | ✅ **COMPLETA e no ar** (6/6, revisão final Ready-to-merge; migrations 0025/0026 aplicadas; 268 testes) | [spec-B](spec-B-seguranca-dinheiro.md) · [plano-B](plano-B-seguranca-dinheiro.md) |
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
- [ ] **BREVO_API_KEY no Vercel:** usuário cola o valor válido (o Claude não digita credenciais); Claude verifica ao vivo.
- [ ] **Upload de mídia:** usuário sobe no Spotify/YouTube o que o Claude gerar; devolve URLs.

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

## ⚠️ Decisão aberta (bloqueia parte da F6)

**A garantia publicada e a implementada divergem** — termos dizem 7 dias
**incondicionais**, o código usa janela de **30 dias**, a política documenta
**30 dias com smart gates**. Apertar tudo para "7 condicionais" encurta a janela
e adiciona condições que compradores atuais não viram. As duas saídas estão
detalhadas no [`plano-F-polish.md`](plano-F-polish.md) (fim da Task F6) —
**precisa da escolha do usuário** antes de mexer em termos/copy.

## Decisões travadas

- **Garantia = condicional de 7 dias** (smart gates: janela + não-triagem +
  não-download). Alinhar código (`refundWindowExpiry` 30→7), doc da política
  (`arquitetura-1/parte5`), termos e copy a 7 dias — executado na **Trilha F (F6)**.
  ⚠️ **Revisitar à luz da divergência acima antes de executar.**
- **Escopo:** tudo que o Claude controla, pronto e polido; mídia via NotebookLM→hand-off.
