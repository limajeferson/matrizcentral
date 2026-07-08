# Conversão por Robustez de Conteúdo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reposicionar a landing do Matriz Central de "um ebook + trilha" para "uma central viva de IA local, multi-formato, numa plataforma-feed", comunicando a biblioteca real (relatórios, podcasts, vídeos, apresentações, pesquisas) como argumento de conversão.

**Architecture:** Novas seções e ajustes de copy na landing v2 (`.mcv2`, `src/app/(marketing)/`), derivando toda vitrine de conteúdo da fonte única `CONTENT_HUB` (`src/data/content-hub.ts`) — honesto e DRY. A agregação de contagens por formato é extraída para um helper puro testável. Zero dependências novas; reuso de framer-motion, tokens de cor semântica e padrões visuais existentes.

**Tech Stack:** Next.js 14.2 (App Router), React 18, TypeScript, framer-motion 12, CSS puro (`landing-v2.css`), vitest 4 (ambiente `node`).

## Global Constraints

- **Custo zero:** proibido adicionar dependências npm ou assets externos. Reusar framer-motion (instalado), `CONTENT_HUB` e padrões `.mcv2`.
- **Fonte única de conteúdo:** toda vitrine puxa de `CONTENT_HUB`; nunca inventar títulos.
- **Honestidade:** itens com `embedUrl === null` (exceto `relatorio`/`pesquisa`) exibem selo "em breve", igual ao hub do dashboard. Biblioteca enquadrada como "em expansão". Não afirmar features de busca inexistentes.
- **Escopo CSS:** todo estilo novo sob `.mcv2` em `src/app/(marketing)/landing-v2.css`.
- **Acessibilidade:** respeitar `prefers-reduced-motion`; foco visível; ícones decorativos com `aria-hidden`.
- **Copy:** português do Brasil.
- **Cor semântica:** reusar tokens existentes; "em breve" usa `var(--mc-warn)` (âmbar).
- **Gate de verificação por task:** `npx tsc --noEmit` (exit 0) + `npm run test` (suíte completa passa). NÃO usar `npm run build` — ele falha em `/api/checkout` por env do Stripe ausente (pré-existente, não relacionado).

---

## File Structure

- Create `src/lib/content-stats.ts` — agregação pura de contagens por formato (`formatCounts`, `FormatStat`).
- Create `src/lib/content-stats.test.ts` — testes vitest.
- Create `src/components/marketing/v2/ContentLibrarySection.tsx` — seção "A Central".
- Modify `src/app/(marketing)/page.tsx` — inserir `ContentLibrarySection` após `SystemSection`.
- Modify `src/app/(marketing)/landing-v2.css` — blocos `.mc-library-*` e `.mc-hero-proof-strip`.
- Modify `src/components/marketing/v2/SystemSection.tsx` — reposicionar os 4 pilares.
- Modify `src/components/marketing/v2/HeroV2.tsx` — faixa de prova de formatos.
- Modify `src/components/marketing/v2/PricingV2.tsx` — expandir a pilha de valor.

---

## Task 1: Helper puro de contagem por formato

**Files:**
- Create: `src/lib/content-stats.ts`
- Test: `src/lib/content-stats.test.ts`

**Interfaces:**
- Consumes: `CONTENT_HUB`, `ContentType`, `ContentItem` de `@/data/content-hub`.
- Produces:
  - `interface FormatStat { type: ContentType | "apresentacao"; label: string; icon: string; count: number; }`
  - `function formatCounts(items?: ContentItem[]): FormatStat[]` — retorna os 5 formatos na ordem fixa (relatorio, podcast, video, apresentacao, pesquisa) com as contagens; `apresentacao` é contagem fixa (3) por estar fora do hub.

- [ ] **Step 1: Escrever o teste que falha**

