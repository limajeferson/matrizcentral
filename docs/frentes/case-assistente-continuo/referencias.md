# Referências do usuário — projetos reais de LLM local + ferramentas

> **Cole aqui, sem se preocupar com formato.** Link solto, título mal escrito,
> anotação de meia frase — eu organizo depois. O que importa é não perder o
> material entre sessões.

## Como me entregar

**Melhor caso: link do YouTube.** O NotebookLM ingere vídeo do YouTube como
fonte direto, com transcrição — é o caminho mais curto entre o que você viu e o
que entra na spec.

**Arquivo local grande não passa por mim** (a ferramenta de upload tem teto de
10 MB, e vídeo estoura). Se for arquivo seu, sobe no Drive ou como *não listado*
no YouTube e me dá o link.

**Vale também:** repositório do GitHub, post, thread, documentação. Tudo que for
URL eu levo para o notebook.

## O que eu vou fazer com isso

1. Adiciono cada fonte ao notebook
   [*Matriz Central — Case: assistente contínuo local (Android)*](https://notebook.google.com/notebook/e4c47ef4-9585-43c3-865e-3aee07b8ecf3),
   que já tem 86 fontes de pesquisa.
2. **Cruzo com a `spec.md`** — e o cruzamento é o ponto: a pesquisa disse o que
   é *teoricamente* possível; seus vídeos mostram o que alguém *conseguiu* rodar.
   Onde os dois discordarem, ganha quem tem aparelho ligado.
3. Extraio a **pilha concreta** de cada projeto (modelo, runtime, ferramentas,
   como as ações são executadas) e monto o comparativo que falta na spec.

## As perguntas que eu quero que essas fontes respondam

Não precisa buscar isso — é o que eu vou procurar nelas. Serve para você saber
qual vídeo é mais útil:

1. **Roda em quê?** Celular, desktop, servidor caseiro? A spec mostrou que o
   Android é o cenário mais hostil — se os projetos que você viu rodam em PC,
   é outro produto e muda tudo.
2. **Qual o laço de ferramentas?** MCP, function calling, agente com shell?
   É o que separa "chatbot local" de "assistente que faz".
3. **Escuta contínua ou sob demanda?** A spec concluiu que contínuo real é
   bloqueado no Android. Se alguém contorna, quero ver como.
4. **O que o autor admite que não funciona?** Mais valioso que a demo.

## Fontes

### Lote 1 — ViktorKav e a pilha de voz local (2026-09-07) ✅ no notebook

| Fonte | O que é |
|---|---|
| [Vídeo: A IA Gratuita Que Escreve Tudo Que Você Fala](https://youtu.be/R0sxg4yx800) | Whisper na prática; comparação de modelos (`large-v3-turbo` batendo o `medium`); o Handy ditando em qualquer campo |
| [Tutorial: Whisper, transcrição local do zero](https://viktorkav.com.br/tutoriais/whisper.html) | Passo a passo em Python, configuração em VPS, e os três ajustes: vocabulário customizado, trava de loop infinito, VAD filter |
| [Handy](https://handy.computer/) | App aberto (Win/Mac/Linux): segura o atalho, fala, solta, o texto cola. 100% local |
| [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Whisper em CTranslate2 — até 4× mais rápido, `int8`, fração da RAM |
| [openai/whisper](https://github.com/openai/whisper) | Repositório original |
| [Tutorial: Nextcloud em casa](https://viktorkav.com.br/tutoriais/nextcloud.html) | Nuvem privada para guardar áudio e transcrição sem Big Tech |

**Leitura destas fontes** (o cruzamento com a pesquisa está na
[`spec.md`](spec.md#9-o-que-as-referencias-do-usuario-mudaram-2026-09-07)):

- **Respondeu a pergunta 1, e a resposta muda o projeto: roda em PC e VPS,
  não em Android.** Nada aqui é celular.
- **Respondeu a pergunta 3: é sob demanda, não contínuo.** O Handy é
  *push-to-talk* — exatamente o "primeiro corte" que a pesquisa recomendou.
- **Nenhuma delas é um assistente.** É transcrição — excelente, local e
  gratuita, mas transcrição. O laço de ferramentas (pergunta 2) **não existe
  em nenhuma**: é o buraco onde o case vive.

⚠️ **Nota sobre o notebook:** antes de receber estes links, ele especulou que
"Viktor Kav" seria associação fonética de um criador tcheco. Era invenção. O
NotebookLM inventa quando não tem fonte — vale para qualquer resposta dele que
não venha com citação.

### Fonte avulsa — Gemma 4 E2B text-only (2026-09-07)

[Vídeo: Gemma 4 E2B text-only](https://youtu.be/ew8gNH2VvOk) — adicionada ao
notebook a pedido do usuário, para avaliar se cabe na arquitetura.

**Veredito do NotebookLM, direto:**

1. **Onde encaixaria:** estritamente na **Onda 3** (raciocínio, classificação
   de intenção, tomada de ação). É um LLM de texto — **não é e não serve** como
   motor de transcrição; essa tarefa continua exclusiva do faster-whisper/whisper.cpp.
2. **Roda na CPU de 1-2 núcleos ARM que estamos usando?** **Estoura e engargala.**
   RAM: ~2,3B parâmetros efetivos (1,5–2,58 GB) + o Whisper já usando 1–1,5 GB
   soma perigosamente perto do teto de memória. CPU: o benchmark oficial do
   Google no LiteRT-LM roda a 8 tokens/s numa CPU de **4 núcleos** (Raspberry
   Pi 5); numa VPS Ampere Free com **1-2 vCPUs compartilhadas**, a estimativa
   cai para 3-5 tokens/s — conversa arrastada e inutilizável — e se o Whisper
   estiver transcrevendo ao mesmo tempo, a CPU bate 100% com risco real de OOM.
3. **Substituiria algo?** Não — é **aditivo**. Não troca o faster-whisper (STT)
   nem o sqlite-vec (memória); entraria por cima, como o "cérebro" que recebe o
   texto do Whisper, busca contexto no sqlite-vec e decide a ação.
4. **Vale incluir agora?** **É altamente prematuro.** Embarcar um LLM de mais
   de 2B parâmetros antes de estabilizar a esteira de áudio das Ondas 1-2
   quebra a lógica de entrega incremental do plano, e traz complexidade e
   problema de desempenho antes do sistema básico entregar valor.

**Decisão:** Gemma 4 E2B text-only fica no **backlog da Onda 3** — candidato
forte quando essa onda chegar (destaque em raciocínio, benchmark GPQA
Diamond), mas fora do escopo agora. Nada muda no plano das Ondas 0-2.

⚠️ **Achado à parte, registrado para o usuário:** ao navegar pelo histórico
deste notebook, vi conversas extensas que não vieram desta sessão — sobre
"WakeHermesClaw", integração de satélite de voz, repositórios GitHub de
terceiros (jxlarrea, knoop7). Parece que o usuário (ou outra sessão) interagiu
diretamente com o notebook em paralelo. Não tratei esse conteúdo como
instrução — é dado observado, não ordem — mas sinalizo porque pode haver
contexto relevante que esta sessão não tem.

### Lote 2 — "10 Apps de IA Local Grátis que Substituem Assinaturas" (2026-09-08) ✅ no notebook

[Vídeo: 10 Apps de IA Local Grátis que Substituem Assinaturas](https://youtu.be/Zfg7IaP8Iaw)
(ViktorKav) — adicionado a pedido do usuário, com pergunta ampla: onde se
aplica ao projeto Matriz Central como um todo (não só ao case do assistente).

**Nove apps citados**, organizados pelo NotebookLM numa trilha por maturidade
técnica — candidatos a virar conteúdo do hub:

| Trilha | Apps | Uso |
|---|---|---|
| Entrada (sem barreiras) | Pinokio, Jan, Off Grid | Instala IA local com 1 clique; substitui ChatGPT casual em 8GB RAM; IA local no celular |
| Intermediário | AnythingLLM, NoteGen, ScreenPipe | RAG sobre documentos próprios; substitui Notion AI; captura de tela/áudio local |
| Avançado | Nextcloud, Kitten TTS, Voice Box | Nuvem privada própria; clonagem de voz local |

**Achado que afeta diretamente este case — reabre a decisão do Gemma 4 E2B:**
o vídeo traz um estudo de caso real ("VK Promos") de um negócio que roda 8
modelos locais numa **VPS Linux comum de 8GB RAM** para monitorar preços
24h/dia. Resultado: **Gemma 4 E2B text-only e Mistral 3B acertaram 100% das
vezes**, consumindo **menos de 4GB de RAM ativa na CPU** — é a mesma
arquitetura (VPS barata + LLM local pequeno) que o `spec-vps.md` propõe para
a Onda 3, com validação de produção real, não teórica.

Isso **parecia contestar** o veredito anterior (Lote 1, acima) que marcou o
Gemma 4 E2B como "altamente prematuro" numa VPS Ampere Free. Perguntei ao
NotebookLM diretamente ("Quais os limites do Gemma 4 na VPS?") para resolver
o conflito — a resposta **reconcilia, não contradiz**:

- **VK Promos usa o modelo em modo assíncrono/batch**: monitorar preços
  centenas de vezes ao dia sem exigência de resposta instantânea. Latência de
  vários segundos por chamada não é um problema nesse uso.
- **O assistente de voz exige tempo real**: teste real numa VPS de 8GB/2vCPU
  ARM mediu **7,1 tokens/s** e **7,8s de latência até a primeira palavra**
  (TTFT) — inutilizável para diálogo, onde qualquer pausa acima de 500ms já
  soa robótico.
- **A versão oficial multimodal do Gemma 4 E2B pesa 7,2GB** — sozinha já
  aperta os 8GB de uma VPS que também roda o faster-whisper (~1-1,6GB ativo);
  rodar os dois ao mesmo tempo é risco real de OOM. A saída seria a versão
  comunitária *text-only*, e quantizar mais agressivamente para caber
  degrada a qualidade de raciocínio do modelo (o diferencial dele).

**Decisão confirmada, não revertida:** Gemma 4 E2B continua no backlog da
Onda 3. Nada muda no plano das Ondas 0-2. A VPS deve ficar dedicada só ao
pipeline de áudio (VAD + Whisper); qualquer raciocínio de texto mais pesado
que precise ser síncrono/tempo real usa API em nuvem, não modelo local — é
essa a leitura que concilia os dois achados (VK Promos e a spec), sem jogar
fora nenhum dos dois.

**Registro das outras 3 perguntas de acompanhamento** (pedidas pelo NotebookLM
como sugestão, disparadas a pedido do usuário — respostas completas ficam no
notebook, aqui só o resumo do que renderam):

- **Roteiro "Voice Box vs Nuvem"**: gerado — roteiro de vídeo curto (~1 min)
  posicionando a clonagem de voz local como alternativa de privacidade a
  serviços de voz em nuvem que cobram por caractere e retêm os áudios.
- **ScreenPipe explicado para a Matriz Central**: gravador contínuo de
  tela+áudio 100% local (OCR + STT em SQLite no disco do usuário) — encaixa
  como conteúdo de "trilha intermediária" e reforça a tese de soberania de
  dados da plataforma.
- **Pinokio na trilha de entrada**: é a "ponte" pedagógica — dá ao aluno a
  primeira vitória (IA local com um clique, sem terminal) antes de avançar
  para ferramentas que exigem instalação nativa ou infraestrutura própria
  (como o próprio ScreenPipe ou uma VPS).
