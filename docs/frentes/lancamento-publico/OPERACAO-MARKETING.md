# 🚀 OPERAÇÃO DE MARKETING — documento mestre

> **Este é o único documento que você precisa abrir.** Tudo aqui é para copiar e
> colar: arquivos, títulos, descrições, tags, palavras-chave, legendas.
>
> **Como usar:** as etapas estão numeradas na seção
> [Roteiro de execução](#-roteiro-de-execução). Faça **uma por vez**, volte aqui
> e marque. Ao concluir cada uma, me avise — eu ligo a parte do sistema que
> depende dela e te devolvo a próxima.
>
> _Criado em 2026-07-26. Auditado contra os arquivos reais, não contra
> documentação antiga._

---

## 📦 Inventário de arquivos — o que existe DE FATO

Auditei arquivo por arquivo, abrindo cada imagem. Este é o estado real:

| Arquivo | Dimensão | Para quê | Estado |
|---|---|---|---|
| `public/brand/mc-avatar-800.png` | 800×800 | Foto de perfil (YouTube, Spotify, Instagram) | ✅ **pronto** |
| `public/brand/mc-capa-spotify-3000.png` | 3000×3000 | Capa do programa no Spotify | ✅ **pronto** |
| `public/brand/mc-banner-youtube-2560x1440.png` | 2560×1440 | Banner do canal do YouTube | ✅ **refeito hoje** |
| `public/brand/thumb-verdade-ia-local.png` | 1280×720 | Thumbnail do vídeo 1 | ✅ **criado hoje** |
| `public/brand/thumb-evolucao-ia-local.png` | 1280×720 | Thumbnail do vídeo 2 | ✅ **criado hoje** |
| `public/brand/thumb-lucrando-ia-local.png` | 1280×720 | Thumbnail do vídeo 3 | ✅ **criado hoje** |
| `public/brand/logo-cubo.svg` | vetor | Logo master, qualquer material | ✅ pronto |
| `public/brand/favicon.svg` | vetor | Favicon (já no ar no site) | ✅ pronto |
| `public/brand/mc-thumbnail-template-1280x720.png` | 1280×720 | Template para thumbnails futuras | ⚙️ template |

### 🔍 O que estava errado (você estava certo em desconfiar)

Sua suspeita procedia — **em parte**:

1. **As thumbnails dos 3 vídeos NÃO existiam.** Só havia um *template* com o
   texto placeholder "TÍTULO DO EPISÓDIO AQUI". Para usar, você teria que abrir
   um editor de imagem e escrever cada título à mão. **Isso é o que ficou parado.**
   → **Resolvido:** gerei as 3 thumbnails reais, com o título de cada vídeo.
2. **O banner do YouTube tinha um defeito de arte:** o wordmark "MATRIZ CENTRAL"
   **sobrepunha o cubo** — a letra M ficava em cima da face do cubo.
   → **Resolvido:** refeito com espaçamento correto e dentro da área segura do
   YouTube (a faixa central que aparece em todos os dispositivos).
3. **Avatar e capa do Spotify estavam realmente prontos e bons** — esses não
   eram o problema.

> Onde ficam os arquivos no seu computador:
> `C:\Users\Grazi\Claude\Projects\matrizcentral\public\brand\`
> As mídias (áudio/vídeo) ficam em `notebooklm\audio\` e `notebooklm\video\`.

---

## 🎨 Identidade — use igual em todo canal

**Cores:** fundo `#0b0b0f` · violetas do cubo `#a78bfa` (topo) · `#7c5cff`
(esquerda, é o acento principal) · `#7c3aed` (direita)
**Tipografia:** **Outfit** nos títulos, **Inter** no corpo
**Wordmark:** `MATRIZ CENTRAL` em caixa alta, com respiro entre as letras

**Frase de posicionamento (use em qualquer lugar que peça uma linha):**
```
IA local — sem nuvem, sem mensalidade, com autonomia.
```

---

# 📺 CANAL 1 — YouTube

### Configuração do canal

**Nome do canal:**
```
Matriz Central
```

**Handle:**
```
@matrizcentral
```

**Foto de perfil:** `public/brand/mc-avatar-800.png`
**Banner:** `public/brand/mc-banner-youtube-2560x1440.png`

**Descrição do canal (colar inteiro):**
```
IA rodando na sua máquina — sem mensalidade, sem nuvem alheia.

Relatórios, comparativos e debates sobre modelos locais, hardware e automação, do iniciante ao avançado. Aqui você descobre o que roda no computador que você já tem, e como parar de pagar assinatura para usar inteligência artificial.

Vídeos novos acompanham o portal: https://www.matrizcentral.com.br
```

**Palavras-chave do canal** (YouTube Studio → Configurações → Canal → Palavras-chave):
```
ia local, inteligência artificial local, llm local, rodar ia no pc, ollama, lm studio, modelos open source, ia sem mensalidade, privacidade ia, hardware para ia, ia offline, alternativa chatgpt
```

**Links do canal:** `Portal` → `https://www.matrizcentral.com.br`

---

### 🎬 Vídeo 1

**Arquivo:** `notebooklm\video\video-verdade-ia-local.mp4`
**Thumbnail:** `public\brand\thumb-verdade-ia-local.png`

**Título:**
```
A Verdade sobre IA Local
```

**Descrição:**
```
Por que alguns modelos locais já superam serviços pagos em determinados cenários — e onde eles ainda perdem. Sem hype: o que dá para fazer hoje, na máquina que você já tem.

Neste vídeo:
• Onde o modelo local ganha do serviço pago
• Onde ele ainda perde, e por quê
• Como decidir se vale a pena para o seu caso

A Matriz Central é uma plataforma de IA local: relatórios, podcasts, vídeos e pesquisas para rodar modelos no seu próprio hardware, com privacidade e sem mensalidade.

👉 Portal: https://www.matrizcentral.com.br

#IALocal #InteligenciaArtificial #Privacidade
```

**Tags** (campo "Tags" no Studio):
```
ia local, llm local, inteligência artificial local, rodar ia no computador, alternativa chatgpt, privacidade, ia offline, modelos open source, ollama
```

---

### 🎬 Vídeo 2

**Arquivo:** `notebooklm\video\video-evolucao-ia-local.mp4`
**Thumbnail:** `public\brand\thumb-evolucao-ia-local.png`

**Título:**
```
A Evolução da IA Local
```

**Descrição:**
```
A linha do tempo que mostra como a IA local passou de curiosidade técnica a substituta real de serviço pago — e o que mudou no hardware e nos modelos para isso acontecer.

Neste vídeo:
• De onde a IA local partiu
• O que destravou o salto de qualidade
• Onde ela está agora, e para onde vai

A Matriz Central é uma plataforma de IA local: relatórios, podcasts, vídeos e pesquisas para rodar modelos no seu próprio hardware, com privacidade e sem mensalidade.

👉 Portal: https://www.matrizcentral.com.br

#IALocal #InteligenciaArtificial #OpenSource
```

**Tags:**
```
ia local, evolução da ia, llm open source, história da inteligência artificial, modelos locais, hardware para ia, ia offline, llama, mistral
```

---

### 🎬 Vídeo 3

**Arquivo:** `notebooklm\video\video-lucrando-ia-local.mp4`
**Thumbnail:** `public\brand\thumb-lucrando-ia-local.png`

**Título:**
```
Lucrando com IA Local
```

**Descrição:**
```
Como transformar modelos gratuitos rodando em VPS barata num serviço que gera receita — com os números na mesa, não com promessa.

Neste vídeo:
• Que serviços dá para vender rodando modelo local
• Quanto custa a infraestrutura de verdade
• Onde a conta fecha e onde ela não fecha

A Matriz Central é uma plataforma de IA local: relatórios, podcasts, vídeos e pesquisas para rodar modelos no seu próprio hardware, com privacidade e sem mensalidade.

👉 Portal: https://www.matrizcentral.com.br

#IALocal #NegociosDigitais #InteligenciaArtificial
```

**Tags:**
```
ia local, ganhar dinheiro com ia, monetizar inteligência artificial, vps para ia, negócio com ia, serviço de ia, automação, empreender com tecnologia
```

---

### ⚙️ Configuração que vale para os 3 vídeos

- **Público:** "Não, não é conteúdo para crianças"
- **Visibilidade:** **Não listado** — o player embutido no site funciona igual, mas o vídeo não aparece no seu canal antes do lançamento. Vira Público depois com dois cliques, **sem trocar o link**.
- **Idioma:** Português (Brasil)
- **Categoria:** Ciência e tecnologia
- **Depois de publicar:** Compartilhar → Copiar link (`https://youtu.be/...`)

---

# 🎧 CANAL 2 — Spotify

### Configuração do programa

**Onde:** [creators.spotify.com](https://creators.spotify.com)

**Nome do programa:**
```
Matriz Central Podcast
```

**Capa:** `public/brand/mc-capa-spotify-3000.png`
**Idioma:** Português (Brasil) · **Categoria:** Technology

**Descrição do programa (colar inteiro):**
```
O podcast da Matriz Central sobre IA local: modelos que rodam no seu computador, hardware que aguenta, automação que funciona.

Sem hype — número, passo e resultado. Se você usa inteligência artificial todos os dias e cansou de pagar mensalidade, este é o seu lugar.

Portal: https://www.matrizcentral.com.br
```

> ⚠️ **Ajuste ao insumo antigo:** a descrição que estava no handoff anterior
> citava "Com Jeferson e Marina, e convidados por episódio". **Os áudios do
> NotebookLM não têm esses hosts fixos** — anunciar nomes que o ouvinte não vai
> encontrar quebra a expectativa logo no primeiro episódio. Removi. Se você
> quiser nomear os hosts, me diga e eu reescrevo.

---

### 🎙️ Publique nesta ordem (vira a numeração dos episódios)

Para cada um: **New episode** → arrastar o `.m4a` → título → descrição →
**Publish now** → abrir no Spotify → Compartilhar → **Copiar link do episódio**.

---

**Episódio 1** — arquivo `notebooklm\audio\podcast-rode-ia-potente.m4a`

Título:
```
Rode IA Potente Direto no Seu Computador
```
Descrição:
```
Como colocar uma IA de verdade rodando na sua máquina sem pagar mensalidade. O que dá para rodar hoje, o que ainda não dá, e por onde começar sem quebrar nada.

Mais relatórios, vídeos e pesquisas em https://www.matrizcentral.com.br
```

---

**Episódio 2** — arquivo `notebooklm\audio\podcast-ias-poderosas.m4a`

Título:
```
IAs Poderosas Rodando no Seu Computador
```
Descrição:
```
O setup que transforma um computador comum em uma central de IA para o dia a dia — sem placa de vídeo de servidor e sem depender da nuvem.

Mais relatórios, vídeos e pesquisas em https://www.matrizcentral.com.br
```

---

**Episódio 3** — arquivo `notebooklm\audio\podcast-melhor-ia-hardware.m4a`

Título:
```
A Melhor IA para Seu Hardware Local
```
Descrição:
```
O organograma que usamos para decidir qual IA instalar em menos de dois minutos, partindo do hardware que você já tem.

Mais relatórios, vídeos e pesquisas em https://www.matrizcentral.com.br
```

---

**Episódio 4** — arquivo `notebooklm\audio\podcast-escolher-ias-sem-travar.m4a`

Título:
```
Como Escolher IAs Locais Sem Travar
```
Descrição:
```
Os erros mais comuns que travam a IA local — e como evitá-los antes de instalar, não depois de perder a tarde.

Mais relatórios, vídeos e pesquisas em https://www.matrizcentral.com.br
```

---

**Episódio 5** — arquivo `notebooklm\audio\podcast-vibe-coding-fim-programador.m4a`

Título:
```
Vibe Coding e o Fim do Programador Tradicional?
```
Descrição:
```
Debate: o que os projetos 100% gerados por IA dizem sobre o futuro de quem programa. Sem hype e sem pânico — o que já acontece de fato.

Mais relatórios, vídeos e pesquisas em https://www.matrizcentral.com.br
```

---

**Episódio 6** — arquivo `notebooklm\audio\podcast-vibe-coding-engenharia.m4a`

Título:
```
Vibe Coding e a Engenharia de Software
```
Descrição:
```
Velocidade de produção contra qualidade: onde a IA acelera de verdade e onde ela quebra o design do sistema.

Mais relatórios, vídeos e pesquisas em https://www.matrizcentral.com.br
```

---

# 📸 CANAL 3 — Instagram *(opcional, só quando os outros dois estiverem no ar)*

**Foto de perfil:** `public/brand/mc-avatar-800.png`

**Nome:** `Matriz Central` · **Usuário:** `@matrizcentral`

**Bio (colar):**
```
IA local, sem mensalidade.
Relatórios, podcasts e vídeos para rodar IA na sua máquina.
↓ Portal
```
**Link:** `https://www.matrizcentral.com.br`

---

# ✅ ROTEIRO DE EXECUÇÃO

Faça **uma etapa por vez**. Ao concluir, me avise — eu ligo o que depende dela.

### Etapa 1 — Criar o canal do YouTube
- [ ] Criar canal com nome `Matriz Central` e handle `@matrizcentral`
- [ ] Subir foto de perfil (`mc-avatar-800.png`) e banner (`mc-banner-youtube-2560x1440.png`)
- [ ] Colar a descrição e as palavras-chave do canal
- [ ] **Me avisar** → eu confiro se o canal aparece certo

### Etapa 2 — Subir os 3 vídeos
- [ ] Vídeo 1 (`video-verdade-ia-local.mp4`) com título, descrição, tags e thumbnail
- [ ] Vídeo 2 (`video-evolucao-ia-local.mp4`)
- [ ] Vídeo 3 (`video-lucrando-ia-local.mp4`)
- [ ] **Me mandar os 3 links** → eu ligo os players no site e verifico em produção

### Etapa 3 — Criar o programa no Spotify
- [ ] Criar `Matriz Central Podcast` com a capa e a descrição
- [ ] **Me avisar**

### Etapa 4 — Subir os 6 podcasts (na ordem 1→6)
- [ ] Episódios 1 a 6, cada um com título e descrição
- [ ] **Anotar a duração real** que o Spotify mostrar em cada um
- [ ] **Me mandar os 6 links + as durações** → eu ligo os players e corrijo as durações erradas do site

### Etapa 5 — Aprovar as copies do site
- [ ] Abrir [`copy-para-aprovacao.md`](copy-para-aprovacao.md) e responder `C1` a `C11`
- [ ] **Me mandar as respostas** → eu aplico e deployo

### Etapa 6 — Criar a conta Kiwify
- [ ] Criar conta e me avisar quando estiver logado
- [ ] → eu escrevo a integração (webhook de compra aprovada/reembolso/chargeback)

### Etapa 7 — Instagram *(opcional)*
- [ ] Criar perfil com avatar, bio e link

---

## O que acontece do meu lado a cada etapa

| Sua etapa | O que eu faço em seguida |
|---|---|
| 2 (links dos vídeos) | Ligo os `embedUrl`, escalono as datas de publicação, tiro o selo "em breve" dos 3 vídeos, verifico os players em produção |
| 4 (links dos podcasts) | Idem para os 6 podcasts + **corrijo as durações erradas** dos 4 antigos |
| 2 + 4 concluídas | O eixo audiovisual sai do zero — a landing passa a poder anunciar podcasts e vídeos **sem mentir** (hoje 9 de 16 itens estão vazios) |
| 5 (copies) | Aplico as aprovadas, reescrevo as observadas, deployo |
| 6 (Kiwify) | Escrevo a integração e ligo o "até 12x" de verdade |

## Fora deste lote (registrado, sem prazo)

Slides, infográficos e o quiz do Estúdio do NotebookLM **não têm vitrine** na
plataforma hoje. Ficam no backlog até existir um formato "apresentação" no hub.
Não bloqueiam nada.
