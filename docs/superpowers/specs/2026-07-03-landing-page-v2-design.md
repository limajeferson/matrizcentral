# Matriz Central — Landing Page v2 (a partir do modelo guia)

Data: 2026-07-03
Status: Aprovado para plano de implementação

## Contexto

O usuário pediu a um outro assistente (Claude Cowork, no Windows) para gerar um clone
mais rico do template de referência original (o mockup "IPSUM", já usado como base
visual nesta sessão). O resultado está em
`C:\Users\jefer\Documents\Projetos\matrizcentral\landing-clone.html` — um HTML
autocontido, estático, com JS decorativo (tabs, waveform animada), bem mais completo
que a primeira landing page implementada no Next.js (que tinha só Header, Hero,
FeaturesGrid e PricingSection).

Este documento define como portar essa estrutura mais rica para a landing page real
do Matriz Central (`src/app/(marketing)/`), substituindo a versão atual, mantendo as
mesmas decisões de integridade já aplicadas na primeira versão desta sessão.

## Escopo

Substituir os componentes de `src/components/marketing/` para incorporar as seções
novas do modelo guia: demo widget com abas, seção "vantagens" com gráfico, cards de
feature com mockups visuais, CTA final em destaque, footer completo com nav. Mantém a
estrutura de rota já existente (`src/app/(marketing)/page.tsx` compõe os componentes).

**Fora de escopo:** animações JS decorativas do arquivo original (waveform animada,
troca de aba puramente estética) — ficam para uma iteração futura se o usuário pedir;
esta fase entrega a estrutura visual completa em componentes estáticos (Server
Components onde possível), com interatividade real só onde já existe (troca de aba do
quiz-demo, que aqui é só um preview ilustrativo, pode ser client-side simples).

## Decisões que adaptam o modelo guia à realidade do produto (mesmos princípios já aplicados nesta sessão)

1. **Cor primária: violeta, não verde.** O modelo guia usa `#37c978` (verde-menta)
   como acento. Mantém-se o violeta (`violet-600`) já estabelecido no dashboard, quiz
   de triagem e primeira landing page — trocar de novo criaria a mesma inconsistência
   já corrigida antes (achado da revisão final da Fase de Identidade Visual).
2. **Sem logos de "confiado por" com nomes de empresas reais.** O modelo guia lista
   "loom, ramp, Vercel, descript, Raycast" como clientes. Não temos esses clientes —
   omitido, como já decidido na primeira versão da landing page.
3. **Sem depoimentos fabricados com nomes de empresas reais.** Mesma decisão da
   primeira versão: sem "Emily Zhang @ ramp" fictícia.
4. **Pricing real, não assinatura.** R$47 pagamento único (não $19/$29/$59 por mês).
   Reaproveita o card de plano "popular" com o gradiente verde do modelo → adaptado
   para violeta, com um único plano (não 3 tiers, já que só existe 1 produto).
5. **Demo widget reinterpretado para o produto real.** O modelo guia mostra um "AI
   Voice Tutor" (clonagem de voz, criar tutor) — não é o nosso produto. As abas viram
   "Quiz de Perfil / Roadmap / Ebook", cada uma com um preview estático ilustrando essa
   parte do fluxo real (reaproveita a ideia das abas do protótipo gerado no Claude
   Design antes, que já tinha essa adaptação certa).
6. **Seção "Advantages" sem comparação de concorrente fabricada.** O modelo guia tem
   um gráfico "nós vs. Next Best Competitor" — não temos dados reais de comparação
   com concorrentes. Reaproveita o visual do gráfico (curva suave com preenchimento
   gradiente), mas reframed como "sua evolução com XP ao longo do roadmap" —
   ilustrativo, sem alegar comparação com concorrentes.
7. **CTA final ("Start Speaking a New Language Today") adaptado** para o contexto do
   produto: convite para começar o quiz/comprar o ebook.
8. **Seção de depoimentos (testimonials) omitida, não adaptada.** O modelo guia tem
   uma seção inteira "What Our Users Are Saying" com dois cards de depoimento entre
   Pricing e o CTA final. Diferente das outras seções (que foram reinterpretadas com
   conteúdo real), esta foi conscientemente omitida — não existem depoimentos reais de
   usuários ainda, e fabricar nomes/citações violaria a mesma regra já aplicada nos
   itens 2 e 3 (sem logos e depoimentos fictícios). Retomar quando houver depoimentos
   reais para usar.

## Componentes (arquivos)

```
src/components/marketing/
├─ Header.tsx          (já existe — mantém, sem mudanças)
├─ Hero.tsx             (já existe — ganha o demo widget abaixo do CTA)
├─ DemoWidget.tsx       (novo — abas Quiz de Perfil / Roadmap / Ebook + preview estático)
├─ AdvantagesSection.tsx (novo — gráfico SVG ilustrativo + 3 features em texto)
├─ FeaturesGrid.tsx     (já existe — ganha mockups visuais nos cards, não só badge+texto)
├─ PricingSection.tsx   (já existe — reestiliza para o visual "plano em destaque"
                          gradiente violeta do modelo guia, mantendo 1 produto/preço)
├─ FinalCta.tsx         (novo — banner escuro de CTA final antes do footer)
└─ Footer.tsx           (já existe — ganha nav de links, mantém simples)
```

## Testes

Sem lógica de negócio nova (é visual). `npx tsc --noEmit` limpo e os 18 testes
existentes continuam passando (nenhum deles cobre `marketing/`, então nenhuma
alteração de comportamento esperada nesses testes). Verificação manual no browser
(`npm run dev`) de cada seção nova.
