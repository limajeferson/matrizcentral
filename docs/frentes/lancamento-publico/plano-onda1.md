# Onda 1 — Receita & Descoberta · Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development`
> para implementar task a task. Os passos usam checkbox (`- [ ]`).

**Goal:** parar de perder venda por erro de rede, parar de ser invisível para
buscador e rede social, e começar a registrar o funil — o mínimo para poder
anunciar.

**Architecture:** seis tasks independentes, commit por task. A lógica que dá pra
testar (rotas do sitemap, validação do evento de funil) sai para `src/lib` como
função pura com teste; o resto é componente/rota, verificado rodando o app.

**Tech Stack:** Next.js 14.2.35 App Router · React 18 · TypeScript · Supabase
(service role) · Vitest (`environment: node`) · `next/og` e `next/font` (nativos,
sem dependência nova).

## Global Constraints

Herda **todas** as restrições de [`plano.md`](plano.md#global-constraints). As que
mais pegam nesta onda:

- **Proibido `npm install`.** `next/og`, `sitemap.ts` e `robots.ts` já vêm no
  Next 14.2.35.
- **Gate antes de cada commit:** `npx tsc --noEmit` (exit 0) · `npm run test` ·
  `npx next lint` sem erros. Baseline atual a preservar: **345 testes / 56
  arquivos**, **0 erros de lint**, 2 warnings `no-img-element` pré-existentes.
- **`npm run build` falha de propósito** sem `STRIPE_SECRET_KEY` — não é regressão.
- **Vitest é `environment: node`**: teste só de lógica pura. Componente se
  verifica com `npm run dev -- -p 3000`.
- **A `/oferta` é tema claro (`.lp-guide`)** — não trazer classe `.mcv2` para lá.
- **Nunca gravar URL com token** em lugar nenhum (log, evento, referrer).
- Domínio de produção: `https://www.matrizcentral.com.br`.

---

### Task 1: `/oferta` à prova de falha *(bug de receita)*

**Por quê:** hoje, se o `fetch` do checkout lançar (rede instável, DNS, offline),
`loading` fica `true` para sempre. O cliente vê "Redirecionando..." eternamente,
sem erro e sem checkout. É perda de venda silenciosa.

**Files:**
- Modify: `src/components/marketing/OfferPricing.tsx:6-37` (o componente `PlanCheckout`)

**Interfaces:**
- Consumes: `isValidEmail` de `@/lib/email-validation` (já importado).
- Produces: nada consumido por outras tasks.

- [ ] **Step 1: Substituir o `PlanCheckout` inteiro**

Trocar as linhas 6–37 de `src/components/marketing/OfferPricing.tsx` por:

```tsx
function PlanCheckout({ plan, cta }: { plan: "ebook" | "regular" | "advanced"; cta: string }) {
  const inputId = `checkout-email-${plan}`;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    setError(null);
    // Em caso de sucesso a navegação já foi disparada: manter o botão travado
    // evita duplo clique enquanto o browser troca de página.
    let redirecting = false;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
      });
      if (!res.ok) {
        setError("Não foi possível iniciar o checkout. Tente novamente.");
        return;
      }
      const data = await res.json().catch(() => null);
      const url = data?.url;
      if (typeof url !== "string" || !url) {
        setError("Não foi possível iniciar o checkout. Tente novamente.");
        return;
      }
      redirecting = true;
      window.location.href = url;
    } catch {
      setError("Conexão instável. Verifique sua internet e tente novamente.");
    } finally {
      if (!redirecting) setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="waitlist-form">
        <label htmlFor={inputId} className="sr-only">
          Seu e-mail para receber o acesso
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <button
        type="submit"
        className="btn btn-dark"
        style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        disabled={loading}
      >
        {loading ? "Redirecionando..." : cta}
      </button>
      {error && (
        <p className="hero-error" style={{ marginBottom: 12 }} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
```

Mudanças, uma a uma: `<div>` → `<form onSubmit>` (Enter agora envia) ·
`type="button"` → `type="submit"` · `try/catch/finally` (o bug) · resposta JSON
malformada tratada · `<label>` associado por `htmlFor` · `role="alert"` no erro ·
`autoComplete="email"`.

- [ ] **Step 2: Rodar o gate**

```bash
npx tsc --noEmit && npm run test && npx next lint
```
Esperado: exit 0 · **345 testes** passando · 0 erros de lint (os 2 warnings
`no-img-element` continuam — são pré-existentes).

- [ ] **Step 3: Verificar no navegador**

```bash
npm run dev -- -p 3000
```
Abrir `http://localhost:3000/oferta` e conferir, nos **três** planos:
1. Digitar e-mail inválido + Enter → aparece "Informe um e-mail válido." e o
   botão **não** trava.
2. Com o DevTools em **Network → Offline**, e-mail válido + clicar → aparece
   "Conexão instável..." e o botão **volta** para o texto original (não fica em
   "Redirecionando..."). *Este é o bug que a task corrige — se o botão travar, a
   task falhou.*
3. Voltar a rede ao normal → o clique leva ao checkout da Stripe.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/OfferPricing.tsx
git commit -m "fix(oferta): checkout nao trava mais em erro de rede (try/catch/finally) + form acessivel"
```

---

### Task 2: Termos acessíveis onde o dinheiro é cobrado

**Por quê:** a `/oferta` diz "ver termos" e não é link; o rodapé dela só tem
`/#features` — âncora **morta**, esse id não existe em lugar nenhum. As páginas
de checkout não têm rodapé. A página que cobra é a única sem acesso ao contrato.

> ⚠️ Esta task **só cria o caminho** para os termos. O **texto** da garantia está
> contraditório em três lugares e é corrigido na **Onda 3**, que tem aprovação do
> usuário. Não mexer na redação da garantia aqui.

**Files:**
- Create: `src/components/marketing/LegalLinks.tsx`
- Modify: `src/components/marketing/Footer.tsx:8-11`
- Modify: `src/components/marketing/OfferPricing.tsx` (a `<li>` "Garantia...", hoje linha 53)
- Modify: `src/app/checkout/sucesso/page.tsx`
- Modify: `src/app/checkout/cancelado/page.tsx`

**Interfaces:**
- Produces: `<LegalLinks />` — componente de servidor sem props, renderiza um
  `<nav>` com links para `/legal/termos`, `/legal/privacidade` e `/suporte`.

- [ ] **Step 1: Criar o componente de links legais**

Criar `src/components/marketing/LegalLinks.tsx`:

```tsx
import Link from "next/link";

/**
 * Links de contrato/suporte. Usado no rodapé antigo (/oferta) e nas páginas de
 * checkout, que não têm rodapé próprio. Sem estilo de tema: herda a cor do pai,
 * então funciona no claro (.lp-guide) e no escuro (.mc-checkout).
 */
export default function LegalLinks({ className }: { className?: string }) {
  return (
    <nav className={className} aria-label="Links legais">
      <Link href="/legal/termos">Termos de uso</Link>
      <Link href="/legal/termos#garantia">Garantia</Link>
      <Link href="/legal/privacidade">Privacidade</Link>
      <Link href="/suporte">Suporte</Link>
    </nav>
  );
}
```

- [ ] **Step 2: Consertar o rodapé antigo**

Em `src/components/marketing/Footer.tsx`, trocar o `<nav>` das linhas 8–11 por
`<LegalLinks />` e corrigir a âncora morta. O arquivo inteiro passa a ser:

```tsx
import LegalLinks from "./LegalLinks";

export default function Footer() {
  return (
    <footer>
      <div className="container foot-row">
        <span className="logo" style={{ fontSize: 16 }}>
          Matriz<span>/</span>Central
        </span>
        <nav>
          {/* /#features nao existe: os ids reais da landing sao sistema,
              processo, preco, faq, central, momento, estrategia. */}
          <a href="/#sistema">O sistema</a>
          <a href="/#preco">Preço</a>
        </nav>
        <LegalLinks />
        <span>
          © {new Date().getFullYear()} Matriz Central. Todos os direitos
          reservados.
        </span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Transformar "ver termos" em link**

Em `src/components/marketing/OfferPricing.tsx`, a `<li>` da garantia (hoje
linha 53) passa a:

```tsx
<li>Garantia condicional de 7 dias (<a href="/legal/termos#garantia">ver termos</a>)</li>
```

*(A redação "condicional" é corrigida na Onda 3 — aqui só vira link.)*

- [ ] **Step 4: Rodapé mínimo nas páginas de checkout**

Em `src/app/checkout/sucesso/page.tsx` e `src/app/checkout/cancelado/page.tsx`,
importar `LegalLinks` e renderizá-lo como último filho do elemento raiz de cada
página:

```tsx
import LegalLinks from "@/components/marketing/LegalLinks";
// ...
<LegalLinks className="mc-checkout-legal" />
```

E acrescentar ao fim de `src/app/checkout/checkout-dark.css`:

```css
.mc-checkout-legal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  font-size: 13px;
  opacity: 0.7;
}
.mc-checkout-legal a { text-decoration: underline; }
```

> Se o elemento raiz dessas páginas não tiver a classe `.mc-checkout` no
> ancestral, o CSS não se aplica — conferir lendo os dois arquivos antes de
> editar e ajustar o seletor ao que existir. **Não** mover as páginas para outro
> escopo de CSS.

- [ ] **Step 5: Gate**

```bash
npx tsc --noEmit && npm run test && npx next lint
```
Esperado: exit 0 · 345 testes · 0 erros.

- [ ] **Step 6: Verificar no navegador**

Com `npm run dev -- -p 3000`:
- `/oferta` → o "(ver termos)" é clicável e cai em `/legal/termos` **na âncora
  da garantia** (a página rola até o `<h2 id="garantia">`).
- `/oferta` → rodapé: "O sistema" leva à seção do sistema na home (**não** a uma
  âncora morta); os 4 links legais funcionam.
- `/checkout/cancelado` → os links legais aparecem e estão legíveis **no tema
  escuro** (contraste ok).

- [ ] **Step 7: Commit**

```bash
git add src/components/marketing/LegalLinks.tsx src/components/marketing/Footer.tsx src/components/marketing/OfferPricing.tsx src/app/checkout/
git commit -m "fix(legal): termos acessiveis na /oferta e no checkout + ancora morta /#features corrigida"
```

---

### Task 3: SEO técnico — sitemap, robots e metadata raiz

**Por quê:** não existe `sitemap`, `robots`, `metadataBase`, `openGraph` nem
canonical. Um link compartilhado hoje sai sem título, sem descrição e sem imagem.

**Files:**
- Create: `src/lib/seo.ts`
- Create: `src/lib/seo.test.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/layout.tsx:18-21` (metadata raiz)

**Interfaces:**
- Produces (usado nas Tasks 4 e 5 e nas ondas seguintes):
  - `SITE_URL: string` — `"https://www.matrizcentral.com.br"`
  - `PRIVATE_PATH_PREFIXES: readonly string[]`
  - `isPrivatePath(path: string): boolean`
  - `buildSitemapEntries(posts: Array<{ slug: string; date: string }>): SitemapEntry[]`
  - `interface SitemapEntry { url: string; lastModified?: string; changeFrequency: "daily"|"weekly"|"monthly"|"yearly"; priority: number }`

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/seo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SITE_URL, buildSitemapEntries, isPrivatePath } from "./seo";

describe("isPrivatePath", () => {
  it("marca as areas logadas como privadas", () => {
    expect(isPrivatePath("/feed")).toBe(true);
    expect(isPrivatePath("/conta")).toBe(true);
    expect(isPrivatePath("/dashboard/abc123")).toBe(true);
    expect(isPrivatePath("/api/checkout")).toBe(true);
    expect(isPrivatePath("/biblioteca/parte1")).toBe(true);
    expect(isPrivatePath("/certificado/XYZ")).toBe(true);
  });

  it("nao confunde prefixo com comeco de outra rota", () => {
    expect(isPrivatePath("/contato")).toBe(false);
    expect(isPrivatePath("/")).toBe(false);
    expect(isPrivatePath("/blog/por-que-ia-local")).toBe(false);
    expect(isPrivatePath("/oferta")).toBe(false);
  });
});

describe("buildSitemapEntries", () => {
  const posts = [{ slug: "por-que-ia-local", date: "2026-07-01" }];

  it("inclui a landing e a pagina de venda", () => {
    const urls = buildSitemapEntries(posts).map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/oferta`);
  });

  it("inclui um item por post, com a data do post", () => {
    const entry = buildSitemapEntries(posts).find(
      (e) => e.url === `${SITE_URL}/blog/por-que-ia-local`
    );
    expect(entry).toBeDefined();
    expect(entry?.lastModified).toBe("2026-07-01");
  });

  it("nunca expoe uma rota privada no sitemap", () => {
    for (const entry of buildSitemapEntries(posts)) {
      const path = entry.url.replace(SITE_URL, "") || "/";
      expect(isPrivatePath(path)).toBe(false);
    }
  });

  it("usa url absoluta em todas as entradas", () => {
    for (const entry of buildSitemapEntries(posts)) {
      expect(entry.url.startsWith(`${SITE_URL}/`)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npx vitest run src/lib/seo.test.ts
```
Esperado: **FAIL** — `Failed to resolve import "./seo"`.

- [ ] **Step 3: Implementar `src/lib/seo.ts`**

```ts
/** Origem canônica do site. Sem barra no fim. */
export const SITE_URL = "https://www.matrizcentral.com.br";

/**
 * Caminhos que nunca podem ser indexados nem entrar no sitemap: área logada,
 * APIs, leitor protegido, checkout e páginas por token/código.
 * Entrada terminada em "/" é prefixo; sem "/" casa exata ou seguida de "/".
 */
export const PRIVATE_PATH_PREFIXES = [
  "/api/",
  "/dashboard/",
  "/checkout/",
  "/biblioteca/",
  "/certificado/",
  "/quiz/",
  "/conta",
  "/feed",
  "/forum",
  "/entrar",
] as const;

export function isPrivatePath(path: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? path.startsWith(prefix)
      : path === prefix || path.startsWith(`${prefix}/`)
  );
}

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

const STATIC_ROUTES: Array<Omit<SitemapEntry, "url"> & { path: string }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/oferta", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/sobre", changeFrequency: "monthly", priority: 0.5 },
  { path: "/suporte", changeFrequency: "monthly", priority: 0.5 },
  { path: "/legal/termos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/privacidade", changeFrequency: "yearly", priority: 0.3 },
];

export function buildSitemapEntries(
  posts: Array<{ slug: string; date: string }>
): SitemapEntry[] {
  const entries: SitemapEntry[] = STATIC_ROUTES.map(({ path, ...rest }) => ({
    url: `${SITE_URL}${path}`,
    ...rest,
  }));
  for (const post of posts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }
  return entries;
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
npx vitest run src/lib/seo.test.ts
```
Esperado: **PASS**, 6 testes.

- [ ] **Step 5: Criar as rotas de sitemap e robots**

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog";
import { buildSitemapEntries } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(
    BLOG_POSTS.map((post) => ({ slug: post.slug, date: post.date }))
  );
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { PRIVATE_PATH_PREFIXES, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PRIVATE_PATH_PREFIXES],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 6: Metadata raiz com OG e canonical**

Em `src/app/layout.tsx`, trocar o bloco `export const metadata` (linhas 18–21) por:

```ts
const SITE_DESCRIPTION =
  "Plataforma de aprendizado sobre IA local: relatórios, podcasts, vídeos e pesquisas para rodar modelos no seu próprio hardware, com privacidade e sem mensalidade.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Matriz Central — IA local, do diagnóstico ao domínio",
    template: "%s · Matriz Central",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Matriz Central",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Matriz Central",
    url: SITE_URL,
    title: "Matriz Central — IA local, do diagnóstico ao domínio",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Matriz Central — IA local, do diagnóstico ao domínio",
    description: SITE_DESCRIPTION,
  },
};
```

E acrescentar o import no topo do arquivo:

```ts
import { SITE_URL } from "@/lib/seo";
```

⚠️ **O `template: "%s · Matriz Central"` afeta todas as páginas que já definem
`title`.** Abrir cada uma e remover sufixo repetido, para não sair
"Blog | Matriz Central · Matriz Central":
`src/app/(marketing)/sobre/page.tsx:25` · `src/app/(marketing)/legal/termos/page.tsx:10` ·
`src/app/(marketing)/legal/privacidade/page.tsx:10` · `src/app/blog/page.tsx:4` ·
`src/app/blog/[slug]/page.tsx:12` · `src/app/suporte/page.tsx:4` ·
`src/app/entrar/resgate/page.tsx:5`.

- [ ] **Step 7: Gate + verificação no navegador**

```bash
npx tsc --noEmit && npm run test && npx next lint
```
Esperado: exit 0 · **351 testes** (345 + 6 novos) · 0 erros.

Com `npm run dev -- -p 3000`:
- `http://localhost:3000/sitemap.xml` → XML com **13 URLs** (7 fixas + 6 posts),
  todas absolutas, **nenhuma** de área logada.
