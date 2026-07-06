# Requisitos — Reformulação da Triagem (FILA)

**Status:** NA FILA — rodar o ciclo (brainstorming → writing-plans → subagent-driven-development)
depois de concluir: (1) redesign /oferta, (2) tweak do fundo pixel na landing.
**Data de recebimento:** 2026-07-05

Este arquivo preserva os requisitos detalhados dados pelo usuário. Ao iniciar o ciclo,
formalizar como spec `2026-07-05-triagem-redesign-design.md` e explorar o código atual
(`src/data/quiz-triagem.ts`, `src/data/quiz-triagem.test.ts`, `src/app/quiz/`, componentes
de quiz em `src/components/quiz/`) — parte disso pode já estar alinhada (o teste atual já
proíbe menção a linguagens de programação).

## Objetivo
Reposicionar a etapa de "Quiz de Perfil" para **aumentar a percepção de valor** — não só trocar textos.
Deve parecer uma **pequena consultoria** ("este material será personalizado para mim"), não um teste
nem processo seletivo ("estou sendo avaliado"). Existe para aumentar valor, NÃO para excluir usuários.

## Público (remover qualquer pressuposto técnico)
Profissionais que usam IA, empresários, criadores, estudantes, analistas, curiosos, quem nunca programou.

## Remover completamente
Palavra "Quiz"; perguntas sobre linguagem de programação (Python, JavaScript, Go, Rust, "Não programo")
e similares.

## Renomear a etapa (recomendação)
Não usar "Quiz". Diretrizes do usuário: Diagnóstico Inicial / Orientação Inicial / Definição da Trilha /
Mapeamento de Uso / Plano Inicial.
**Recomendação:** "Diagnóstico Inicial" — já é a linguagem da landing (SystemSection/ProcessSteps),
gera consistência de marca e conota consultoria personalizada, culminando em "Sua trilha recomendada".

## Novas perguntas (descobrir contexto, não medir conhecimento técnico)
1. Como você utiliza IA hoje? — Todos os dias / Algumas vezes por semana / Estou começando / Ainda não utilizo
2. Qual é seu principal objetivo? — Economizar com assinaturas / Ter mais privacidade / Trabalhar sem depender da internet / Aprender IA local / Automatizar tarefas
3. Como você prefere aprender? — Quero o caminho mais simples / Quero entender como funciona / Um equilíbrio entre teoria e prática
4. Qual computador você pretende utilizar? — Notebook básico / Notebook intermediário / Desktop / Ainda não sei
5. Você pretende utilizar IA principalmente para: — Trabalho / Estudos / Empresa / Projetos pessoais / Ainda estou descobrindo
6. Quanto tempo você pretende dedicar inicialmente? — Até 30 minutos / Cerca de 1 hora / Algumas horas / Aos poucos
7. O que mais incomoda você hoje? — Pagar assinatura todo mês / Limites de uso / Falta de privacidade / Depender da internet / Não saber por onde começar

## Resultado (não usar "Seu Perfil")
Usar "Sua trilha recomendada" / "Seu plano inicial" / "Sua recomendação personalizada".
Exemplo de layout do resultado:
- **Objetivo principal:** Eliminar a dependência de assinaturas de IA.
- **Ponto de partida:** Notebook intermediário.
- **Primeiros passos:** 1. Entender IA Local 2. Escolher o modelo ideal 3. Instalar 4. Primeiro uso 5. Ajustes de desempenho
- **Tempo estimado:** 45–60 minutos.

## UX
Sensação de consultoria; evitar cara de teste ou formulário burocrático; linguagem de orientação personalizada.
Fecho emocional: "A Matriz Central entendeu exatamente meu contexto e vai me mostrar o caminho mais adequado para começar."
