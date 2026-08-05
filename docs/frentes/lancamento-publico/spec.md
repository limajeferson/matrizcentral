# Spec — Lançamento Público (auditoria → 6 ondas)

> **Frente guarda-chuva.** Nasce da auditoria de código de **2026-07-26** (4 agentes
> paralelos: escopo F, escopo G, prontidão de lançamento/SEO, gate). Ela **absorve
> e reordena** as Trilhas F e G do programa `lancamento-final` e acrescenta o que
> a auditoria achou e nenhum plano cobria: **medição, SEO técnico, bordas de erro,
> destino do lead e consistência copy↔código**.
>
> **Objetivo do usuário que define a ordem:** *"fazer o lançamento da plataforma e
> começar o marketing para captar cliente."* O critério de prioridade é um só:
> **o que faz perder dinheiro ou perder dado agora vem primeiro.**

## Contexto verificado (não é suposição)

Levantado em 2026-07-26 contra o código e o banco remoto:

- **Gate verde:** `npx tsc --noEmit` exit 0 · `npm run test` **345 testes / 56
  arquivos** · `npx next lint` 0 erros (2 warnings `no-img-element` em
  `VideoPlayer.tsx:52` e `SystemSection.tsx:92`).
- **Banco em dia até a `0029`** — verificado por catálogo no remoto:
  `forum_replies.parent_reply_id`, `reading_progress`, `reading_events` e
  `users.capacity_tier` existem. *(O `CLAUDE.md` dizia "aplicadas até 0026" —
  desatualizado, corrigir.)* Próximo número livre: **`0030`**.
- **3 commits locais não pushados**, todos `docs/` da frente `kit-ecossistema-dragum`
  — sem pré-requisito de deploy, seguros.
- **Trilhas F e G nunca foram iniciadas** — nenhum commit delas no histórico.

## Achados da auditoria (o "porquê" de cada onda)

### Bloqueiam receita ou marketing (Onda 1)

| # | Achado | Evidência |
|---|---|---|
| A1 | **Botão de compra trava em erro de rede.** `handleCheckout` não tem `try/catch/finally`; se o `fetch` lançar, `loading` fica `true` para sempre e o cliente não compra nem vê erro. | `src/components/marketing/OfferPricing.tsx:11-24` (o `setLoading(false)` só existe no caminho `!res.ok`, :21) |
| A2 | **Zero medição.** Sem analytics e sem eventos de funil próprios. `/api/checkout` cria a sessão e não grava nada. Abandono de checkout, CTR e origem de tráfego são invisíveis. | grep `analytics\|gtag\|plausible\|track(\|posthog` em `src/` = 1 hit, e é **comentário** (`HeroV2.tsx:12`) |
| A3 | **Zero SEO técnico.** Sem `sitemap`, `robots`, `metadataBase`, `openGraph`, `twitter`, canonical, OG image. **A landing e a `/oferta` não têm metadata própria.** | `src/app/layout.tsx:18-21` só `title`+`description`; nenhum `sitemap*`/`robots*` em `src/app` ou `public/` |
| A4 | **Termos inacessíveis justo na `/oferta`.** Ela usa o rodapé antigo, que só tem `/#features` (âncora **morta** — esse id não existe) e `/#preco`. A copy manda "ver termos" e **não é link**. `/checkout/sucesso` e `/checkout/cancelado` não têm rodapé nenhum. | `oferta/page.tsx:32` → `marketing/Footer.tsx:8-11`; `OfferPricing.tsx:53` |
| A5 | **Sem `error.tsx` / `not-found.tsx` / `global-error.tsx` / `loading.tsx`** em todo o `src/app`. Exceção em produção = tela branca do Next. | busca em `src/app/**` = zero |
| A6 | **Lead sem destino.** A newsletter grava em `newsletter_subscribers` e **ninguém lê**: sem Brevo, sem double opt-in, sem página de obrigado (logo, sem URL para medir conversão). | `api/newsletter/route.ts:21-23`; migration `0011` só `id/email/created_at`; zero leitores em `src/` |

### Promessas descoladas do código (Onda 3)

