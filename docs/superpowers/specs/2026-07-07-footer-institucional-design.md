# Footer Institucional da Matriz Central — Design

**Data:** 2026-07-07
**Status:** Aprovado para implementação
**Escopo:** Reconstrução do rodapé como hub institucional + 3 páginas novas (`/sobre`, `/legal/privacidade`, `/legal/termos`) + newsletter funcional.

> ⚠️ **Ressalva jurídica:** Os textos legais (Privacidade, Termos, Reembolso, LGPD) serão redigidos como rascunho de boa-fé baseado no que o site faz hoje. **Não constituem aconselhamento jurídico.** O usuário deve revisar com um profissional antes de considerá-los definitivos.

---

## 1. Objetivo

Transformar o rodapé (hoje `src/components/marketing/v2/FooterV2.tsx`, 2 colunas simples) em uma área institucional que transmita: "existe uma empresa séria, com visão de longo prazo, por trás disto — não é um ebook vendido por uma página qualquer."

Inspiração visual: Vercel, Stripe, Notion, Linear (minimalista, muito espaço, pouco texto, glow violeta discreto). Coerente com o design system existente: escopo `.mcv2`, dark + violeta elétrico (`--mc-accent`).

Princípio de honestidade (do `CLAUDE.md`): enquadrar como "em expansão", nunca "tudo já disponível". Links sem destino real recebem selo **"em breve"** (mesmo padrão de `mc-library-soon`), nunca links mortos.

---

## 2. Cópia institucional (texto canônico)

Estas strings são a fonte da verdade — reusadas no footer (versão curta) e na página `/sobre` (versão expandida).

**Slogan:** `Menos assinatura. Mais autonomia.`

**Descrição institucional (longa):**
> A Matriz Central é uma plataforma brasileira dedicada ao desenvolvimento da autonomia em Inteligência Artificial, reunindo conteúdo, ferramentas e experiências de aprendizado para quem deseja utilizar IA com mais controle, privacidade e independência.

**Descrição institucional (curta, para o footer):**
> Plataforma brasileira dedicada à autonomia em Inteligência Artificial. Conteúdo, ferramentas e aprendizado para usar IA com mais controle, privacidade e independência.

**História (`/sobre#historia`):**
> Desde 2025, a Matriz Central pesquisa, estrutura e ensina formas práticas de utilizar modelos de Inteligência Artificial localmente, reunindo conteúdo técnico, trilhas de aprendizado e ferramentas para quem deseja reduzir a dependência de serviços baseados em assinatura.

**Missão (`/sobre#missao`):**
> Democratizar o acesso à IA local através de conteúdo organizado, objetivo e acessível para diferentes níveis de conhecimento.

**Visão (`/sobre#visao`):**
> Ser uma das principais referências em língua portuguesa para aprendizado, implantação e uso prático de Inteligência Artificial Local.

**Valores (`/sobre#valores`)** — 6 itens, cada um com linha de apoio (evitar genérico):
1. **Autonomia** — você no controle da sua própria IA, do primeiro dia.
2. **Conhecimento aplicado** — nada de teoria solta; tudo aponta para a prática.
3. **Privacidade** — seus dados no seu hardware, não na nuvem de terceiros.
4. **Transparência** — sem promessas infladas nem letra miúda.
5. **Tecnologia acessível** — sem exigir que você seja programador.
6. **Evolução contínua** — a plataforma cresce, e você cresce com ela.

**Copyright:**
> © 2026 Matriz Central. Todos os direitos reservados. · Desenvolvido no Brasil · Atuando desde 2025.

O ano do copyright usa `new Date().getFullYear()` (dinâmico), como no footer atual.

---

## 3. Estrutura de dados do footer

Novo arquivo `src/components/marketing/v2/footer-nav.ts`:

```ts
export interface FooterLink {
  label: string;
  href?: string;   // ausente => renderiza como texto, não <a>
  soon?: boolean;  // true => selo "em breve"
}
export interface FooterColumn {
  title: string;
  links: FooterLink[];
}
export const FOOTER_COLUMNS: FooterColumn[] = [ /* colunas 2-6 abaixo */ ];
```

Regra de renderização: item com `href` e sem `soon` → `<a href>`. Item sem `href` **ou** com `soon: true` → `<span>` com selo "em breve". (Um item pode ter `href` E `soon` se apontar para uma âncora que existe mas cujo conteúdo é provisório — não usado nesta versão; regra: `soon` sempre vence e vira span.)

### Mapa de colunas

**Coluna 1 — Marca** (não vem de `FOOTER_COLUMNS`; é markup fixo no componente): logo `Matriz/Central`, slogan, descrição curta, linha "Atuando desde 2025", ícones sociais (todos "em breve").

**Coluna 2 — Plataforma:**
| Rótulo | href | soon |
|---|---|---|
| O Sistema | `/#sistema` | — |
| Como Funciona | `/#processo` | — |
| Preço | `/#preco` | — |
| Certificação | — | sim |
| FAQ | `/#faq` | — |
| Oferta | `/oferta` | — |

