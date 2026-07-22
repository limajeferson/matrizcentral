# Frente: Segmentação de Público (3 perfis) — PEDIDO DO USUÁRIO

> **Status: 🎯 engatilhada — brainstorm é o primeiro passo da próxima sessão.**
> Origem: `proxima-tarefa.md` (arquivo local do usuário, não versionado —
> conteúdo preservado aqui verbatim em 2026-07-21 para não se perder, conforme
> lição do insumo da Trilha E). Método pedido pelo usuário no próprio texto:
> `brainstorming` → `writing-plans` → `subagent-driven-development`, com
> autonomia e poder de decisão/expansão delegados ao Claude.

## Pedido original (verbatim)

> quero aplicar no site um contexto para facilitar o entendimento e a separação
> de público, e quero entender se isso afeta a apresentação no feed ou se em
> algum outro ponto de marketing, mas sei que afeta CRM e como trabalhamos a
> separação de público para melhorar o funil e a experiência dos usuários. tenho
> em mente 3 modelos, e você tem autonomia e poder de decisão, mudança ou
> expansão, pode alterar como entender melhor, utilize agentes, skills e plugins
> que decidir ser necessário ou agregador, para identificar melhorias. Os
> modelos são:
>
> **avançados** — com recursos disponíveis para investimentos robustos, que
> podem escolher a melhor LLM, e vamos oferecer focado primeiro no modelo mais
> performático, segundo como ele definir e pretende utilizar, assumindo que ele
> pode montar a melhor infraestrutura para uma LLM Local ou em VPS robusta.
>
> **equilibrados** — que têm foco total em sua necessidade, usuários que são
> decididos e sabem o que pretendem, qual o projeto que têm em mente e assim
> podemos direcionar a melhor IA para o modelo que ele poderá utilizar; vamos
> deixar estruturas prontas, para a triagem separar e direcionar para o/os
> melhores modelos para o formato dele.
>
> **limitado** — usuário que tem recurso limitado; vamos projetar baseado no que
> ele já possui de infraestrutura — um smartphone, um notebook, um terminal sem
> placa de vídeo ou com placa de vídeo — analisando o que ele apresentar ser sua
> infraestrutura para entregar o melhor modelo que possa rodar sem gerar
> transtornos.
>
> Pensando nisso, utilize o `writing-plans` para planejar como aplicar e quais
> frentes e setores do projeto precisam ser alterados, refeitos ou redesenhados,
> sabendo que a experiência, interface e jornada dos usuários devem ser a melhor
> possível; além do que foi pedido, tenha a iniciativa para criar frentes e
> etapas que ajudarão a melhorar o projeto e que deixei passar sem lembrar ou
> ter atenção; entenda como ser bom com o design e com o marketing, para o
> cliente se sentir num ambiente perfeito. Estude melhorias e aplique utilizando
> o `subagent-driven-development`, garantindo a melhor execução.

## Contexto que o brainstorm DEVE levantar antes de propor (aterrissagem no código real)

- **Já existe um sistema de perfis/triagem** — o brainstorm parte dele, não do
  zero: `users.profile_id`/`diagnosed_at` (migration 0022, SP1), o quiz/triagem
  (`src/data/quiz-llm-local.ts`), o `DiagnosticoInline` no `/feed` e a rota
  `POST /api/diagnostico`. Mapear como os 3 perfis novos se relacionam com os
  perfis atuais do diagnóstico (substituem? refinam? são um eixo ortogonal
  de recursos/infra?).
- **CRM/funil:** `docs/frentes/suporte-crm/crm.md` (onboarding, retenção,
  win-back) e os e-mails de ciclo (`computeDueEmails`) — onde a segmentação
  entra nos e-mails e na oferta (`/oferta`, cupom de upgrade).
- **Feed/apresentação:** o feed já personaliza por diagnóstico (bloco de
  boas-vindas, trilha recomendada) — avaliar o quanto a segmentação muda a
  vitrine (`CONTENT_HUB` não tem eixo de "custo de infra" hoje).
- **Marketing/landing:** `docs/frentes/blog-marketing/marketing.md` (funil) e a
  landing v2 — se/onde o público se auto-identifica antes do checkout.
- **Restrições permanentes:** custo zero (sem dep nova), conteúdo em pt-BR,
  gate `tsc`+test+lint+visual, lições de `spec` e `visual` do
  [`../../LICOES.md`](../../LICOES.md) injetadas nos briefs.

## Ordem acordada (handoff 2026-07-21)

1. **Brainstorm desta frente** (`superpowers:brainstorming`) — é a
   próxima-tarefa nomeada pelo usuário; decisões de escopo de produto que
   surgirem são do usuário, o resto o Claude decide.
2. Spec em `spec.md` desta pasta → `writing-plans` → plano(s) → SDD.
3. **Trilha C (dark-aware) segue na fila** logo depois (roteiro completo no
   `ESTADO-ATUAL.md`) — ela é mecânica/visual e não conflita com o desenho da
   segmentação; se o brainstorm concluir que telas do feed/marketing serão
   redesenhadas, avaliar na hora se C1/C2 antecipam ou esperam.
