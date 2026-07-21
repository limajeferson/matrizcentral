# Frente: Memória de Lições (EMG no fluxo de trabalho)

**Status:** ✅ concluída (2026-07-21).

Avaliação do paper *Experience Memory Graph* trazido pelo usuário → implementação
literal rejeitada (produto não tem agentes em runtime; ver `spec.md`), e a
arquitetura offline/runtime do paper aplicada ao processo: [`docs/LICOES.md`](../../LICOES.md)
(base por gatilho) + etapa 7 no [`PLAYBOOK-EXECUCAO.md`](../../PLAYBOOK-EXECUCAO.md)
(destilação ao fim de cada frente) + injeção de lições nos briefs de task.

- **EMG como conteúdo do produto** ("Loops vs Grafos") ficou como candidato da
  **Trilha E** — não executado aqui.
- ⚠️ O insumo anterior da Trilha E (diálogo NotebookLM das 26 fontes) foi
  sobrescrito no `texto-para-salvar-prompt-temporario.md` pela discussão do EMG;
  a tabela dos 5 artefatos sobrevive no README da lancamento-final. Ao rodar a
  Trilha E, pedir ao usuário para reexportar o diálogo, se ainda existir.
