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
