# Kit de Ecossistema para o DRAGUM

**Status:** ✅ Concluída (2026-07-23)

## O que é

Exportação **destilada** do ecossistema (dieta de tokens, arquitetura de docs,
neuroconexão, método, autonomia) para o projeto novo DRAGUM. Spec:
[`spec.md`](spec.md) · Plano: [`plano.md`](plano.md).

**Os entregáveis vivem FORA deste repo**, em `C:\Users\Grazi\Claude\Projects\dragum\`:

- `ecossistema-matrizcentral/` — 6 guias + LEIA-ME hub + 8 templates (o método maduro).
- `ecossistema-promobest/` — 3 arquivos + LEIA-ME (a origem, destilada do clone do GitHub).
- `COMECE-AQUI.md` — prompt de missão da primeira sessão do dragum (herdar →
  instanciar → NotebookLM via Chrome → spec destilada com 1 checkpoint → writing-plans).

## Próximo passo

Nenhum neste repo. O próximo passo é **do usuário, na pasta dragum**: abrir o
Claude Code lá e dizer "leia o COMECE-AQUI.md e execute".

## Decisões já travadas

- Só destilado — sem cópias fiéis de arquivos dos projetos.
- Fluxo da sessão nova: spec destilada + 1 checkpoint de aprovação (sem
  brainstorming longo), depois `/superpowers:writing-plans`.
- Verificações passaram: grep de contaminação global limpo (0 hits) + simulação
  de bootstrap (5 respostas fecham lendo só COMECE-AQUI + LEIA-ME) + clone do
  promobest removido do scratchpad.
