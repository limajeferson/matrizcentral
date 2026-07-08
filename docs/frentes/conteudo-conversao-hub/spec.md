# Conversão por Robustez de Conteúdo — Design

**Data:** 2026-07-05
**Status:** aprovado (autonomia declarada pelo usuário)
**Branch:** feat/conversao-conteudo

## Problema

A landing (`.mcv2`, `src/app/(marketing)/`) ancora o produto no **ebook**: a seção "O Sistema" diz "Um sistema, não um ebook solto", mas seus 4 cards são Ebook / Diagnóstico / Roadmap / Certificação, e o Preço lista os mesmos 4. A **biblioteca multi-formato real** (relatórios, podcasts, vídeos, apresentações, pesquisas da comunidade) e a **plataforma-feed** (rede social de aprendizado, gamificação/XP, busca personalizada) **não aparecem em lugar nenhum** da landing. É valor real produzido, porém não comunicado — subvende o produto e enfraquece a conversão a R$47.

## Objetivo

Reposicionar a percepção do produto de "um ebook + trilha" para **"uma central viva de IA local, multi-formato, numa plataforma-feed"**, usando a robustez de conteúdo como argumento central de conversão — sem prometer o que não existe.

## Conteúdo real (fonte da verdade)

Fonte única: `src/data/content-hub.ts` (`CONTENT_HUB`, tipo `ContentType = "relatorio" | "podcast" | "video" | "pesquisa"`). Assets em `notebooklm/` e `content/`.

- **Relatórios — 2 (ao vivo):** "Panorama Estratégico de LLMs Locais", "Comparativo de Modelos LLM Locais". `bodyPath` renderiza hoje.
- **Podcasts — 4 (produzidos, `embedUrl:null` = "em breve"):** 4 episódios.
- **Vídeos — 2 (produzidos, "em breve"):** "A Verdade sobre IA Local", "A Evolução da IA Local".
- **Apresentações — 3 (assets `.pptx`/`.png`, ainda fora do `CONTENT_HUB`):** informadas apenas na contagem de formatos, não como cards com página de detalhe (evita mexer no renderer de conteúdo).
- **Pesquisa da comunidade — 1:** enquete de hardware.
- **Ebook — 1 (bônus/complementar):** `content/ebooks/`.

## Regras de honestidade (obrigatórias)

1. Toda vitrine de conteúdo puxa de `CONTENT_HUB` — nunca inventar títulos.
2. Itens com `embedUrl === null` (exceto `relatorio`/`pesquisa`) exibem o selo **"em breve"**, exatamente como o hub do dashboard (`conteudo/page.tsx`) já faz.
3. A biblioteca é enquadrada como **"em expansão / novos toda semana"**, nunca como "tudo já disponível streamando".
4. A "busca personalizada / feed social" é comunicada como característica da plataforma sem afirmar features de busca que ainda não existem no código.

## Escopo

**Dentro:** mensagens e seções de conversão da landing (`src/app/(marketing)/`), reusando dados/estilos existentes. Atualização de memória e `CLAUDE.md`.

**Fora (decomposto para projeto futuro):** construir a busca personalizada / feed social real na plataforma (`dashboard/`), embedar os podcasts/vídeos (wiring de `embedUrl`), adicionar `apresentacao` como `ContentType` com página de detalhe. Estes são subsistemas próprios; este spec só **comunica** o que existe.

## Restrições globais

- **Custo zero:** nenhuma dependência npm nova, nenhum asset externo. Reusar framer-motion (instalado), `CONTENT_HUB`, e os padrões `.mcv2`.
- **Escopo CSS:** todo estilo novo sob `.mcv2` em `src/app/(marketing)/landing-v2.css`.
- **Acessibilidade:** respeitar `prefers-reduced-motion`; contraste legível; foco visível.
- **Copy:** português do Brasil.
- **Cor semântica:** reusar os tokens já criados (`--mc-success`, `--mc-trust`, `--mc-gold`, `--mc-warn`); "em breve" usa `--mc-warn` (âmbar), coerente com o dashboard.
- **Gate de verificação:** `npx tsc --noEmit` + `npm run test` (o `next build` completo falha em `/api/checkout` por env do Stripe ausente — pré-existente, não relacionado).

## Arquitetura das frentes