| # | Promessa no ar | O que o código entrega |
|---|---|---|
| B1 | `/oferta`: **"12x R$47"** (`OfferPricing.tsx:73`) | O código só liga `installments:{enabled:true}` na Stripe (`api/checkout/route.ts:64-67`) — **quem decide parcelas e juros é o emissor**. 12×47 = R$564 vs R$497 à vista = **+13,5%** sem a palavra "juros" em lugar nenhum de `src/`. |
| B2 | `/oferta`: **"Garantia condicional de 7 dias"** (`OfferPricing.tsx:53`) | Os termos publicados dizem **incondicional** (`legal/termos/page.tsx:38-43`). A política vigente é **7 incondicionais + 8–30 comercial** (`leitor-protegido/politica-reembolso.md`). **Três versões diferentes no ar.** |
| B3 | Landing: R$47 = **"todo o sistema"** (`PricingV2.tsx:33-37`) | `/oferta` diz que R$47 dá **só prévias** da biblioteca; acesso pleno é R$497 (`OfferPricing.tsx:50`) |
| B4 | Landing: "Relatórios, **podcasts, vídeos** e apresentações" (`PricingV2.tsx:17`) | **16 de 16 itens do `CONTENT_HUB` têm `embedUrl === null`**; os 4 relatórios e 3 pesquisas renderizam por outro caminho, mas **os 9 itens audiovisuais (6 podcasts + 3 vídeos) estão 100% vazios** |

### Dívida que virou risco (Onda 4)

| # | Achado | Evidência |
|---|---|---|
| C1 | **XP de triagem concedido em dobro.** Os dois caminhos usam `action_type:"triagem"` com `reference_id` diferente (`token` vs `user.id`), então o `onConflict` nunca colide. | `api/quiz/route.ts:75` vs `api/diagnostico/route.ts:63` |
| C2 | **3 APIs concedem XP e mutam estado só com o token** — sem checar sessão nem entitlement. Entitlement revogado/expirado continua ganhando XP. | `api/content/complete/route.ts:7-33`, `api/pesquisa/responder/route.ts:12-50`, `api/roadmap/complete/route.ts:9-66` (nenhuma chama `getSessionUser`) |
| C3 | **`/entrar/resgate` não é uso único.** Nenhum `update` em `tokens`, nenhuma tabela de resgates. O token vale 365 dias e aparece em link visível → **fábrica de sessões de 30 dias**. | `api/resgate/route.ts:26-94`; o próprio comentário admite (`:21-22`) |
| C4 | **Auto-login é consume-then-mint.** O `session_id` é consumido dentro de `resolveUserBySessionId` **antes** de `createSession`; se o `createSession` lançar, o cliente perde o login e o retry cai em `ready:false`. | `access.ts:134-137` antes de `checkout-login/route.ts:18` |
| C5 | **`resolveUserIdByToken` lê o token sem checar `valid_until`** — trap de expiry aberto. | `entitlement-access.ts:5-11` |
| C6 | **14 call sites duplicam a leitura de `tokens`** com colunas e mensagens divergentes; `resolveTokenRow` não existe. | 14 arquivos listados no plano |
| C7 | **Código morto mútuo:** `/api/access-status` tem zero consumidores e é o único chamador de `resolveQuizUrlBySessionId`. | `access.ts:15-47`, `api/access-status/route.ts` |
| C8 | **`buildReplyTree` sem cap de profundidade e com sort sem desempate** (comparador nunca retorna 0 → ordem arbitrária em `created_at` igual). O cap de 5 é só visual, no componente. | `lib/forum-tree.ts:4-15`; `ReplyThread.tsx:12` |
| C9 | **`dashboard/[token]/conteudo/[id]` entrega o markdown inteiro numa resposta só, sem registrar leitura** — contradiz o invariante do leitor protegido, que a política de reembolso usa como evidência. | `page.tsx:69-71,122` vs `biblioteca/[slug]/page.tsx:84-89` |
| C10 | **Paginação do feed por `created_at` puro**, sem cursor composto → item pode sumir/repetir na borda. | `lib/feed-posts.ts:40-46` |

### Marca e polish (Onda 2)

- **A marca nova não está no site.** Os assets existem (`public/brand/favicon.svg` = cubo isométrico), mas `src/app/icon.svg` ainda é o **triângulo antigo**, e o `layout.tsx` não declara `icons`. Nenhum logo em imagem: header, landing e footer são **texto**.
- **Seis famílias de fonte espalhadas** (Geist, Hanken Grotesk, JetBrains Mono, Archivo Black, Inter, Press Start 2P) e **Outfit — a fonte escolhida da marca — tem zero ocorrências em `src/`.**
- **Certificado existe mas é indescobrível:** as rotas `dashboard/[token]/certificado` e `certificado/[code]` funcionam, mas não há link em `/conta`, `/feed`, `LeftSidebar` ou dashboard; o `footer-nav.ts:18` marca "Certificação" como **`soon: true`** apesar de pronta; e o botão do quiz diz "Ver Meu Certificado →" mas navega para `/dashboard/[token]` (`QuizValidacao.tsx:191,195`).
- **a11y aberto:** `UserMenu` sem Escape, sem setas, sem retorno de foco; `ProfileCard` sem `aria-expanded`, sem Escape, sem foco, com `role="dialog"` questionável.
- **`ContentGate` fora de tokens** (`border-white/10`, `bg-black/40`, `text-white/70`).
- **`useReducedMotion` só existe no marketing**, zero na área logada; stories sem `visibilitychange` (slide pula ao voltar de aba).
- **Âncoras quebradas:** `/#features` não existe (Header/Footer antigos); o `LandingHeader` usa âncoras relativas (`#sistema`, `#processo`, `#preco`, `#faq`) e é renderizado **fora da landing** em `/sobre` e `/legal/*`.
- **`ContatoForm` sem `<label>`**; `/oferta` sem `<form>` (Enter não envia), sem label.

