# Reestruturação das Seções 2 e 3 da Landing — Design

**Data:** 2026-07-07
**Status:** Aprovado para implementação
**Escopo:** Redividir a função das seções 2 (`SystemSection`) e 3 (`ContentLibrarySection`) da landing, reescrever as descrições do `CONTENT_HUB` como *fascinations*, e separar conteúdo "novo/disponível" de "em breve" com base nos ativos reais em `/notebooklm/`.

---

## 1. Diagnóstico

Hoje as seções 2 e 3 respondem à mesma pergunta ("o que eu recebo?") e parecem repetidas (ambas listam ebook + trilha + XP + certificado). A correção não é de copy, é de **função**: cada seção deve responder uma única dúvida do visitante.

- **Seção 2 (`SystemSection`)** → responde **"Por que esse sistema é diferente?"** → vende **o método**.
- **Seção 3 (`ContentLibrarySection`)** → responde **"Como é estudar dentro da Matriz Central?"** → vende **a experiência/plataforma**.

Ordem atual da página já é adequada (Hero → Opportunity → System → ContentLibrary → ProcessSteps → Strategy → Pricing → FAQ); **não há reordenação**, apenas repropósito das seções 2 e 3.

---

## 2. Seção 2 — `SystemSection` (vende o MÉTODO)

**Tag:** manter `O sistema` (ou `Por que é diferente`) — usar `Por que é diferente`.

**Heading:** `Um sistema, muito além da leitura isolada` (substitui "Um sistema, não um ebook solto").

**Intro nova** (parágrafo antes dos cards):
> Você não compra apenas conteúdo. Você entra em um sistema pensado para levar você do primeiro contato com IA Local até a utilização prática, seguindo uma sequência organizada de aprendizado. Cada recurso existe para resolver uma etapa da jornada.

**4 cards** — cada um com **benefício no título** + nome do recurso + descrição (copy canônica do usuário):

| Benefício (título) | Recurso | Descrição | Ícone SVG |
|---|---|---|---|
| Descubra por onde começar | Diagnóstico Inicial | Em vez de procurar informações aleatórias, o sistema identifica seu contexto e recomenda a melhor trilha para começar. | `IconCompass` |
| Aprenda em uma sequência lógica | Roadmap Inteligente | Cada etapa desbloqueia a próxima para que você evolua sem estudar conteúdos fora do seu momento. | `IconRoad` |
| Estude no formato que preferir | Biblioteca Multimídia | Leia, assista ou ouça o mesmo conhecimento em diferentes formatos, mantendo sempre o mesmo objetivo. | `IconBooks` |
| Acompanhe sua evolução | Progressão + Certificação | Veja seu progresso crescer ao longo da jornada e valide o conhecimento adquirido ao final da trilha. | `IconTrophy` |

**Mudança visual importante:** os cards atuais usam **imagens externas do Unsplash** (`images.unsplash.com`), o que viola custo zero / "sem assets externos". Substituir a imagem de cada card por um dos **ícones SVG inline** já existentes em `icons.tsx` (bússola, estrada, livros, troféu), herdando `currentColor`. Remove a dependência de rede e alinha com a estética do resto.

Manter a animação de foco/hover existente (framer-motion) e a estrutura `.mc-system-*`; só troca o conteúdo de `mc-system-image-wrap` (de `<img>` para o componente de ícone) e os textos. Ajustar CSS de `.mc-system-image-wrap`/`.mc-system-image` para acomodar um ícone centralizado em vez de foto (ex.: fundo sutil + ícone `--mc-accent`).

---

## 3. Seção 3 — `ContentLibrarySection` (vende a EXPERIÊNCIA)

**Tag:** manter `A central`.

**Heading:** `Não é um livro digital.` / `É uma central colaborativa.` (substitui "Não é um ebook. / É uma central.").

**Copy de experiência** (substitui o subtítulo atual):
> A Matriz Central reúne diferentes formatos de conteúdo em um único ambiente. Escolha como aprender, continue exatamente de onde parou e descubra novos materiais conforme evolui — tudo organizado em um só lugar.

**Substituir o bloco de "inventário"** (hoje: `2 Relatórios · 4 Podcasts · 2 Vídeos · 3 Apresentações · 1 Pesquisa`, que parece estoque) por um bloco **"vivo"**:
> **Atualizado constantemente**
> Novos conteúdos entram na plataforma conforme novas pesquisas, modelos e ferramentas surgem. Você sempre terá novos materiais para continuar evoluindo.

Classe nova `.mc-library-living` (ícone + título + texto). O `formatCounts()` continua existindo (usado no hero e nos testes) — apenas **sai desta vitrine visual**; não remover a função.

**Subtítulo antes dos cards:** `Últimos conteúdos adicionados` (classe `.mc-library-latest-title`).

### Cards premium (estilo software)

Reescrever `.mc-library-card` para um layout mais premium:
- **Selo de status** no topo:
  - `NOVO` (destaque, cor `--mc-accent`) para itens **disponíveis**.
  - `em breve` (cor `--mc-warn`) para itens **não publicados** (mantém a regra atual).
- **Título** do conteúdo.
- **Fascination** (nova `description` do `CONTENT_HUB` — ver §4).
- **Meta:** `{duração} min · +{XP} XP`.
- **Ação:** para itens disponíveis, um affordance `Abrir {tipo} →` (`Abrir relatório →`, `Responder pesquisa →`) em `--mc-accent`, que **linka para `/oferta`** (conversão honesta: o consumo real é pós-compra). Itens "em breve" não têm ação.

**Ordenação:** disponíveis primeiro, "em breve" depois (ordenar `CONTENT_HUB` por `comingSoon` asc na renderização; não mutar o array fonte).

