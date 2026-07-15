# Spec — Frente 1: Moldura do App (header + sidebar + rodapé)

> Programa: [`README.md`](README.md). Primeira frente (só visual, sem backend).
> Modelos: header-3 (`@efferd`), sidebar-showcase (`@ruixen.ui`), footer
> (`@rapid-ui`). Reconstruídos com framer-motion + Tailwind + ícones caseiros.
> Herda todas as Global Constraints do programa (custo zero, violeta/dark, etc.).

## Estado atual

- `AppShell.tsx` (server): header sticky (logo + busca desabilitada + sino +
  `userMenu`) + grid 3-col (`260px 1fr 320px`, colapsa <lg com `left` em order-2).
- `LeftSidebar.tsx` (server): nav (Feed/Conteúdos/Fórum/Conta/Suporte) + bloco
  "Explorar por formato". Sem estado ativo, sem animação.
- **Sem rodapé** na área logada (só no marketing).

## Item 1 — Header animado (modelo header-3)

Extrair o header para **`AppHeader.tsx` (client)** montado pelo `AppShell`.
Comportamento (fiel ao header-3: "scroll blur + animated mobile drawer"):

- **Scroll-aware (framer-motion):** ao rolar para baixo além de ~80px, o header
  **recolhe** (esconde com `translateY(-100%)`); ao rolar para cima, **reaparece**.
  Sempre visível no topo. Blur/opacidade e sombra intensificam quando `scrollY>8`.
  Altura `h-16`. Usar `useState`+listener de `scroll` (passivo) com `lastScrollY`
  em `ref`; `motion.header` anima `y`.
- **Drawer mobile (framer-motion + AnimatePresence):** abaixo de `md`, a busca
  inline some e surge um **botão hambúrguer** (`IconMenu` — criar) que abre um
  **drawer lateral** (overlay escuro + painel deslizante da direita/esquerda) com
  a navegação. O conteúdo do drawer é o slot `mobileNav` que o `AppShell` passa
  (a `LeftSidebar`). `Escape` e clique no overlay fecham; foco inicial no painel;
  trava o scroll do body enquanto aberto.
- Mantém: logo (`Matriz` + `Central` violeta), busca (desktop, `md+`), sino,
  `userMenu`. `role="banner"`, botões com `aria-label`, drawer `role="dialog"`
  `aria-modal`.
- **Interface:** `AppHeader({ userMenu: ReactNode; mobileNav: ReactNode })`.
  `AppShell` passa `mobileNav={left}` (mesmos nós da `LeftSidebar`).

## Item 2 — Sidebar em seções (modelo sidebar-showcase)

`LeftSidebar.tsx` vira **client** (`usePathname` + animação). Fiel ao
sidebar-showcase (seções rotuladas, item ativo, grupo colapsável, badges,
framer-motion):

- **Seções rotuladas:** "Navegar" (Feed · Conteúdos · Fórum) e "Sua conta"
  (Conta · Suporte). Rótulo em `text-xs uppercase text-muted-foreground`.
- **Item ativo:** compara `usePathname()` com o href base; ativo ganha
  `bg-accent`/`text-foreground` + **barra violeta** à esquerda (indicador
  `layoutId` do framer-motion animando entre itens no hover/ativo).
- **Grupo colapsável "Explorar por formato":** cabeçalho com chevron
  (`IconChevron`) que expande/recolhe a lista (framer-motion `height:auto`
  animado via `AnimatePresence`). Estado aberto por padrão; persistência não
  necessária.
- **Badges:** itens de formato cuja categoria está **inteiramente "em breve"**
  (todos os itens daquele `type` com `embedUrl===null` e não relatório/pesquisa)
  recebem selo âmbar "Em breve". Calcular via helper puro
  `formatAvailability(CONTENT_HUB)` (testável) — retorna `Record<ContentType,
  { emBreve: boolean }>`. (Relatórios/Pesquisas nunca "em breve".)
- **Sem** bloco de perfil no rodapé da sidebar (o showcase tem; nós já temos
  `UserMenu` no header + `ProfileCard`). YAGNI — não duplicar.
- A11y: `nav aria-label`, item ativo com `aria-current="page"`, botão do grupo
  com `aria-expanded`.

## Item 3 — Rodapé do app (modelo footer @rapid-ui)

Novo **`AppFooter.tsx` (server)** montado pelo `AppShell` abaixo do grid.
Multi-coluna, dark-aware, tokens semânticos (sem animação — o modelo é estático):

- **Marca:** "Matriz Central" + tagline curta ("Sua central de IA local —
  relatórios, podcasts, vídeos e comunidade").
- **Colunas de links:**
  - *Plataforma:* Feed (`/feed`) · Conteúdos (`/feed#conteudos`) · Fórum
    (`/forum`).
  - *Conta:* Minha conta (`/conta`) · Suporte (`/suporte`).
  - *Legal:* Sobre (`/sobre`) · Privacidade (`/legal/privacidade`) · Termos
    (`/legal/termos`).
- **Linha de contato** (sem inventar redes sociais falsas): e-mail de suporte
  (`mailto:`) + link para o site. Ícones caseiros (`IconSupport`, `IconAccount`
  ou criar `IconMail`).
- **Barra inferior:** "© 2026 Matriz Central. Todos os direitos reservados."
- Responsivo: colunas empilham no mobile (`grid` → 1 col; `sm:` 2; `lg:` 4).

## Montagem (AppShell)

`AppShell` deixa de renderizar o header inline; passa a compor:
`<AppHeader userMenu={userMenu} mobileNav={left} />` + grid (inalterado) +
`<AppFooter />`. O grid e as colunas seguem iguais (a `LeftSidebar` já é o `left`).

## Não-objetivos / diferido

- Busca funcional (segue desabilitada — item de outra frente).
- Notificações reais no sino (idem).
- Nav aninhada multi-nível do header-3 (nosso nav é raso) — não aplicável.
- Perfil no rodapé da sidebar (coberto por UserMenu/ProfileCard).

## Verificação

- Gate: `tsc` 0 + `npm run test` (novo teste de `formatAvailability`) + `next
  lint` sem erros.
- App logado (`/feed`): header some ao rolar p/ baixo e volta ao subir; drawer
  mobile abre/fecha (Escape/overlay); sidebar marca item ativo, grupo de formato
  colapsa, badges "Em breve" nos formatos certos; rodapé aparece com as colunas.
- Insulamento: nada vaza para `.mcv2`/`.lp-guide`; dark-aware nos três.