```ts
// src/lib/content-stats.test.ts
import { describe, expect, it } from "vitest";
import { formatCounts } from "@/lib/content-stats";
import { CONTENT_HUB } from "@/data/content-hub";

describe("formatCounts", () => {
  it("retorna os 5 formatos na ordem fixa", () => {
    expect(formatCounts().map((s) => s.type)).toEqual([
      "relatorio",
      "podcast",
      "video",
      "apresentacao",
      "pesquisa",
    ]);
  });

  it("conta cada tipo real do CONTENT_HUB", () => {
    const stats = formatCounts();
    const count = (t: string) => stats.find((s) => s.type === t)?.count;
    expect(count("relatorio")).toBe(CONTENT_HUB.filter((i) => i.type === "relatorio").length);
    expect(count("podcast")).toBe(CONTENT_HUB.filter((i) => i.type === "podcast").length);
    expect(count("video")).toBe(CONTENT_HUB.filter((i) => i.type === "video").length);
    expect(count("pesquisa")).toBe(CONTENT_HUB.filter((i) => i.type === "pesquisa").length);
  });

  it("apresentações tem contagem fixa 3 (fora do hub)", () => {
    expect(formatCounts().find((s) => s.type === "apresentacao")?.count).toBe(3);
  });

  it("aceita lista custom; apresentações permanece fixa", () => {
    const stats = formatCounts([]);
    expect(stats.find((s) => s.type === "podcast")?.count).toBe(0);
    expect(stats.find((s) => s.type === "apresentacao")?.count).toBe(3);
  });

  it("cada formato tem label e ícone não vazios", () => {
    for (const s of formatCounts()) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.icon.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- content-stats`
Expected: FAIL — "Failed to resolve import" / `formatCounts is not a function`.

- [ ] **Step 3: Implementar o mínimo para passar**

```ts
// src/lib/content-stats.ts
import { CONTENT_HUB, type ContentItem, type ContentType } from "@/data/content-hub";

export interface FormatStat {
  type: ContentType | "apresentacao";
  label: string;
  icon: string;
  count: number;
}

/** Apresentações existem como assets (.pptx/.png) mas ainda não estão no CONTENT_HUB. */
const APRESENTACOES_COUNT = 3;

const FORMAT_ORDER: { type: ContentType | "apresentacao"; label: string; icon: string }[] = [
  { type: "relatorio", label: "Relatórios", icon: "📄" },
  { type: "podcast", label: "Podcasts", icon: "🎙️" },
  { type: "video", label: "Vídeos", icon: "🎬" },
  { type: "apresentacao", label: "Apresentações", icon: "🖥️" },
  { type: "pesquisa", label: "Pesquisas", icon: "📊" },
];

/** Contagem de itens por formato, na ordem de exibição. */
export function formatCounts(items: ContentItem[] = CONTENT_HUB): FormatStat[] {
  return FORMAT_ORDER.map((f) => ({
    ...f,
    count:
      f.type === "apresentacao"
        ? APRESENTACOES_COUNT
        : items.filter((i) => i.type === f.type).length,
  }));
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test -- content-stats`
Expected: PASS (5 testes).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content-stats.ts src/lib/content-stats.test.ts
git commit -m "feat: helper puro de contagem de conteudo por formato"
```

---

## Task 2: Seção "A Central" (vitrine da biblioteca)

**Files:**
- Create: `src/components/marketing/v2/ContentLibrarySection.tsx`
- Modify: `src/app/(marketing)/page.tsx` (import + inserir após `<SystemSection />`)
- Modify: `src/app/(marketing)/landing-v2.css` (adicionar bloco `.mc-library-*` ao final, antes do bloco "Rede ambiente")

**Interfaces:**
- Consumes: `CONTENT_HUB`, `ContentType` de `@/data/content-hub`; `formatCounts` de `@/lib/content-stats` (Task 1); `Reveal` de `./motion-primitives`.
- Produces: `default export function ContentLibrarySection(): JSX.Element` — `<section id="central">`.

- [ ] **Step 1: Criar o componente**

```tsx
// src/components/marketing/v2/ContentLibrarySection.tsx
"use client";

import { CONTENT_HUB, type ContentType } from "@/data/content-hub";
import { formatCounts } from "@/lib/content-stats";
import { Reveal } from "./motion-primitives";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

const TYPE_ICON: Record<ContentType, string> = {
  relatorio: "📄",
  podcast: "🎙️",
  video: "🎬",
  pesquisa: "📊",
};

