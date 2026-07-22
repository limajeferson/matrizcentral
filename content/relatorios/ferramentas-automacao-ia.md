### Ferramentas de IA Local para Automação e Produtividade

A parte mais cara de montar uma automação com IA local não é escolher "o melhor modelo" — é descobrir qual ferramenta resolve a tarefa específica sem exigir hardware que você não tem. A maioria dos catálogos mistura modelo de linguagem, orquestrador de agente e runtime de servidor como se fossem a mesma categoria de decisão, e isso empurra quem está começando para comprar VRAM que nunca vai usar ou, no sentido oposto, para tentar rodar um agente complexo num modelo pequeno demais para a tarefa.

Este relatório organiza o que aparece de fato testado ou documentado — modelos leves para tarefas repetitivas, modelos e orquestradores para automação mais pesada, os runtimes que servem tudo isso localmente e os utilitários de terminal que fecham a ponta de execução. Cada tabela traz só o que tinha dado concreto de hardware ou função; linha sem informação suficiente para orientar uma decisão foi deixada de fora em vez de preenchida com suposição.

## Modelos leves para automação de bastidores

Para tarefas repetitivas e bem definidas — monitorar preço, extrair dado de texto, rodar 24/7 numa VPS barata —, o ganho não vem do modelo maior, vem do modelo que cabe no hardware disponível sem deixar de acertar a tarefa.

| Ferramenta/Modelo | Para quê | Hardware mínimo | Observação |
| --- | --- | --- | --- |
| Gemma 4 / Gemma 3 (2B/3B/4B) | Raciocínio, codificação e automação leve, entendimento multimodal básico | 2B roda em celular ou VPS de 8GB RAM (menos de 4GB ocupados) | Licença Apache 2.0; suporte GGUF/Llama.cpp |
| Ministral 3 (3B/8B) | Monitoramento de preços, extração de dados, fluxos de produção com alta precisão | 3B roda em VPS com menos de 4GB RAM; 8B (Q3) exige cerca de 8GB RAM | Arquitetura compacta com quantização agressiva |
| Llama 3.2 (3B) | Processamento de texto geral, alta velocidade de inferência (11,2 tokens/s) | Baixo requisito de RAM; rodou em VPS de 8GB | Disponível via Ollama e LM Studio |
| DeepSeek | Extração de dados e monitoramento | Rodou em VPS de 8GB RAM (4,9 tokens/s) | Sem dado de arquitetura na fonte |
| Nemotron | Extração de dados | Rodou em VPS de 8GB RAM (6,4 tokens/s) | Apresentou alta taxa de alucinação nos testes — usar com validação extra |

## Modelos e orquestradores para automação mais pesada

Quando a tarefa deixa de ser extração simples e passa a envolver decisão, código ou múltiplos passos encadeados (agêntico), o hardware mínimo sobe — e a escolha certa depende de quanto raciocínio a tarefa realmente exige.

| Ferramenta/Modelo | Para quê | Hardware mínimo | Observação |
| --- | --- | --- | --- |
| Qwen 3.5 / 3.6 / 3.7 / 2.5 | Raciocínio lógico, codificação, chamadas de ferramentas (agêntico), análise de textos longos | Versões menores rodam em máquinas simples; 27B+ exige GPU de alta VRAM ou Mac M3 Ultra (256GB para os modelos massivos) | Contexto até 262 mil tokens; suporte a quantização GGUF |
| GLM 4.7 / 5 / 5.1 / 5.2 | Chamada de ferramentas (agêntico), engenharia de sistemas, OCR multimodal, baixo custo via API | Hospedagem local ou via OpenRouter | Variante "Flash" otimizada para velocidade |
| GPT-OSS 20B | Navegação web via tool calling e extração de dados com raciocínio ajustável | 12GB RAM em 4 bits; recomendado 16GB de VRAM | Mixture of Experts; contexto de 131 mil tokens |
| DevStraw Small 2 | Programação back-end e visão computacional (reproduzir interfaces a partir de screenshots) | 14GB de espaço em 4 bits; recomendado 16GB de VRAM ou Mac com 24GB RAM | Modelo denso; contexto entre 256k e 393k tokens |
| Quenter 30B | Codificação, design responsivo, suporte a agentes | Mínimo 24GB de VRAM; ideal 32GB de memória unificada (Mac) | Mixture of Experts com 128 experts (8 ativos) |
| MiniMax M2.5 / M2.7 / M3 | Produtividade no mundo real, codificação, multimodalidade nativa | M2.7 roda em Mac M3 Ultra (256GB RAM) | Contexto de 1 milhão de tokens (M3); também disponível via nuvem |