**Coluna 3 — Conteúdo** (tudo em breve):
Blog · Artigos · Guias · Novidades · Feed Educacional · Catálogo — todos `soon: true`.

**Coluna 4 — Suporte:**
| Rótulo | href | soon |
|---|---|---|
| Central de Ajuda | — | sim |
| Contato | — | sim |
| Garantia | `/legal/termos#garantia` | — |
| Política de Reembolso | `/legal/termos#reembolso` | — |
| Status da Plataforma | — | sim |
| Perguntas Frequentes | `/#faq` | — |

**Coluna 5 — Institucional:**
| Rótulo | href | soon |
|---|---|---|
| Sobre | `/sobre` | — |
| Nossa História | `/sobre#historia` | — |
| Missão | `/sobre#missao` | — |
| Visão | `/sobre#visao` | — |
| Valores | `/sobre#valores` | — |
| Parceiros | — | sim |
| Trabalhe Conosco | — | sim |

**Coluna 6 — Legal:**
| Rótulo | href | soon |
|---|---|---|
| Política de Privacidade | `/legal/privacidade` | — |
| Termos de Uso | `/legal/termos` | — |
| Cookies | `/legal/privacidade#cookies` | — |
| LGPD | `/legal/privacidade#lgpd` | — |
| Licenciamento | `/legal/termos#licenciamento` | — |
| Direitos Autorais | `/legal/termos#direitos` | — |

---

## 4. Faixa de destaque (topo do footer)

Acima das colunas, três selos discretos em linha (ícones SVG, não emoji):
- `Plataforma Brasileira`
- `Atuando desde 2025`
- `Especializada em IA Local`

Visual: linha de "trust badges" com ícones de linha pequenos + texto mono, borda sutil, sem preenchimento chamativo.

---

## 5. Newsletter (funcional)

> **Correção sobre o spec original:** `/api/waitlist` NÃO serve — ele exige `planId`
> (`mensal_97`/`anual_497`) e grava na tabela `plan_waitlist` (interesse em plano de
> preço). Usar para newsletter poluiria dados de negócio. A newsletter ganha endpoint
> e tabela próprios.

Componente client `src/components/marketing/v2/FooterNewsletter.tsx`.
- Título: "Receba novidades sobre IA Local"
- Descrição: "Artigos, novidades e novos conteúdos diretamente no seu e-mail."
- Campo de e-mail + botão "Inscrever-se".
- **Backend novo:** `POST /api/newsletter` → grava `{ email }` na tabela `newsletter_subscribers`.
  - Valida e-mail no servidor (reusa `isValidEmail`), retorna `400` se inválido.
  - Insere via `getSupabaseServerClient()` (mesmo padrão de `/api/waitlist`).
  - `onConflict` no e-mail é ignorado (re-inscrição não é erro): usar `upsert` com `onConflict: "email"` ou tratar erro de duplicata como sucesso.
  - Resposta: `{ ok: true }` em sucesso; `{ error }` + status em falha.
- **Migration nova:** `supabase/migrations/0011_newsletter_subscribers.sql` — tabela
  `newsletter_subscribers` (`id uuid pk default gen_random_uuid()`, `email text not null unique`,
  `created_at timestamptz default now()`), RLS habilitado sem policies públicas (só service role
  insere, como as demais tabelas de waitlist).
  - ⚠️ A migration precisa ser aplicada no Supabase (`supabase db push` ou painel) pelo
    usuário para a newsletter funcionar em runtime. Anotar como passo manual.
- **Tipo:** adicionar `newsletter_subscribers` ao tipo `Database` em `src/types` (seguir o
  padrão das outras tabelas). Se o tipo `Database` for gerado/estático, incluir a nova tabela.
