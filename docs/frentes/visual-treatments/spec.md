# Design: Tratamentos Visuais Inspirados (Frente D)

**Data:** 2026-07-05
**Origem:** referências do usuário no 21st.dev (registro de componentes no estilo shadcn/ui — publicados para serem copiados/adaptados em outros projetos, diferente da licença restritiva de um template Framer)
**Branch:** `feat/landing-v4-visual-treatments` (a partir do `master` pós-merge da Frente A/B/C)

## Princípio geral

Nenhuma referência é copiada verbatim — cada uma é reimplementada do zero em
React + framer-motion + CSS/canvas simples, na paleta da identidade
(`--mc-bg: #0a0812`, `--mc-accent: #7c5cff`, `--mc-accent-deep: #5b3df5`),
respeitando custo zero (sem serviços/assets pagos) e `useReducedMotion`.

## Mapeamento das 6 referências (decisão final registrada aqui)

O usuário delegou a decisão final de aplicação a mim. Onde a instrução original
tinha ambiguidade sobre "qual página", a decisão e o motivo estão registrados:

| # | Referência | Efeito a reproduzir | Onde aplicar (decisão) |
|---|---|---|---|
| D1 | code-pen-home-skeuomorphism-in-the-dark-button | Botão escuro com relevo tátil (box-shadow em camadas simulando luz/sombra) e estado "pressionado" ao clicar | Botões `.mc-btn` (accent e ghost) em toda a landing `.mcv2` — são os elementos de "navegação por botão" (CTAs, ações) do site |
| D2 | starfield-1 | Fundo full-viewport com estrelas/pontos brilhando e à deriva, atrás do conteúdo | Página `/oferta` (menu de escolha de plano — é a superfície de "pagamento" mais próxima de um "login/menu" que o site tem hoje) |
| D3 | neural-access-login | Blobs desfocados coloridos, com leve parallax pelo mouse, atrás de um formulário | Páginas `/checkout/sucesso` e `/checkout/cancelado` (hoje em branco, sem identidade — são o "gateway/hub de pagamento" real do fluxo, já que o checkout em si é hospedado pelo Stripe) |
| D4 | modern-login-signup (rede de pontos) | Rede de nós conectados ao fundo — já existe como `NetworkField` no hero/closing | Vira o **background ambiente único de todo o site** `.mcv2`: muito mais lento, menos nós, quase imperceptível (opacidade baixíssima), substituindo as instâncias pontuais atuais em `HeroV2`/`ClosingSection` |
| D5 | animated-banner | Overlay de profundidade no hover, transição suave entre estados | Cards da `SystemSection` ("Ebook Técnico", "Diagnóstico Inicial", "Roadmap Inteligente", "Certificação Verificável") — passam de um grid plano para um **stack sobreposto** onde o card em foco (hover/scroll) se destaca à frente e os outros recuam com profundidade |
| D6 | modern-animated-hero-section (scramble text) | Texto que embaralha caracteres aleatórios antes de se resolver na palavra final | Logo/wordmark "Matriz/Central" no header — dispara uma vez ao montar a página |

## D1 — Botões skeuomórficos escuros

- Novo tratamento visual para `.mc-btn-accent`/`.mc-btn-ghost` em
  `landing-v2.css`: mantém o clip-path chanfrado existente (assinatura da
  identidade), mas adiciona camadas de `box-shadow` (sombra externa escura +
  realce interno claro no topo) simulando relevo, e inverte a direção da
  sombra + um pequeno `translateY` no estado `:active`/pressionado.
- Sem novo componente React — é só CSS.

## D2 — Starfield em `/oferta`

- Novo componente `Starfield.tsx` (canvas + `requestAnimationFrame`):
  N pontos brancos/violeta em posições aleatórias, opacidade oscilando
  (twinkle) via seno, drift lento. `position: fixed; inset: 0; z-index: -1;
  pointer-events: none`.
- Adicionado em `src/app/(marketing)/oferta/page.tsx` como camada de fundo,
  sem alterar `Header`, `Footer`, `OfferPricing` ou o CSS `.lp-guide`
  existente — os cards continuam claros e legíveis por cima.
- Respeita `prefers-reduced-motion`: com reduced motion, renderiza os pontos
  estáticos (sem animação de twinkle/drift).

## D3 — Blobs (neural-access) nas páginas de checkout