- `http://localhost:3000/robots.txt` → contém `Sitemap:` e os `Disallow:` das
  áreas privadas.
- Ver o `<head>` da home (Ctrl+U) → tem `og:title`, `og:description`,
  `og:locale`, `twitter:card` e `<link rel="canonical">`.
- Abrir `/blog` e conferir que o título **não** ficou duplicado.

- [ ] **Step 8: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts src/app/sitemap.ts src/app/robots.ts src/app/layout.tsx src/app/blog src/app/suporte "src/app/(marketing)" src/app/entrar
git commit -m "feat(seo): sitemap, robots, metadataBase, openGraph e canonical na raiz"
```

---

### Task 4: Imagem de compartilhamento + metadata nas rotas que faltam

**Por quê:** a landing e a `/oferta` — as duas páginas que vão receber tráfego —
**não têm metadata própria**, e não existe imagem de OG. Link no WhatsApp sai cru.

**Files:**
- Create: `src/app/opengraph-image.tsx`
- Modify: `src/app/(marketing)/page.tsx` (adicionar `export const metadata`)
- Modify: `src/app/(marketing)/oferta/page.tsx` (adicionar `export const metadata`)
- Modify: `src/app/certificado/[code]/page.tsx` (adicionar `generateMetadata`)
- Modify: `src/app/feed/page.tsx`, `src/app/forum/page.tsx`, `src/app/conta/page.tsx`,
  `src/app/entrar/page.tsx`, `src/app/checkout/sucesso/page.tsx`,
  `src/app/checkout/cancelado/page.tsx` (adicionar `robots: { index: false }`)

**Interfaces:**
- Consumes: `SITE_URL` de `@/lib/seo` (Task 3).

- [ ] **Step 1: Gerar a imagem de OG com `next/og`**

Criar `src/app/opengraph-image.tsx` (sem dependência nova — `next/og` vem no Next):

```tsx
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Matriz Central — IA local, do diagnóstico ao domínio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0a0a0f 0%, #17122b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 14, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, background: "#7c5cff", borderRadius: 6 }} />
          <div style={{ width: 44, height: 44, background: "#5b3ee8", borderRadius: 6 }} />
          <div style={{ width: 44, height: 44, background: "#3b229e", borderRadius: 6 }} />
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
          Matriz Central
        </div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#c9c4e0", lineHeight: 1.3 }}>
          IA local, do diagnóstico ao domínio
        </div>
      </div>
    ),
    size
  );
}
```

> **Escape hatch:** se o `ImageResponse` falhar no build/dev deste projeto,
> **não instale nada**. Apague este arquivo e coloque um PNG estático em
> `src/app/opengraph-image.png` (convenção de arquivo do App Router), derivado de
> `public/brand/`. Reporte qual caminho foi usado.

- [ ] **Step 2: Metadata da landing e da `/oferta`**

Em `src/app/(marketing)/page.tsx`, acrescentar (fora do componente):

```tsx
export const metadata = {
  title: "IA local, do diagnóstico ao domínio",
  description:
    "Descubra qual IA roda no seu hardware, monte sua trilha e acompanhe relatórios, podcasts e pesquisas da comunidade. Sem mensalidade, sem enviar seus dados para fora.",
  alternates: { canonical: "/" },
};
```

Em `src/app/(marketing)/oferta/page.tsx`:

```tsx
export const metadata = {
  title: "Planos e acesso",
  description:
    "Start, Regular e Advanced: escolha como quer acessar a Matriz Central. Pagamento único a partir de R$47, com garantia.",
  alternates: { canonical: "/oferta" },
};
```

- [ ] **Step 3: `generateMetadata` no certificado público**

O `/certificado/[code]` é a página que o aluno **compartilha**. Em
`src/app/certificado/[code]/page.tsx`, adicionar:

```tsx
export function generateMetadata({ params }: { params: { code: string } }) {
  return {
    title: "Certificado de conclusão",
    description: `Verificação pública do certificado ${params.code} emitido pela Matriz Central.`,
    alternates: { canonical: `/certificado/${params.code}` },
    robots: { index: false, follow: true },
  };
}
```

> `index: false` porque cada certificado é de uma pessoa — não deve virar
> resultado de busca —, mas `follow: true` e OG mantidos para o link ficar bonito
> quando o aluno postar.

- [ ] **Step 4: `noindex` nas páginas privadas**

Em cada um destes arquivos, adicionar (ou completar o `metadata` existente):

```tsx
export const metadata = { robots: { index: false, follow: false } };
```

Arquivos: `src/app/feed/page.tsx` · `src/app/forum/page.tsx` ·
`src/app/conta/page.tsx` · `src/app/entrar/page.tsx` ·
`src/app/checkout/sucesso/page.tsx` · `src/app/checkout/cancelado/page.tsx`.

> Se algum deles for `"use client"`, **não** dá para exportar `metadata` — nesse
> caso o `noindex` do `robots.ts` (Task 3) já cobre, e basta anotar no relatório
> qual arquivo ficou de fora e por quê.

- [ ] **Step 5: Gate + verificação**

```bash
npx tsc --noEmit && npm run test && npx next lint
```
Esperado: exit 0 · 351 testes · 0 erros.

Com `npm run dev -- -p 3000`:
- `http://localhost:3000/opengraph-image` → renderiza o PNG 1200×630.
- Ctrl+U na home → `og:image` aponta para `/opengraph-image`; o `<title>` é
  "IA local, do diagnóstico ao domínio · Matriz Central".
