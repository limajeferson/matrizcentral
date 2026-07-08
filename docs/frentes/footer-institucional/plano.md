# Footer Institucional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o rodapé da Matriz Central num hub institucional (6 colunas, faixa de destaque, newsletter funcional) e criar as páginas `/sobre`, `/legal/privacidade` e `/legal/termos`, transmitindo "existe uma empresa séria por trás".

**Architecture:** Footer data-driven (`footer-nav.ts` → `FooterV2.tsx`), links sem destino real renderizam selo "em breve" em vez de `<a>`. Newsletter com endpoint e tabela Supabase próprios (`/api/newsletter`, `newsletter_subscribers`). Páginas novas seguem o padrão de `oferta/page.tsx` (layout de marketing + wrapper `.mcv2`). Ícones sociais e de destaque em SVG inline (`icons.tsx`), `currentColor`.

**Tech Stack:** Next.js 14.2.35 (App Router), React, TypeScript, framer-motion (já instalado), Supabase (`@supabase/supabase-js`), Vitest (`environment: node`), CSS por página em `landing-v2.css` (escopo `.mcv2`).

## Global Constraints

- Comunicar em **português do Brasil**. Toda cópia visível em pt-BR.
- **Custo zero:** sem dependências npm novas, sem assets externos. Ícones em SVG inline; efeitos com CSS/Canvas nativo e framer-motion (já instalado).
- CSS novo no escopo correto: footer e páginas de marketing sob **`.mcv2`** em `src/app/(marketing)/landing-v2.css`. Não vazar entre páginas.
- Tokens de cor: `--mc-accent` (#7c5cff, voz da marca), `--mc-gray`, `--mc-line`, `--mc-white`, `--mc-warn` (âmbar, "em breve"), `--mc-bg`, `--mc-surface`. Reusar; violeta é o único acento alto.
- **Gate de verificação:** `npx tsc --noEmit` (exit 0) + `npm run test` (verde). NÃO usar `npm run build` como gate (falha pré-existente em `/api/checkout` por falta de `STRIPE_SECRET_KEY`, não relacionada).
- Vitest roda em `environment: node` → só testar **lógica pura** (`src/lib`). Componentes/páginas verificados rodando o app (`npm run dev -- -p 3000`) + navegador.
- Windows/Git Bash: caminhos com `(marketing)` precisam de aspas.
- Regra "em breve": item de footer sem `href` OU com `soon: true` renderiza como `<span>` com selo, nunca `<a>`. `soon` sempre vence.
- Copyright usa `new Date().getFullYear()` (dinâmico).

---

## File Structure

**Novos:**
- `src/lib/email-validation.ts` — helper puro `isValidEmail`.
- `src/lib/email-validation.test.ts` — teste do helper.
- `src/components/marketing/v2/footer-nav.ts` — tipos + dados das colunas 2–6.
- `src/components/marketing/v2/FooterNewsletter.tsx` — form client da newsletter.
- `src/app/api/newsletter/route.ts` — endpoint POST.
- `supabase/migrations/0011_newsletter_subscribers.sql` — tabela (aplicar manualmente).
- `src/app/(marketing)/sobre/page.tsx` — página institucional.
- `src/app/(marketing)/legal/privacidade/page.tsx` — política de privacidade.
- `src/app/(marketing)/legal/termos/page.tsx` — termos de uso.

**Modificados:**
- `src/components/marketing/v2/icons.tsx` — +6 ícones sociais, +3 ícones de destaque.
- `src/components/marketing/v2/FooterV2.tsx` — reescrita completa.
- `src/types/index.ts` — +tabela `newsletter_subscribers` no tipo `Database`.
- `src/app/(marketing)/landing-v2.css` — classes de footer + `.mc-legal`; remover bloco de footer duplicado.

---

## Task 1: Helper de validação de e-mail

**Files:**
- Create: `src/lib/email-validation.ts`
- Test: `src/lib/email-validation.test.ts`

**Interfaces:**
- Produces: `isValidEmail(value: string): boolean` — true para e-mail sintaticamente válido.

- [ ] **Step 1: Write the failing test**

`src/lib/email-validation.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { isValidEmail } from "@/lib/email-validation";

describe("isValidEmail", () => {
  it("aceita e-mails válidos", () => {
    expect(isValidEmail("ana@exemplo.com")).toBe(true);
    expect(isValidEmail("j.silva+news@sub.dominio.com.br")).toBe(true);
  });

  it("rejeita e-mails inválidos", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("semarroba.com")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a @b.com")).toBe(false);
    expect(isValidEmail("a@b.com ")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/email-validation.test.ts`
Expected: FAIL (módulo não encontrado / `isValidEmail is not a function`).

- [ ] **Step 3: Write minimal implementation**

`src/lib/email-validation.ts`:
```ts
// Mesmo regex já usado em OfferPricing.tsx, centralizado para reuso.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True se `value` é um e-mail sintaticamente válido (sem espaços, com @ e TLD). */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim()) && value === value.trim();
}
```

Nota: o teste `"a@b.com "` (espaço no fim) deve dar `false` — por isso o `value === value.trim()`. O teste `"a @b.com"` falha pelo `\s` no regex.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/email-validation.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/email-validation.ts src/lib/email-validation.test.ts
git commit -m "feat: helper puro isValidEmail (centraliza regex de e-mail)"
```

---

## Task 2: Ícones sociais e de destaque

**Files:**
- Modify: `src/components/marketing/v2/icons.tsx`

**Interfaces:**
- Produces: `IconGithub`, `IconLinkedin`, `IconYoutube`, `IconInstagram`, `IconX`, `IconDiscord` (componentes `({ className }: { className?: string }) => JSX.Element`), e `IconFlag`, `IconClock`, `IconCpu` para a faixa de destaque. Todos `viewBox` próprio, `fill="currentColor"` (ou stroke conforme o path), `aria-hidden`.

- [ ] **Step 1: Adicionar os 6 ícones sociais**

Em `src/components/marketing/v2/icons.tsx`, antes do bloco `FORMAT_ICON`, adicionar os 6 ícones de marca usando os paths **CC0 do simple-icons** (viewBox `0 0 24 24`, `fill="currentColor"`). Buscar cada path oficial (fonte: simple-icons; slugs `github`, `linkedin`, `youtube`, `instagram`, `x`, `discord`) e escrever no mesmo formato dos ícones existentes. Exemplo do formato (GitHub, path real do simple-icons):

```tsx
export function IconGithub({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
```

Fazer o mesmo para `IconLinkedin`, `IconYoutube`, `IconInstagram`, `IconX`, `IconDiscord` — cada um com o path oficial do simple-icons correspondente. Se algum path não estiver disponível de memória, buscar em `https://cdn.simpleicons.org/<slug>` ou no pacote simple-icons (extrair o `<path d>`). Manter `IconProps` já existente no arquivo.

- [ ] **Step 2: Adicionar os 3 ícones da faixa de destaque**

No mesmo arquivo, adicionar ícones de linha simples (hand-drawn, estilo dos primeiros ícones do arquivo — `stroke="currentColor"`, `fill="none"`, viewBox `0 0 24 24`) para a faixa de destaque:
- `IconFlag` — bandeira (Plataforma Brasileira):
```tsx
export function IconFlag({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 21V4M5 4h11l-1.5 3.5L16 11H5" />
    </svg>
  );
}
```
- `IconClock` — relógio (Atuando desde 2025):
```tsx
export function IconClock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
```
- `IconCpu` — chip (Especializada em IA Local):
```tsx
export function IconCpu({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 10.5h4v4h-4z" />
      <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
    </svg>
  );
}
```

- [ ] **Step 3: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/v2/icons.tsx
git commit -m "feat: icones sociais (simple-icons CC0) e de destaque para o footer"
```

---

## Task 3: Dados de navegação do footer

**Files:**
- Create: `src/components/marketing/v2/footer-nav.ts`

**Interfaces:**
- Produces:
  - `interface FooterLink { label: string; href?: string; soon?: boolean }`
  - `interface FooterColumn { title: string; links: FooterLink[] }`
  - `const FOOTER_COLUMNS: FooterColumn[]` — colunas 2 a 6 (a coluna 1 "Marca" é markup fixo no componente).

- [ ] **Step 1: Criar o arquivo de dados**

`src/components/marketing/v2/footer-nav.ts`:
```ts
export interface FooterLink {
  label: string;
  href?: string;
  soon?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

// Coluna 1 (Marca) é markup fixo em FooterV2.tsx. Aqui só as colunas 2–6.
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Plataforma",
    links: [
      { label: "O Sistema", href: "/#sistema" },
      { label: "Como Funciona", href: "/#processo" },
      { label: "Preço", href: "/#preco" },
      { label: "Certificação", soon: true },
      { label: "FAQ", href: "/#faq" },
      { label: "Oferta", href: "/oferta" },
    ],
  },
  {
    title: "Conteúdo",
    links: [
      { label: "Blog", soon: true },
      { label: "Artigos", soon: true },
      { label: "Guias", soon: true },
      { label: "Novidades", soon: true },
      { label: "Feed Educacional", soon: true },
      { label: "Catálogo", soon: true },
    ],
  },
  {
    title: "Suporte",
    links: [
      { label: "Central de Ajuda", soon: true },
      { label: "Contato", soon: true },
      { label: "Garantia", href: "/legal/termos#garantia" },
      { label: "Política de Reembolso", href: "/legal/termos#reembolso" },
      { label: "Status da Plataforma", soon: true },
      { label: "Perguntas Frequentes", href: "/#faq" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Sobre", href: "/sobre" },
      { label: "Nossa História", href: "/sobre#historia" },
      { label: "Missão", href: "/sobre#missao" },
      { label: "Visão", href: "/sobre#visao" },
      { label: "Valores", href: "/sobre#valores" },
      { label: "Parceiros", soon: true },
      { label: "Trabalhe Conosco", soon: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidade", href: "/legal/privacidade" },
      { label: "Termos de Uso", href: "/legal/termos" },
      { label: "Cookies", href: "/legal/privacidade#cookies" },
      { label: "LGPD", href: "/legal/privacidade#lgpd" },
      { label: "Licenciamento", href: "/legal/termos#licenciamento" },
      { label: "Direitos Autorais", href: "/legal/termos#direitos" },
    ],
  },
];
```

- [ ] **Step 2: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/v2/footer-nav.ts
git commit -m "feat: estrutura de dados das colunas do footer institucional"
```

---

## Task 4: Componente FooterV2 + CSS

**Files:**
- Modify: `src/components/marketing/v2/FooterV2.tsx` (reescrita completa)
- Modify: `src/app/(marketing)/landing-v2.css` (classes de footer; remover bloco duplicado)

**Interfaces:**
- Consumes: `FOOTER_COLUMNS`, `FooterLink` de `footer-nav.ts`; `IconGithub`…`IconDiscord`, `IconFlag`, `IconClock`, `IconCpu` de `icons.tsx`; `<FooterNewsletter />` (Task 5 — nesta task, incluir o import e o uso; a Task 5 cria o componente. Para permitir compilar antes da Task 5, criar um stub mínimo primeiro OU ordenar Task 5 antes desta na execução).
- Produces: `<FooterV2 />` (default export) — usado em `src/app/(marketing)/page.tsx` e nas páginas novas.

> **Ordem de execução:** Fazer a Task 5 (newsletter) ANTES desta, para o import de `FooterNewsletter` existir. O plano lista a newsletter como Task 5 por coesão temática, mas na execução: 5 → 4. Alternativamente, criar o stub de `FooterNewsletter` no início desta task.

- [ ] **Step 1: Reescrever FooterV2.tsx**

`src/components/marketing/v2/FooterV2.tsx`:
```tsx
import Link from "next/link";
import { FOOTER_COLUMNS, type FooterLink } from "./footer-nav";
import FooterNewsletter from "./FooterNewsletter";
import {
  IconFlag, IconClock, IconCpu,
  IconGithub, IconLinkedin, IconYoutube, IconInstagram, IconX, IconDiscord,
} from "./icons";

const HIGHLIGHTS = [
  { Icon: IconFlag, label: "Plataforma Brasileira" },
  { Icon: IconClock, label: "Atuando desde 2025" },
  { Icon: IconCpu, label: "Especializada em IA Local" },
];

const SOCIALS = [
  { Icon: IconGithub, label: "GitHub" },
  { Icon: IconLinkedin, label: "LinkedIn" },
  { Icon: IconYoutube, label: "YouTube" },
  { Icon: IconInstagram, label: "Instagram" },
  { Icon: IconX, label: "X" },
  { Icon: IconDiscord, label: "Discord" },
];

function FooterNavLink({ link }: { link: FooterLink }) {
  if (!link.href || link.soon) {
    return (
      <span className="mc-footer-link is-soon">
        {link.label}
        <span className="mc-footer-soon mc-mono">em breve</span>
      </span>
    );
  }
  return (
    <Link className="mc-footer-link" href={link.href}>
      {link.label}
    </Link>
  );
}

export default function FooterV2() {
  return (
    <footer className="mc-footer" id="mc-footer">
      <div className="mc-container">
        <div className="mc-footer-highlights" aria-label="Sobre a plataforma">
          {HIGHLIGHTS.map(({ Icon, label }) => (
            <span className="mc-footer-highlight mc-mono" key={label}>
              <Icon className="mc-footer-highlight-icon" />
              {label}
            </span>
          ))}
        </div>

        <div className="mc-footer-main">
          <div className="mc-footer-brand">
            <span className="mc-logo mc-display">
              Matriz<span className="mc-accent-text">/</span>Central
            </span>
            <p className="mc-footer-slogan">Menos assinatura. Mais autonomia.</p>
            <p className="mc-footer-desc">
              Plataforma brasileira dedicada à autonomia em Inteligência
              Artificial. Conteúdo, ferramentas e aprendizado para usar IA com
              mais controle, privacidade e independência.
            </p>
            <p className="mc-footer-since mc-mono">Atuando desde 2025.</p>
            <div className="mc-footer-social" aria-label="Redes sociais (em breve)">
              {SOCIALS.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="mc-footer-social-item"
                  title={`${label} — em breve`}
                  aria-label={`${label} — em breve`}
                >
                  <Icon className="mc-footer-social-icon" />
                </span>
              ))}
            </div>
          </div>

          <div className="mc-footer-columns">
            {FOOTER_COLUMNS.map((col) => (
              <nav className="mc-footer-col" key={col.title} aria-label={col.title}>
                <span className="mc-footer-col-title mc-mono">{col.title}</span>
                {col.links.map((link) => (
                  <FooterNavLink key={link.label} link={link} />
                ))}
              </nav>
            ))}
          </div>
        </div>

        <FooterNewsletter />

        <div className="mc-footer-bottom">
          <span>
            © {new Date().getFullYear()} Matriz Central. Todos os direitos
            reservados. · Desenvolvido no Brasil · Atuando desde 2025.
          </span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Remover o bloco de footer CSS duplicado**

Em `src/app/(marketing)/landing-v2.css`, localizar os DOIS blocos de regras `.mc-footer*` (um por volta da linha ~719, outro ~1004). Remover completamente ambos os blocos antigos (`.mc-footer`, `.mc-footer-grid`, `.mc-footer-desc`, `.mc-footer-nav`, `.mc-footer-bottom` e variações), pois serão substituídos. Confirmar que nenhuma outra regra depende deles (grep por `mc-footer` no CSS).

- [ ] **Step 3: Adicionar as novas classes de footer**

Adicionar ao final da seção de footer em `landing-v2.css` (escopo `.mcv2`):
```css
/* ---- Footer institucional ---- */
.mcv2 .mc-footer {
  margin-top: 96px;
  padding: 56px 0 32px;
  background: var(--mc-surface);
  border-top: 1px solid var(--mc-line);
  border-radius: 28px 28px 0 0;
  position: relative;
  overflow: hidden;
}
.mcv2 .mc-footer::before {
  content: "";
  position: absolute;
  top: 0; left: 50%;
  width: 60%; height: 1px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, rgba(124, 92, 255, 0.5), transparent);
}
.mcv2 .mc-footer-highlights {
  display: flex; flex-wrap: wrap; gap: 12px 28px;
  padding-bottom: 40px; margin-bottom: 40px;
  border-bottom: 1px solid var(--mc-line);
}
.mcv2 .mc-footer-highlight {
  display: inline-flex; align-items: center; gap: 8px;
  color: var(--mc-gray); font-size: 0.72rem;
}
.mcv2 .mc-footer-highlight-icon {
  display: inline-block; width: 1rem; height: 1rem; color: var(--mc-accent);
}
.mcv2 .mc-footer-main {
  display: grid;
  grid-template-columns: 1.4fr 3fr;
  gap: 48px;
}
.mcv2 .mc-footer-brand { max-width: 340px; }
.mcv2 .mc-footer-slogan {
  margin: 16px 0 12px; color: var(--mc-white); font-weight: 600; font-size: 0.95rem;
}
.mcv2 .mc-footer-desc { color: var(--mc-gray); font-size: 0.9rem; line-height: 1.6; }
.mcv2 .mc-footer-since { margin-top: 14px; color: var(--mc-gray); font-size: 0.7rem; }
.mcv2 .mc-footer-social { display: flex; gap: 12px; margin-top: 20px; }
.mcv2 .mc-footer-social-item {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border: 1px solid var(--mc-line); border-radius: 9px;
  color: var(--mc-gray); cursor: default; transition: border-color 0.2s;
}
.mcv2 .mc-footer-social-item:hover { border-color: rgba(124, 92, 255, 0.35); }
.mcv2 .mc-footer-social-icon { display: inline-block; width: 1rem; height: 1rem; }
.mcv2 .mc-footer-columns {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 32px 24px;
}
.mcv2 .mc-footer-col { display: flex; flex-direction: column; gap: 12px; }
.mcv2 .mc-footer-col-title {
  color: var(--mc-white); font-size: 0.72rem; letter-spacing: 0.08em; margin-bottom: 4px;
}
.mcv2 .mc-footer-link {
  color: var(--mc-gray); font-size: 0.85rem; text-decoration: none;
  transition: color 0.2s; display: inline-flex; align-items: center; gap: 8px;
}
a.mcv2 .mc-footer-link:hover, .mcv2 a.mc-footer-link:hover { color: var(--mc-white); }
.mcv2 .mc-footer-link.is-soon { color: var(--mc-gray); opacity: 0.65; cursor: default; }
.mcv2 .mc-footer-soon {
  font-size: 0.6rem; font-weight: 700; color: var(--mc-warn);
  border: 1px solid rgba(245, 180, 90, 0.3); border-radius: 999px;
  padding: 1px 6px; letter-spacing: 0.04em;
}
.mcv2 .mc-footer-bottom {
  margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--mc-line);
  color: var(--mc-gray); font-size: 0.78rem;
}
@media (max-width: 900px) {
  .mcv2 .mc-footer-main { grid-template-columns: 1fr; gap: 40px; }
  .mcv2 .mc-footer-columns { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 560px) {
  .mcv2 .mc-footer-columns { grid-template-columns: repeat(2, 1fr); }
}
```
Ajustar o token `--mc-warn` se o nome real no arquivo diferir (verificar `:root`/`.mcv2` no topo do CSS; usar o valor exato usado por `.mc-library-soon`).

- [ ] **Step 4: Verificar typecheck + visual**

Run: `npx tsc --noEmit` → exit 0.
Rodar o app (`npm run dev -- -p 3000`) e no navegador conferir o footer da home: 6 grupos (marca + 5 colunas), faixa de destaque no topo, selos "em breve" nos itens certos, ícones sociais esmaecidos. Testar responsividade reduzindo a largura (5→3→2 colunas).

- [ ] **Step 5: Commit**

```bash
git add "src/components/marketing/v2/FooterV2.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: footer institucional de 6 colunas com faixa de destaque e selos em breve"
```

---

## Task 5: Newsletter (migration + tipo + endpoint + componente)

> **Executar ANTES da Task 4** (o `FooterV2` importa `FooterNewsletter`).

**Files:**
- Create: `supabase/migrations/0011_newsletter_subscribers.sql`
- Modify: `src/types/index.ts` (+tabela no tipo `Database`)
- Create: `src/app/api/newsletter/route.ts`
- Create: `src/components/marketing/v2/FooterNewsletter.tsx`

**Interfaces:**
- Consumes: `isValidEmail` de `@/lib/email-validation`; `getSupabaseServerClient` de `@/lib/supabase/server`.
- Produces: `POST /api/newsletter` (body `{ email: string }` → `{ ok: true }` | `{ error }`); `<FooterNewsletter />` default export.

- [ ] **Step 1: Criar a migration**

`supabase/migrations/0011_newsletter_subscribers.sql`:
```sql
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
-- Default-deny: sem policies, acesso só via service role key (mesmo padrão das demais tabelas).
```

- [ ] **Step 2: Adicionar a tabela ao tipo Database**

Em `src/types/index.ts`, dentro de `Database["public"]["Tables"]`, adicionar (seguindo o padrão de `plan_waitlist`):
```ts
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
```

- [ ] **Step 3: Criar o endpoint**

`src/app/api/newsletter/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/email-validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return NextResponse.json({ error: "e-mail inválido" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível inscrever agora. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Criar o componente client**

`src/components/marketing/v2/FooterNewsletter.tsx`:
```tsx
"use client";

import { useState } from "react";
import { isValidEmail } from "@/lib/email-validation";

type Status = "idle" | "loading" | "done" | "error";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setValidationError("Informe um e-mail válido.");
      return;
    }
    setValidationError(null);
    setStatus("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    setStatus(res && res.ok ? "done" : "error");
  };

  return (
    <div className="mc-footer-newsletter">
      <div className="mc-footer-newsletter-copy">
        <h3 className="mc-footer-newsletter-title">Receba novidades sobre IA Local</h3>
        <p className="mc-footer-newsletter-desc">
          Artigos, novidades e novos conteúdos diretamente no seu e-mail.
        </p>
      </div>
      {status === "done" ? (
        <p className="mc-footer-newsletter-done mc-mono">
          ✓ Pronto! Você vai receber nossas novidades.
        </p>
      ) : (
        <div className="mc-footer-newsletter-form">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Seu e-mail"
          />
          <button
            type="button"
            className="mc-btn mc-btn-accent"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? "..." : "Inscrever-se"}
          </button>
          {validationError && <p className="mc-footer-newsletter-error">{validationError}</p>}
          {status === "error" && (
            <p className="mc-footer-newsletter-error">Não deu certo, tente de novo.</p>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Adicionar CSS da newsletter**

Em `landing-v2.css` (escopo `.mcv2`), junto ao footer:
```css
.mcv2 .mc-footer-newsletter {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 20px; margin-top: 48px; padding: 28px 0;
  border-top: 1px solid var(--mc-line); border-bottom: 1px solid var(--mc-line);
}
.mcv2 .mc-footer-newsletter-title { color: var(--mc-white); font-size: 1rem; font-weight: 600; margin: 0; }
.mcv2 .mc-footer-newsletter-desc { color: var(--mc-gray); font-size: 0.85rem; margin: 6px 0 0; }
.mcv2 .mc-footer-newsletter-form { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.mcv2 .mc-footer-newsletter-form input {
  background: var(--mc-bg); border: 1px solid var(--mc-line); border-radius: 10px;
  padding: 10px 14px; color: var(--mc-white); font-size: 0.88rem; min-width: 240px;
}
.mcv2 .mc-footer-newsletter-form input:focus { outline: none; border-color: var(--mc-accent); }
.mcv2 .mc-footer-newsletter-done { color: var(--mc-success, #46d39a); font-size: 0.85rem; }
.mcv2 .mc-footer-newsletter-error { color: var(--mc-warn); font-size: 0.78rem; width: 100%; }
@media (max-width: 560px) {
  .mcv2 .mc-footer-newsletter-form input { min-width: 0; flex: 1; }
}
```
Confirmar que `.mc-btn`/`.mc-btn-accent` já existem no CSS (usados no hero). Se `--mc-success` não existir, usar o valor real do token verde do projeto.

- [ ] **Step 6: Verificar typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/0011_newsletter_subscribers.sql src/types/index.ts "src/app/api/newsletter/route.ts" "src/components/marketing/v2/FooterNewsletter.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: newsletter do footer (endpoint /api/newsletter + tabela + form)"
```

> **Passo manual (usuário):** aplicar a migration no Supabase (`supabase db push` ou colar o SQL no painel) para a newsletter gravar em runtime. Sem isso, o POST retorna 500.

---

## Task 6: Página /sobre

**Files:**
- Create: `src/app/(marketing)/sobre/page.tsx`
- Modify: `src/app/(marketing)/landing-v2.css` (classes `.mc-about-*` se necessário; reusar `.mc-strategy-*` para os valores)

**Interfaces:**
- Consumes: layout de marketing (fontes + `.lp-guide`) via `src/app/(marketing)/layout.tsx`; `PixelGridBackground`, `LandingHeader`, `FooterV2`, `Reveal` de `./motion-primitives` (verificar caminho real dos imports em `page.tsx` da home).

- [ ] **Step 1: Criar a página**

Seguir o padrão de `src/app/(marketing)/page.tsx` (mesma configuração de fontes `Archivo_Black`/`Inter`/`Press_Start_2P`, wrapper `.mcv2`, `PixelGridBackground`, `LandingHeader`, `FooterV2`). `src/app/(marketing)/sobre/page.tsx`:

```tsx
import { Archivo_Black, Inter, Press_Start_2P } from "next/font/google";
import "../landing-v2.css";

import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import { Reveal } from "@/components/marketing/v2/motion-primitives";
import {
  IconChat, IconCompass, IconLock, IconBooks, IconTrophy, IconMonitor,
} from "@/components/marketing/v2/icons";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-mc-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mc-sans" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-mc-pixel" });

const VALORES = [
  { Icon: IconLock, title: "Autonomia", desc: "Você no controle da sua própria IA, do primeiro dia." },
  { Icon: IconBooks, title: "Conhecimento aplicado", desc: "Nada de teoria solta; tudo aponta para a prática." },
  { Icon: IconMonitor, title: "Privacidade", desc: "Seus dados no seu hardware, não na nuvem de terceiros." },
  { Icon: IconChat, title: "Transparência", desc: "Sem promessas infladas nem letra miúda." },
  { Icon: IconCompass, title: "Tecnologia acessível", desc: "Sem exigir que você seja programador." },
  { Icon: IconTrophy, title: "Evolução contínua", desc: "A plataforma cresce, e você cresce com ela." },
];

export const metadata = {
  title: "Sobre — Matriz Central",
  description:
    "Plataforma brasileira dedicada à autonomia em Inteligência Artificial. Nossa história, missão, visão e valores.",
};

export default function SobrePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} ${pressStart2P.variable} mcv2`}>
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <section className="mc-section">
          <div className="mc-container mc-about-hero">
            <Reveal>
              <span className="mc-tag">Institucional</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mc-display mc-about-title">Menos assinatura.<br />Mais autonomia.</h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mc-about-lead">
                A Matriz Central é uma plataforma brasileira dedicada ao
                desenvolvimento da autonomia em Inteligência Artificial,
                reunindo conteúdo, ferramentas e experiências de aprendizado
                para quem deseja utilizar IA com mais controle, privacidade e
                independência.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mc-section" id="historia">
          <div className="mc-container mc-about-block">
            <span className="mc-tag">Nossa História</span>
            <p className="mc-about-text">
              Desde 2025, a Matriz Central pesquisa, estrutura e ensina formas
              práticas de utilizar modelos de Inteligência Artificial
              localmente, reunindo conteúdo técnico, trilhas de aprendizado e
              ferramentas para quem deseja reduzir a dependência de serviços
              baseados em assinatura.
            </p>
          </div>
        </section>

        <section className="mc-section">
          <div className="mc-container mc-about-grid2">
            <div id="missao" className="mc-about-block">
              <span className="mc-tag">Missão</span>
              <p className="mc-about-text">
                Democratizar o acesso à IA local através de conteúdo
                organizado, objetivo e acessível para diferentes níveis de
                conhecimento.
              </p>
            </div>
            <div id="visao" className="mc-about-block">
              <span className="mc-tag">Visão</span>
              <p className="mc-about-text">
                Ser uma das principais referências em língua portuguesa para
                aprendizado, implantação e uso prático de Inteligência
                Artificial Local.
              </p>
            </div>
          </div>
        </section>

        <section className="mc-section" id="valores">
          <div className="mc-container">
            <Reveal>
              <span className="mc-tag">Valores</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mc-display mc-about-values-title">O que nos guia</h2>
            </Reveal>
            <div className="mc-strategy-grid">
              {VALORES.map((v, i) => (
                <Reveal key={v.title} delay={0.05 * i}>
                  <div className="mc-strategy-card">
                    <v.Icon className="mc-strategy-icon" />
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mc-section">
          <div className="mc-container mc-about-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">Começar por R$47</a>
          </div>
        </section>
      </div>
      <FooterV2 />
    </div>
  );
}
```

Verificar os caminhos de import reais conferindo o topo de `src/app/(marketing)/page.tsx` (nomes de `PixelGridBackground`, `LandingHeader`, `motion-primitives`, e o export `Reveal`). Ajustar se divergirem.

- [ ] **Step 2: Adicionar CSS `.mc-about-*`**

Em `landing-v2.css` (escopo `.mcv2`):
```css
.mcv2 .mc-about-title { font-size: clamp(2.2rem, 6vw, 4.5rem); margin-top: 16px; }
.mcv2 .mc-about-lead { max-width: 640px; margin-top: 24px; color: var(--mc-gray); font-size: 1.05rem; line-height: 1.7; }
.mcv2 .mc-about-block { max-width: 560px; }
.mcv2 .mc-about-text { margin-top: 14px; color: var(--mc-gray); font-size: 1rem; line-height: 1.7; }
.mcv2 .mc-about-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.mcv2 .mc-about-values-title { margin: 12px 0 40px; font-size: clamp(1.6rem, 4vw, 2.6rem); }
.mcv2 .mc-about-cta { display: flex; justify-content: center; }
@media (max-width: 760px) { .mcv2 .mc-about-grid2 { grid-template-columns: 1fr; gap: 32px; } }
```

- [ ] **Step 3: Verificar typecheck + visual**

Run: `npx tsc --noEmit` → exit 0.
No navegador: abrir `http://localhost:3000/sobre`, conferir seções. No footer, clicar "Missão" → deve rolar até `#missao`. Testar `/sobre#valores` direto na URL.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/sobre/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: pagina /sobre institucional (historia, missao, visao, valores)"
```

---

## Task 7: Páginas legais /legal/privacidade e /legal/termos

**Files:**
- Create: `src/app/(marketing)/legal/privacidade/page.tsx`
- Create: `src/app/(marketing)/legal/termos/page.tsx`
- Modify: `src/app/(marketing)/landing-v2.css` (classe `.mc-legal`)

**Interfaces:**
- Consumes: mesmo padrão de layout/fontes de `/sobre`; `LandingHeader`, `FooterV2`, `PixelGridBackground`.

- [ ] **Step 1: Adicionar CSS `.mc-legal`**

Em `landing-v2.css` (escopo `.mcv2`):
```css
.mcv2 .mc-legal { max-width: 760px; margin: 0 auto; padding: 64px 0 40px; }
.mcv2 .mc-legal h1 { font-size: clamp(2rem, 5vw, 3.2rem); }
.mcv2 .mc-legal .mc-legal-updated { color: var(--mc-gray); font-size: 0.8rem; margin: 12px 0 40px; }
.mcv2 .mc-legal h2 { font-size: 1.3rem; color: var(--mc-white); margin: 40px 0 12px; scroll-margin-top: 90px; }
.mcv2 .mc-legal p, .mcv2 .mc-legal li { color: var(--mc-gray); font-size: 0.95rem; line-height: 1.75; }
.mcv2 .mc-legal ul { margin: 12px 0 12px 20px; display: flex; flex-direction: column; gap: 8px; }
.mcv2 .mc-legal .mc-legal-note {
  margin-top: 40px; padding: 16px 20px; border: 1px solid var(--mc-line);
  border-radius: 12px; font-size: 0.85rem;
}
```
`scroll-margin-top` garante que âncoras (`#cookies`, `#garantia`…) não fiquem sob o header fixo.

- [ ] **Step 2: Criar /legal/privacidade**

`src/app/(marketing)/legal/privacidade/page.tsx` — mesmo cabeçalho de fontes/imports de `/sobre` (ajustar o caminho relativo do CSS para `"../../landing-v2.css"`). Estrutura:
```tsx
import { Archivo_Black, Inter } from "next/font/google";
import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-mc-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mc-sans" });

export const metadata = {
  title: "Política de Privacidade — Matriz Central",
  description: "Como a Matriz Central coleta, usa e protege seus dados.",
};

export default function PrivacidadePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <article className="mc-container mc-legal">
          <h1 className="mc-display">Política de Privacidade</h1>
          <p className="mc-legal-updated mc-mono">Última atualização: julho de 2025</p>

          <p>
            Esta Política descreve como a Matriz Central coleta, utiliza e
            protege as informações de quem usa a plataforma. Ao usar nossos
            serviços, você concorda com as práticas aqui descritas.
          </p>

          <h2>Dados que coletamos</h2>
          <p>
            Coletamos o e-mail que você fornece ao adquirir um produto, entrar
            em uma lista de espera ou assinar nossa newsletter. Dados de
            pagamento são processados diretamente pela Stripe — não armazenamos
            números de cartão em nossos servidores.
          </p>

          <h2>Como usamos os dados</h2>
          <ul>
            <li>Entregar o produto adquirido e liberar seu acesso.</li>
            <li>Enviar comunicações sobre sua compra e novidades da plataforma.</li>
            <li>Melhorar o conteúdo e a experiência de aprendizado.</li>
          </ul>

          <h2 id="cookies">Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento do site e,
            eventualmente, cookies de análise para entender de forma agregada
            como a plataforma é usada. Você pode desativar cookies não
            essenciais nas configurações do seu navegador.
          </p>

          <h2 id="lgpd">LGPD</h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (Lei
            13.709/2018), você tem direito a acessar, corrigir e solicitar a
            exclusão dos seus dados pessoais. Para exercer esses direitos,
            entre em contato pelo e-mail de suporte da plataforma. Não vendemos
            nem compartilhamos seus dados com terceiros para fins de marketing.
          </p>

          <p className="mc-legal-note">
            Este documento pode ser atualizado periodicamente. Recomendamos
            revisá-lo de tempos em tempos.
          </p>
        </article>
      </div>
      <FooterV2 />
    </div>
  );
}
```

- [ ] **Step 3: Criar /legal/termos**

`src/app/(marketing)/legal/termos/page.tsx` — mesmo esqueleto, com `metadata.title = "Termos de Uso — Matriz Central"`. Conteúdo com âncoras `#garantia`, `#reembolso`, `#licenciamento`, `#direitos`:
```tsx
// ... (mesmos imports e fontes de privacidade/page.tsx) ...

export const metadata = {
  title: "Termos de Uso — Matriz Central",
  description: "Termos e condições de uso da plataforma Matriz Central.",
};

export default function TermosPage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <article className="mc-container mc-legal">
          <h1 className="mc-display">Termos de Uso</h1>
          <p className="mc-legal-updated mc-mono">Última atualização: julho de 2025</p>

          <p>
            Estes Termos regem o uso da plataforma Matriz Central. Ao adquirir
            ou acessar nossos conteúdos, você concorda com as condições abaixo.
          </p>

          <h2>Descrição do serviço</h2>
          <p>
            A Matriz Central oferece conteúdo educacional, ferramentas e
            trilhas de aprendizado voltadas ao uso de Inteligência Artificial
            executada localmente. Alguns recursos podem estar em
            desenvolvimento e são sinalizados como "em breve".
          </p>

          <h2 id="garantia">Garantia</h2>
          <p>
            O produto de entrada (R$47) inclui garantia de 7 dias. Se, dentro
            desse prazo, você concluir que o conteúdo não atende às suas
            expectativas, devolvemos o valor pago.
          </p>

          <h2 id="reembolso">Política de Reembolso</h2>
          <p>
            Para solicitar reembolso dentro do período de garantia, entre em
            contato pelo e-mail de suporte informando o e-mail usado na compra.
            O estorno é processado pela Stripe e pode levar alguns dias úteis
            para aparecer na fatura, conforme o emissor do cartão.
          </p>

          <h2 id="licenciamento">Licenciamento</h2>
          <p>
            O acesso ao conteúdo é pessoal e intransferível. Você pode utilizar
            o material para seu próprio aprendizado, mas não pode redistribuir,
            revender ou publicar os conteúdos, no todo ou em parte, sem
            autorização por escrito.
          </p>

          <h2 id="direitos">Direitos Autorais</h2>
          <p>
            Todo o conteúdo da Matriz Central — textos, materiais, marca e
            identidade visual — é protegido por direitos autorais e pertence à
            Matriz Central, salvo indicação em contrário.
          </p>

          <p className="mc-legal-note">
            Este documento pode ser atualizado periodicamente. O uso continuado
            da plataforma após alterações implica concordância com os novos
            termos.
          </p>
        </article>
      </div>
      <FooterV2 />
    </div>
  );
}
```
Incluir os mesmos imports/fontes do arquivo de privacidade no topo.

- [ ] **Step 4: Verificar typecheck + visual**

Run: `npx tsc --noEmit` → exit 0.
No navegador: `http://localhost:3000/legal/privacidade` e `/legal/termos`. Do footer, clicar "Cookies" (→ `/legal/privacidade#cookies`), "Garantia" (→ `/legal/termos#garantia`) e confirmar que rola até a âncora correta com o header não cobrindo o título (`scroll-margin-top`).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(marketing)/legal" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: paginas legais /legal/privacidade e /legal/termos"
```

---

## Task 8: Polish final e verificação integrada

**Files:**
- Modify: qualquer ajuste fino em `landing-v2.css` / componentes conforme revisão visual.

- [ ] **Step 1: Rodar o gate completo**

Run: `npx tsc --noEmit` → exit 0.
Run: `npm run test` → todos verdes (65 existentes + `email-validation`).

- [ ] **Step 2: Revisão visual integrada (navegador)**

Com `npm run dev -- -p 3000`, conferir em uma passada:
- Home: footer completo, faixa de destaque, newsletter (enviar um e-mail de teste — se a migration foi aplicada, retorna sucesso; senão, "não deu certo" é esperado e aceitável neste ambiente).
- Responsividade: reduzir a janela até mobile; colunas 5→3→2, marca empilha, newsletter empilha.
- `/sobre`: todas as seções + navegação por âncora do footer.
- `/legal/privacidade` e `/legal/termos`: legibilidade + âncoras.
- Selos "em breve" nos itens corretos; ícones sociais esmaecidos com tooltip "em breve".

- [ ] **Step 3: Commit de ajustes (se houver)**

```bash
git add -A
git commit -m "polish: ajustes finais do footer institucional e paginas"
```

---

## Self-Review (preenchido pelo autor do plano)

- **Cobertura do spec:** slogan/cópia (Tasks 4,6) ✓; 6 colunas + em breve (Tasks 3,4) ✓; faixa de destaque (Tasks 2,4) ✓; newsletter funcional (Task 5) ✓; sociais em breve (Tasks 2,4) ✓; /sobre (Task 6) ✓; legais com âncoras (Task 7) ✓; CSS premium/responsivo/glow (Tasks 4,8) ✓; remover CSS duplicado (Task 4) ✓; ressalva jurídica (spec + textos) ✓.
- **Dependência de ordem:** Task 5 (newsletter) executa antes da Task 4 (footer importa `FooterNewsletter`) — anotado em ambas. Task 1 (helper) antes da 5. Task 2 (ícones) e 3 (dados) antes da 4.
- **Consistência de tipos:** `isValidEmail(string): boolean` usado igual em 1/5; `FooterLink`/`FooterColumn` definidos em 3 e consumidos em 4; `FooterNewsletter` default export consumido em 4.
- **Sem placeholders:** todos os passos com código real. Exceção consciente: paths dos 6 SVGs de marca (Task 2) referenciam a fonte exata (simple-icons, viewBox 0 0 24 24) com exemplo completo do GitHub — os demais são cópia mecânica do path oficial de cada slug.