### Definição de "disponível" vs "em breve" (com base em `/notebooklm/`)

Cruzamento dos ativos reais com o `CONTENT_HUB`:

| Item | Ativo em `/notebooklm/` | Publicado no app | Estado |
|---|---|---|---|
| Panorama Estratégico (relatório) | `textos/*.md` | ✅ `content/relatorios/panorama-...md` | **NOVO** |
| Comparativo de Modelos (relatório) | `textos/*.md` | ✅ `content/relatorios/comparativo-...md` | **NOVO** |
| Pesquisa de hardware | — (interativa) | ✅ funciona | **NOVO** |
| 4 Podcasts | `audio/*.m4a` | ❌ sem embedUrl | em breve |
| 2 Vídeos | `video/*.mp4` | ❌ sem embedUrl | em breve |
| Apresentações (3) | `apresentacoes/*` | ❌ fora do CONTENT_HUB | em breve (não renderizadas como card) |

**Fato-chave:** essa divisão **já é** a lógica `comingSoon` existente em `ContentLibrarySection.tsx` (`embedUrl===null && type!=="relatorio" && type!=="pesquisa"`). Ou seja: **não precisa de campo novo de dados**. "NOVO" = `!comingSoon`; "em breve" = `comingSoon`. Só adicionar o selo "NOVO" ao ramo já-disponível.

**CTA final:** manter `Quero acesso à central` → `/oferta`.

---

## 4. Fascinations — reescrita das `description` no `CONTENT_HUB`

Decisão do usuário: **reescrever a `description` global** (fonte única `src/data/content-hub.ts`). Afeta landing + dashboard + páginas internas — aceito pelo usuário. As novas descrições são de curiosidade, mas continuam verdadeiras ao conteúdo (não enganam).

| id | Nova `description` (fascination) |
|---|---|
| `relatorio-panorama-llms-locais` | O mapa dos modelos locais que mais entregam em 2026 — e quais já não valem o seu tempo. |
| `relatorio-comparativo-modelos` | Qual modelo realmente roda bem no seu hardware, comparado lado a lado e sem marketing. |
| `podcast-rode-ia-potente` | Como colocar uma IA de verdade rodando na sua máquina sem pagar mensalidade. |
| `podcast-ias-poderosas` | O setup que transforma um computador comum em uma central de IA para o dia a dia. |
| `podcast-melhor-ia-hardware` | O organograma que usamos para decidir qual IA instalar em menos de dois minutos. |
| `podcast-escolher-ias-sem-travar` | Os erros mais comuns que travam a IA local — e como evitá-los antes de instalar. |
| `video-verdade-ia-local` | Por que alguns modelos locais já superam serviços pagos em determinados cenários. |
| `video-evolucao-ia-local` | A linha do tempo que mostra como a IA local passou de curiosidade a substituta de serviço pago. |
| `pesquisa-hardware-atual` | Descubra em 5 segundos com qual hardware a comunidade está rodando IA local hoje. |

`title`, `durationMinutes`, `xpReward`, `type`, `embedUrl` etc. **não mudam** — só `description`.

---

## 5. Arquivos afetados

**Modificados:**
- `src/components/marketing/v2/SystemSection.tsx` — nova intro, 4 cards do método, ícones SVG no lugar das fotos.
- `src/components/marketing/v2/ContentLibrarySection.tsx` — nova heading/copy, bloco "atualizado constantemente", "últimos conteúdos adicionados", cards premium, ordenação disponíveis-primeiro, selo NOVO.
- `src/data/content-hub.ts` — 9 `description` reescritas (fascinations).
- `src/app/(marketing)/landing-v2.css` — CSS de `.mc-system-*` (ícone no lugar de foto), `.mc-library-living`, `.mc-library-latest-title`, selo `.mc-library-new`, ação `.mc-library-action`, e restyle premium de `.mc-library-card`.

**Não muda:** `content-stats.ts` (função `formatCounts` continua, sai só da vitrine), `ProcessSteps` (roadmap — etapa separada), testes existentes.

---

## 6. Testes e verificação

- **Vitest (node):** os testes de `content-stats` continuam válidos (contagens/labels inalterados). Nenhum teste asserta `description`, então a reescrita é segura. Se algum teste referenciar texto de card, ajustar.
- **Gate:** `npx tsc --noEmit` (exit 0) + `npm run test` (67 verdes). Não usar `npm run build` (falha pré-existente Stripe).
- **Visual (navegador + dev server):** conferir Seção 2 (4 cards de método com ícones, sem imagens externas), Seção 3 (bloco "atualizado constantemente", cards premium com NOVO nos 2 relatórios + pesquisa, "em breve" nos 6 de mídia, ordenação disponíveis-primeiro, fascinations aparecendo). Verificar no DevTools/Network que **não há mais requisições a `images.unsplash.com`**.

---

## 7. Execução (subagent-driven-development)

Fases (cada uma verificada antes da próxima):
1. **Dados** — reescrever as 9 `description` em `content-hub.ts` (fascinations). Verificar tsc+test.
2. **Seção 2 (método)** — `SystemSection.tsx` + CSS: intro, 4 cards, troca foto→ícone SVG. Verificar visual + ausência de Unsplash.
3. **Seção 3 (experiência)** — `ContentLibrarySection.tsx` + CSS: heading/copy nova, bloco "atualizado constantemente", "últimos conteúdos adicionados", cards premium, selo NOVO, ordenação. Verificar visual.
4. **Polish** — responsividade dos novos grids/cards, revisão final tsc+test+visual (incluindo Network sem assets externos).
