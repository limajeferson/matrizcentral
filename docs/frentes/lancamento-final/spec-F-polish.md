# Spec — Trilha F: UX / a11y / CX polish

> Programa: [`README.md`](README.md). Fecha os débitos de a11y do backlog do
> design v2 **e** os "herdados nunca fechados" da auditoria original. Depende de
> **C (dark-aware)** ter passado (compartilha a migração p/ tokens semânticos).
> Custo zero, dark-aware, pt-BR, commit por item.

## Grupo 1 — a11y / UX (backlog design v2)

### F1 — Focus-trap em modais
- `ExpandableContentCard.tsx:27-42`: só trata Escape; **Tab escapa** pro fundo.
  Adicionar trap de `Tab`/`Shift+Tab` ciclando entre focáveis do `dialogRef`
  enquanto aberto. **Mesmo padrão** no `StoryViewer.tsx:91-99` (só Escape/setas).
- Extrair um helper mínimo `useFocusTrap(ref, active)` (reuso nos dois).

### F2 — Teclado no `UserMenu` e `ProfileCard`
- `UserMenu.tsx` (`role="menu"`, itens `role="menuitem"`): adicionar **Escape p/
  fechar**, **ArrowUp/Down** navegando os itens, e **retorno de foco** ao gatilho
  ao fechar (padrão `opener?.focus?.()`).
- `ProfileCard.tsx` (pill flutuante, hoje `role="dialog"` sem teclado): trocar
  `role="dialog"` por **disclosure** (`aria-expanded` no gatilho, sem role modal —
  a página segue interativa atrás, não é modal); Escape recolhe; foco no painel
  ao abrir e de volta ao pill ao fechar.

### F3 — `prefers-reduced-motion`
- Nenhum uso na área logada (só no marketing). Adicionar `useReducedMotion()`
  (framer-motion, já usado no marketing) e curto-circuitar p/ transição instantânea
  em: `StoryViewer.tsx` (auto-avanço + fade), `RankingList.tsx` (stagger/spring),
  `FeedTimeline.tsx` (transição), `ExpandableContentCard.tsx` (scale/opacity). No
  StoryViewer, com reduced-motion, desligar/alongar o auto-avanço.

### F4 — `ContentGate` → tokens semânticos
- `ContentGate.tsx:18-46` usa cores fixas (`border-white/10`, `bg-black/40`,
  `text-white/70`, `text-white`). Trocar por `border-border`, `bg-card/…`,
  `text-foreground`, `text-muted-foreground` (respeita o tema; combina com C).

## Grupo 2 — herdados nunca fechados (auditoria original)

### F5 — Links mortos
- **Header/Footer antigos** (`marketing/Header.tsx`, `marketing/Footer.tsx`):
  `/#features` e `/#preco` — `#features` não existe. **Conferir se ainda são
  importados por alguma rota**; se não, **remover os componentes antigos**; se
  sim, repontar. 
- **v2** (`LandingHeader.tsx:8,10`, `HeroV2.tsx:52`, `footer-nav.ts:17,19`):
  âncoras `#sistema`/`#preco` — qualificar com `/` (`/#sistema`, `/#preco`) pra
  funcionarem fora da landing (o `footer-nav.ts` já faz certo; o `LandingHeader`
  usa âncora sem `/`).

### F6 — Copy inconsistente
- **Garantia 7 vs 30 dias:** `refundWindowExpiry` (`tokens.lib:16-18`) grava **30
  dias**, mas a copy diz 7 (`OfferPricing.tsx:53`, `legal/termos/page.tsx:40`).
  **Decisão:** alinhar numa fonte única. Recomendado: **garantia de 7 dias** é o
  padrão de mercado e mais seguro pro caixa → **mudar `refundWindowExpiry` p/ 7
  dias** e manter a copy. (Se o usuário preferir 30, mudar a copy.) Registrar a
  escolha.
- **E-mail "ebook":** `email.ts:18` (`sendTokenEmail`) diz "Seu ebook está
  confirmado." pra todos os planos. Trocar por copy plano-neutra: "Seu acesso à
  Matriz Central está confirmado." (o produto é a plataforma).

### F7 — Descoberta do certificado
- `dashboard/[token]/page.tsx`: **não há card/link pro certificado**
  (`/dashboard/[token]/certificado` existe). Adicionar um card (ao lado do de
  Ranking, ~linhas 224-236), visível quando conquistado.
- `QuizValidacao.tsx:190-196`: botão diz "Ver Meu Certificado →" mas navega pro
  dashboard raiz. Apontar pra `/dashboard/${token}/certificado`.

### F8 — Forms da `/oferta`
- `OfferPricing.tsx:11-24` (`handleCheckout`): **sem `try/catch`** → falha de rede
  trava o `loading`. Adicionar `try/catch/finally` (reseta loading + mostra erro).
- Markup (`:27-36`): **sem `<form>`/onSubmit** (Enter não envia) e input **sem
  label**. Envolver num `<form onSubmit>` (Enter envia) + `<label htmlFor>`
  visualmente oculto (ou `aria-label`).

## RightSidebar (aguardando o usuário)
- A revisão de design da `RightSidebar` depende das anotações do usuário. Quando
  chegarem, entram nesta trilha como itens próprios. **Não bloqueia** F1–F8.

## Não-objetivos
- Redesign amplo; só a11y + consertos herdados pontuais. Votos/novas features.

## Verificação
- Gate por item: `tsc` 0 + `npm run test` + `next lint`. Verificação de teclado
  ao vivo (Tab/Escape/setas nos modais e menu); reduced-motion via DevTools
  (emular). Conferir os links (nenhum 404/no-op), a copy (7/30 e "acesso"), o
  card do certificado, e o form da `/oferta` (Enter + falha de rede).
- `refundWindowExpiry`: se mudar p/ 7 dias, atualizar o teste em `tokens.test.ts`
  (se houver). Sem migration. Sem dependência nova.