- Ctrl+U em `/feed` → contém `<meta name="robots" content="noindex,nofollow">`.

- [ ] **Step 6: Commit**

```bash
git add src/app/opengraph-image.tsx "src/app/(marketing)" src/app/certificado src/app/feed src/app/forum src/app/conta src/app/entrar src/app/checkout
git commit -m "feat(seo): imagem de compartilhamento + metadata na landing/oferta/certificado e noindex nas privadas"
```

---

### Task 5: Medição de funil própria

**Por quê:** hoje não existe **nenhum** dado de funil. Sem isso, qualquer real
gasto em tráfego é cego: não dá para saber se a landing converte para a `/oferta`,
onde o checkout é abandonado, nem de onde vem quem compra.

**Decisão de projeto:** funil **próprio** numa tabela nossa (custo zero, sem
dependência npm, dado cru na nossa mão), **sem PII** — `anon_id` opaco de cookie
first-party, nunca e-mail.

**Files:**
- Create: `supabase/migrations/0030_funnel_events.sql`
- Create: `src/lib/funnel.ts`
- Create: `src/lib/funnel.test.ts`
- Create: `src/app/api/track/route.ts`
- Create: `src/components/analytics/TrackView.tsx`
- Modify: `src/app/(marketing)/page.tsx`, `src/app/(marketing)/oferta/page.tsx`,
  `src/app/checkout/sucesso/page.tsx` (montar o `TrackView`)
