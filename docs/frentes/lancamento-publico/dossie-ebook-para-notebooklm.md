# 📕 Dossiê Editorial do Ebook — para avaliação externa no NotebookLM

> **Como usar este arquivo:** anexe-o ao NotebookLM **junto com o próprio ebook**
> (`content/ebooks/ebook_llm_local_matrizcentral.md`) e, se possível, com as suas
> fontes atuais sobre LLMs locais. Depois, cole as perguntas da seção
> [Perguntas para o NotebookLM](#-perguntas-para-o-notebooklm-responder-com-pontuação)
> — elas foram escritas para forçar respostas pontuadas e acionáveis, não elogios.
>
> **O que este documento é:** uma radiografia da construção editorial do ebook,
> medida arquivo a arquivo, sem opinião de venda. Serve para o avaliador externo
> saber o que já sabemos e gastar energia no que não sabemos.
>
> **O que ele não é:** um julgamento do conteúdo técnico. É exatamente isso que
> queremos que o NotebookLM traga, porque **IA local envelhece em semanas** e o
> material está marcado como "Versão 1.0 — 2026".
>
> _Levantado em 2026-07-28 por medição direta do arquivo, não por memória._

---

## 1. Ficha técnica (medida, não estimada)

| Métrica | Valor |
|---|---|
| Arquivo | `content/ebooks/ebook_llm_local_matrizcentral.md` |
| Linhas | 739 |
| Palavras | **3.853** |
| Equivalente em páginas | **~15 a 20** (a 250–300 palavras/página) |
| Capítulos | 10 (Capítulo 0 a 9) + Apêndice + Próximos Passos |
| Tabelas | 8 |
| Blocos de código / diagramas ASCII | 20 |
| **Imagens** | **0** |
| **Fontes citadas / bibliografia** | **0** |
| Links externos | 5 (Ollama ×2, LM Studio, CUDA, HuggingFace) |
| Links internos para o próprio site | 4 — **2 deles apontam para páginas que não existem** |
| Versão declarada | "Versão 1.0 — 2026" |

> ⚠️ **Contradição comercial já detectada:** a página de vendas anuncia
> "**120+ páginas de conteúdo técnico**". O material real tem ~15–20 páginas.
> A discrepância é de aproximadamente **6×**. Isso já está registrado para
> correção de copy e **não é tarefa do avaliador externo** — está aqui só para
> contexto.

---

## 2. Arquitetura editorial

### Macro — a espinha do argumento

O livro tem uma tese única e a defende do começo ao fim:

> **"O modelo maior não é o modelo certo. Especialização vence escala."**

A progressão macro é:

1. **Dor financeira** (Cap 0) — quanto você paga em assinatura
2. **Quebra de crença** (Cap 1) — o mito do "quanto maior, melhor"
3. **Fundamento técnico** (Cap 2) — arquitetura, MoE vs Dense, quantização
4. **Decisão** (Cap 3) — organograma para escolher o modelo
5. **Referência** (Cap 4 e 5) — tabelas de modelos e de performance por hardware
6. **Execução** (Cap 6) — instalação e primeiro prompt
7. **Investimento** (Cap 7) — o que comprar por faixa de orçamento
8. **Contexto histórico** (Cap 8) — linha do tempo
9. **Upsell** (Cap 9) — o "Módulo Avançado" pago
10. **Consulta** (Apêndice) — glossário

**Observação estrutural:** a curva é *dor → crença → teoria → decisão → prática →
compra*. É uma estrutura de venda clássica, coerente. O ponto discutível é o
Capítulo 9 ser essencialmente publicitário dentro de um material pago.

### Mid — o padrão que se repete dentro dos capítulos

Cada capítulo segue quase sempre o mesmo molde de três tempos:

| Tempo | Como aparece | Exemplo real |
|---|---|---|
| **Abertura** | Uma afirmação curta e provocativa, às vezes em negrito isolado | Cap 1: *"**Isso é falso.**"* |
| **Desenvolvimento** | Explicação + tabela ou diagrama ASCII + caso concreto com número | Cap 2: tabela Dense vs MoE com 18 vs 66 tok/s |
| **Fechamento** | Um bloco rotulado que destila a lição | `**Conclusão prática:**`, `**Lição prática:**`, `> 💡 **Regra de ouro:**`, `**Princípio central deste guia:**` |

O padrão é **consistente e reconhecível** — o leitor aprende a esperar o
fechamento destacado. Capítulos 4 (tabela) e Apêndice (glossário) fogem do molde
por serem material de consulta, o que é adequado.

### Micro — os recursos de linguagem usados

- **Segunda pessoa direta** o tempo todo ("Abra sua última fatura", "Você não precisou esperar")
- **Números específicos como prova** — 92% de respostas nulas, 100% de precisão, 47s vs 58s, R$50/mês
- **Marcadores visuais de status**: ✅ ❌ ⚠️ 💡 ⚡ 🐌
- **Blocos de "Armadilhas Comuns"** com o erro (❌) e a correção (✅) lado a lado
- **Comandos prontos para colar**, com comentário explicando cada linha
- **Contraste antes/depois** em diagrama ASCII (ex.: com e sem "dieta de tokens")

---

## 3. Mapa capítulo a capítulo

| # | Capítulo | Palavras | O que entrega | Formato dominante |
|---|---|---|---|---|
| — | Antes de Começar | 83 | Hook: "o modelo maior não é o modelo certo" | Prosa curta |
| — | Índice | 115 | 11 entradas com âncoras HTML | Lista |
| 0 | Por Que Você Está Pagando Demais | 257 | Tabela de custo cloud vs local; o que mudou em 2025-26 | Tabela + bullets |
| 1 | A Ilusão do Tamanho | 343 | Caso Gemma 4 E2B (100% precisão); armadilha do Llama 3.2 3B (92% nulos) | Caso + citação em bloco |
| 2 | Arquitetura Importa Mais que Parâmetros | 494 | Dense vs MoE; `think=false`; quantização FP32→Q3 | Diagrama ASCII + tabela |
| 3 | Organograma de Decisão | 254 | Árvore de decisão por objetivo → modelo → hardware | **Fluxograma ASCII** (o maior do livro) |
| 4 | Tabela Comparativa 2026 | 425 | 15 modelos com VRAM, velocidade, uso indicado; + 3 a evitar | Tabela de referência |
| 5 | Performance por Hardware | 370 | 4 tiers (modesto → Apple Silicon) com modelos viáveis por tier | Blocos por tier |
| 6 | Setup Passo a Passo | 474 | Ollama e LM Studio; API REST; código Python e TypeScript; troubleshooting | **Tutorial + código** |
| 7 | Monte Sua Máquina | 359 | 3 faixas de orçamento + alternativa VPS | Tabela de componentes |
| 8 | Linha do Tempo | 240 | 2023 Q4 → 2026, evolução dos modelos | Timeline ASCII |
| 9 | O Que Vem a Seguir | 202 | Apresenta o "Módulo Avançado" pago | **Publicitário** |
| — | Apêndice: Glossário | 236 | 18 termos definidos | Tabela |
| — | Próximos Passos | 89 | 4 ações finais | Lista numerada |

**Desequilíbrio observado:** o Capítulo 2 (494 palavras) tem quase o dobro do
Capítulo 9 (202) e mais que o dobro do Capítulo 8 (240). Os capítulos de maior
valor prático — 3 (organograma) e 6 (setup) — somam 728 palavras, menos de 19%
do livro.

---

## 4. Inventário do que é prático e aplicável

**O que existe de fato:**

| Recurso | Onde | Estado |
|---|---|---|
| Comandos de instalação (Linux/Mac/Windows) | Cap 6 | ✅ prontos para colar |
| Comandos Ollama (run, pull, list, rm) | Cap 6 | ✅ com comentário linha a linha |
| Chamada à API REST via `curl` | Cap 6 | ✅ |
| Integração em Python | Cap 6 | ✅ função completa |
| Integração em TypeScript | Cap 6 | ✅ função completa |
| Passo a passo do LM Studio | Cap 6 | ✅ 7 passos numerados |
| Troubleshooting | Cap 6 | ✅ 5 erros com causa e solução |
| Árvore de decisão de modelo | Cap 3 | ✅ o ativo mais forte do livro |

**O que NÃO existe:**

- ❌ Nenhum exercício ou desafio prático
- ❌ Nenhum checklist de progresso ou "o que você aprendeu"
- ❌ Nenhum projeto guiado do início ao fim
- ❌ Nenhuma forma de o leitor verificar se acertou
- ❌ Nenhuma imagem, captura de tela ou diagrama visual (**só ASCII em blocos de código**)

---

## 5. Links, fontes e rastreabilidade — os problemas

### 5.1 Links internos quebrados (verificados em produção em 2026-07-28)

| Link citado | Onde | Status real |
|---|---|---|
| `matrizcentral.com.br/setup` | Cap 7 (linha 530) e nota final (linha 739) | **404** |
| `matrizcentral.com.br/assinatura` | Cap 9 (linha 697) | **404** — a rota correta é `/oferta` |
| `matrizcentral.com.br` (dashboard) | Próximos Passos | ✅ existe |

O ebook também promete *"links de afiliados para compra de componentes"* que
**não existem** em lugar nenhum.

### 5.2 Ausência total de bibliografia

O livro afirma duas vezes que algo foi *"documentado nas fontes deste guia"*
(Cap 1 e Cap 2) — **mas não há nenhuma seção de fontes, nenhuma nota de rodapé,
nenhum link para o estudo, benchmark ou repositório de origem.**

Isso é crítico porque o material faz **afirmações numéricas específicas e
verificáveis**:

- Gemma 4 E2B com **100% de precisão** em extração de preços, em VPS de 8GB
- Llama 3.2 3B com **até 92% de respostas nulas** em automação
- Gemma 4 31B Dense: **18 tok/s**, terminando tarefa em **47s**
- Gemma 4 26B MoE: **66 tok/s**, terminando em **58s**
- Tabela de 15 modelos com VRAM mínima e velocidade

Sem fonte, o leitor não tem como distinguir **medição própria** de **número de
terceiro** de **estimativa**. Este projeto já foi mordido exatamente por isso
antes: numa revisão anterior, um relatório afirmava benchmarks de terceiros como
se fossem medição própria, e precisou ser corrigido para atribuir cada número à
sua origem.

### 5.3 Nomes de modelo que precisam de verificação externa

O material cita modelos cuja existência e numeração **precisam ser confirmadas
contra a realidade de 2026** — é o principal motivo desta avaliação externa:

`Gemma 4` (E2B, 12B, 26B MoE, 31B Dense) · `Qwen 3.7 Plus 397B` ·
`Qwen 3.6 27B` · `Qwen 3 VL` (4B, 8B) · `QwenCoder 30B` · `GLM-5 744B` ·
`Mistral 3 3B` · `GPT OSS 20B` · `MiniMax` · `Phi-3 Mini` · `Llama 3.2 3B/1B` ·
`Llama 3.1 70B/8B` · `Mistral 7B` · `DeepSeek R1`

### 5.4 Possível imprecisão de data

A linha do tempo do Capítulo 8 posiciona o **DeepSeek R1 em "2024 Q4"**.
Conferir: o lançamento amplamente noticiado foi em **janeiro de 2025**.

---

## 6. Imagens e recursos visuais

**O ebook não tem uma única imagem.** Zero `![...]()` no arquivo inteiro.

Todo o apoio visual é **arte ASCII dentro de blocos de código**:

- Fluxograma de decisão (Cap 3) — o mais elaborado, ~40 linhas
- Diagramas de fluxo Dense vs MoE (Cap 2)
- Tabela de quantização com setas (Cap 2)
- Timeline (Cap 8)
- Blocos de armadilha ✅/❌ (Cap 1, 6)

**Consequência prática:** o material é 100% legível em texto puro (bom para o
leitor protegido do site, que renderiza markdown), mas **não tem nenhum ativo
visual reaproveitável** para redes sociais, thumbnail, carrossel ou apresentação.
E o fluxograma do Capítulo 3 — que é o ativo mais valioso do livro — **depende de
fonte monoespaçada e largura de tela** para não quebrar.

---

## 7. O que já sabemos (não gaste energia redescobrindo)

Para o avaliador externo não repetir trabalho, estes pontos **já estão
identificados e endereçados internamente**:

1. A copy do site promete "120+ páginas" e o material tem ~15–20 → correção de copy já enfileirada.
2. `/setup` e `/assinatura` dão 404 → correção já enfileirada.
3. O Capítulo 9 é publicitário → decisão comercial consciente, não erro.
4. O material não tem imagens → conhecido; queremos saber **se e onde** faria diferença.

---

## ❓ Perguntas para o NotebookLM responder (com pontuação)

> **Instrução ao avaliador:** responda cada bloco separadamente. Onde pedimos
> nota, use escala de **0 a 10 com justificativa em uma frase**. Onde houver
> divergência entre o ebook e suas fontes, **cite a fonte e a data**. Prefira
> apontar o que está errado a elogiar o que está certo — é para isso que serve
> esta avaliação.

### Bloco A — Atualidade técnica *(o mais importante)*

1. **Verifique modelo por modelo** a lista da seção 5.3 deste dossiê. Para cada
   um: **existe? a numeração da versão está correta? foi superado por algo
   melhor desde então?** Marque cada um como `CONFIRMADO`, `DESATUALIZADO` ou
   `NÃO ENCONTRADO`, com a fonte.
2. A tabela comparativa do Capítulo 4 (15 modelos, VRAM, velocidade) reflete o
   estado de 2026? **Quais linhas você removeria, corrigiria ou acrescentaria?**
3. Os números de benchmark citados (100% precisão, 92% nulos, 18 vs 66 tok/s,
   47s vs 58s) são plausíveis e/ou rastreáveis a alguma fonte pública?
4. A recomendação de **evitar o Llama 3.2 3B** ainda se sustenta?
5. A linha do tempo do Capítulo 8 tem erros de data? (checar especialmente o
   DeepSeek R1)
6. **Nota de atualidade técnica: __/10.**

### Bloco B — Estrutura e didática

7. A progressão *dor → crença → teoria → decisão → prática → compra* funciona
   para aprender, ou algum capítulo está fora de lugar?
8. O desequilíbrio de tamanho (Cap 3 e 6, os mais práticos, somam só 19% do
   livro) prejudica o resultado? **Quais capítulos deveriam crescer e quais
   deveriam encolher?**
9. O padrão de fechamento destacado (`Conclusão prática`, `Regra de ouro`) é
   eficaz ou vira ruído por repetição?
10. **O que falta de didática?** Especificamente: exercícios, checklist,
    projeto guiado, autoavaliação — algum deles mudaria o resultado do leitor?
11. **Nota de estrutura didática: __/10.**

### Bloco C — Aplicação prática

12. Um leitor com hardware modesto e sem experiência consegue **sair do zero até
    o primeiro prompt** só com o Capítulo 6? Onde ele trava?
13. O troubleshooting cobre os erros que realmente acontecem hoje, ou está
    desatualizado?
14. Os exemplos de código (Python, TypeScript, curl) estão corretos e usam a API
    atual do Ollama?
15. O organograma do Capítulo 3 leva a decisões certas? **Refaça-o** se
    discordar.
16. **Nota de aplicabilidade prática: __/10.**

### Bloco D — Fontes e credibilidade

17. Quais afirmações do livro **exigem citação** e hoje não têm? Liste-as em
    ordem de risco.
18. Para cada uma, **qual fonte pública poderia sustentá-la?**
19. Alguma afirmação está **factualmente errada** a ponto de precisar sair?
20. **Nota de credibilidade: __/10.**

### Bloco E — O que fazer a seguir

21. Se você pudesse fazer **apenas 5 mudanças** neste ebook, quais seriam, em
    ordem de impacto?
22. **O material deveria crescer ou ficar do tamanho que está?** Justifique
    pensando no leitor técnico, não no marketing.
23. Onde uma **imagem ou diagrama visual** faria diferença real (não decorativa)?
24. Que **conteúdo novo** de 2026 está faltando e deveria virar capítulo?
25. **Nota geral: __/10** — e a frase que resume o veredito.

---

## Depois que a avaliação voltar

Traga a resposta do NotebookLM inteira para o Claude Code. A decisão final sobre
o que aplicar é do fundador, com recomendação do Claude — nada entra no material
sem passar por essa curadoria, justamente porque **conteúdo técnico gerado sem
verificação já causou problema neste projeto antes** (benchmarks de terceiros
afirmados como medição própria, corrigidos numa revisão anterior).

Regra que vale para tudo que voltar: **número sem fonte não entra no ebook.**