## Orquestradores de agentes e runtimes que servem os modelos

Um modelo sozinho não automatiza nada — ele precisa de um orquestrador que decida quando chamar ferramentas e de um runtime que o sirva de forma estável. Aqui entram tanto os agentes com acesso à nuvem quanto o software que roda o modelo local no dia a dia.

| Ferramenta/Modelo | Para quê | Hardware mínimo | Observação |
| --- | --- | --- | --- |
| Claude (Sonnet, Opus, Haiku) | Decisões arquiteturais, codificação autônoma, diagnóstico de sistemas, orquestração via Programmatic Tool Calling (PTC) | Acesso via API/nuvem (não é modelo local); SDK Python 0.72+ para PTC | Suporte a MCP (Model Context Protocol) |
| Claude Code | CLI para automação de tarefas de engenharia e diagnóstico | Execução via terminal, consumo de API | Arquitetura baseada em agentes e subagentes |
| Omnistack-agent | Agente full stack com 10 papéis (arquiteto, DevOps, QA etc.), compila adaptadores para múltiplos LLMs | Node 18+ para build; requisito real depende do LLM hospedeiro | Agnóstico a plataforma; núcleo compilado em adaptadores |
| Ollama | Rodar, gerenciar e servir modelos locais (chat, código, visão, embeddings, tool calling) | macOS, Windows, Linux ou Docker; requisito varia com o modelo carregado | API REST compatível com OpenAI e Anthropic |
| vLLM | Servir modelos para múltiplos usuários com API estilo OpenAI | Pensado para servidor de inferência em produção | Runtime de alto desempenho |
| Llama.cpp | Execução local de LLMs em formato GGUF | Indicado para uso local individual | Runtime para inferência local |
| LM Studio | Rodar IAs localmente, gratuito | Máquina local | Ferramenta gratuita |

## Automação de terminal e utilitários

Fecha a ponta operacional: scripts e agentes pequenos que executam ações diretas no sistema, sem passar por um orquestrador completo.

| Ferramenta/Modelo | Para quê | Hardware mínimo | Observação |
| --- | --- | --- | --- |
| FAS (Faz) | Conversão de imagens, download de vídeos, organização de arquivos via utilitários locais | Roda sobre hardware local | Sistema de "duas voltas" com verificação de segurança (blocklist) |
| Script Suporte / AI | Diagnóstico de sistemas (logs, DNS, SSH) e assistente rápido via terminal | Executa em rede local (ex.: Zima Board) | Conexão direta via terminal ao modelo Gemma |

## Como escolher

Três critérios, nessa ordem, evitam o erro mais comum — que é escolher pelo nome do modelo em vez de pela tarefa:

- Hardware que você realmente tem. VPS de 8GB e notebook comum ficam com Ministral 3, Gemma 4 pequeno ou Llama 3.2. GPU de 16-24GB de VRAM abre GPT-OSS 20B e DevStraw Small 2. Acima disso (Mac com memória unificada grande ou GPU dedicada tipo Intel Arc B70 de 32GB / RTX 5090) só compensa se a tarefa exigir os modelos de 30B+ ou raciocínio agêntico pesado — rodar um modelo massivo numa automação de extração simples é desperdício de energia, não sofisticação.
- Tipo de tarefa, não tamanho do modelo. Extração e monitoramento repetitivo pedem precisão e baixo custo (modelos leves da primeira tabela); codificação e fluxos agênticos de múltiplos passos pedem os modelos e orquestradores da segunda e terceira; ações diretas no sistema (converter arquivo, checar log) pedem só um utilitário de terminal, não um agente completo.
- Confiabilidade verificada, não prometida. Nem todo modelo pequeno é preciso e nem todo modelo grande é confiável — o Nemotron testado para extração apresentou alta taxa de alucinação apesar do hardware modesto necessário. Antes de colocar qualquer ferramenta desta lista em produção, valide o resultado num lote pequeno de dados reais antes de automatizar em escala.
