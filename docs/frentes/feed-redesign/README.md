# Frente — Redesign do Feed (baseline)

**Status:** ✅ concluída, revisada (opus = Ready to merge) e deployada.

Baseline do feed logado a partir do design do usuário no Claude Design (template
"Community Feed"), adotando a **estrutura** com a **marca da Matriz** (violeta, não
rosa). 4 sub-frentes via subagent-driven-development:

- **A** — tema **dark padrão** (só área logada, `ThemeProvider` caseiro anti-flash)
  + `UserMenu` (nível/XP · toggle tema · conta · sair).
- **B** — `/feed` vira **shell de 3 colunas** theme-aware com dados reais.
- **C** — card de perfil flutuante **minimizado** (pill que expande).
- **D** — **emojis → ícones SVG** em todo o site + e-mails; `icon-map.md`.

- **Detalhe:** [`spec.md`](spec.md) · [`plano.md`](plano.md) · [`icon-map.md`](icon-map.md).
- **Próximo passo:** os itens de backlog de design evoluíram para o programa
  [`design-v2`](../design-v2/README.md).