- Modify: `src/components/marketing/OfferPricing.tsx` (evento `checkout_start`)
- Modify: `src/components/marketing/v2/FooterNewsletter.tsx` (evento `newsletter_signup`)

**Interfaces:**
- Produces:
  - `FUNNEL_EVENTS: readonly FunnelEvent[]` e `type FunnelEvent`
  - `validateTrackInput(input: unknown): { ok: true; value: TrackPayload } | { ok: false; error: string }`
  - `interface TrackPayload { event: FunnelEvent; path: string | null; referrer: string | null; meta: Record<string, string | number | boolean> | null }`
  - `<TrackView event={...} />` — client component que dispara o evento uma vez ao montar.
- Consumes: `isPrivatePath` de `@/lib/seo` (Task 3) · `createRateLimiter` de
  `@/lib/rate-limit` · `getSupabaseServerClient` de `@/lib/supabase/server`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/lib/funnel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateTrackInput } from "./funnel";

describe("validateTrackInput", () => {
  it("aceita um evento conhecido", () => {
    const result = validateTrackInput({ event: "oferta_view", path: "/oferta" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.event).toBe("oferta_view");
      expect(result.value.path).toBe("/oferta");
    }
  });

  it("recusa evento desconhecido", () => {
    const result = validateTrackInput({ event: "hackeado", path: "/" });
    expect(result.ok).toBe(false);
  });

  it("recusa payload que nao e objeto", () => {
    expect(validateTrackInput(null).ok).toBe(false);
    expect(validateTrackInput("oferta_view").ok).toBe(false);
  });

  it("NUNCA guarda caminho privado (o token do dashboard nao pode vazar)", () => {
    const result = validateTrackInput({
      event: "content_open",
      path: "/dashboard/8f3a-token-secreto/conteudo/x",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.path).toBeNull();
  });

  it("descarta a query string do referrer", () => {
    const result = validateTrackInput({
      event: "landing_view",
      path: "/",
      referrer: "https://google.com/search?q=ia+local&token=abc",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.referrer).toBe("https://google.com/search");
  });

  it("descarta referrer que nao e http(s)", () => {
    const result = validateTrackInput({
      event: "landing_view",
      path: "/",
      referrer: "javascript:alert(1)",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.referrer).toBeNull();
  });

  it("aceita meta so com valores primitivos e no maximo 10 chaves", () => {
    const ok = validateTrackInput({ event: "checkout_start", meta: { plan: "advanced" } });
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.meta).toEqual({ plan: "advanced" });

    const aninhado = validateTrackInput({ event: "checkout_start", meta: { a: { b: 1 } } });
    expect(aninhado.ok).toBe(true);
    if (aninhado.ok) expect(aninhado.value.meta).toEqual({});

    const demais = Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [`k${i}`, "v"])
    );
    const cortado = validateTrackInput({ event: "checkout_start", meta: demais });
    expect(cortado.ok).toBe(true);
    if (cortado.ok) expect(Object.keys(cortado.value.meta ?? {}).length).toBe(10);
  });

  it("trunca caminho gigante em 300 caracteres", () => {
    const result = validateTrackInput({ event: "landing_view", path: `/${"a".repeat(500)}` });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.path?.length).toBe(300);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npx vitest run src/lib/funnel.test.ts
```
Esperado: **FAIL** — `Failed to resolve import "./funnel"`.

- [ ] **Step 3: Implementar `src/lib/funnel.ts`**

```ts
import { isPrivatePath } from "./seo";

export const FUNNEL_EVENTS = [
  "landing_view",
  "oferta_view",
  "checkout_start",
  "checkout_success",
  "newsletter_signup",
  "content_open",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export interface TrackPayload {
  event: FunnelEvent;
  path: string | null;
  referrer: string | null;
  meta: Record<string, string | number | boolean> | null;
}

const MAX_LEN = 300;
const MAX_META_KEYS = 10;
const MAX_META_VALUE_LEN = 200;

function isFunnelEvent(value: unknown): value is FunnelEvent {
  return typeof value === "string" && (FUNNEL_EVENTS as readonly string[]).includes(value);
}

/**
 * Normaliza o caminho. Caminho privado vira null: a URL do dashboard CONTÉM o
 * token de acesso — gravá-la seria vazar credencial no banco de métricas.
 */
function normalizePath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/")) return null;
  const path = value.slice(0, MAX_LEN);
  const withoutQuery = path.split("?")[0];
  if (isPrivatePath(withoutQuery)) return null;
  return path;
}

/** Guarda só origem + caminho do referrer: query string carrega PII e tokens. */
function normalizeReferrer(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname}`.slice(0, MAX_LEN);
  } catch {
    return null;
  }
}

function normalizeMeta(value: unknown): Record<string, string | number | boolean> | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_META_KEYS) break;
    if (typeof raw === "number" || typeof raw === "boolean") out[key] = raw;
    else if (typeof raw === "string") out[key] = raw.slice(0, MAX_META_VALUE_LEN);
  }
  return out;
}

export function validateTrackInput(
  input: unknown
): { ok: true; value: TrackPayload } | { ok: false; error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "payload inválido" };
  }
  const body = input as Record<string, unknown>;
  if (!isFunnelEvent(body.event)) return { ok: false, error: "evento desconhecido" };
  return {
    ok: true,
    value: {
      event: body.event,
      path: normalizePath(body.path),
      referrer: normalizeReferrer(body.referrer),
      meta: normalizeMeta(body.meta),
    },
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
npx vitest run src/lib/funnel.test.ts
```
Esperado: **PASS**, 8 testes.

- [ ] **Step 5: Criar e APLICAR a migration**

Criar `supabase/migrations/0030_funnel_events.sql`:

```sql
-- Funil próprio (custo zero, sem dependência de terceiro).
-- SEM PII: anon_id é um identificador opaco de cookie first-party; user_id só
-- é preenchido quando já existe sessão. Nunca gravar e-mail nem URL com token.
create table if not exists funnel_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  anon_id text not null,
  user_id uuid references users(id) on delete set null,
  path text,
  referrer text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists funnel_events_event_created_idx
  on funnel_events (event, created_at desc);
create index if not exists funnel_events_anon_idx
  on funnel_events (anon_id, created_at desc);

-- RLS ligada e SEM policy: só o service role (que a ignora) escreve e lê.
-- O cliente nunca fala com esta tabela direto — sempre por POST /api/track.
alter table funnel_events enable row level security;
```

Aplicar no remoto **agora** (L-023 — migration e código na mesma sessão):

```bash
npx supabase db query --linked -f supabase/migrations/0030_funnel_events.sql
```

Verificar que existe e está com RLS:

```bash
npx supabase db query --linked "select relname, relrowsecurity from pg_class where relname = 'funnel_events';"
```
Esperado: uma linha, `relrowsecurity` = `true`. **Se não vier assim, pare e
reporte** — não siga para o próximo passo.

- [ ] **Step 6: Criar a rota `POST /api/track`**

Antes de escrever, confirme o nome real do helper de sessão:

```bash
npx rg "export .*function (getSessionUser|getSession)" src/lib
```

Criar `src/app/api/track/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createRateLimiter } from "@/lib/rate-limit";
import { validateTrackInput } from "@/lib/funnel";

export const dynamic = "force-dynamic";

const ANON_COOKIE = "mc_anon";
const ANON_MAX_AGE = 60 * 60 * 24 * 365;
// 1 evento por segundo por visitante: mata loop de render sem perder o funil.
const limiter = createRateLimiter(1_000);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = validateTrackInput(body);
  // Métrica nunca quebra a experiência: erro de payload responde 204 e some.
  if (!parsed.ok) return new NextResponse(null, { status: 204 });

  const jar = cookies();
  let anonId = jar.get(ANON_COOKIE)?.value;
  const isNew = !anonId;
  if (!anonId) anonId = crypto.randomUUID();

  if (!limiter.check(anonId, Date.now())) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = getSupabaseServerClient();
  await supabase.from("funnel_events").insert({
    event: parsed.value.event,
    anon_id: anonId,
    path: parsed.value.path,
    referrer: parsed.value.referrer,
    meta: parsed.value.meta,
  });

  const res = new NextResponse(null, { status: 204 });
  if (isNew) {
    res.cookies.set(ANON_COOKIE, anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ANON_MAX_AGE,
    });
  }
  return res;
}
```

> `user_id` fica de fora nesta task **de propósito**: ligar o funil à sessão
> exige decidir o que fazer com o histórico anônimo anterior ao login, e isso é
> escopo da Onda 5. A coluna já existe para quando for a hora.

- [ ] **Step 7: Criar o disparador de evento no cliente**

Criar `src/components/analytics/TrackView.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import type { FunnelEvent } from "@/lib/funnel";

/** Dispara um evento de funil uma única vez, quando a página monta. */
export default function TrackView({ event }: { event: FunnelEvent }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const payload = JSON.stringify({
      event,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
    });
    // sendBeacon nao segura a navegacao; fetch keepalive e o plano B.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => null);
    }
  }, [event]);
  return null;
}
```

- [ ] **Step 8: Instrumentar os 4 pontos do funil**

1. `src/app/(marketing)/page.tsx` → `<TrackView event="landing_view" />` dentro do JSX.
2. `src/app/(marketing)/oferta/page.tsx` → `<TrackView event="oferta_view" />`.
3. `src/app/checkout/sucesso/page.tsx` → `<TrackView event="checkout_success" />`.
4. `src/components/marketing/OfferPricing.tsx` → no `handleSubmit`, **logo antes**
   do `fetch("/api/checkout")`:

```tsx
navigator.sendBeacon?.(
  "/api/track",
  new Blob([JSON.stringify({ event: "checkout_start", path: "/oferta", meta: { plan } })], {
    type: "application/json",
  })
);
```

5. `src/components/marketing/v2/FooterNewsletter.tsx` → no ramo de sucesso
   (onde hoje faz `setStatus("done")`), a mesma chamada com
   `{ event: "newsletter_signup", path: "/" }`.

- [ ] **Step 9: Vercel Web Analytics sem pacote npm**

Em `src/app/layout.tsx`, dentro do `<body>`, depois do script de tema:

```tsx
{/* Web Analytics da Vercel servido pela propria plataforma — sem dependencia
    npm (custo zero). So carrega em producao; exige "Web Analytics" ligado no
    painel do projeto na Vercel, senao o script simplesmente nao existe. */}
{process.env.NODE_ENV === "production" && (
  <script defer src="/_vercel/insights/script.js" />
)}
```

- [ ] **Step 10: Gate + verificação ponta a ponta**

```bash
npx tsc --noEmit && npm run test && npx next lint
```
Esperado: exit 0 · **359 testes** (351 + 8) · 0 erros.

Com `npm run dev -- -p 3000`: abrir `/`, depois `/oferta`, e clicar em comprar
com e-mail válido (pode cancelar na Stripe). Depois:

```bash
npx supabase db query --linked "select event, path, referrer, meta, created_at from funnel_events order by created_at desc limit 10;"
```
Esperado: linhas de `landing_view`, `oferta_view` e `checkout_start` (esta com
`meta` = `{"plan": "..."}`), **nenhuma** com token no `path`.

Limpar os eventos de teste depois de conferir:

```bash
npx supabase db query --linked "delete from funnel_events where created_at > now() - interval '2 hours';"
```

- [ ] **Step 11: Commit**

```bash
git add supabase/migrations/0030_funnel_events.sql src/lib/funnel.ts src/lib/funnel.test.ts src/app/api/track src/components/analytics src/app/layout.tsx "src/app/(marketing)" src/app/checkout src/components/marketing
git commit -m "feat(medicao): funil proprio (funnel_events + /api/track) e Web Analytics sem dependencia nova"
```

---

### Task 6: Bordas de erro com a marca

**Por quê:** não existe `error.tsx`, `not-found.tsx`, `global-error.tsx` nem
`loading.tsx` em lugar nenhum. Qualquer exceção em produção hoje é **tela branca
do Next** — e as três rotas que leem markdown do disco em runtime são justamente
as mais propensas a demorar.

**Files:**
- Create: `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`
- Create: `src/app/blog/[slug]/loading.tsx`, `src/app/biblioteca/[slug]/loading.tsx`,
  `src/app/dashboard/[token]/conteudo/[id]/loading.tsx`

- [ ] **Step 1: Página 404**

Criar `src/app/not-found.tsx`:

```tsx
import Link from "next/link";

export const metadata = { title: "Página não encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-widest opacity-60">Erro 404</p>
      <h1 className="text-3xl font-semibold">Esta página não existe</h1>
      <p className="max-w-md opacity-70">
        O endereço pode ter mudado ou o link estar incompleto. Você pode voltar ao
        início ou falar com a gente.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg px-5 py-2.5 font-medium" style={{ background: "#7c5cff", color: "#fff" }}>
          Voltar ao início
        </Link>
        <Link href="/suporte" className="rounded-lg border px-5 py-2.5 font-medium">
          Falar com o suporte
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Fronteira de erro de rota**

Criar `src/app/error.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sem isso o erro some: o digest e a unica chave para achar o stack real
    // nos runtime logs da Vercel.
    console.error("[app/error]", error.digest, error.message);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm uppercase tracking-widest opacity-60">Algo quebrou</p>
      <h1 className="text-3xl font-semibold">Não conseguimos carregar esta página</h1>
      <p className="max-w-md opacity-70">
        A falha foi registrada. Tente de novo — se continuar, fale com a gente e
        informe o código <code>{error.digest ?? "sem código"}</code>.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="rounded-lg px-5 py-2.5 font-medium" style={{ background: "#7c5cff", color: "#fff" }}>
          Tentar de novo
        </button>
        <Link href="/suporte" className="rounded-lg border px-5 py-2.5 font-medium">
          Falar com o suporte
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Fronteira global**

Criar `src/app/global-error.tsx` (precisa das próprias tags `<html>`/`<body>` —
ele substitui o layout raiz quando o próprio layout quebra):

```tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ background: "#0a0a0f", color: "#fff", fontFamily: "sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 600 }}>Erro inesperado</h1>
          <p style={{ opacity: 0.7, maxWidth: 420 }}>
            Recarregue a página. Se continuar, informe o código{" "}
            <code>{error.digest ?? "sem código"}</code> ao suporte.
          </p>
          <button onClick={reset} style={{ background: "#7c5cff", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontWeight: 500, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Estados de carregamento nas rotas que leem disco**

As três rotas mostram o mesmo esqueleto, então o esqueleto mora num lugar só e
os `loading.tsx` apenas o reexportam — **não** copiar o corpo três vezes.

Criar `src/components/ui/ContentSkeleton.tsx`:

```tsx
/** Esqueleto de leitura: usado pelos loading.tsx das rotas que leem markdown
 *  do disco em runtime (blog, biblioteca, conteúdo por token). */
export default function ContentSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl animate-pulse space-y-4 px-6 py-16"
      aria-busy="true"
      aria-label="Carregando conteúdo"
    >
      <div className="h-8 w-2/3 rounded bg-current opacity-10" />
      <div className="h-4 w-1/3 rounded bg-current opacity-10" />
      <div className="h-4 w-full rounded bg-current opacity-10" />
      <div className="h-4 w-full rounded bg-current opacity-10" />
      <div className="h-4 w-5/6 rounded bg-current opacity-10" />
    </div>
  );
}
```

E criar os três `loading.tsx` — `src/app/blog/[slug]/loading.tsx`,
`src/app/biblioteca/[slug]/loading.tsx` e
`src/app/dashboard/[token]/conteudo/[id]/loading.tsx` — cada um com **exatamente**
esta linha (a convenção do App Router exige o default export por arquivo; o
reexport satisfaz isso sem duplicar o corpo):

```tsx
export { default } from "@/components/ui/ContentSkeleton";
```

- [ ] **Step 5: Gate + verificação**

```bash
npx tsc --noEmit && npm run test && npx next lint
```
Esperado: exit 0 · 359 testes · 0 erros.

Com `npm run dev -- -p 3000`:
- `http://localhost:3000/rota-que-nao-existe` → a 404 da marca, com os 2 botões
  funcionando (**não** o 404 branco do Next).
- `http://localhost:3000/blog/slug-inexistente` → mesma 404.
- Conferir que a 404 fica legível **nos dois temas** (o layout raiz é dark por
  padrão; alternar o tema pelo menu do app e recarregar).

- [ ] **Step 6: Commit**

```bash
git add src/app/not-found.tsx src/app/error.tsx src/app/global-error.tsx src/app/blog src/app/biblioteca src/app/dashboard
git commit -m "feat(ux): 404, fronteiras de erro e estados de carregamento com a marca"
```

---

## Definição de pronto da Onda 1

- [ ] Botão de compra da `/oferta` **não trava** com a rede offline (verificado no navegador).
- [ ] `/legal/termos` alcançável a partir da `/oferta` e das duas páginas de checkout.
- [ ] `/sitemap.xml` responde com 13 URLs públicas e **zero** privadas.
- [ ] `/robots.txt` responde com `Sitemap:` e os `Disallow:`.
- [ ] Ctrl+U na home mostra `og:title`, `og:description`, `og:image` e canonical.
- [ ] `funnel_events` tem linhas reais de `landing_view` → `oferta_view` →
      `checkout_start`, **sem token em nenhum `path`**, e os eventos de teste foram apagados.
- [ ] Rota inexistente mostra a 404 da marca.
- [ ] Gate final: `tsc` 0 · **359 testes** · lint sem erros.
- [ ] `docs/ESTADO-ATUAL.md` atualizado (topo + log de sessões) e commitado.
