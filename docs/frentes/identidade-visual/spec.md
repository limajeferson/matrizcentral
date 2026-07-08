# Matriz Central — Identidade Visual (Fase de Design)

Data: 2026-07-03
Status: Aprovado para plano de implementação

## Contexto

Após a Fase 1 (bootstrap + fluxo core do MVP), o usuário forneceu 5 referências visuais
(Dribbble) para definir a identidade visual do portal, com o pedido explícito de misturá-las
numa estrutura própria e usar ferramentas de design disponíveis para um resultado profissional
(ver memória `matrizcentral-identidade-visual.md` para os links originais).

Síntese das 5 referências (analisadas visualmente):
1. **Identidade geral**: dashboard dark-mode, acento roxo/violeta, cards arredondados, sidebar de
   ícones, tipografia sans limpa.
2. **Feed de conteúdo**: painéis glassmórficos claros sobre fundo suave, tons pastéis, sidebar de
   ícones, anéis de progresso, cards em pill.
3. **Hub de aprendizado**: fundo creme claro, headline bold grande, cards de categoria em cores
   pastéis de baixo contraste (rosa/âmbar/lavanda/menta), sidebar de ícones, painel social lateral.
4. **Gamificação**: nav superior escura + cards claros/pastéis abaixo, badges de streak/pontos,
   anéis de progresso radiais, filtros de categoria em pill, timeline de roadmap.
5. **Landing page**: SaaS limpo, fundo branco, CTA sólido, headline bold, cards de feature
   tintados, seção de pricing, testimonials.

**Padrão convergente**: fundo claro dominante, cards arredondados com cores pastéis por
categoria, sidebar de ícones, tipografia bold/limpa, uso extensivo de badges e anéis de
progresso para gamificação.

## Escopo

Aplicar uma identidade visual coerente (tokens de design + componentes primitivos) sobre as 3
telas que já existem da Fase 1: landing page, dashboard, quiz (triagem + validação). Não inclui
construir novas features de gamificação (streak, comunidade, atividade semanal) que a Fase 2
ainda não implementou no backend — usa apenas o XP total que já existe.

**Fora de escopo:** Figma (decisão explícita do usuário: direto para código), novos widgets de
gamificação sem dados reais, sidebar de navegação com múltiplas seções (só existe 1 página no
dashboard hoje).

## Paleta e tokens de design

- **Fundo:** off-white quente `#FAFAF8` (não branco puro), inspirado nos refs 2 e 3.
- **Primária:** violeta `#7C3AED` (Tailwind `violet-600`), com tints (`violet-50/100/200`) para
  fundos suaves e states de hover/active.
- **Cores de categoria** (pastéis de baixo contraste, para diferenciar tipo de conteúdo no
  dashboard, inspirado no ref3):
  - Rosa pastel (`rose-100`/`rose-900` texto) — conteúdo de ebook/leitura
  - Âmbar pastel (`amber-100`/`amber-900`) — quiz/avaliação
  - Lavanda pastel (`violet-100`/`violet-900`) — perfil/roadmap
  - Menta pastel (`emerald-100`/`emerald-900`) — XP/conquistas
- **Cards:** cantos arredondados generosos (`rounded-2xl` a `rounded-3xl`), sombra suave
  (`shadow-sm`/`shadow-md` com leve tint), tratamento "glass" nos cards de destaque do dashboard
  (fundo branco semi-transparente `bg-white/70` + `backdrop-blur-md` + borda sutil
  `border-white/40`).
- **Tipografia:** mantém a stack padrão do Next.js (Geist), headlines bold grandes (`text-4xl` a
  `text-5xl font-bold`) nos títulos de seção, como nos refs 3 e 5.

## Componentes primitivos novos

Criados em `src/components/ui/`, reutilizados em todas as telas:

```
GlassCard        — container com o tratamento glass (fundo translúcido + blur + borda sutil)
CategoryBadge    — pill colorida por tipo de conteúdo (variant: "ebook" | "quiz" | "roadmap" | "xp")
```

O botão primário reaproveita o `Button` do shadcn já instalado (Task 4 da Fase 1), só recebe uma
variante de cor violeta sólida.

## Telas afetadas

### Landing page (`src/app/(marketing)/`)
Reconstrução no estilo do ref5: headline bold grande, CTA sólido violeta (substitui o azul
atual), seção de features com `GlassCard`/`CategoryBadge` tintados, mantém a estrutura de
Hero + PricingSection já existente (não adiciona `ProductCard`/`FAQ` — mesma decisão de escopo
da Fase 1, catálogo ainda tem 1 produto só). Sem logos de empresas falsas (não temos clientes
reais ainda para prova social).

### Dashboard (`src/app/dashboard/[token]/`)
- Perfil descoberto: `GlassCard` com `CategoryBadge` variant="roadmap"
- Roadmap: `RoadmapCard` (já existe) ganha `GlassCard` como container e badges de semana em
  lavanda pastel
- Download do ebook: `GlassCard` com `CategoryBadge` variant="ebook"
- XP total: badge `CategoryBadge` variant="xp" ao lado do XP já exibido (Task da correção da
  revisão final da Fase 1)
- Quiz de validação: container `GlassCard` ao redor do `QuizValidacaoContainer`
- Rail lateral mínimo: logo + ícone "Home" ativo + avatar/logout, estabelecendo a base visual
  para quando a Fase 2 adicionar mais seções (badges, leaderboard) — sem links mortos, só os
  itens que já existem hoje.

### Quiz de triagem e validação (`src/components/quiz/`)
- `QuizTriagem.tsx`: aplica os tokens (cards com `rounded-2xl`, cor primária violeta na barra de
  progresso e botões, em vez do azul atual)
- `QuizValidacao.tsx`: **não altera a lógica interna** (já reaprovado sem alteração na Fase 1);
  aplica apenas classes de cor consistentes com os novos tokens onde location permitir sem tocar
  na lógica (ex: cor da barra de progresso, cor dos botões) — se a mudança de estilo exigir tocar
  na lógica do componente, para e reporta em vez de arriscar quebrar o componente já aprovado.

## Testes

Sem lógica nova de negócio nesta fase (é puramente visual) — os testes existentes (18 testes da
Fase 1) continuam sendo a rede de segurança; não são esperados novos testes automatizados além de
verificação manual visual (`npm run dev` + captura de tela/verificação no browser de cada tela
afetada) e `tsc --noEmit` limpo.
