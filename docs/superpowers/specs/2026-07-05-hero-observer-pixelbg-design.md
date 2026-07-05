# Hero "IA Observando" + Fundo Pixel Glow + Rodapé Escuro — Design

**Data:** 2026-07-05
**Status:** aprovado (autonomia declarada pelo usuário)
**Branch:** feat/hero-observer-pixelbg

## Contexto

Após o reposicionamento de conteúdo, o usuário pediu 3 ajustes visuais na landing (`.mcv2`, `src/app/(marketing)/`):

1. **Rodapé** hoje é branco (`.mc-footer { background:#ffffff; color:#17131f }`, `landing-v2.css:690`) — destoa do tema escuro.
2. **Fundo de ondas** (`WaveCanvasBackground`) não agradou: rápido demais e não é o efeito desejado.
3. **Hero** parece vazio (só texto sobre fundo escuro).

## Objetivo

- **Rodapé:** virar Surface `#14101F` (escuro), texto/links claros.
- **Fundo:** trocar as ondas por **pequenos quadrados que brilham** (pixel glow), **mais apagado e mais lento** que as ondas.
- **Hero:** adicionar um **círculo grande quase apagado** ("IA observando das escuras") no canto superior direito, ~63% visível (cortado em cima e à direita), que **some ao rolar para baixo**.

## Referências (do usuário; não acessadas — implementação fiel à descrição)

- Fundo: 21st.dev `@easemize/pixel-perfect-hero` — grade de quadradinhos brilhando.
- Círculo: 21st.dev `@Scottclayton3d/artificial-hero` — apenas o círculo (íris/olho de IA).

## Restrições globais

- **Custo zero:** sem dependências npm novas, sem assets externos. Canvas 2D nativo + CSS + framer-motion (instalado).
- **Escopo CSS:** tudo sob `.mcv2` em `landing-v2.css`.
- **Acessibilidade:** `prefers-reduced-motion` desliga a animação do fundo (frame estático) e o twinkle; foco visível; elementos decorativos `aria-hidden`.
- **Cor:** paleta existente — violeta `--mc-accent` #7c5cff, azul `--mc-trust` #466eff, surface #14101F. Tudo apagado (dim).
- **Gate por task:** `npx tsc --noEmit` (exit 0) + `npm run test`. NÃO usar `npm run build` (falha pré-existente em `/api/checkout` por env do Stripe).

## Arquitetura das frentes

### Frente 1 — Rodapé escuro (`#14101F`)
- Em `landing-v2.css`, no bloco `.mc-footer` (~690-728): `background:#ffffff` → `#14101F`; `color:#17131f` → `var(--mc-white)`; `.mc-footer .mc-logo` → `var(--mc-white)`; `.mc-footer-desc` `#5c5666` → `var(--mc-gray)`; `.mc-footer-nav a` `#17131f` → `var(--mc-white)` (hover → `var(--mc-accent)`); `.mc-footer-bottom` `border-top #e8e5ee` → `1px solid var(--mc-line)`, `color #5c5666` → `var(--mc-gray)`. Sem mudança de estrutura (FooterV2 inalterado).

### Frente 2 — Fundo Pixel Glow (substitui as ondas)
- **Novo helper puro** `src/lib/pixel-twinkle.ts`: `twinkleAlpha(amp, speed, phase, time)` → `amp * (0.5 + 0.5*sin(time*speed + phase))`, limitado a `[0, amp]`. Testável em `node`.
- **Novo componente** `src/components/marketing/v2/PixelGridBackground.tsx` (client, canvas fixo z-index 0, classe `.mc-pixel-bg`):
  - Grade de células de ~34px; em cada célula um quadradinho (~10px, cantos levemente arredondados) que brilha via `shadowBlur`.
  - Cada célula recebe amplitude aleatória **enviesada para baixo** (`rand²`) → a maioria quase apagada; poucas brilham. `amp` máximo ~0.12 (bem dim).
  - Cores alternando violeta `#7c5cff` e azul `#466eff` por célula.
  - **Lento:** `TIME_INC ≈ 0.012`, velocidades por célula ~0.3–0.8 → períodos de vários segundos.
  - DPR-aware; `prefers-reduced-motion` → desenha um frame estático esparso e **não** roda RAF; limpeza de RAF e listener de resize no unmount.
- **Wiring:** em `page.tsx`, trocar `import WaveCanvasBackground` por `PixelGridBackground` e `<WaveCanvasBackground />` por `<PixelGridBackground />`.
- **CSS:** renomear o seletor de fundo `.mc-wave-bg` → `.mc-pixel-bg` (mesmas regras fixed/inset/z0/pointer-events). `.mc-canvas` permanece `background: transparent`.
- **Remoção de código morto:** apagar `WaveCanvasBackground.tsx`, `src/lib/wave-field.ts` e `src/lib/wave-field.test.ts` (ficam órfãos após a troca).

### Frente 3 — Círculo "IA Observando" no hero
- **Novo componente** `src/components/marketing/v2/HeroObserver.tsx` (client, framer-motion):
  - `motion.div` circular (classe `.mc-observer`), decorativo (`aria-hidden`), `pointer-events:none`.
  - **Aparência (íris de IA, dim):** `background` com radial-gradients em camadas — glow externo suave, anéis concêntricos tênues (`repeating-radial-gradient`), centro mais escuro (pupila); tom violeta/azul. `opacity` base baixa (~0.35).
  - **Scroll-fade:** `const { scrollY } = useScroll();` e `const opacity = useTransform(scrollY, [0, 600], [0.38, 0]);` aplicado via `style={{ opacity }}` — some ao rolar ~600px.
- **Posição (CSS `.mc-observer`):** `position:absolute; top:-18%; right:-12%; width:clamp(560px,62vw,880px); aspect-ratio:1;` — dentro de `.mc-hero` (que tem `overflow:clip`), cortando topo e direita, deixando ~63% visível no canto superior direito. `z-index:0` (atrás de `.mc-hero-content`, que é `position:relative`).
- **Wiring:** em `HeroV2.tsx`, renderizar `<HeroObserver />` como primeiro filho de `<section className="mc-hero">`, antes de `.mc-hero-content`.

## Componentes e interfaces

- `twinkleAlpha(amp:number, speed:number, phase:number, time:number): number` — puro, `[0, amp]`.
- `PixelGridBackground(): JSX.Element` — `<canvas className="mc-pixel-bg">`, sem props.
- `HeroObserver(): JSX.Element` — `<motion.div className="mc-observer">`, sem props.

## Testes / verificação

- Ambiente vitest `node` → teste automatizado só do helper puro `twinkleAlpha` (bounds, fase, clamp).
- Componentes verificados rodando o app (dev + Playwright): fundo com quadradinhos dim e lentos; círculo dim no canto sup. direito ~63% visível; some ao rolar; rodapé escuro. Confirmar `/oferta` e `/checkout` intactos e legibilidade do conteúdo sobre o novo fundo.

## Fora de escopo

- Não mexer em `/oferta`, `/checkout`, dashboard.
- Não adicionar dependências. Não reescrever seções fora do necessário.

## Pós-execução

- `simplify` (limpeza de reuso/simplificação) e `superpowers:systematic-debugging` para fechar a fase caçando qualquer regressão (ex.: legibilidade, z-index, performance de canvas).
