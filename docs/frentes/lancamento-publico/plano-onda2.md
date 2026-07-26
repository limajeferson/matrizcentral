# Onda 2 — Identidade & Polish · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development`.
> Os passos usam checkbox (`- [ ]`).

**Goal:** a marca existir no produto antes do primeiro tráfego pago, e fechar os
polimentos de acesso e acessibilidade que ficaram herdados de várias frentes.

**Architecture:** sete tasks, commit por task. A ordem é por risco de regressão
visual: identidade primeiro (favicon → tipografia → logo), depois os itens
localizados (links, certificado, forms, a11y).

**Tech Stack:** Next.js 14.2.35 App Router · React 18 · TypeScript · Tailwind ·
`next/font/google` (self-hosted no build — sem request externo em runtime).

Substitui o `plano-F-polish.md` do programa `lancamento-final`, revalidado contra
o código em 2026-07-26. **As correções aos itens errados daquele plano estão em
[`plano.md`](plano.md#correções-aos-planos-f-e-g-achadas-na-auditoria-de-2026-07-26)
— leia antes de despachar qualquer task.**

## Global Constraints

Herda todas as de [`plano.md`](plano.md#global-constraints). Nesta onda pegam mais:

- **Proibido `npm install`.** `next/font/google` baixa a fonte **no build** e a
  serve do próprio domínio — é custo zero e sem asset externo em runtime. Fonte
  por `<link>` para o Google **não** é aceitável.
- **Gate antes de cada commit:** `npx tsc --noEmit` exit 0 · `npm run test` ·
  `npx next lint` sem **erros**. Baseline ao iniciar a onda: **364 testes / 58
  arquivos**, 0 erros, 2 warnings `no-img-element` pré-existentes.
- **Vitest é `environment: node`** — teste só de lógica pura. Componente se
  verifica rodando o app.
- **Escopos de CSS separados:** `.mcv2` (landing v2, dark) · `.lp-guide`
  (`/oferta`, claro) · `.mc-checkout` (checkout) · área logada em tokens
  dark-aware. Nada vaza entre eles.
- **Tokens de cor:** `--mc-accent` `#7c5cff` (único acento alto), `--mc-success`,
  `--mc-trust`, `--mc-gold`, `--mc-warn`. Os violetas oficiais do cubo são
  `#a78bfa`, `#7c5cff`, `#7c3aed` (`public/brand/logo-cubo.svg`).
- **L-051:** entrega do tipo "o usuário consegue ver/chegar em X" se verifica com
  `getComputedStyle` no navegador, **não** com `grep` no HTML.
- **L-050:** todo item "corrigir X em todo lugar" nasce de um `grep` rodado ao
  escrever o brief, com a lista de arquivo:linha colada nele.
- **L-040:** o certificado é superfície de **impressão** — não converter para
  token de tema sem checar o resultado no papel.

---

### Task 1: A marca no ícone

**Estado atual (auditado):** os assets existem em `public/brand/` (`favicon.svg`
= cubo isométrico de 3 violetas, `logo-cubo.svg`, avatar, banners), mas
`src/app/icon.svg` ainda é **o triângulo antigo** (3 nós, `#7c3aed`), e o
`layout.tsx` não declara `icons`.

**Files:** `src/app/icon.svg` · `src/app/apple-icon.png` (novo) ·
`src/app/layout.tsx` (bloco `metadata`)

- [ ] Substituir o conteúdo de `src/app/icon.svg` pelo de `public/brand/favicon.svg`.
- [ ] Declarar `icons` no `metadata` raiz apontando para os arquivos de convenção.
- [ ] Verificar no navegador: a aba mostra o **cubo**, não o triângulo (limpar
      cache do favicon — o Chrome guarda com força; testar em janela anônima).
- [ ] Commit: `feat(identidade): cubo da marca no favicon`

---

### Task 2: Tipografia unificada — Outfit + Inter

**Estado atual (auditado):** **seis** famílias espalhadas, e a fonte escolhida da
marca (**Outfit**) tem **zero ocorrências em `src/`**:

| Arquivo | Fontes hoje |
|---|---|
| `src/app/layout.tsx:2,7-16` | Geist Sans + Geist Mono (`next/font/local`) |
| `src/app/(marketing)/layout.tsx:1-14` | Hanken Grotesk + JetBrains Mono |
| `src/app/(marketing)/page.tsx:1,23-36` | Archivo Black + Inter + Press Start 2P |
| `src/app/(marketing)/sobre/page.tsx:1,13` | idem |
| `src/app/(marketing)/legal/*/page.tsx:1,8` | idem |

**Decisão:** **Outfit** nos títulos, **Inter** no corpo, via `next/font/google`
no layout raiz, expostas como CSS vars. Escala M3 do conceito aprovado:
`insumos/2026-07-22-conceito-tipografico.md` — **ler antes de escrever a escala**.

⚠️ **Esta é a task com maior risco de regressão visual da onda inteira** (mexe em
tipografia de todas as páginas públicas). Um commit só, e verificação visual
página a página **antes** de seguir para a Task 3.

- [ ] Declarar Outfit e Inter no `layout.tsx` com `variable: "--font-display"` e
      `"--font-body"`, e aplicar no `<body>`.
- [ ] Repontar `globals.css`/`tailwind.config.ts` para essas vars.
- [ ] Remover as declarações redundantes dos 5 arquivos da tabela — **exceto**
      `Press_Start_2P`, se ele estiver a serviço de um efeito deliberado (ler o
      uso antes; se for decorativo e intencional, preservar e registrar).
- [ ] **Verificação visual obrigatória:** landing, `/oferta`, `/sobre`,
      `/legal/termos`, `/blog`, um post, `/suporte`, `/feed` (logado) — nos dois
      temas. Nenhum texto pode ficar sem fonte (fallback serif do navegador é o
      sintoma).
- [ ] Commit: `feat(identidade): Outfit nos titulos e Inter no corpo, aposentando 6 familias`

---

### Task 3: O cubo nas superfícies

**Estado atual (auditado):** nenhum logo em imagem. Tudo texto:
`AppHeader.tsx:76-78` · `LandingHeader.tsx:30-32` · `marketing/Header.tsx:17-19` ·
`marketing/Footer.tsx:5-7` · `FooterV2`. O `SystemSection.tsx:92` tem um `<img>`
que é ilustração de seção, **não** logo.

- [ ] Componente único `src/components/brand/Logo.tsx` (SVG inline do cubo +
      wordmark opcional, tamanho por prop) — **não** repetir o SVG em 5 lugares.
- [ ] Montar nas 4 superfícies acima, preservando o comportamento existente
      (o `LandingHeader` usa `ScrambleText` no wordmark — decidir se o efeito
      continua e registrar a decisão).
- [ ] E-mails (`src/lib/email.ts`): avaliar o logo no cabeçalho. **Cuidado:**
      cliente de e-mail não renderiza SVG de forma confiável — usar PNG de
      `public/brand/` por URL absoluta, ou não usar.
- [ ] Verificação visual nas 4 superfícies, nos dois temas.
- [ ] Commit: `feat(identidade): logo cubo no header, na landing e nos rodapes`

---

### Task 4: Âncoras que não levam a lugar nenhum

**Estado atual (auditado):** o `/#features` morto **já foi corrigido** na Onda 1
(rodapé e header). **O que resta** é o `LandingHeader`, que usa âncoras
**relativas** (`#sistema`, `#processo`, `#preco`, `#faq`) e é renderizado **fora
da landing** — em `legal/privacidade/page.tsx:19`, `legal/termos/page.tsx:19` e
`sobre/page.tsx:35`. Nessas três páginas os links do menu não fazem nada.

- [ ] **Rodar o `grep` primeiro** e colar no brief a lista completa de âncoras
      relativas em `src/components/marketing/v2/LandingHeader.tsx`.
- [ ] Trocar por absolutas (`/#sistema` etc.), que funcionam da landing **e** de
      fora dela. Conferir que `HeroV2.tsx:52` (`#sistema`) só renderiza na
      landing — se for o caso, pode ficar relativa; registrar a checagem.
- [ ] Verificar clicando os 4 itens do menu a partir de `/sobre` e `/legal/termos`.
- [ ] Commit: `fix(landing): ancoras absolutas no LandingHeader (ele renderiza fora da landing)`

---

### Task 5: O certificado existe e ninguém acha

**Estado atual (auditado):** as rotas funcionam
(`dashboard/[token]/certificado/page.tsx` e `certificado/[code]/page.tsx`), mas:

- `/conta/page.tsx:41,53,60,66` → links para dashboard, biblioteca, feed, fórum. **Sem certificado.**
- `LeftSidebar.tsx:24-32` → 6 itens. **Sem certificado.**
- `dashboard/[token]/page.tsx` → cards de conteúdo e ranking. **Sem certificado.**
- `footer-nav.ts:18` → "Certificação" marcada **`soon: true`**, apesar de pronta.
- `QuizValidacao.tsx:191,195` → o botão **diz** "Ver Meu Certificado →" e navega
  para `/dashboard/${token}`. **A copy mente.**

Hoje o único caminho real é o link por e-mail (`src/lib/email.ts:75,87,91`).

- [ ] Link para o certificado em `/conta`, no `LeftSidebar` e no dashboard.
- [ ] Tirar o `soon: true` do `footer-nav.ts` e apontar o href certo.
- [ ] Resolver a mentira do botão do quiz: **ou** navega para o certificado,
      **ou** a copy passa a dizer o que ele faz. Decidir olhando o fluxo real de
      quem acabou o quiz e registrar o porquê.
- [ ] Verificação: a partir de uma sessão logada, chegar ao certificado por cada
      um dos caminhos novos.
- [ ] Commit: `fix(certificado): descoberta a partir da conta, da sidebar e do rodape`

---

### Task 6: Formulário de contato acessível

**Estado atual (auditado):** `ContatoForm.tsx` já tem `<form onSubmit>` (`:28`) e
`try/catch` com todos os caminhos setando estado (`:13-22`) — **o que falta é só
o rótulo**: input (`:29`) e textarea (`:30`) têm apenas `placeholder`, sem
`<label htmlFor>` nem `aria-label`. Placeholder não é rótulo: some ao digitar e
leitor de tela não anuncia.

- [ ] `<label htmlFor>` associado nos dois campos (visível ou `sr-only` —
      o Tailwind alcança essa rota; confirmado na Onda 1).
- [ ] `aria-live` na mensagem de resultado, se ainda não houver.
- [ ] Verificação: `getComputedStyle` confirma o label associado e, se `sr-only`,
      que ele está fora da tela mas presente na árvore de acessibilidade.
- [ ] Commit: `fix(a11y): rotulos associados no formulario de contato`

---

### Task 7: Teclado no `UserMenu` e no `ProfileCard`

**Estado atual (auditado):**

- `UserMenu.tsx` — tem `aria-haspopup="menu"` (`:48`) e `aria-expanded` (`:49`).
  **Falta:** `Escape` (o único `useEffect`, `:21-30`, só trata `mousedown` fora),
  navegação por setas entre os `role="menuitem"` (`:70,80,89`), e retorno de foco
  ao gatilho no fechamento.
- `ProfileCard.tsx` — **nada**: `role="dialog"` (`:49`) sem foco nem `Escape`; o
  gatilho (`:30-34`) tem `aria-label` mas **não** `aria-expanded`; `setExpanded`
  puro em `:32` e `:67`.

- [ ] Criar `src/lib/use-focus-trap.ts` — o helper que a Trilha F previa e **nunca
      foi escrito** (a Trilha G tinha uma task bloqueada esperando por ele).
      Se houver lógica pura extraível (ex.: cálculo do próximo índice focável),
      extrair para função testada — é o único pedaço testável desta task.
- [ ] `UserMenu`: `Escape` fecha e devolve o foco ao gatilho; `ArrowUp`/`ArrowDown`
      circulam entre os itens.
- [ ] `ProfileCard`: `aria-expanded` no gatilho, `Escape` fecha, foco entra no
      painel ao abrir e volta ao pill ao fechar. **Reavaliar o `role="dialog"`** —
      se não é modal, `dialog` mente para o leitor de tela.
- [ ] Verificação **só por teclado**, sem mouse: Tab até o gatilho, Enter,
      setas, Escape, e conferir onde o foco parou.
- [ ] Commit: `fix(a11y): teclado e foco no UserMenu e no ProfileCard`

---

## Também nesta onda (juntar à task mais próxima)

- **`ContentGate` fora de tokens** (`ContentGate.tsx:18-19,22`: `border-white/10`,
  `bg-black/40`, `text-white/70`, `text-white`) → migrar para tokens dark-aware.
  Cabe na Task 6 ou 7. ⚠️ `text-white` **sobre botão violeta** não vira token —
  ressalva registrada na revalidação de 2026-07-20.
- **`useReducedMotion` na área logada** — existe só em
  `src/components/marketing/v2/*`; **zero** em `src/components/app/`. Cabe na Task 3.
- **Stories pulando slide ao voltar de aba** — falta `visibilitychange`
  (zero ocorrências em `src/`); o `requestAnimationFrame` acumula o intervalo
  enquanto a aba está em segundo plano. Cabe na Task 3.

## Definição de pronto da Onda 2

- [ ] A aba do navegador mostra o **cubo**.
- [ ] Nenhuma página pública renderiza com fonte de fallback do navegador.
- [ ] O logo aparece no header, na landing e nos rodapés.
- [ ] Os 4 itens do menu funcionam a partir de `/sobre` e `/legal/*`.
- [ ] Dá para chegar ao certificado sem o e-mail.
- [ ] Formulário de contato com rótulo associado.
- [ ] `UserMenu` e `ProfileCard` operáveis **só** com teclado, com foco visível
      e previsível.
- [ ] Gate: `tsc` 0 · testes verdes · lint sem erros.
- [ ] `docs/ESTADO-ATUAL.md` atualizado e commitado.
