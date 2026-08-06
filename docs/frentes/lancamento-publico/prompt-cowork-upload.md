# 🤖 Prompt para o Claude Cowork — subir as 9 mídias

> **Para o usuário.** Tutorial curto + prompt pronto para colar no Cowork.
> Atualizado em 2026-08-06 com os caminhos corretos e a etapa do Spotify.

---

## Parte 1 — Por que é o Cowork que faz isso

O Claude Code **não consegue** subir esses arquivos. A ferramenta de upload dele
tem **limite de 10 MB por chamada** e só aceita arquivos de pastas compartilhadas
com a sessão. Os vídeos têm 33–52 MB e os podcasts 23–53 MB — todos fora do
limite. Não é a janela do Windows que impede; é o tamanho.

O Cowork controla o **desktop**, então ele opera a janela nativa de arquivo e não
tem esse teto.

### 🔑 A técnica que destrava a janela de arquivo

Na tentativa de 2026-07-28 o Cowork criou o canal do YouTube inteiro com sucesso
e travou na hora de enviar o vídeo: a janela nativa do Windows abriu e ele tentou
navegar pelas pastas clicando.

**Não navegue.** Toda janela de arquivo do Windows tem o campo **"Nome do
arquivo"**: cole o caminho completo ali e aperte **Enter**. O Windows abre direto,
sem clicar em pasta nenhuma. É operação de teclado — muito mais confiável.

### Estado dos canais (verificado hoje)

| Canal | Estado |
|---|---|
| **YouTube** `@centralmatriz` | ✅ Canal criado e configurado (nome, avatar, banner, descrição, palavras-chave). **Zero vídeos.** Usuário logado. |
| **Spotify for Creators** | ✅ Conta criada. ❌ **Programa "Matriz Central Podcast" ainda NÃO existe** — o Cowork cria (é configuração, não cadastro). |
| **Kiwify** | ✅ Cadastro completo ("já pode começar a vender"). ❌ Nenhum produto criado. *(fora do escopo deste prompt)* |

### Uma decisão sua antes de acionar

**Visibilidade dos vídeos.** O prompt manda subir como **"Não listado"**: você
confere título, descrição e thumbnail antes de qualquer pessoa ver, e a URL já
serve para ligar o player no site. Virar público é um clique depois. Se preferir
público direto, altere a linha correspondente no prompt.

---

## Parte 2 — O prompt (copie daqui para baixo)