## Decisões desta spec

1. **Kiwify como caixa** (decisão do usuário, 2026-07-26). A entrega continua na
   nossa plataforma; a Kiwify é só o caixa. Consequência: a promessa de
   parcelamento **passa a ser verdadeira**, mas só quando a integração estiver no
   ar — até lá a copy não pode prometer o que a Stripe não entrega (Onda 3
   escreve os **dois estados**, e a Onda 6 vira a chave).
2. **Medição é própria, não terceirizada.** Tabela `funnel_events` + `POST /api/track`.
   Motivo: custo zero é restrição do projeto (sem dependência npm nova), e um
   funil próprio dá o dado cru que nenhum plano gratuito de terceiro entrega.
   O Vercel Web Analytics entra **sem pacote npm**, pelo script servido pela
   própria plataforma.
3. **Nada de PII nova no funil.** `funnel_events` guarda um `anon_id` opaco
   (cookie first-party), nunca e-mail. `user_id` só quando já há sessão.
4. **A `/oferta` mantém o rodapé antigo, consertado** — não repontar para o
   `FooterV2`. Motivo: a `/oferta` é tema claro (`.lp-guide`) e o `FooterV2` é
   `.mcv2` dark; repontar quebraria o visual. Conserta-se o rodapé antigo
   (âncora morta + links legais).
5. **Onda 3 tem portão humano.** Garantia e preço têm efeito jurídico e
   comercial: o Claude redige, **o usuário aprova antes do deploy** (limite
   permanente 3 do `CLAUDE.md`).
6. **O case Dragum é conteúdo, não frente.** Registrado no backlog editorial
   (ver `backlog-conteudo.md`), sem ação agora.

## As 6 ondas

### Onda 1 — Receita & Descoberta *(sem isto, anunciar é queimar dinheiro)*
- **H1** `/oferta` à prova de falha: `<form onSubmit>`, `try/catch/finally`, `<label>`, botão `submit`.
- **H2** Termos acessíveis: rodapé antigo com links legais e âncora viva; `"ver termos"` vira link; rodapé mínimo em `/checkout/*`.
- **H3** SEO técnico: `sitemap.ts`, `robots.ts`, `metadataBase`, `openGraph`/`twitter` no root, `opengraph-image` com a marca.
- **H4** Metadata por rota: landing, `/oferta`, `/certificado/[code]` (compartilhável), `/biblioteca/[slug]`; `noindex` nas privadas.
- **H5** Medição: migration `0030_funnel_events`, `src/lib/funnel.ts` puro, `POST /api/track`, instrumentação dos 6 eventos do funil + Vercel Web Analytics sem dep.
- **H6** Bordas: `error.tsx`, `global-error.tsx`, `not-found.tsx` com a marca + `loading.tsx` nas 3 rotas que leem markdown do disco.

### Onda 2 — Identidade & Polish *(a marca precisa existir antes do primeiro tráfego)*
- **F-I1** Favicon/ícones = cubo; `icons` no metadata.
- **F-I2** Tipografia unificada: **Outfit** (títulos) + **Inter** (corpo) via `next/font/google`, aposentando a bagunça de 6 famílias.
- **F-I3** Logo cubo no `AppHeader`, `LandingHeader`, rodapés e e-mails.
- **F5** Âncoras mortas e o `LandingHeader` fora da landing.
- **F7** Certificado descobrível (`/conta`, `LeftSidebar`, `footer-nav`, botão do quiz).
- **F8** Forms: `<label>` no `ContatoForm`.
- **F2** a11y do `UserMenu` e do `ProfileCard`.
- **F4** `ContentGate` em tokens.
- **F1/F3** `use-focus-trap` + `useReducedMotion` na área logada + `visibilitychange` nos stories.

