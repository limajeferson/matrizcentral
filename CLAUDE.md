# CLAUDE.md — Matriz Central

Contexto para sessões do Claude Code neste repositório. Mantenha conciso.

> **› Contexto completo e navegação:** leia [`docs/ECOSSISTEMA.md`](docs/ECOSSISTEMA.md) primeiro — é o hub que indexa specs, arquitetura, memória e o fluxo de deploy.

## Produto (não é um ebook)

- O produto é uma **plataforma multi-formato de IA local**: relatórios, podcasts, vídeos, apresentações e pesquisas da comunidade, num **feed/hub** com gamificação (XP/níveis/certificado). O ebook é material de apoio, não o produto.
- **Fonte única de conteúdo:** `src/data/content-hub.ts` (`CONTENT_HUB`). Nunca inventar títulos numa vitrine — mapear desse array.
- **Regra "em breve":** item com `embedUrl === null` (exceto `relatorio`/`pesquisa`) ainda não está publicado → exibir selo "em breve". Enquadrar a biblioteca como "em expansão", nunca "tudo já disponível".
- **Estado da landing (07/2026):** landing v2 completa em `src/app/(marketing)`. Seção 2 (`SystemSection`) vende o **método** (4 cards com imagens locais em `public/system/`); Seção 3 (`ContentLibrarySection`) vende a **experiência** (cards NOVO/em breve). Há footer institucional, páginas `/sobre` e `/legal/{privacidade,termos}`, e newsletter (`/api/newsletter` → tabela `newsletter_subscribers`, migration `0011` pendente de aplicar). Detalhe e histórico: ver `docs/ECOSSISTEMA.md`.

## Verificação (gotcha importante)

- **`npm run build` FALHA** ao coletar `/api/checkout`: `src/lib/stripe.ts` instancia `new Stripe(process.env.STRIPE_SECRET_KEY!)` no topo do módulo e a chave não existe no shell de build. É pré-existente e não relacionado à maioria das mudanças.
- **Gate real:** `npx tsc --noEmit` (exit 0) + `npm run test`. Para conferir o visual, rode o app (`npm run dev`) — não confie só no build.
- **Vitest roda em `environment: "node"`** (sem jsdom/testing-library) → testes automatizados só para **lógica pura** em `src/lib`/`src/data`. Componentes são verificados rodando o app (dev + navegador/Playwright), extraindo a lógica testável para helpers puros.

## CSS por página (manter escopo)

- Landing v2: `src/app/(marketing)/landing-v2.css`, tudo sob **`.mcv2`** (dark + violeta elétrico).
- `/oferta`: `.lp-guide` (tema claro). `/checkout`: `.mc-checkout`. Novo CSS deve ficar no escopo certo para não vazar entre páginas.
- **Tokens de cor** (`.mcv2`): `--mc-accent` `#7c5cff` (voz única da marca) e semânticos `--mc-success` (verde, garantia/sucesso), `--mc-trust` (azul, pagamento/privacidade), `--mc-gold` (ouro, certificado/gamificação), `--mc-warn` (âmbar, "em breve"/escassez). Reusar; violeta é o único acento "alto".

## Restrições / ambiente

- **Custo zero:** sem dependências npm novas e sem assets externos; só tiers gratuitos. Animações/efeitos com Canvas 2D nativo, CSS e libs já instaladas (framer-motion).
- **Windows / Git Bash:** caminhos com `(marketing)` precisam de aspas. Dev server: a porta 3000 costuma estar ocupada e o Next pula para 3001/3002 — force com `npm run dev -- -p 3000`.
- Comunicar em **português do Brasil**.