- Estados do componente: idle → enviando → sucesso ("✓ Pronto! Você vai receber nossas novidades.") → erro (mensagem discreta).
- Validação de e-mail no client: helper puro `src/lib/email-validation.ts`
  (`isValidEmail(value: string): boolean`) — testável no Vitest (`environment: node`).
  Reusa o mesmo regex já usado em `OfferPricing.tsx` (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`),
  agora centralizado.

---

## 6. Ícones sociais

Adicionar ao `src/components/marketing/v2/icons.tsx` 6 ícones de marca (SVG inline, `currentColor`): GitHub, LinkedIn, YouTube, Instagram, X (Twitter), Discord. Fonte: paths CC0/simple-icons-style. Renderizados no footer como grupo "em breve" — sem `href`, cor esmaecida (`--mc-gray`), `title`/`aria-label` "em breve", `cursor: default`. Sem `tabindex` de link.

---

## 7. Páginas novas

Todas usam o layout de marketing existente (`src/app/(marketing)/layout.tsx` → fontes + `.lp-guide`) e o wrapper `.mcv2` (dark + violeta), seguindo o padrão de `oferta/page.tsx`. Header e Footer institucional presentes em cada uma.

### 7.1 `/sobre` — `src/app/(marketing)/sobre/page.tsx`
Seções (todas com `id` para âncora do footer):
- Hero curto: slogan + descrição institucional longa.
- `#historia` — parágrafo de maturidade.
- `#missao` + `#visao` — dois blocos lado a lado (grid 2 col → 1 no mobile).
- `#valores` — grid dos 6 valores (reusar estilo visual dos cards de `StrategySection` / `.mc-strategy-card`).
- CTA final → `/oferta`.

### 7.2 `/legal/privacidade` — `src/app/(marketing)/legal/privacidade/page.tsx`
Documento com subseções âncora:
- Introdução (quem somos, escopo).
- Dados que coletamos (e-mail via checkout/waitlist; dados de pagamento processados pela **Stripe**, não armazenados por nós).
- Como usamos os dados (entrega do produto, comunicação, novidades).
- `#cookies` — uso de cookies (essenciais/analytics, se houver).
- `#lgpd` — direitos do titular sob a LGPD (acesso, correção, exclusão) e canal de contato.
- Não vendemos dados a terceiros.

### 7.3 `/legal/termos` — `src/app/(marketing)/legal/termos/page.tsx`
Documento com subseções âncora:
- Aceitação dos termos.
- Descrição do produto/serviço.
- `#garantia` — garantia do produto R$47.
- `#reembolso` — política de reembolso.
- `#licenciamento` — licença de uso do conteúdo (uso pessoal, proibição de redistribuição).
- `#direitos` — direitos autorais / propriedade intelectual.

Ambas as páginas legais: CSS `.mc-legal` (título + texto corrido legível, largura de leitura confortável `max-width`, espaçamento generoso). Nota "última atualização" e a ressalva de que o texto pode ser atualizado.

---

## 8. CSS

Novas classes no escopo `.mcv2` em `src/app/(marketing)/landing-v2.css`:
- `mc-footer` (reescrever), `mc-footer-highlights` (faixa de destaque), `mc-footer-columns` (grid 6→3→2→1), `mc-footer-col`, `mc-footer-col-title`, `mc-footer-link`, `mc-footer-soon` (selo em breve — reusar tokens de `mc-library-soon`), `mc-footer-social`, `mc-footer-newsletter`, `mc-footer-brand`, `mc-footer-bottom` (reescrever).
- Grid responsivo: 6 colunas desktop → 3 tablet → 2 → 1 mobile (Marca ocupa linha própria/destaque).
- Glow violeta muito leve no topo do footer (borda/gradiente sutil), divisórias `1px` com `--mc-line`.
- `.mc-legal` (páginas legais): container de leitura, `h1/h2`, `p`, `ul`, espaçamento.

Remover o bloco CSS de footer duplicado detectado (`landing-v2.css` ~719 e ~1004) — consolidar em um só.

---

## 9. Arquivos afetados

**Novos:**
- `src/components/marketing/v2/footer-nav.ts` (dados)
- `src/components/marketing/v2/FooterNewsletter.tsx` (client)
- `src/lib/email-validation.ts` (helper puro) + `src/lib/email-validation.test.ts`
- `src/app/api/newsletter/route.ts` (endpoint newsletter)
- `supabase/migrations/0011_newsletter_subscribers.sql` (tabela) — aplicar manualmente
- `src/app/(marketing)/sobre/page.tsx`
- `src/app/(marketing)/legal/privacidade/page.tsx`
- `src/app/(marketing)/legal/termos/page.tsx`

**Modificados:**
- `src/components/marketing/v2/FooterV2.tsx` (reescrita completa)
- `src/components/marketing/v2/icons.tsx` (6 ícones sociais)
- `src/app/(marketing)/landing-v2.css` (classes de footer + `.mc-legal`, remover duplicata)

---

## 10. Testes e verificação

- **Unitário (Vitest, node):** `email-validation.test.ts` — casos válidos/inválidos.
- **Gate:** `npx tsc --noEmit` exit 0 + `npm run test` (65 existentes + novos) verdes.
- **Visual (navegador via dev server):** conferir footer na home (6 colunas desktop, colapso responsivo, selos "em breve", newsletter enviando de verdade para `/api/waitlist`), e as 3 páginas novas renderizando com âncoras funcionando (clicar Missão no footer → rola até `#missao` em `/sobre`).
- `npm run build` continua falhando por causa de `/api/checkout` (Stripe key) — pré-existente e não relacionado; não é gate.

---

## 11. Execução (subagent-driven-development)

Fases (cada uma verificada antes da próxima):
1. **Dados + ícones sociais** — `footer-nav.ts`, 6 ícones em `icons.tsx`, helper `email-validation` + teste.
2. **Footer component + CSS** — reescrever `FooterV2.tsx` consumindo os dados, novas classes CSS, faixa de destaque, grupo social. Verificar visual na home.
3. **Newsletter** — migration `0011`, tipo `Database`, endpoint `/api/newsletter`, `FooterNewsletter.tsx`. Verificar envio real.
4. **Página `/sobre`** — com seções âncora. Verificar navegação footer→âncora.
5. **Páginas legais** `/legal/privacidade` e `/legal/termos` + `.mc-legal`. Verificar links do footer.
6. **Polish** — responsividade (6→3→2→1), glow/divisórias, revisão final tsc+test+visual.
