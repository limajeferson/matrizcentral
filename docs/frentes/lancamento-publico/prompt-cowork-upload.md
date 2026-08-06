# 🤖 Prompt para o Claude Cowork — subir as 9 mídias

> **Para o usuário.** Este documento tem duas partes: um **tutorial curto** com o
> que você precisa saber antes, e o **prompt pronto para colar** no Cowork.
> Gerado em 2026-08-06.

---

## Parte 1 — Tutorial: o que travou antes e como destravar

Na tentativa de 2026-07-28 o Cowork **criou o canal do YouTube inteiro com
sucesso** (nome, handle, avatar, banner, descrição, palavras-chave) e parou na
hora de enviar o Vídeo 1: chegou na tela de upload do YouTube Studio, clicou em
"Selecionar arquivos", e a **janela nativa de arquivo do Windows** abriu.

O registro da época diz que "nenhuma automação de navegador enxerga essa janela"
— e isso é verdade para automação **de navegador**. Mas o Cowork controla o
**desktop**, então ele consegue interagir com a janela. O que provavelmente
faltou foi a técnica certa.

### 🔑 A técnica: não navegue pelas pastas, cole o caminho

Toda janela de arquivo do Windows tem um campo **"Nome do arquivo"**. Você pode
**digitar o caminho completo ali e apertar Enter** — o Windows abre o arquivo
direto, sem precisar clicar em pasta nenhuma. É uma operação de teclado, muito
mais confiável para um agente do que caçar ícones numa árvore de diretórios.

Os caminhos completos estão no prompt abaixo, prontos para colar.

### O que você precisa ter aberto/logado antes de acionar o Cowork

