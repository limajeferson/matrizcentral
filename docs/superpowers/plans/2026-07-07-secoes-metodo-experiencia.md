# Reestruturação Seções 2 e 3 (Método vs Experiência) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redividir a função das seções 2 (`SystemSection` → vende o método) e 3 (`ContentLibrarySection` → vende a experiência) da landing, reescrever as descrições do `CONTENT_HUB` como fascinations, trocar as fotos externas por ícones SVG, e separar conteúdo "NOVO" de "em breve".

**Architecture:** Duas seções React existentes reescritas para responder perguntas distintas. Dados: `CONTENT_HUB` (fonte única) tem 9 `description` reescritas. "NOVO" vs "em breve" reusa a lógica `comingSoon` já existente (relatório/pesquisa = disponível; mídia = em breve). Fotos Unsplash trocadas por ícones inline de `icons.tsx`.

**Tech Stack:** Next.js 14 App Router, React, framer-motion (já instalado), CSS por página em `landing-v2.css` (escopo `.mcv2`), Vitest (node).

## Global Constraints

- Comunicar em **português do Brasil**. Toda cópia em pt-BR.
- **Custo zero:** sem dependências npm novas, **sem assets externos**. A Seção 2 deve DEIXAR de referenciar `images.unsplash.com` — trocar por ícones SVG inline de `icons.tsx`.
- CSS novo no escopo **`.mcv2`** em `src/app/(marketing)/landing-v2.css`.
- Tokens: `--mc-accent` #7c5cff, `--mc-accent-deep`, `--mc-gray`, `--mc-line`, `--mc-white`, `--mc-surface`, `--mc-warn` (#ffb454, "em breve"), `--mc-success` (#19c39a). Reusar.
- **Gate:** `npx tsc --noEmit` (exit 0) + `npm run test` (67 verdes). NÃO usar `npm run build` (falha pré-existente Stripe).
- Vitest roda em `environment: node` → só lógica pura; componentes verificados no navegador (`npm run dev -- -p 3000`).
- Windows/Git Bash: caminhos com `(marketing)` precisam de aspas.
- Headings exatas (decisão do usuário): Seção 2 = `Um sistema, / muito além da leitura isolada`; Seção 3 = `Não é um livro digital. / É uma central colaborativa.`
- `CONTENT_HUB`: só a `description` muda; `title`, `type`, `durationMinutes`, `xpReward`, `embedUrl`, `bodyPath`, `surveyOptions` inalterados.
- `formatCounts()` em `content-stats.ts` NÃO é removida (usada no hero + testes); só sai da vitrine da Seção 3.

---

## File Structure

**Modificados:**
- `src/data/content-hub.ts` — 9 `description` reescritas (fascinations).
- `src/components/marketing/v2/SystemSection.tsx` — intro nova, 4 cards do método, ícone SVG no lugar de `<img>`.
- `src/components/marketing/v2/ContentLibrarySection.tsx` — heading/copy nova, bloco "atualizado constantemente", "últimos conteúdos adicionados", cards premium, selo NOVO, ordenação disponíveis-primeiro.
- `src/app/(marketing)/landing-v2.css` — `.mc-system-icon` (substitui foto), `.mc-library-living`, `.mc-library-latest-title`, `.mc-library-new`, `.mc-library-action`, restyle de `.mc-library-card`.

---

## Task 1: Fascinations no CONTENT_HUB

**Files:**
- Modify: `src/data/content-hub.ts`

**Interfaces:**
- Produces: os mesmos `ContentItem` com `description` reescrita. Nenhuma mudança de tipo/assinatura.

- [ ] **Step 1: Reescrever as 9 descrições**

Em `src/data/content-hub.ts`, trocar APENAS o campo `description` de cada item pelos textos abaixo (manter todo o resto de cada objeto intacto):

| id | Nova `description` |
|---|---|
| `relatorio-panorama-llms-locais` | `O mapa dos modelos locais que mais entregam em 2026 — e quais já não valem o seu tempo.` |
| `relatorio-comparativo-modelos` | `Qual modelo realmente roda bem no seu hardware, comparado lado a lado e sem marketing.` |
| `podcast-rode-ia-potente` | `Como colocar uma IA de verdade rodando na sua máquina sem pagar mensalidade.` |
| `podcast-ias-poderosas` | `O setup que transforma um computador comum em uma central de IA para o dia a dia.` |
| `podcast-melhor-ia-hardware` | `O organograma que usamos para decidir qual IA instalar em menos de dois minutos.` |
| `podcast-escolher-ias-sem-travar` | `Os erros mais comuns que travam a IA local — e como evitá-los antes de instalar.` |
| `video-verdade-ia-local` | `Por que alguns modelos locais já superam serviços pagos em determinados cenários.` |
| `video-evolucao-ia-local` | `A linha do tempo que mostra como a IA local passou de curiosidade a substituta de serviço pago.` |
| `pesquisa-hardware-atual` | `Descubra em 5 segundos com qual hardware a comunidade está rodando IA local hoje.` |

