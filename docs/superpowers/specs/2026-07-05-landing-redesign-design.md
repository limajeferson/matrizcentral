# Design: Redesign da Landing Principal — Nova Identidade "Matriz Central"

**Data:** 2026-07-05
**Escopo:** Landing principal (`/`). A `/oferta` e o dashboard permanecem intactos nesta fase.
**Referência de direção visual:** template de fitness estudado como inspiração de energia/ritmo (dark + acento elétrico + tipografia display gigante + animações de scroll). A implementação é 100% original — fonte, paleta, formas, conteúdo e código próprios.

## Objetivo

Redesenhar a landing com uma identidade visual de alto impacto e um sistema de animações de scroll, elevando a percepção de qualidade do produto e a conversão para `/oferta`. A nova identidade passa a ser a referência da marca daqui em diante.

## 1. Identidade visual

### Cores
- **Fundo base:** quase-preto com temperatura violeta — `#0A0812` (tokens em oklch no CSS).
- **Acento único:** violeta elétrico, evolução do primário atual — família `#7C5CFF` (mais saturado que o `#7C3AED` atual). Usado em **blocos de cor sólida inteiros** (seções/cards com fundo violeta), não apenas detalhes.
- **Neutros:** branco `#FFFFFF` para texto sobre dark/violeta, cinzas frios para texto secundário.
- **Footer claro:** fundo branco/near-white com texto escuro — inversão de contraste no fechamento da página.

### Tipografia
- **Display:** Archivo Black (Google Fonts, via `next/font`), caixa alta, tracking apertado. Hero: clamp de ~56px (mobile) a ~120px (desktop). Títulos de seção: 40–72px.
- **Corpo:** Inter (via `next/font`).
- **Mono:** JetBrains Mono para números, XP, badges e labels técnicos.

### Formas e layout
- **Canvas com moldura:** conteúdo dentro de um wrapper com cantos arredondados (radius ~24px) inserido na viewport com pequena margem, criando profundidade sobre o fundo da página.
- **Chanfros:** botões e cards com cantos cortados na diagonal via `clip-path` — assinatura da identidade.
- **Tags:** retângulos pequenos com fundo translúcido, texto mono.

### Imagens
- Zero banco de fotos. Visuais são: **NetworkMotif** (rede de nós já existente, agora animada com parallax), **mockups estilizados do dashboard/XP** construídos em HTML/CSS/SVG, e gráficos abstratos SVG. Custo zero, sem assets pesados.

## 2. Estrutura da página

Ordem das seções e componentes (novos ou reescritos em `src/components/marketing/`):

1. **Header** — logo + botão hamburguer. Menu overlay fullscreen com links animados em stagger. CTA contextual removido do header (migra para o FixedCta).
2. **FixedCta** (novo) — botão fixo no canto inferior direito, "Começar por R$47" → `/oferta`, visível durante todo o scroll, chanfrado, some perto do footer.
3. **Hero** — headline display gigante em caps com palavra-chave em violeta; NetworkMotif ao fundo com parallax; prova social (leitores/avaliação) acima da headline; CTA duplo (accent → `/oferta`, ghost → âncora); DemoWidget mantido abaixo.
4. **ProblemSection** (substitui AdvantagesSection) — bloco violeta sólido: o argumento contra mensalidades de IA, com contador animado de gasto anual (ex.: ChatGPT Plus + Claude Pro ≈ R$ por ano).
5. **SystemSection** (substitui FeaturesGrid) — "Um sistema, não um ebook solto": cards grandes alternando fundo dark/violeta — ebook, trilha personalizada via quiz, dashboard com XP. Cada card: título display, descrição, tags mono, visual próprio (mockup/motif).
6. **ProcessSteps** (novo) — "PASSO 1 / 2 / 3" com títulos display enormes e efeito sticky de empilhamento no scroll: comprar → quiz gera a trilha → estudar e subir de nível.
7. **PricingSection** — planos atuais (Ebook R$47 avulso + plano completo) mantendo hierarquia e badges da /oferta, agora em cards chanfrados na nova identidade.
8. **FaqSection** (novo) — accordion sobre bloco violeta; perguntas adaptadas do conteúdo existente (requisitos de máquina, precisa saber programar, acesso, garantia).
9. **FinalCta** — headline display + CTA, transição para o footer.
10. **Footer** — claro (fundo branco), colunas de links, contraste invertido.

**Copy:** adaptado do existente (argumentos e provas mantidos), reescrito para o novo ritmo — headlines curtas em caixa alta, subtítulos em uma frase. Sem inventar claims novos.

## 3. Sistema de animação (Framer Motion)

Nova dependência: `framer-motion` (MIT). Componentes de seção viram client components.

- **Aparição:** fade + translateY(~24px) + blur sutil, `whileInView` com `once: true`, stagger em grupos (cards, links do menu).
- **Parallax:** `useScroll` + `useTransform` no NetworkMotif do hero e visuais de seção.
- **Sticky steps:** ProcessSteps com container alto e cards sticky que escalam/empilham conforme o progresso do scroll.
- **Micro-interações:** botões com spring no hover (deslocamento do chanfro), contadores numéricos animados (gasto anual, XP), menu overlay com stagger.
- **Acessibilidade:** `useReducedMotion` desativa deslocamentos/parallax (mantém apenas fades); conteúdo 100% legível sem JS (animações são progressivas — estado inicial visível via CSS quando JS não carrega).
- **Performance:** single dependency; sem imagens raster; `will-change` pontual; animações apenas em `transform`/`opacity`.

## 4. Arquitetura e impacto no código

- **Arquivos reescritos:** `Header.tsx`, `Hero.tsx`, `PricingSection.tsx`, `FinalCta.tsx`, `Footer.tsx`.
- **Arquivos novos:** `FixedCta.tsx`, `ProblemSection.tsx`, `SystemSection.tsx`, `ProcessSteps.tsx`, `FaqSection.tsx`, além de primitivos compartilhados (`motion-primitives.tsx`: Reveal, Stagger, AnimatedCounter; `AngledButton.tsx`).
- **Removidos da landing:** `AdvantagesSection.tsx`, `FeaturesGrid.tsx` (arquivos deletados se não usados em outra página; verificar referências antes).
- **CSS:** tokens da nova identidade em `globals.css` (escopo `.mc-landing` ou camada própria para não vazar para dashboard/oferta nesta fase); fontes via `next/font` no layout do route group `(marketing)` — atenção para não afetar a `/oferta`, que compartilha o route group: fontes expostas como CSS variables e aplicadas apenas na landing.
- **DemoWidget e NetworkMotif:** mantidos, reestilizados por CSS.

## 5. Tratamento de erros e casos-limite

- JS desabilitado/falha de hidratação: conteúdo visível (sem estados iniciais `opacity: 0` hardcoded em CSS crítico).
- `prefers-reduced-motion`: fades apenas.
- Mobile: display type escala via clamp; sticky steps degradam para stack simples em telas baixas; menu overlay é o padrão em todas as larguras.

## 6. Testes e verificação

- `npm run build` e `npm run test` (suite existente) passam.
- Verificação end-to-end: navegar a landing no navegador (Playwright) em desktop e mobile viewport — hero, scroll completo, menu, FAQ, CTAs apontando para `/oferta`.
- Verificar que `/oferta`, `/quiz` e `/dashboard` não mudaram visualmente.
