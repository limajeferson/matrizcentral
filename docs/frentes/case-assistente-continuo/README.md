# Frente — Case: assistente contínuo local-primeiro (Android)

**Status:** 🌱 **aberta em 2026-09-04** — em pesquisa. Não é fila de execução
ainda; é o levantamento que decide se vira produto, conteúdo, ou os dois.

**Pedido do usuário (verbatim, 2026-09-04):**

> *"quero iniciar a construção de um case para a plataforma, quero um projeto de
> assistente em modo contínuo, como funciona o JARVIS do homem de ferro, quero
> elaborar algo que possa utilizar em aparelhos android e que possa ouvir e
> conversas e ser um agente em modo live"*

## Por que este case, e não outro

A Matriz Central vende uma tese: **IA local vale a pena**. Hoje ela prova isso
com relatórios, podcasts e um ebook — material *sobre* o assunto. Um assistente
contínuo rodando no próprio celular é a prova mais dura que existe da mesma
tese, porque junta os três argumentos de venda num artefato só:

- **privacidade** — escuta contínua é o caso em que "manda pra nuvem" é
  inaceitável para qualquer pessoa, não só para entusiasta;
- **custo** — um agente ligado 24h por API é caro de um jeito que ninguém
  sustenta; local é o único caminho economicamente viável;
- **soberania** — funciona sem sinal, sem assinatura, sem alguém desligar.

É também o formato de conteúdo que a plataforma ainda não tem: **um projeto
acompanhado do zero ao ar**, em vez de material avulso. Se sair bem, vira
trilha, série de vídeo e argumento de upsell do Advanced ao mesmo tempo.

## Estado da pesquisa

| Quando | O quê |
|---|---|
| 2026-09-04 | Varredura no repositório: **nada** sobre assistente contínuo, JARVIS ou Android nos arquivos do projeto (nem no `notebooklm/`). |
| 2026-09-04 | Varredura nos **18 notebooks** do NotebookLM: nenhum trata do tema. Os adjacentes são *Securing the AI Agent Development Life Cycle*, *Graphify and Claude Code: Advanced Cognitive Memory Architectures* e *Omnistack Agent* — nenhum cobre escuta contínua nem Android. |
| 2026-09-04 | **Deep Research disparado** no NotebookLM, notebook novo, com um roteiro de 8 eixos (abaixo). Resultado alimenta a `spec.md` desta frente. |

### Os 8 eixos da pesquisa

1. **Execução local no aparelho** — modelos on-device (Gemini Nano/AICore,
   Llama 3.2 1–3B, Phi-4-mini, Qwen2.5, Gemma 3n), runtimes (MediaPipe LLM
   Inference, llama.cpp, MLC LLM, ExecuTorch, ONNX Runtime Mobile),
   quantização e o piso real de RAM/NPU.
2. **Escuta contínua** — wake word (openWakeWord, Porcupine), VAD (Silero),
   ASR em streaming no aparelho (whisper.cpp, Vosk, Moonshine), diarização,
   e o custo de bateria de um foreground service 24h.
3. **Os limites do Android** — foreground services, microfone em background a
   partir do 11/14/15, restrições de bateria, e o que a Play Store aceita em
   política de gravação de áudio.
4. **Modo "live"** — sessão bidirecional em tempo real (Gemini Live API,
   OpenAI Realtime), latência fim-a-fim, *barge-in*, e a arquitetura híbrida
   local-primeiro com escalonamento para nuvem.
5. **Memória contínua** — RAG local, embeddings on-device, vetorial embarcado
   (sqlite-vec, ObjectBox), memória episódica e resumo incremental.
6. **Executar ações** — Accessibility Service, App Actions/App Functions,
   intents/Tasker, MCP em dispositivo móvel.
7. **Privacidade e lei** — gravar conversa de terceiro no Brasil (LGPD,
   consentimento, Marco Civil) e o que muda quando o processamento é 100%
   local.
8. **Quem já tentou** — Rabbit r1, Humane, Friend/Omi, Limitless Pendant, Home
   Assistant Assist, Willow, Leon, Dot — **e o que deu errado em cada um.**

O eixo 8 é o mais importante para a decisão: quase todo produto desta categoria
que chegou ao mercado fracassou, e por motivos que se repetem. Entrar sem
mapear isso é repetir de graça.

## O que já está decidido

- **Android**, não iOS — decisão do usuário. (O iOS não permite escuta contínua
  em background de terceiro; a plataforma inviabiliza o produto, não é escolha
  de gosto.)
- **Modo contínuo e conversacional** ("live"), não comando-e-resposta.
- **Local-primeiro** — não é decisão de gosto, é a tese do produto. Qualquer
  parte que precise de nuvem tem que ser justificada e opcional.

## O que ainda é decisão do usuário (não do Claude)

1. **O case é produto ou conteúdo?** Um app publicado que a Matriz Central
   mantém é uma empresa nova, com suporte, loja e responsabilidade sobre áudio
   de terceiros. Um case *documentado* — código aberto, série de conteúdo,
   trilha guiada — entrega o mesmo argumento de marca sem abrir essa frente.
   **Recomendação: começar como case documentado**, com o app publicado como
   possível segundo passo. Motivo em uma linha: o valor de marca chega igual e
   o passivo jurídico da escuta de terceiros não chega junto.
2. **Escopo de gravação.** Assistente que ouve *o ambiente* (conversa com
   outras pessoas) e assistente que ouve *só você* são produtos jurídica e
   tecnicamente diferentes. O eixo 7 traz o material; a escolha é sua.
3. **Prioridade contra o lançamento.** A fila hoje é `lancamento-publico`
   (Onda 4 em execução) + Kiwify. Este case **não é caminho crítico de
   receita** — precisa entrar sem empurrar o lançamento.

## Próximo passo

Quando o Deep Research terminar: destilar as fontes em `spec.md` — arquitetura
candidata, o que é possível hoje em aparelho real, os limites duros do Android,
e o veredito honesto sobre o que dá para prometer. **Nenhuma promessa de
produto antes disso**; o eixo 8 existe justamente porque essa categoria é um
cemitério de promessas.