- Novo componente `NeuralBackdrop.tsx`: 4-5 blobs (`div`s com
  `radial-gradient` em tons de `--mc-accent`/`--mc-accent-deep`, `filter:
  blur(60px)`) posicionados absolutamente, deriva lenta via CSS
  `@keyframes`, leve parallax pelo mouse (client component, `mousemove`
  listener, `useReducedMotion` desativa o parallax e a deriva).
- `src/app/checkout/sucesso/page.tsx` e `src/app/checkout/cancelado/page.tsx`
  são reescritos com fundo escuro (`--mc-bg`) + `NeuralBackdrop` + o
  conteúdo existente (mensagem de sucesso/cancelamento, link de volta)
  restilizado em texto claro sobre esse fundo. Essas páginas hoje não têm
  identidade nenhuma (Tailwind puro, fundo branco) — não há conflito com
  nenhum CSS protegido.

## D4 — Fundo ambiente único (rede de nós lenta)

- Novo componente `AmbientNetwork.tsx`: canvas fixo, full-viewport,
  atrás de todo o conteúdo de `.mcv2`. ~12-18 nós (bem menos que o
  `NetworkField` atual), opacidade base ~0.05-0.08, velocidade de deriva
  extremamente baixa (quase imperceptível), cor `--mc-accent` bem escurecida.
- Adicionado uma única vez em `src/app/(marketing)/page.tsx`, como primeiro
  filho de `.mcv2` (atrás do `noscript`/header/conteúdo).
- `HeroV2.tsx` e `ClosingSection.tsx` **removem** seu próprio `NetworkField`
  local (o ambiente global substitui os dois) — `NetworkField.tsx` continua
  existindo no repositório apenas se ainda referenciado em algum outro lugar;
  caso nenhuma referência sobre, é removido nesta frente.
- Com `prefers-reduced-motion`, os nós ficam estáticos (sem deriva).

## D5 — Cards da `SystemSection` em stack sobreposto

- Reestrutura o grid 2×2 atual para um layout de pilha: os 4 cards ficam
  parcialmente sobrepostos (offset diagonal crescente, como um baralho),
  cada um com leve rotação e profundidade (`z-index`/`scale`/sombra).
- Ao passar o mouse (ou tocar, ou ao entrar em foco via scroll) sobre um
  card, ele sobe para frente (`scale` maior, `z-index` no topo, sombra mais
  forte) e os demais recuam ligeiramente (`scale` menor, opacidade reduzida)
  — feito com framer-motion (`whileHover`, `animate` condicionado a estado
  de qual card está em foco), reaproveitando o padrão de easing de
  `motion-primitives.tsx`.
- Mantém a mesma copy/estrutura Benefício→Recurso→Descrição e as mesmas
  imagens Unsplash já usadas — só a disposição/interação muda.
- No mobile (`≤800px`): degrada para o grid empilhado vertical simples
  (sem sobreposição, que não funciona bem em telas estreitas).

## D6 — Logo com efeito de scramble

- Novo componente `ScrambleText.tsx`: recebe uma string e, ao montar,
  embaralha caracteres aleatórios por ~400-600ms antes de resolver
  progressivamente (esquerda→direita) para o texto final — implementado com
  `useState`/`useEffect`/`setInterval` (sem depender de framer-motion para a
  troca de caractere; framer-motion só para um leve fade/opacity por
  caractere se fizer sentido).
- Aplicado ao `<span className="mc-logo">` em `LandingHeader.tsx`
  ("Matriz/Central"), disparando uma vez ao montar a página (não em loop).
- Com `prefers-reduced-motion`, renderiza o texto final diretamente, sem
  o efeito de embaralhamento.

## Restrições globais

- Nenhuma dependência nova (tudo em canvas/CSS/framer-motion, já
  disponíveis).
- `/oferta` mantém `Header.tsx`, `Footer.tsx`, `OfferPricing.tsx` e
  `landing-clone.css` intocados — D2 só adiciona uma camada de fundo atrás
  do conteúdo existente.
- Conteúdo funcional de checkout (D3) não muda — só a apresentação visual.
- Todas as animações nesta frente respeitam `useReducedMotion` com um
  fallback estático coerente.
- `npm run build` e `npm run test` passam ao final de cada task.
- Commits em pt-BR, trailers:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` e
  `Claude-Session: https://claude.ai/code/session_012bbzHLj2xcGJHZY89EPJDp`.
