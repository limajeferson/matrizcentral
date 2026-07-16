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
| B | **Segurança do dinheiro** (reembolso→revoga, XP dedup, rate limit, validações, testes do caminho pago) | Claude | 🔄 **em execução (2/6 tasks)** | [spec-B](spec-B-seguranca-dinheiro.md) · [plano-B](plano-B-seguranca-dinheiro.md) |
| C | Dark-aware (27 arquivos; blog force-light + logado→tokens; glass-card cascateia) | Claude | 📐 spec+plano prontos | [spec-C](spec-C-dark-aware.md) · plano-C |
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