```
Você vai publicar mídias em dois canais da Matriz Central, a partir de arquivos
que já estão nesta máquina. Trabalhe em português do Brasil.

## Antes de tudo: leia o kit

Todos os títulos, descrições, tags e caminhos de thumbnail já estão escritos em:

C:\Users\jefer\Documents\Projetos\matrizcentral\docs\frentes\lancamento-publico\OPERACAO-MARKETING.md

LEIA ESSE ARQUIVO PRIMEIRO, inteiro. Use os textos de lá LITERALMENTE. Não
invente título, descrição nem tag — já foram escritos e revisados.

## ⚠️ A técnica que resolve o bloqueio conhecido

Quando a janela nativa de arquivo do Windows abrir, NÃO navegue pelas pastas
clicando. Em vez disso:

1. Clique no campo "Nome do arquivo".
2. Cole o CAMINHO COMPLETO do arquivo.
3. Aperte Enter.

Foi tentar navegar visualmente que travou a tentativa anterior.

## TAREFA 1 — YouTube: 3 vídeos

Vá em studio.youtube.com (conta do canal @centralmatriz, já logada).

Para cada arquivo, um upload. Use o texto da seção "CANAL 1 — YouTube" do kit:

1. C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\video-verdade-ia-local.mp4
   → título "A Verdade sobre IA Local", thumbnail public\brand\thumb-verdade-ia-local.png

2. C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\video-evolucao-ia-local.mp4
   → título "A Evolução da IA Local", thumbnail public\brand\thumb-evolucao-ia-local.png

3. C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\video-lucrando-ia-local.mp4
   → título "Lucrando com IA Local", thumbnail public\brand\thumb-lucrando-ia-local.png

(As thumbnails ficam em C:\Users\jefer\Documents\Projetos\matrizcentral\public\brand\)

Em cada vídeo:
- Descrição e tags: copie do kit, literalmente.
- Público-alvo: marque "Não, não é conteúdo para crianças".
- VISIBILIDADE: NÃO LISTADO. Não publique como público.

Quando o processamento terminar, copie a URL
(formato https://www.youtube.com/watch?v=XXXXXXXXXXX) e anote.

## TAREFA 2 — Spotify: criar o programa e publicar 6 episódios

A conta em creators.spotify.com já existe e o usuário está logado. O PROGRAMA
ainda não existe — crie você, usando a seção "CANAL 2 — Spotify" do kit:

- Nome: Matriz Central Podcast
- Capa: C:\Users\jefer\Documents\Projetos\matrizcentral\public\brand\mc-capa-spotify-3000.png
- Idioma: Português (Brasil) · Categoria: Technology
- Descrição: a do kit, literalmente

Se em algum momento pedirem para criar conta nova ou digitar senha, PARE e avise
o usuário — isso é tarefa dele, não sua.

Depois publique os 6 episódios NESTA ORDEM (a ordem vira a numeração):

1. ...\notebooklm\audio\podcast-rode-ia-potente.m4a
2. ...\notebooklm\audio\podcast-ias-poderosas.m4a
3. ...\notebooklm\audio\podcast-melhor-ia-hardware.m4a
4. ...\notebooklm\audio\podcast-escolher-ias-sem-travar.m4a
5. ...\notebooklm\audio\podcast-vibe-coding-fim-programador.m4a
6. ...\notebooklm\audio\podcast-vibe-coding-engenharia.m4a

(Caminho completo de cada um começa com
C:\Users\jefer\Documents\Projetos\matrizcentral\)

Título e descrição de cada episódio: no kit.

IMPORTANTE: ao publicar cada episódio, ANOTE A DURAÇÃO REAL em minutos que o
Spotify mostrar. O site tem durações erradas cadastradas e serão corrigidas com
esses números.

Depois de publicado, abra o episódio no Spotify normal → Compartilhar → Copiar
link do episódio (formato https://open.spotify.com/episode/XXXX) e anote.

## O QUE DEVOLVER NO FIM

Uma lista, uma linha por item, exatamente neste formato:

video-verdade-ia-local → <url>
video-evolucao-ia-local → <url>
video-lucrando-ia-local → <url>
podcast-rode-ia-potente → <url> | duração: XX min
podcast-ias-poderosas → <url> | duração: XX min
podcast-melhor-ia-hardware → <url> | duração: XX min
podcast-escolher-ias-sem-travar → <url> | duração: XX min
podcast-vibe-coding-fim-programador → <url> | duração: XX min
podcast-vibe-coding-engenharia → <url> | duração: XX min

Esses identificadores são os ids reais dos itens no código do site. NÃO os
altere — é por eles que o conteúdo vai ser ligado.

## REGRAS

- NÃO crie conta em lugar nenhum e NÃO digite senha.
- NÃO publique vídeo como público no YouTube. Não listado, sempre.
- NÃO aceite termos, contratos ou políticas em nome do usuário.
- Se um upload falhar duas vezes seguidas, PARE e relate — não fique tentando.
- Se algum vídeo receber aviso de direitos autorais, NÃO conteste. Anote e relate.
- Se ficar em dúvida sobre qualquer texto, use o do kit. Nunca improvise copy.
```

---

## Parte 3 — O que o Claude Code faz depois

Cole a lista de volta no Claude Code. Ele vai:

1. Preencher o `embedUrl` dos 9 itens em `src/data/content-hub.ts` — eles saem do
   selo **"em breve"** e viram players tocáveis.
2. Escalonar o `publishedAt` de cada um. A barra de stories mostra o que saiu nos
   últimos 7 dias — publicar tudo com a mesma data faria os 9 aparecerem e
   sumirem juntos.
3. Corrigir os `durationMinutes` dos 4 podcasts antigos, que estão errados no
   código, com as durações reais anotadas.
4. Verificar os players **em produção**.

## Estado dos arquivos (2026-08-06)

As pastas foram consolidadas nesta data: havia uma subpasta aninhada
(`notebooklm/video/video/`) criada por engano ao remontar o ambiente. Os arquivos
canônicos — os que o kit referencia — estão agora direto em `notebooklm/video/` e
`notebooklm/audio/`. Versões antigas com outros nomes foram preservadas em
`notebooklm/_antigos/`, e **não devem ser usadas**.