### Onda 3 — Verdade da Oferta *(portão humano)*
- **I1** Garantia unificada nas 3 superfícies (oferta, termos, e-mails): 7 incondicionais + 8–30 comercial, qualificador visível no ponto da promessa.
- **I2** Preço honesto nos dois estados (Stripe hoje / Kiwify depois).
- **I3** Landing ↔ oferta dizendo a mesma coisa sobre o que R$47 entrega.
- **I4** Biblioteca enquadrada como "em expansão" onde hoje se anuncia mídia que não existe.
- **I5** *(achado em 2026-08-05, durante a Onda 2)* **O FAQ da landing mente sobre
  o certificado.** `src/components/marketing/v2/faq-data.ts:18-20` diz que *"com
  70% de acerto o certificado com QR code é liberado"*. Dois erros: (a) o quiz é
  **metade** do requisito — `src/lib/certificates.ts` também exige a **missão
  final** da trilha concluída; (b) **não existe QR code** em nenhuma das duas
  rotas de certificado. É promessa com efeito sobre expectativa de cliente.
- **I6** *(menor, mesma origem)* O pill "Certificado" no bloco "Você ganhou:"
  do `QuizValidacao.tsx:143-148` sugere emissão garantida ao passar no quiz.

> ⚠️ **A Onda 3 virou pré-requisito da Onda 6** (decisão de 2026-08-05: listar
> na Kiwify antes de lançar pelo site). Copy falsa num marketplace gera reembolso
> em massa → queda de ranking e risco de **suspensão da conta**. `I1`–`I6` têm
> que estar no ar **antes** da listagem.

### Onda 4 — Tech-debt & Segurança
- **G-S1** XP de triagem deduplicado; fluxo por token aposentado.
- **G-S2** As 3 APIs de mutação passam a exigir sessão + entitlement.
- **G-S3** `/entrar/resgate` uso único.
- **G-S4** Mint-then-consume no auto-login.
- **G-D1** `resolveTokenRow` (14 sites) + expiry no `resolveUserIdByToken`.
- **G-D2** Código morto (`/api/access-status` + `resolveQuizUrlBySessionId`).
- **G-D3** `forum-tree`: cap de profundidade + desempate por `id`; `replyCountLabel` DRY.
- **G-D4** Cursor composto na paginação do feed.
- **G-D5** `dashboard/[token]/conteudo/[id]` alinhado ao invariante do leitor.

### Onda 5 — Motor de Marketing
- **J1** Newsletter → Brevo, com double opt-in e página de obrigado (URL medível).
- **J2** Captura fora do rodapé.
- **J3** Sequência de nutrição sobre o cron que já existe.

### Onda 6 — Kiwify + Auditoria final
- **K1** Integração Kiwify (webhooks `compra_aprovada`/`compra_reembolsada`/`chargeback`) coexistindo com a Stripe, + cron de reconciliação.
- **K2** Virada da copy de preço (Onda 3, estado 2).
- **K3** Auditoria final + dogfooding da jornada completa em produção.

## Critérios de sucesso

1. `npx tsc --noEmit` 0, `npm run test` verde e `next lint` sem erros ao fim de **cada** item.
2. Um link da landing compartilhado no WhatsApp mostra **título, descrição e imagem da marca**.
3. `GET /sitemap.xml` e `/robots.txt` respondem em produção com as rotas públicas — e **sem** as privadas.
4. Um visitante indo landing → `/oferta` → checkout deixa **rastro consultável** em `funnel_events`.
5. Nenhuma superfície do produto promete o que o código não entrega (garantia, parcelamento, mídia).
6. Um erro forçado em produção mostra **página da marca**, não tela branca.
7. Nenhum caminho concede XP sem sessão + entitlement válidos; nenhum token vira sessão duas vezes.
8. Quem assina a newsletter recebe confirmação e cai numa lista do Brevo.

## Não-objetivos

- Nada que exija credencial ou conta do usuário é feito pelo Claude (chaves Kiwify, uploads públicos).
- Custo zero mantido: **sem dependência npm nova**, sem asset externo em runtime.
- Nada de redesign da área logada — o baseline visual está aprovado.
- O jogo Dragum não vira frente aqui; é insumo editorial.

## Riscos

- **Onda 3 sem aprovação vira bloqueio:** se o usuário não revisar a copy, o
  código fica pronto e não deploya. Mitigação: entregar a copy num diff isolado,
  legível, com as três versões atuais lado a lado.
- **`next/font/google` em 6 arquivos ao mesmo tempo** pode causar regressão
  visual ampla. Mitigação: item próprio, um commit, verificação visual no dev
  server antes de seguir.
- **Migration `0030`** precisa ser aplicada no remoto **na mesma sessão** em que
  o código que a usa for pushado (L-023).