export default function ContentLibrarySection() {
  const stats = formatCounts();

  return (
    <section className="mc-section" id="central">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">A central</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-library-heading">
            Não é um ebook.
            <br />
            É uma central.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-library-sub">
            Leia, ouça, assista — no formato que combina com você. Uma
            biblioteca de IA local em expansão, com novos conteúdos toda semana.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mc-library-formats mc-mono">
            {stats.map((f) => (
              <span className="mc-library-format" key={f.type}>
                <span className="mc-library-format-icon" aria-hidden="true">{f.icon}</span>
                <b>{f.count}</b> · {f.label}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mc-library-grid">
          {CONTENT_HUB.map((item, index) => {
            const comingSoon =
              item.embedUrl === null &&
              item.type !== "relatorio" &&
              item.type !== "pesquisa";

            return (
              <Reveal key={item.id} delay={0.04 * (index % 4)}>
                <article className="mc-library-card">
                  <div className="mc-library-card-head">
                    <span className="mc-library-badge mc-mono">
                      <span aria-hidden="true">{TYPE_ICON[item.type]}</span> {TYPE_LABEL[item.type]}
                    </span>
                    {comingSoon && <span className="mc-library-soon mc-mono">em breve</span>}
                  </div>
                  <h3 className="mc-library-card-title">{item.title}</h3>
                  <p className="mc-library-card-desc">{item.description}</p>
                  <span className="mc-library-meta mc-mono">
                    {item.durationMinutes} min · +{item.xpReward} XP
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <div className="mc-library-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero acesso à central
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Inserir a seção na página**

Em `src/app/(marketing)/page.tsx`, adicionar o import junto aos outros (após a linha de `SystemSection`):

```tsx
import ContentLibrarySection from "@/components/marketing/v2/ContentLibrarySection";
```

E, no JSX, inserir a seção logo após `<SystemSection />`:

```tsx
        <SystemSection />
        <ContentLibrarySection />
        <ProcessSteps />
```

- [ ] **Step 3: Adicionar o CSS da seção**

Em `src/app/(marketing)/landing-v2.css`, imediatamente antes do comentário `/* ---- Rede ambiente (fundo único do site) ---- */`, adicionar:

```css
/* ---- A Central (vitrine da biblioteca multi-formato) ---- */
.mcv2 .mc-library-heading { margin-top: 20px; }
.mcv2 .mc-library-sub {
  margin-top: 20px;
  max-width: 560px;
  color: var(--mc-gray);
  font-size: 1.05rem;
}
.mcv2 .mc-library-formats {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  color: var(--mc-gray);
}
.mcv2 .mc-library-format b { color: var(--mc-white); }
.mcv2 .mc-library-format-icon { margin-right: 4px; }
.mcv2 .mc-library-grid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.mcv2 .mc-library-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 24px;
  background: var(--mc-surface);
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  transition: border-color 0.3s ease, transform 0.3s ease;
}
.mcv2 .mc-library-card:hover {
  border-color: rgba(124, 92, 255, 0.5);
  transform: translateY(-4px);
}
.mcv2 .mc-library-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.mcv2 .mc-library-badge {
  color: var(--mc-gray);
  font-size: 0.72rem;
}
.mcv2 .mc-library-soon {
  color: var(--mc-warn);
  font-size: 0.68rem;
  font-weight: 700;
}
.mcv2 .mc-library-card-title { font-size: 1.1rem; font-weight: 600; margin: 4px 0 0; }
.mcv2 .mc-library-card-desc { color: var(--mc-gray); font-size: 0.92rem; flex: 1; }
.mcv2 .mc-library-meta { color: var(--mc-gray); font-size: 0.72rem; }
.mcv2 .mc-library-cta { margin-top: 40px; }
@media (max-width: 900px) {
  .mcv2 .mc-library-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .mcv2 .mc-library-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador, via app): a seção "A Central" aparece entre "O Sistema" e "Sua jornada", com os títulos reais dos relatórios/podcasts/vídeos, selos "em breve" em âmbar nos podcasts/vídeos, e a faixa de formatos com contagens.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/ContentLibrarySection.tsx "src/app/(marketing)/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: secao A Central com vitrine da biblioteca multi-formato (frente A)"
```

---

## Task 3: Reposicionar "O Sistema"

**Files:**
- Modify: `src/components/marketing/v2/SystemSection.tsx` (somente o array `ITEMS`, linhas 7-44)

**Interfaces:**
- Consumes: nada novo.
- Produces: nenhum export novo (mesmo `default export function SystemSection`). Apenas o conteúdo de `ITEMS` muda; a estrutura visual (grid em linha + hover) permanece.

- [ ] **Step 1: Substituir o array ITEMS**

Em `src/components/marketing/v2/SystemSection.tsx`, substituir todo o array `const ITEMS = [ ... ];` (linhas 7-44) por:

```tsx
const ITEMS = [
  {
    benefit: "Tudo em um só lugar",
    feature: "Biblioteca multi-formato",
    description:
      "Relatórios, podcasts, vídeos e apresentações sobre IA local — com o ebook técnico como material de apoio, não como o produto.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Aprenda como numa rede social",
    feature: "Plataforma-feed",
    description:
      "Um feed de aprendizado no seu ritmo, organizado por contexto — não um PDF que você baixa e esquece.",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
  {
    benefit: "Comece pelo caminho certo",
    feature: "Trilha guiada",
    description:
      "Um diagnóstico inicial do seu contexto e um roadmap inteligente que libera cada etapa na ordem certa.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60",
    accent: false,
  },
  {
    benefit: "Comprove sua evolução",
    feature: "Gamificação + Certificado",
    description:
      "XP, níveis e uma certificação verificável com autenticação pública ao concluir sua trilha.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
    accent: true,
  },
];
```

- [ ] **Step 2: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): os 4 cards de "O Sistema" agora mostram Biblioteca multi-formato / Plataforma-feed / Trilha guiada / Gamificação + Certificado, mantendo o layout em linha e o destaque no hover. A heading "Um sistema, não um ebook solto" permanece e agora é reforçada pelo conteúdo.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/v2/SystemSection.tsx
git commit -m "feat: reposiciona O Sistema em torno da plataforma e biblioteca (frente B)"
```

---

## Task 4: Faixa de prova de formatos no Hero

**Files:**
- Modify: `src/components/marketing/v2/HeroV2.tsx` (adicionar import + faixa de prova)
- Modify: `src/app/(marketing)/landing-v2.css` (bloco `.mc-hero-proof-strip`, junto às regras `.mc-hero-*`)

**Interfaces:**
- Consumes: `formatCounts` de `@/lib/content-stats` (Task 1); `Reveal` (já importado no HeroV2).
- Produces: nenhum export novo.

- [ ] **Step 1: Adicionar o import**

Em `src/components/marketing/v2/HeroV2.tsx`, adicionar após a linha `import { Reveal } from "./motion-primitives";`:

```tsx
import { formatCounts } from "@/lib/content-stats";
```

- [ ] **Step 2: Renderizar a faixa de prova**

Ainda em `HeroV2.tsx`, dentro do componente, no início da função (antes do `return`), adicionar:

```tsx
  const formats = formatCounts();
```

E inserir a faixa logo após o bloco do `mc-hero-cta` (o `</Reveal>` que fecha os botões), antes do `mc-hero-demo`:

```tsx
        <Reveal delay={0.35}>
          <ul className="mc-hero-proof-strip mc-mono" aria-label="A biblioteca inclui">
            {formats.map((f) => (
              <li key={f.type}>
                <span aria-hidden="true">{f.icon}</span> <b>{f.count}</b> {f.label}
              </li>
            ))}
            <li className="mc-hero-proof-grow">+ pesquisas da comunidade · em expansão</li>
          </ul>
        </Reveal>
```

- [ ] **Step 3: Adicionar o CSS da faixa**

Em `src/app/(marketing)/landing-v2.css`, logo após a regra `.mcv2 .mc-hero-sub { ... }` (perto da linha 258), adicionar:

```css
.mcv2 .mc-hero-proof-strip {
  list-style: none;
  margin: 28px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: var(--mc-gray);
}
.mcv2 .mc-hero-proof-strip li {
  padding: 6px 12px;
  border: 1px solid var(--mc-line);
  border-radius: 999px;
  font-size: 0.72rem;
}
.mcv2 .mc-hero-proof-strip b { color: var(--mc-white); }
.mcv2 .mc-hero-proof-grow { color: var(--mc-accent); border-color: rgba(124, 92, 255, 0.4) !important; }
```

- [ ] **Step 4: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): sob os botões do hero aparece uma fileira de chips com os formatos e contagens, terminando em "em expansão" em violeta.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/v2/HeroV2.tsx "src/app/(marketing)/landing-v2.css"
git commit -m "feat: faixa de prova de formatos no hero (frente C)"
```

---

## Task 5: Pilha de valor no Preço

**Files:**
- Modify: `src/components/marketing/v2/PricingV2.tsx` (array `INCLUDED`, linhas 6-11)

**Interfaces:**
- Consumes: `ProductBanner` (já importado no PricingV2 após a frente D anterior).
- Produces: nenhum export novo. `ProductBanner` já aceita `{ icon, label, description, index }`; a expansão de `INCLUDED` gera 6 banners (índices 01–06).

- [ ] **Step 1: Substituir o array INCLUDED**

Em `src/components/marketing/v2/PricingV2.tsx`, substituir o array `const INCLUDED = [ ... ];` (linhas 6-11) por:

```tsx
const INCLUDED = [
  { icon: "📚", label: "Biblioteca multi-formato", description: "Relatórios, podcasts, vídeos e apresentações sobre IA local." },
  { icon: "🧩", label: "Plataforma-feed", description: "Aprenda no seu ritmo, como numa rede social de aprendizado." },
  { icon: "🧭", label: "Diagnóstico inicial", description: "Uma trilha recomendada para o seu contexto." },
  { icon: "🛣️", label: "Roadmap inteligente", description: "Sempre o próximo passo certo, sem excesso de conteúdo." },
  { icon: "🏆", label: "Gamificação + Certificado", description: "XP, níveis e certificação verificável ao concluir a trilha." },
  { icon: "📘", label: "Ebook técnico (bônus)", description: "Material de apoio para rodar IA local do zero ao uso prático." },
];
```

- [ ] **Step 2: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): a seção "Um Único Pagamento" agora mostra 6 banners ultrawide (Biblioteca, Plataforma-feed, Diagnóstico, Roadmap, Gamificação+Certificado, Ebook bônus), numerados 01–06, reforçando a pilha de valor por R$47.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/v2/PricingV2.tsx
git commit -m "feat: pilha de valor completa no preco (frente D)"
```

---

## Self-Review

**1. Cobertura do spec:**
- Frente A (seção A Central) → Task 2. ✅
- Frente B (reposicionar O Sistema) → Task 3. ✅
- Frente C (faixa de prova no hero) → Task 4. ✅
- Frente D (pilha de valor no preço) → Task 5. ✅
- Helper puro de contagens (testes em ambiente node) → Task 1. ✅
- Frente E (memória + CLAUDE.md + consistência): memória já feita; CLAUDE.md via `claude-md-management:revise-claude-md` é ação do controlador **após** a execução (não é task de subagente); FAQ/Closing não contradizem o novo posicionamento (que só adiciona), então não exigem mudança. ✅
- Regras de honestidade (fonte única, "em breve", "em expansão") → embutidas nas Global Constraints e na Task 2 (regra `comingSoon` idêntica à do hub). ✅

**2. Placeholders:** nenhum "TBD"/"handle edge cases"; todo passo traz código completo e comandos com saída esperada.

**3. Consistência de tipos:** `FormatStat`/`formatCounts` (Task 1) consumidos com os mesmos nomes nas Tasks 2 e 4. `ContentType`, `CONTENT_HUB` usados conforme o módulo real. `ProductBanner` (Task 5) recebe os 4 campos que o componente já espera. A regra `comingSoon` na Task 2 replica exatamente a de `conteudo/page.tsx` (`embedUrl === null && type !== "relatorio" && type !== "pesquisa"`).

**Ordem de dependências:** 1 antes de 2 e 4 (helper). 3 e 5 independentes. Todas sob `.mcv2`, tocando `landing-v2.css` em blocos distintos (sem colisão).