- **YouTube:** já logado na conta do canal `@centralmatriz`. ✅ (verificado hoje)
- **Spotify for Creators:** a conta **precisa existir antes**. Criar conta e
  digitar senha não é tarefa de agente — faça você em
  [creators.spotify.com](https://creators.spotify.com), crie o programa
  **"Matriz Central Podcast"** e só então acione o Cowork para os episódios.

### Duas decisões suas, antes de começar

1. **Visibilidade dos vídeos.** Recomendo **"Não listado"**: você confere título,
   descrição e thumbnail antes de qualquer pessoa ver, e a URL já serve para
   ligar o player no site. Virar público depois é um clique.
2. **O que fazer primeiro.** O Spotify leva de horas a poucos dias para aprovar
   um programa novo. Se houver data de lançamento, crie o programa **antes** de
   tudo, para a fila de aprovação correr em paralelo.

---

## Parte 2 — O prompt (copie daqui para baixo)

```
Você vai subir mídias para dois canais da Matriz Central, a partir de arquivos
que já estão nesta máquina. Trabalhe em português do Brasil.

## Contexto

O canal do YouTube já existe e está configurado (você mesmo criou numa sessão
anterior): youtube.com/@centralmatriz. Está tudo pronto — nome, handle, avatar,
banner, descrição, palavras-chave. Falta APENAS enviar os vídeos.

Os arquivos estão em:
C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\
C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\audio\

Os títulos, descrições e thumbnails de cada item estão no arquivo:
C:\Users\jefer\Documents\Projetos\matrizcentral\docs\frentes\lancamento-publico\OPERACAO-MARKETING.md

LEIA ESSE ARQUIVO PRIMEIRO. Ele tem, para cada vídeo, o título exato, a
descrição pronta para colar e o caminho da thumbnail. Não invente título nem
descrição — use os de lá, literalmente.

## ⚠️ A técnica que resolve o bloqueio conhecido

Quando a janela nativa de arquivo do Windows abrir, NÃO tente navegar pelas
pastas clicando. Em vez disso:

1. Clique no campo "Nome do arquivo" da janela.
2. Cole o CAMINHO COMPLETO do arquivo.
3. Aperte Enter.

O Windows abre o arquivo direto. Foi navegar visualmente pelas pastas que travou
a tentativa anterior.

## Tarefa 1 — YouTube: 3 vídeos

Vá em studio.youtube.com, com a conta do canal @centralmatriz.

Para cada um dos 3 arquivos abaixo, faça um upload:

1. C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\video-verdade-ia-local.mp4
2. C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\video-evolucao-ia-local.mp4
3. C:\Users\jefer\Documents\Projetos\matrizcentral\notebooklm\video\video-lucrando-ia-local.mp4

Em cada um:
- Título e descrição: copie do OPERACAO-MARKETING.md (seção "CANAL 1 — YouTube").
- Thumbnail: o arquivo indicado lá, em public/brand/.
- Público-alvo: marque "Não, não é conteúdo para crianças".
- Visibilidade: NÃO LISTADO. Não publique como público.

Depois de cada upload terminar de processar, copie a URL do vídeo
(formato https://www.youtube.com/watch?v=XXXXXXXXXXX) e anote.

## Tarefa 2 — Spotify: 6 episódios

Só faça esta tarefa se o programa "Matriz Central Podcast" JÁ EXISTIR em
creators.spotify.com. Se não existir, PARE e avise o usuário — criar conta e
programa é tarefa dele, não sua.

Se existir, para cada arquivo abaixo, crie um episódio novo:

1. ...\notebooklm\audio\podcast-rode-ia-potente.m4a
2. ...\notebooklm\audio\podcast-ias-poderosas.m4a
3. ...\notebooklm\audio\podcast-melhor-ia-hardware.m4a
4. ...\notebooklm\audio\podcast-escolher-ias-sem-travar.m4a
5. ...\notebooklm\audio\podcast-vibe-coding-fim-programador.m4a
6. ...\notebooklm\audio\podcast-vibe-coding-engenharia.m4a

(O caminho completo de cada um começa com
C:\Users\jefer\Documents\Projetos\matrizcentral\)

Título e descrição de cada episódio: também no OPERACAO-MARKETING.md, seção
"CANAL 2 — Spotify".

IMPORTANTE: ao publicar cada episódio, ANOTE A DURAÇÃO REAL que o Spotify
mostrar. O site tem durações erradas cadastradas e elas serão corrigidas com
esse número.

Depois de publicar, abra o episódio no Spotify normal, use Compartilhar → Copiar
link do episódio (formato https://open.spotify.com/episode/XXXX) e anote.

## O que devolver no fim

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

Esses identificadores são os ids reais dos itens no código do site — não os
altere, é por eles que o conteúdo vai ser ligado.

## Regras

- NÃO crie conta em lugar nenhum e NÃO digite senha. Se pedirem login, pare e
  avise o usuário.
- NÃO publique nada como público no YouTube. Não listado, sempre.
- NÃO aceite termos, contratos ou políticas em nome do usuário.
- Se um upload falhar duas vezes seguidas, pare e relate o que aconteceu em vez
  de continuar tentando.
- Se um vídeo receber aviso de direitos autorais ou restrição, NÃO tente
  contestar — anote e relate.
```

---

## Parte 3 — O que acontece depois

Quando o Cowork devolver a lista, cole no Claude Code. Ele vai:

1. Preencher o `embedUrl` dos 9 itens em `src/data/content-hub.ts` — eles saem do
   selo **"em breve"** e viram players tocáveis no site.
2. Escalonar o `publishedAt` de cada um (a barra de stories mostra o que foi
   publicado nos últimos 7 dias — subir tudo com a mesma data faria os 9
   aparecerem de uma vez e sumirem juntos).
3. Corrigir os `durationMinutes` dos 4 podcasts antigos, que estão errados no
   código, usando as durações reais que o Cowork anotou.
4. Verificar os players **em produção**, não só localmente.

## Alternativa: o Claude Code faz o upload

Se preferir não usar o Cowork, o Claude Code tem uma ferramenta que injeta o
arquivo direto no campo de upload da página, **sem passar pela janela nativa**.
Ele consegue subir os vídeos do YouTube com você logado no Chrome. É só pedir —
mas ele vai perguntar a visibilidade antes, porque publicar em canal seu é ação
sua para autorizar.
