# Spec — Case: assistente contínuo local-primeiro (Android)

**Fonte:** Deep Research do NotebookLM, 2026-09-04 — **86 fontes** no notebook
*"Matriz Central — Case: assistente contínuo local (Android)"*
([notebook](https://notebook.google.com/notebook/e4c47ef4-9585-43c3-865e-3aee07b8ecf3)),
mais uma consulta de decisão com as 6 perguntas que importam. **Números e
afirmações abaixo são das fontes, não meus** — e vários deles mudam o projeto.

> ⚠️ **Leia primeiro o veredito.** A pesquisa não confirmou o pedido; ela o
> corrigiu. O JARVIS 24h **não é construível hoje em Android por terceiro** —
> não por falta de engenharia, mas por bloqueio deliberado do sistema
> operacional. O que é construível é bom, e é outro produto.

---

## 1. O veredito, em três frases

1. **A escuta contínua "de verdade" é privilégio do Google.** O `SoundTrigger`
   / `AlwaysOnHotwordDetector` — o coprocessador de áudio (DSP) que faz o
   "Hey Google" custar microwatts — é **bloqueado para terceiros** por
   assinatura do sistema e pela permissão `CAPTURE_AUDIO_HOTWORD`.
2. **Sem o DSP, sobra a CPU — e a CPU não dorme.** Gravar continuamente
   impede o *deep sleep* e custa **15% a 25% de bateria por 24 h só para
   ouvir**, antes de qualquer inferência. A inferência local piora: 20
   conversas de múltiplos turnos consomem **6% a 25% da bateria em menos de 15
   minutos**, com aquecimento relevante.
3. **O Android fechou as portas laterais.** Desde o **Android 11** o serviço
   de microfone precisa declarar tipo `microphone`; desde o **Android 14** um
   receiver de `BOOT_COMPLETED` **não pode** iniciar foreground service com
   microfone (lança `ForegroundServiceStartNotAllowedException` e derruba o
   app); no **Android 15**, serviços `mediaProcessing`/`dataSync` têm teto de
   **6 h por período de 24 h**.

**Consequência direta:** um app que promete ouvir o dia inteiro ou descumpre a
promessa, ou destrói a bateria do usuário. As duas saídas terminam em
desinstalação e avaliação ruim — que é literalmente como os concorrentes
morreram (§4).

## 2. Arquitetura viável num Android comum de 8 GB

Cascata de consumo progressivo — cada camada só acorda a seguinte:

| Camada | Escolha das fontes | Por quê |
|---|---|---|
| **Portão (VAD)** | **Silero VAD** v5/v6 (1,2–1,7 MB, chunks de 32 ms a 16 kHz) | Mantém o resto dormindo. É o que decide se o projeto é viável ou não. |
| **Wake word** | openWakeWord (TFLite na CPU) ou **Porcupine** (<20 KB de RAM) | Substituto pobre do DSP — roda na CPU, e é aí que a bateria vai. |
| **STT** | **Moonshine** streaming tiny (27M/44,1M, <1 GB de RAM, ~107 ms) ou **Vosk** (modelos a partir de 50 MB) | `whisper-small` (460M) **superaquece** em uso contínuo — descartado. |
| **Diarização** | Picovoice **Falcon** offline (~0,1 GB de RAM) | Separar quem falou sem sair do aparelho. |
| **SLM** | **1B–3B em 4 bits** (Q4_K_M GGUF / INT4) — Gemma 3 1B e similares | Teto físico de 8 GB de RAM com o cache KV junto. |
| **Memória** | **sqlite-vec** cifrado com SQLCipher (ou ObjectBox) + embeddings **EmbeddingGemma 308M** | Busca semântica local, sem nuvem. |
| **Resumo** | Blocos diários resumidos incrementalmente **durante a carga noturna** | Janela do SLM é 4k–8k tokens; resumir economiza até ~95% do contexto ativo. |
| **Ações** | **Android App Functions** (`@AppFunction` + `AppSearchManager`, via Binder/IPC) — o "MCP do Android" | Chamada tipada e segura de ações de terceiros. É a novidade que muda o jogo. |

**No aparelho:** VAD, wake word, STT, memória semântica, classificação de
intenção. **Na nuvem, e só sob rede estável e intenção de alto esforço:**
raciocínio multi-passo e voz bidirecional em tempo real (Gemini Live /
OpenAI Realtime). Raciocínio pesado **local** gera latência que arruína a
experiência — a fonte é explícita nisso.

## 3. Por que os concorrentes morreram — e o que se aplica a nós

- **Humane AI Pin:** tentou substituir o celular e fez tudo pior. Interface só
  por voz falha porque **~80% das tarefas cotidianas pedem tela** (listas,
  senhas, leitura rápida); o projetor era ilegível ao sol; superaquecia; a
  bateria durava **2–4 h**.
- **Rabbit R1:** *demo over delivery*. Vendeu um "Large Action Model" autônomo
  e entregou um app Android numa caixa de plástico, com **até 10 s de latência
  de voz**, integrações que não funcionavam e um vazamento que deixou **logs de
  conversas dos usuários públicos**.

**O que disso é nosso risco, diretamente:**
1. **Dispositivo/app à parte perde.** As pessoas querem IA integrada ao que já
   carregam, não mais um ecossistema exigindo atenção.
2. **A armadilha térmica e energética.** Sem a cascata com o VAD segurando a
   CPU, o app descarrega o celular no meio do dia e esquenta no bolso.
3. **Prometer o agente autônomo antes de ter.** Foi o que matou a Rabbit — e é
   exatamente o risco de anunciar "JARVIS" numa plataforma que vende confiança
   técnica. **Para a Matriz Central esse é o risco mais caro dos três:** o
   ativo do negócio é a credibilidade da tese de IA local.

## 4. Legalidade no Brasil

- **Gravar conversa da qual você participa é lícito**, mesmo sem os outros
  saberem — jurisprudência consolidada do STF. Exceção: sigilo profissional
  (advogado, médico).
- **Gravar conversa de terceiros da qual você NÃO participa é crime**
  (interceptação ambiental, Lei 9.296/1996 — a fonte escreve "1966", erro
  evidente de digitação dela).
- **Voz é dado pessoal sensível** pela LGPD. Mas o **art. 4º, I** exclui o
  tratamento por pessoa física para fins **estritamente pessoais e não
  econômicos** — o uso pessoal do assistente não cai nas obrigações da lei.
- **Processamento 100% local muda quem responde:** sem dado saindo do aparelho,
  o desenvolvedor deixa de ser **controlador** e passa a fornecedor de software
  de prateleira — sem RIPD, sem responsabilidade civil por vazamento. A guarda
  do áudio passa a ser do usuário.

> **Isto responde a pergunta em aberto do README:** o escopo tem que ser
> **"ouve você"**, não "ouve o ambiente". Não é preferência — é a fronteira
> entre software e crime. E o "100% local" deixa de ser bandeira de marketing
> para virar a **estrutura jurídica** que torna o projeto publicável.

## 5. O primeiro corte (MVP recomendado pelas fontes)

**Trocar o always-on por sessões sob demanda** — um toque (widget na tela
inicial ou botão físico mapeado). Isso, de uma vez: elimina o dreno da escuta
passiva, dispensa as restrições de background e **funciona em qualquer versão
do Android**.

1. **Sessão sob demanda** com um toque.
2. **Transcrição + diarização locais** — Silero VAD + Moonshine 27M (ou Vosk).
3. **Notas semânticas cifradas** — sqlite-vec + SQLCipher. *"Lembre que o
   código do portão do cliente é 4589"* → recuperável por similaridade, sem
   nuvem.
4. **Duas ações reais, e só duas** — dois Android Intents (criar nota; enviar
   SMS), para provar que a voz dispara ação estruturada.

Prova o que precisa ser provado — fala e memória locais num aparelho de 8 GB —
**sem** bater nas paredes do sistema operacional.

## 6. O que isto muda no case, como produto de conteúdo

O ângulo **melhorou**. "Construí um JARVIS" é promessa gasta e checável.
**"Tentei construir o JARVIS e descobri por que ninguém consegue — e o que dá
para construir no lugar"** é conteúdo que ninguém mais tem, é honesto, e é
exatamente a voz que a Matriz Central vende: técnica, verificável, sem hype.

A série se escreve sozinha: o bloqueio do DSP · a conta de bateria · a autópsia
de Humane e Rabbit · a fronteira legal · e o app que de fato funciona.

## 7. O que ainda precisa ser respondido

- **Aparelho de teste** — modelo e versão do Android disponíveis. Muda o que dá
  para demonstrar (App Functions exige Android recente).
- **Case documentado ou app publicado?** (decisão 1 do README, ainda aberta —
  esta spec reforça a recomendação de "documentado primeiro": o MVP acima é
  publicável, mas publicar cria loja, suporte e política de privacidade.)
- **Quando.** A frente **não é caminho crítico de receita** e não pode empurrar
  o `lancamento-publico` nem a Kiwify.

## 8. Ressalvas sobre esta spec

Tudo aqui vem de uma síntese automatizada de 86 fontes. Antes de virar promessa
pública: **reproduzir os números de bateria em aparelho real** (são o eixo do
argumento) e **conferir a citação de cada bloqueio do Android na documentação
oficial** — o erro "Lei 9.296/1966" já mostra que a síntese erra em detalhe.
Nenhum número desta spec vai para conteúdo publicado sem essa checagem.

---

## 9. O que as referências do usuário mudaram (2026-09-07)

O usuário trouxe a pilha do **ViktorKav** — Whisper / faster-whisper / Handy /
Nextcloud (lista e links em [`referencias.md`](referencias.md)). São seis fontes
de gente que **de fato roda isso**, e elas corrigem a spec em dois pontos e a
confirmam num terceiro.

### 9.1 Correção: o alvo é desktop, não Android

**Nada nesse material é celular.** Whisper roda em PC ou VPS; o Handy é
Windows/Mac/Linux; o Nextcloud é servidor de casa. Isso responde de forma
definitiva a pergunta que estava aberta desde o README — *"roda em quê?"* — e
reposiciona a frente inteira:

- **O produto construível é de mesa/casa**, não de bolso.
- **A pesquisa de Android não foi desperdiçada — virou o melhor capítulo.**
  "Por que isto não roda no seu celular, e o motivo não é técnico, é o Google
  ter fechado o DSP" é conteúdo que quase ninguém sabe explicar com fonte. Ela
  sai da posição de "veredito que mata o projeto" para "a parte que ninguém
  mais conta".
- **O eixo do argumento de bateria muda de dono.** Num PC ligado na tomada, os
  15–25% por 24 h deixam de ser impeditivo — e é por isso que a pilha do
  ViktorKav existe e a do celular não.

### 9.2 Confirmação: sob demanda venceu, e já está pronto

A pesquisa recomendou trocar always-on por **sessão sob demanda com um toque**.
O **Handy é exatamente isso**, já construído, aberto e gratuito: segura o
atalho, fala, solta, o texto cola — 100% local.

**Consequência prática, e é a decisão de engenharia mais importante desta
frente:** o "primeiro corte" que a spec desenhou **não precisa ser construído.**
Reescrevê-lo seria queimar o case refazendo software que já existe e funciona.
O case fica de pé **sobre** o Handy.

### 9.3 O buraco real: nenhuma dessas ferramentas é um assistente

Isto precisa ser dito sem rodeio, porque é onde o projeto vive ou morre:
**Whisper + Handy é transcrição, não agente.** Escrever o que você fala e
*fazer* o que você pede são coisas separadas por toda a engenharia que importa.
Falta o que a spec já tinha mapeado e que nenhuma fonte do usuário cobre:

- **memória** — sqlite-vec + embeddings, para o que foi dito ontem valer hoje;
- **intenção** — decidir se a fala é nota, pergunta ou ordem;
- **ação** — o laço de ferramentas que executa.

**É exatamente esse vão que faz o case ter conteúdo.** Se a pilha pronta já
fizesse tudo, não haveria o que construir nem o que contar.

### 9.4 Sobre o n8n

O próprio NotebookLM sugeriu ao usuário fechar o laço com **n8n**. É uma ponte
razoável: self-hosted é gratuito (compatível com a regra de custo zero), e
resolve "ação" sem escrever integrações à mão.

**Mas é decisão de arquitetura, não detalhe** — n8n é mais um serviço para
subir, manter e explicar a quem for reproduzir o case. Um assistente que exige
um orquestrador rodando 24 h é mais difícil de vender como "IA local simples"
do que um binário e um banco. **Vai para a lista de decisões do usuário**, ao
lado de "case documentado ou app publicado".

### 9.5 O que isso faz com a arquitetura da §2

A §2 continua válida como mapa do que é possível **no Android**, e é ela que
sustenta o capítulo do "por que não no celular". Para o alvo desktop, a pilha
candidata passa a ser: **Handy** (captura e transcrição) → **faster-whisper**
(`int8`, o motor que o próprio tutorial mostra rodando em VPS) → **camada nova
nossa** (memória + intenção + ação) → **Nextcloud** opcional, se o usuário
quiser guardar áudio e transcrição em casa.

Os três ajustes do tutorial do ViktorKav — vocabulário customizado, trava de
loop infinito em corte de áudio, VAD filter para ignorar silêncio — são
detalhes de quem já apanhou, e entram direto no roteiro. Foi por isso que pedi
referências de quem roda, e não mais pesquisa.

### 9.6 Próximo passo

Assistir ao vídeo e ler o tutorial **antes** de escrever qualquer roteiro
técnico: o que está acima veio dos links e do resumo do usuário, não de ter
visto o material rodando. Depois disso, o plano da frente — que hoje não existe.