- [ ] **Step 2: Verificar gate**

Run: `npx tsc --noEmit` → exit 0.
Run: `npm run test` → 67 passando (nenhum teste asserta `description`; se algum quebrar por texto, ajustar o teste para o novo texto).

- [ ] **Step 3: Commit**

```bash
git add src/data/content-hub.ts
git commit -m "feat: reescreve descricoes do CONTENT_HUB como fascinations (curiosidade)"
```

---

## Task 2: Seção 2 — SystemSection (vende o método)

**Files:**
- Modify: `src/components/marketing/v2/SystemSection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Consumes: `IconCompass, IconRoad, IconBooks, IconTrophy` de `./icons`; `Reveal` de `./motion-primitives`; `motion, useReducedMotion` de framer-motion (já usados no arquivo).
- Produces: `<SystemSection />` (default export) — consumido por `src/app/(marketing)/page.tsx` (não muda o consumo).

- [ ] **Step 1: Reescrever SystemSection.tsx**

Substituir o conteúdo de `src/components/marketing/v2/SystemSection.tsx` por (mantém a mecânica de foco/hover com framer-motion; troca `<img>` por ícone; usa componente de ícone por item):

```tsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";
import { IconCompass, IconRoad, IconBooks, IconTrophy } from "./icons";

const ITEMS = [
  {
    benefit: "Descubra por onde começar",
    feature: "Diagnóstico Inicial",
    description:
      "Em vez de procurar informações aleatórias, o sistema identifica seu contexto e recomenda a melhor trilha para começar.",
    Icon: IconCompass,
    accent: false,
  },
  {
    benefit: "Aprenda em uma sequência lógica",
    feature: "Roadmap Inteligente",
    description:
      "Cada etapa desbloqueia a próxima para que você evolua sem estudar conteúdos fora do seu momento.",
    Icon: IconRoad,
    accent: true,
  },
  {
    benefit: "Estude no formato que preferir",
    feature: "Biblioteca Multimídia",
    description:
      "Leia, assista ou ouça o mesmo conhecimento em diferentes formatos, mantendo sempre o mesmo objetivo.",
    Icon: IconBooks,
    accent: false,
  },
  {
    benefit: "Acompanhe sua evolução",
    feature: "Progressão + Certificação",
    description:
      "Veja seu progresso crescer ao longo da jornada e valide o conhecimento adquirido ao final da trilha.",
    Icon: IconTrophy,
    accent: true,
  },
];

