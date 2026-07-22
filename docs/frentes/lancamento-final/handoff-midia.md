# Hand-off de mídia — subir podcasts (Spotify) e vídeos (YouTube) e devolver as URLs

> Gerado no fechamento da Task E4 (2026-07-22). Os 9 arquivos foram baixados do
> Estúdio do NotebookLM pelo Claude e estão em `notebooklm/audio/` e
> `notebooklm/video/` (pastas locais, gitignored). O upload é seu (contas
> Spotify/YouTube são suas — limite de autonomia). Quando devolver as URLs, o
> Claude executa a Task E5 (ligar os `embedUrl` e publicar tudo na vitrine).

## Mapa: arquivo ↔ item da plataforma

| # | Arquivo local | Item no `CONTENT_HUB` | Destino |
|---|---|---|---|
| 1 | `notebooklm/audio/podcast-rode-ia-potente.m4a` | `podcast-rode-ia-potente` — "Rode IA Potente Direto no Seu Computador" | Spotify |
| 2 | `notebooklm/audio/podcast-ias-poderosas.m4a` | `podcast-ias-poderosas` — "IAs Poderosas Rodando no Seu Computador" | Spotify |
| 3 | `notebooklm/audio/podcast-melhor-ia-hardware.m4a` | `podcast-melhor-ia-hardware` — "A Melhor IA para Seu Hardware Local" | Spotify |
| 4 | `notebooklm/audio/podcast-escolher-ias-sem-travar.m4a` | `podcast-escolher-ias-sem-travar` — "Como Escolher IAs Locais Sem Travar" | Spotify |
| 5 | `notebooklm/audio/podcast-vibe-coding-fim-programador.m4a` | `podcast-vibe-coding-fim-programador` — "Vibe Coding e o Fim do Programador Tradicional?" (novo, Task E6) | Spotify |
| 6 | `notebooklm/audio/podcast-vibe-coding-engenharia.m4a` | `podcast-vibe-coding-engenharia` — "Vibe Coding e a Engenharia de Software" (novo, Task E6) | Spotify |
| 7 | `notebooklm/video/video-verdade-ia-local.mp4` | `video-verdade-ia-local` — "A Verdade sobre IA Local" | YouTube |
| 8 | `notebooklm/video/video-evolucao-ia-local.mp4` | `video-evolucao-ia-local` — "A Evolução da IA Local" | YouTube |
| 9 | `notebooklm/video/video-lucrando-ia-local.mp4` | `video-lucrando-ia-local` — "Lucrando com IA Local" (novo, Task E6) | YouTube |

## Passo a passo — Spotify (podcasts, itens 1–6)

1. Acesse [creators.spotify.com](https://creators.spotify.com) (Spotify for
   Creators, ex-Podcasters) e entre com sua conta.
2. Se ainda não existe, crie o programa **"Matriz Central Podcast"** (nome
   citado no seu diálogo do NotebookLM): "Create a podcast", capa (pode usar a
   logo da Matriz), descrição curta, idioma pt-BR, categoria Tecnologia.
3. Para CADA arquivo `.m4a` da tabela: **New episode** → arraste o arquivo →
   título = o título do item na tabela acima → descrição = 2–3 frases (pode
   copiar a `description` do `CONTENT_HUB`) → publicar.
4. Depois de publicado, abra o episódio no Spotify normal → botão
   compartilhar → **Copy episode link** (formato
   `https://open.spotify.com/episode/<id>`).
5. Devolva no chat, uma linha por item: `podcast-rode-ia-potente → <link>`.

## Passo a passo — YouTube (vídeos, itens 7–9)

1. Acesse [studio.youtube.com](https://studio.youtube.com) com a conta do
   canal da Matriz Central (criar canal se não existir).
2. **Criar → Enviar vídeos** → arraste o `.mp4` → título = o título da tabela
   → descrição com 2–3 frases + link `https://www.matrizcentral.com.br` →
   "Não é conteúdo para crianças" → visibilidade **Não listado** (recomendado:
   o player embed funciona e o vídeo não aparece público no canal antes do
   lançamento; dá para tornar público depois) ou Público.
3. Copie o link (`https://youtu.be/<id>` ou `watch?v=<id>`).
4. Devolva no chat: `video-verdade-ia-local → <link>`.

## O que acontece quando você devolver as URLs (Task E5, Claude)

- `embedUrl` + `publishedAt` setados nos 9 itens; players `VideoPlayer`/
  `MusicPlayerCard` já tratam YouTube/Spotify (`parseMediaSource`).
- Gate + deploy + verificação dos players **em produção** (L-041/L-044).

## Fora do escopo (registrado, sem dono ainda)

- Artefatos do Estúdio SEM vitrine no produto: slides (Dissecting Kimi K3,
  Homelab Master Blueprint, Mastering Local AI, The Local AI Revolution),
  infográficos (Comparativo de Chamada de Ferramentas, Evolução das IAs
  Locais), quiz (IA Quiz) e os technical reviews não curados. Backlog: avaliar
  formato "apresentação"/"infográfico" no hub numa trilha futura.
- Os 2 relatórios texto do Estúdio já cobertos de outra forma: "Panorama
  Estratégico" (já publicado) e "Kimi K3" (curado na Task E6).