### Frente A — Seção "A Central" (vitrine da biblioteca) — PRINCIPAL
- **Novo componente** `src/components/marketing/v2/ContentLibrarySection.tsx` (client), inserido em `src/app/(marketing)/page.tsx` **depois de `SystemSection` e antes de `ProcessSteps`** (narrativa: oportunidade → sistema → central → jornada → preço).
- Deriva de `CONTENT_HUB`. Agrupa/rotula por formato. Cada card: badge de tipo (📄/🎙️/🎬/📊), título real, descrição, `durationMinutes` + `xpReward`, selo "em breve" quando aplicável (mesma regra do hub).
- Cabeçalho: tag "A central" + `h2` "Não é um ebook. É uma central." + sub "Leia, ouça, assista — no formato que combina com você. Biblioteca em expansão."
- Faixa-resumo de formatos com contagens reais (inclui "Apresentações · 3").
- CTA ao fim → `/oferta`.
- CSS novo `.mc-library-*` sob `.mcv2`; reusar `Reveal`.

### Frente B — Reposicionar "O Sistema"
- Em `SystemSection.tsx`, trocar os 4 `ITEMS` para pilares centrados na plataforma (mantendo o layout em linha + hover já existente):
  1. **Biblioteca multi-formato** — relatórios, podcasts, vídeos, apresentações.
  2. **Plataforma-feed** — aprenda como numa rede social, no seu ritmo.
  3. **Trilha guiada** — diagnóstico inicial + roadmap inteligente.
  4. **Gamificação + Certificado** — XP, níveis e certificação verificável.
- Ebook passa a ser citado como **bônus** na descrição de "Biblioteca", não como pilar próprio. Copy/imagens ajustadas; estrutura visual inalterada.

### Frente C — Faixa de prova no Hero
- Em `HeroV2.tsx`, adicionar sob o CTA uma faixa de prova (`.mc-hero-proof-strip`) com chips de contagem por formato: "2 relatórios · 4 podcasts · 2 vídeos · 3 apresentações · pesquisas da comunidade — em expansão". Ajuste leve do sub-copy para insinuar a plataforma. Respeitar reduced-motion.

### Frente D — Pilha de valor no Preço
- Em `PricingV2.tsx`, expandir `INCLUDED` (hoje 4 itens) para a stack completa via `ProductBanner`: Biblioteca multi-formato, Plataforma-feed, Diagnóstico inicial, Roadmap inteligente, Gamificação/XP/Certificado, Ebook (bônus). Ajustar headline/sub para enfatizar plataforma+biblioteca. Manter o componente `ProductBanner` e o padrão visual.

### Frente E — Infra de marketing
- Memória de projeto `matrizcentral-biblioteca-conteudo` (já criada) + índice.
- Atualizar `CLAUDE.md` via `claude-md-management:revise-claude-md` (registrar que o produto é biblioteca/plataforma, não ebook; regras de honestidade de conteúdo).
- Consistência de copy: revisar FAQ/Closing para não contradizer o novo posicionamento (ajuste leve, sem inventar).

## Componentes e interfaces

- `ContentLibrarySection` — sem props; lê `CONTENT_HUB`. Deriva `comingSoon = embedUrl === null && type !== "relatorio" && type !== "pesquisa"` (mesma regra do hub, DRY). Retorna `<section id="central">`.
- `SystemSection` — mesma assinatura; só muda o array `ITEMS`.
- `HeroV2` — mesma assinatura; adiciona markup da faixa de prova.
- `PricingV2` — mesma assinatura; expande `INCLUDED`.

## Testes / verificação

- Ambiente vitest é `node` (sem jsdom) → testes automatizados só para lógica pura. Extrair a agregação de contagens por formato para um helper puro `src/lib/content-stats.ts` (`formatCounts(items)`) com teste vitest.
- Componentes verificados rodando o app (dev + Playwright): a seção "A Central" renderiza os títulos reais e os selos "em breve"; hero mostra a faixa; preço mostra a stack. Confirmar que `/oferta` e `/checkout` seguem intactos.

## Fora de escopo (não fazer)

- Não construir busca/feed real, não embedar mídia, não adicionar `ContentType` novo, não mexer no renderer `conteudo/[id]`.
- Não adicionar dependências. Não reescrever seções que funcionam além do necessário para o reposicionamento.
