# Redesign da /oferta — Design

**Data:** 2026-07-05
**Status:** aprovado (autonomia declarada pelo usuário)
**Branch:** feat/oferta-redesign

## Problema (diagnosticado no app rodando)

A página `/oferta` (`src/app/(marketing)/oferta/page.tsx`, escopo `.lp-guide`/`.mc-oferta-wrapper`, importa `landing-v2.css`) tem 1 bug com 2 sintomas visíveis:

- **Fundo virou seção:** o `.mc-oferta-starfield` computa `position: relative` — a regra `.mc-oferta-wrapper > * { position: relative; z-index: 1 }` (`landing-v2.css:795`) tem a MESMA especificidade que `.mc-oferta-starfield` (`landing-v2.css:789`, `position: fixed`) e vem depois no arquivo, então vence e o canvas vira um bloco de ~897px no topo.
- **Planos escondidos:** consequência — o bloco de 897px empurra o conteúdo; o `.plans-grid` começa em ~1198px (abaixo da dobra de 897px). A primeira tela mostra só estrelas.

Além disso, há overflow horizontal (scroll lateral) provável do canvas relativo de largura fixa.

Conteúdo dos planos também está desatualizado (garantia 30 dias, benefícios genéricos) e o enquadramento vende "um ebook", não o valor real.

## Objetivo

1. Fazer o starfield ser um **fundo fixo** de verdade (atrás do conteúdo).
2. Trazer os **3 planos para a primeira dobra**, visíveis de cara.
3. Reescrever os **3 tiers** com o conteúdo detalhado fornecido.
4. **Reposicionar** o R$47: não é "comprar um ebook", é receber **diagnóstico + plano de ação** e **parar de pagar assinatura** — virar dono da própria IA (offline, privacidade, vantagem sobre modelos restritos).

## Restrições globais

- **Custo zero:** sem dependências npm novas, sem assets externos.
- **Escopo:** mudanças na `/oferta` (page + `OfferPricing` + bloco `.mc-oferta*` de `landing-v2.css`). Não tocar na landing `/` nem no `/checkout`.
- **Honestidade:** Assinatura Mensal e Acesso Total continuam "Em breve" (waitlist) — só o Ebook Avulso tem checkout real (Stripe). Não prometer compra que não existe.
- **Acessibilidade / pt-BR:** foco visível; copy em português do Brasil.
- **Gate:** `npx tsc --noEmit` (exit 0) + `npm run test`. NÃO usar `npm run build` (falha pré-existente em `/api/checkout`).

## Arquitetura das frentes

### Frente A — Starfield como fundo fixo
- Em `landing-v2.css`, trocar `.mc-oferta-wrapper > *` por `.mc-oferta-wrapper > *:not(.mc-oferta-starfield)` (mantém `position: relative; z-index: 1` para todos os filhos EXCETO o canvas), preservando o `.mc-oferta-starfield { position: fixed; inset:0; z-index:0 }`.
- Garantir que o wrapper não gere overflow horizontal (`overflow-x: clip` no `.mc-oferta-wrapper` se o scroll lateral persistir).

### Frente B — Planos na primeira dobra
- Em `oferta/page.tsx`, compactar a intro: reduzir a `.sec-head` a uma headline curta + subtítulo de posicionamento, e reduzir o padding superior da `section` para que o `.plans-grid` comece dentro da primeira dobra (topo dos cards visível em ~700px).
- Reforçar a `.mc-oferta-wrapper` visualmente com o fundo escuro já existente.

### Frente C — Reescrever os 3 tiers (`OfferPricing.tsx`)
Reescrever o JSX dos 3 `.plan` (mantendo os componentes `EbookAvulsoCheckout` e `WaitlistForm` e os planIds existentes):

**1. Ebook Avulso — R$47 (pagamento único, checkout real):**
- Framing (price small): "pagamento único · você vira dono da sua IA"
- Bullets:
  - 1 ebook completo com todos os capítulos sobre rodar LLMs localmente
  - Passo a passo de instalação e uso dos modelos
  - Avaliação de qual o melhor modelo para o seu objetivo
  - Triagem de perfil + roadmap personalizado (indica o melhor plano para assinar)
  - 1 cupom de R$47 para migrar para a assinatura ou o acesso total
  - Garantia de 7 dias — não gostou, devolvemos
- foot: "Por R$47, uma vez: um diagnóstico, um plano de ação e o fim das mensalidades."

**2. Assinatura Mensal — R$97/mês (Em breve, waitlist `mensal_97`):**
- Bullets:
  - Todos os benefícios do Ebook Avulso
  - 1 ebook novo por mês — 12 no ano (na ordem de lançamento)
  - Acesso ao hub de conteúdo (todos os relatórios, 1 pesquisa/mês, 1 podcast/mês)
  - Cancela quando quiser
- foot: "Pra quem quer estudar todo mês, sem compromisso longo"

**3. Acesso Total 12 Meses — R$497 (Em breve, waitlist `anual_497`, recommended):**
- Bullets:
  - Acesso completo à plataforma
  - Todos os ebooks lançados durante os 12 meses
  - Triagem de perfil + roadmap personalizado
  - Quiz de validação com certificado de conclusão
  - Gamificação de perfil para medir a profundidade do seu aprendizado
  - Hub de conteúdo completo (relatórios, podcasts, pesquisas, apresentações, conteúdo personalizado e avaliação de novas ferramentas)
  - ≈ R$19 por ebook — o mais barato do catálogo (2 lançamentos por mês)
- foot: "Pra quem já sabe que vai estudar o ano inteiro"

- Atualizar a `.plan-note` do rodapé do grid, se necessário, mantendo a de "roda sem placa de vídeo".

### Frente D — Enquadramento de posicionamento (intro)
- A intro da `/oferta` (`sec-head`) passa a comunicar independência, não "ebook": tag "Escolha seu plano", headline curta ("Deixe de alugar inteligência — comece a ser dono dela." ou similar), subtítulo conectando R$47 → diagnóstico + plano de ação + fim das assinaturas + privacidade/offline.

## Fora de escopo (projeto futuro)

- Geração real do cupom de R$47 por comprador (código da compra liberado após 7 dias / prazo de não-cancelamento) — lógica de backend.
- Validação da garantia (preencher perfil + quiz + triagem + avaliação para provar consumo do material) — regras de negócio/termos.
- Tornar Assinatura/Acesso Total compráveis (hoje waitlist).

Estes entram apenas como **copy** na página (menção ao cupom e à garantia de 7 dias); a mecânica fica para specs próprios.

## Testes / verificação

- Sem lógica pura nova → sem testes vitest novos; a suíte existente (65) deve permanecer verde.
- Verificação via app (dev + Playwright): starfield é `position: fixed` (não empurra conteúdo), `.plans-grid` começa dentro da primeira dobra (top < innerHeight), sem overflow horizontal, os 3 tiers exibem o novo conteúdo, e o Ebook Avulso mantém o checkout real. Confirmar `/` e `/checkout` intactos.
