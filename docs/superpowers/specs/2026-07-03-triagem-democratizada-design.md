# Matriz Central — Fase A: Triagem Democratizada + Copy para Todos os Públicos

Data: 2026-07-03
Status: Aprovado para plano de implementação

## Contexto

O usuário definiu a visão de longo prazo: ser um **hub / rede social de aprendizagem**,
referência nº 1 em ensino digital de IA no Brasil, vendendo para **todos os públicos**
(técnicos e não-técnicos), com equilíbrio entre entretenimento e aprendizado ("vício
bom") e conteúdo democratizado. A pesquisa de mercado consolidada está em
`docs/research/2026-07-03-pesquisa-consolidada.md` e fundamenta as decisões abaixo.

A visão foi decomposta em fases:
- **Fase A (este spec)** — Triagem democratizada + copy inclusiva
- Fase B — Hub de conteúdo (podcast, vídeos, relatórios — assets já em `notebooklm/`)
- Fase C — Camada social (perfil público "currículo vivo", comunidade, desafios)
- Fase D — Trilhas por objetivo com profundidade progressiva

## Problema

A triagem atual (20 perguntas) assume público técnico: a 1ª pergunta é "Qual é sua
principal linguagem de programação?" — excludente para a maioria dos compradores
potenciais. Os 6 perfis existentes são personas técnicas/executivas; faltam os públicos
"estudante/curioso" e "profissional não-técnico buscando produtividade" (que a pesquisa
aponta como o mercado de massa: "qual IA assinar ou usar grátis", "IA para meu dia a
dia"). A landing page também usa jargão ("LLMs", "tokens") sem tradução.

## Escopo da Fase A

1. **Dois perfis novos** (migration + seed + tipos):
   - `estudante_curioso` — "Explorador de IA": quer entender IA do zero, sem pressa e
     sem jargão. Ebook 2 grátis: NotebookLM + Obsidian (o mais acessível do catálogo).
     Roadmap com trilha introdutória (capítulos 0-1 do ebook, podcast, vídeos).
   - `profissional_produtividade` — "Profissional + IA": não programa, quer
     produtividade e saber qual IA assinar/usar grátis/ter local. Ebook 2 grátis:
     NotebookLM + Obsidian. Roadmap focado em escolha de modelo (assinar vs gratuito
     vs local) e fluxos pessoais de produtividade.
2. **Triagem ramificada e inclusiva** (reescrita de `quiz-triagem.ts` + suporte a
   ramificação):
   - Pergunta 1 = seletor de caminho: "O que te traz aqui?" (opções por objetivo:
     minha IA local / integrar IA no que construo / IA para meu negócio /
     produtividade pessoal / entender do zero / construir e vender com IA).
   - Pergunta 2 = relação com tecnologia: "Você programa?" com opção explícita e
     acolhedora "Não programo — sem problema, o quiz se adapta".
   - Perguntas técnicas (linguagem, terminal, hardware/GPU, deploy) ganham um campo
     `showIf` e **só aparecem** para quem indicou conhecimento técnico na pergunta 2.
     Perguntas não-técnicas equivalentes aparecem para o outro ramo (qual IA usa hoje,
     assinar vs grátis, uso pessoal vs negócio, tempo disponível, como prefere
     aprender — texto/áudio/vídeo, apetite por profundidade).
   - Total ~20 perguntas no banco, mas cada respondente vê ~12-14 (as do seu ramo +
     as comuns).
3. **Motor de ramificação** (`lib/quiz-branching.ts`, novo, com testes):
   - `visibleQuestions(questions, answers)` — filtra perguntas cujo `showIf` não é
     satisfeito pelas respostas já dadas. `showIf` = `{ questionId, optionIndexes }`
     (a pergunta aparece se a resposta à pergunta referenciada incluir um dos índices).
   - `scoreTriagem` continua como está (soma de pontos por perfil; perguntas não
     exibidas simplesmente não pontuam).
4. **Copy democratizada**:
   - Landing: hero e features sem jargão não traduzido ("ChatGPT particular" fica,
     "LLM" ganha tradução inline; badge deixa de ser "para devs" e vira "para quem
     quer dominar IA — programando ou não").
   - Página do quiz: texto de boas-vindas explicando que a triagem serve para
     personalizar o conteúdo, não para excluir ninguém.

## Fora de escopo (fases seguintes)

Hub de conteúdo (Fase B), camada social (Fase C), trilhas completas por objetivo
(Fase D), novos ebooks para os perfis novos (usam o catálogo atual; conteúdo dedicado
vem com a Fase D), streak/notificações (Fase 2 do roadmap original — e, quando vier,
segue as diretrizes anti-dark-pattern da pesquisa: sem culpa, sem recuperação paga,
leaderboard opt-in, XP ancorado em produção).

## Princípios (da pesquisa, vinculantes para esta e futuras fases)

1. XP ancorado em produção (validação/projetos) > consumo (download/visualização).
2. Zero dark patterns: sem notificações de culpa, sem streak pago, sem escassez falsa.
3. Honestidade como posicionamento: sem promessa de renda, sem jargão que exclui.
4. Autonomia: o usuário sempre pode pular a triagem e escolher manualmente depois
   (mantém-se o fluxo atual como está — a triagem já é opcional por design de URL).

## Modelo de dados

Sem tabelas novas. Migration `0003_seed_novos_perfis.sql` insere os 2 perfis novos em
`profiles` (mesma estrutura: id, name, description, recommended_ebooks, study_roadmap).
`ProfileId` em `lib/quiz-scoring.ts` ganha os 2 novos literais e `PROFILE_ORDER` os
inclui ao final (empates continuam favorecendo os perfis originais).

## Testes

- `lib/quiz-branching.test.ts` (novo): perguntas sem `showIf` sempre visíveis;
  pergunta com `showIf` aparece só quando a resposta referenciada contém um índice
  esperado; resposta ausente = oculta.
- `lib/quiz-scoring.test.ts`: atualizado para os 8 perfis (tie-break preservado).
- Conteúdo: teste de sanidade em `quiz-triagem` — todo `showIf.questionId` referencia
  pergunta anterior existente (sem referência circular/futura).
- Suíte existente continua passando.