export default function SystemSection() {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  return (
    <section className="mc-section" id="sistema">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">Por que é diferente</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-system-heading">
            Um sistema,
            <br />
            muito além da leitura isolada
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-system-intro">
            Você não compra apenas conteúdo. Você entra em um sistema pensado
            para levar você do primeiro contato com IA Local até a utilização
            prática, seguindo uma sequência organizada de aprendizado. Cada
            recurso existe para resolver uma etapa da jornada.
          </p>
        </Reveal>

        <div className="mc-system-row">
          {ITEMS.map((item, index) => {
            const isFocused = focusIndex === index;
            const isDimmed = focusIndex !== null && !isFocused;
            const { Icon } = item;

            return (
              <motion.div
                key={item.feature}
                className={`mc-system-card${item.accent ? " is-accent" : ""}`}
                animate={{
                  scale: reduced ? 1 : isFocused ? 1.04 : isDimmed ? 0.97 : 1,
                  opacity: isDimmed ? 0.5 : 1,
                  y: reduced ? 0 : isFocused ? -8 : 0,
                }}
                whileHover={reduced ? undefined : { scale: 1.04, y: -8 }}
                onHoverStart={() => setFocusIndex(index)}
                onHoverEnd={() => setFocusIndex(null)}
                onFocus={() => setFocusIndex(index)}
                onBlur={() => setFocusIndex(null)}
                tabIndex={0}
                transition={{ duration: reduced ? 0 : 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <div className="mc-system-icon-wrap">
                  <Icon className="mc-system-icon" />
                </div>
                <div className="mc-system-card-body">
                  <span className="mc-tag">{item.benefit}</span>
                  <h3 className="mc-display">{item.feature}</h3>
                  <p>{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Ajustar o CSS (foto → ícone + intro)**

Em `src/app/(marketing)/landing-v2.css`, no bloco `.mc-system-*`:
1. REMOVER as regras `.mcv2 .mc-system-image-wrap { aspect-ratio: 16 / 11; overflow: clip; }` e `.mcv2 .mc-system-image { ... }` (foto não existe mais).
2. ADICIONAR no lugar:
```css
.mcv2 .mc-system-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 0 4px;
}
.mcv2 .mc-system-icon {
  width: 40px;
  height: 40px;
  color: var(--mc-accent);
}
.mcv2 .mc-system-card.is-accent .mc-system-icon { color: #fff; }
.mcv2 .mc-system-intro {
  max-width: 620px;
  margin-top: 20px;
  color: var(--mc-gray);
  font-size: 1.05rem;
  line-height: 1.7;
}
```
(O `.mc-system-card` já tem `overflow: clip` e padding no `-card-body`; o ícone fica no topo, texto embaixo — coerente com os cards atuais.)

- [ ] **Step 3: Verificar gate + visual**

Run: `npx tsc --noEmit` → exit 0. `npm run test` → 67 verdes.
Rodar o app; conferir a Seção 2 (`#sistema`): heading nova, intro, 4 cards (Diagnóstico/Roadmap/Biblioteca/Progressão) com ícones violeta (2º e 4º em fundo violeta com ícone branco). No DevTools → Network, confirmar **zero requisições a `images.unsplash.com`**.

- [ ] **Step 4: Commit**

```bash
git add "src/components/marketing/v2/SystemSection.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: Secao 2 vende o metodo (4 cards + icones SVG no lugar de fotos externas)"
```

---

## Task 3: Seção 3 — ContentLibrarySection (vende a experiência)

**Files:**
- Modify: `src/components/marketing/v2/ContentLibrarySection.tsx`
- Modify: `src/app/(marketing)/landing-v2.css`

**Interfaces:**
- Consumes: `CONTENT_HUB, type ContentType` de `@/data/content-hub`; `FormatIcon` de `./icons`; `Reveal` de `./motion-primitives`. (Não usa mais `formatCounts` nesta seção.)
- Produces: `<ContentLibrarySection />` (default export).

- [ ] **Step 1: Reescrever ContentLibrarySection.tsx**

Substituir o conteúdo por:

```tsx
"use client";

import { CONTENT_HUB, type ContentType, type ContentItem } from "@/data/content-hub";
import { Reveal } from "./motion-primitives";
import { FormatIcon } from "./icons";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

const ACTION_LABEL: Record<ContentType, string> = {
  relatorio: "Abrir relatório",
  podcast: "Ouvir podcast",
  video: "Assistir vídeo",
  pesquisa: "Responder pesquisa",
};

/** "em breve" = mesma regra existente: mídia sem embedUrl. Relatório/pesquisa = disponível. */
function isComingSoon(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

export default function ContentLibrarySection() {
  // Disponíveis primeiro, "em breve" depois (sem mutar o array fonte).
  const ordered = [...CONTENT_HUB].sort(
    (a, b) => Number(isComingSoon(a)) - Number(isComingSoon(b))
  );

  return (
    <section className="mc-section" id="central">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">A central</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-library-heading">
            Não é um livro digital.
            <br />
            É uma central colaborativa.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-library-sub">
            A Matriz Central reúne diferentes formatos de conteúdo em um único
            ambiente. Escolha como aprender, continue exatamente de onde parou e
            descubra novos materiais conforme evolui — tudo organizado em um só
            lugar.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mc-library-living">
            <span className="mc-library-living-title mc-mono">Atualizado constantemente</span>
            <p>
              Novos conteúdos entram na plataforma conforme novas pesquisas,
              modelos e ferramentas surgem. Você sempre terá novos materiais
              para continuar evoluindo.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <span className="mc-library-latest-title mc-mono">Últimos conteúdos adicionados</span>
        </Reveal>

        <div className="mc-library-grid">
          {ordered.map((item, index) => {
            const soon = isComingSoon(item);
            return (
              <Reveal key={item.id} delay={0.04 * (index % 4)}>
                <article className="mc-library-card">
                  <div className="mc-library-card-head">
                    <span className="mc-library-badge mc-mono">
                      <FormatIcon type={item.type} className="mc-library-badge-icon" />{" "}
                      {TYPE_LABEL[item.type]}
                    </span>
                    {soon ? (
                      <span className="mc-library-soon mc-mono">em breve</span>
                    ) : (
                      <span className="mc-library-new mc-mono">novo</span>
                    )}
                  </div>
                  <h3 className="mc-library-card-title">{item.title}</h3>
                  <p className="mc-library-card-desc">{item.description}</p>
                  <span className="mc-library-meta mc-mono">
                    {item.durationMinutes} min · +{item.xpReward} XP
                  </span>
                  {!soon && (
                    <a className="mc-library-action mc-mono" href="/oferta">
                      {ACTION_LABEL[item.type]} →
                    </a>
                  )}
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

Nota: `ContentItem` precisa ser exportado por `@/data/content-hub` (já é — `export interface ContentItem`). Confirmar o import.

- [ ] **Step 2: Ajustar o CSS**

Em `src/app/(marketing)/landing-v2.css`:
1. REMOVER o bloco `.mcv2 .mc-library-formats { ... }` e `.mcv2 .mc-library-format b { ... }` e `.mcv2 .mc-library-format-icon { ... }` (o inventário saiu). MANTER `.mc-library-badge-icon` (ainda usado no badge do card).
2. ADICIONAR:
```css
.mcv2 .mc-library-living {
  margin-top: 32px;
  padding: 20px 24px;
  border: 1px solid var(--mc-line);
  border-radius: var(--mc-radius);
  background: rgba(124, 92, 255, 0.05);
  max-width: 620px;
}
.mcv2 .mc-library-living-title { color: var(--mc-accent); }
.mcv2 .mc-library-living p { margin-top: 8px; color: var(--mc-gray); font-size: 0.95rem; line-height: 1.65; }
.mcv2 .mc-library-latest-title {
  display: block;
  margin-top: 48px;
  color: var(--mc-gray);
}
.mcv2 .mc-library-new {
  color: var(--mc-accent);
  font-size: 0.68rem;
  font-weight: 700;
  border: 1px solid rgba(124, 92, 255, 0.4);
  border-radius: 999px;
  padding: 1px 8px;
}
.mcv2 .mc-library-action {
  margin-top: 4px;
  color: var(--mc-accent);
  font-size: 0.72rem;
  text-decoration: none;
  align-self: flex-start;
}
.mcv2 .mc-library-action:hover { text-decoration: underline; }
```
3. Ajustar `.mc-library-grid { margin-top: 40px; ... }` → o `margin-top` pode ir para `24px` já que agora vem logo após o "latest-title" (opcional; verificar visual).

- [ ] **Step 3: Verificar gate + visual**

Run: `npx tsc --noEmit` → exit 0. `npm run test` → 67 verdes.
No navegador, Seção 3 (`#central`): heading "Não é um livro digital. / É uma central colaborativa.", copy de experiência, bloco "Atualizado constantemente", "Últimos conteúdos adicionados", cards premium. Conferir: **selo "novo"** nos 2 relatórios + pesquisa (aparecem PRIMEIRO), **"em breve"** nos 4 podcasts + 2 vídeos (depois), fascinations no lugar das descrições antigas, e a ação "Abrir relatório →"/"Responder pesquisa →" só nos disponíveis.

- [ ] **Step 4: Commit**

```bash
git add "src/components/marketing/v2/ContentLibrarySection.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: Secao 3 vende a experiencia (bloco vivo + cards premium NOVO/em breve)"
```

---

## Task 4: Polish e verificação integrada

**Files:**
- Modify: ajustes finos em `landing-v2.css` conforme revisão visual.

- [ ] **Step 1: Gate completo**

Run: `npx tsc --noEmit` → exit 0. `npm run test` → 67 verdes.

- [ ] **Step 2: Revisão visual integrada (navegador)**

Com `npm run dev -- -p 3000`, numa passada:
- Seção 2: 4 cards de método com ícones (sem foto), intro, heading nova. **Network sem `images.unsplash.com`.**
- Seção 3: bloco vivo, cards premium, selo novo/em breve, ordenação disponíveis-primeiro, fascinations, ação nos disponíveis.
- Responsividade: reduzir a janela; grids de sistema (4→2→1) e biblioteca (3→2→1) colapsam sem quebrar.
- Confirmar que as duas seções agora contam histórias diferentes (método vs experiência), sem repetição.

- [ ] **Step 3: Commit de ajustes (se houver)**

```bash
git add -A
git commit -m "polish: ajustes finais das secoes metodo/experiencia"
```

---

## Self-Review (autor do plano)

- **Cobertura do spec:** Seção 2 método (Task 2) ✓; Seção 3 experiência (Task 3) ✓; fascinations globais (Task 1) ✓; foto→ícone / custo zero (Task 2) ✓; bloco "atualizado constantemente" (Task 3) ✓; "últimos conteúdos" + cards premium + NOVO (Task 3) ✓; NOVO=!comingSoon, ordenação disponíveis-primeiro (Task 3) ✓; headings exatas do usuário (Tasks 2,3) ✓; `formatCounts` preservada (Task 3 não a remove) ✓.
- **Consistência de tipos:** `isComingSoon(item: ContentItem): boolean` definido e usado em Task 3; `ContentItem` importado de `@/data/content-hub` (export existente); `FormatIcon`/ícones já existem em `icons.tsx`.
- **Sem placeholders:** todo passo tem código/tabela real.
- **Risco:** Task 1 muda `description` global (afeta dashboard) — decisão explícita do usuário. Nenhum teste asserta `description` (verificado: `content-stats.test.ts` só checa contagem/label).
