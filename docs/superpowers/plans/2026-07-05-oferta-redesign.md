# Redesign da /oferta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o fundo da /oferta (starfield deve ser fundo fixo, não uma seção que empurra o conteúdo), trazer os 3 planos para a primeira dobra, reescrever os 3 tiers com o conteúdo detalhado e reposicionar o R$47 como "diagnóstico + plano de ação + fim das assinaturas" em vez de "comprar um ebook".

**Architecture:** Ajustes na página `/oferta` (`src/app/(marketing)/oferta/page.tsx`), no componente de preços (`src/components/marketing/OfferPricing.tsx`) e no bloco `.mc-oferta*` de `landing-v2.css`. Correção pontual de especificidade CSS + reescrita de copy/estrutura. Zero dependências novas.

**Tech Stack:** Next.js 14.2 (App Router), React 18, TypeScript, CSS (`landing-v2.css`/`landing-clone.css`), vitest 4 (`node`).

## Global Constraints

- **Custo zero:** sem dependências npm novas, sem assets externos.
- **Escopo:** só `/oferta` (page + `OfferPricing` + bloco `.mc-oferta*`). NÃO tocar na landing `/` nem no `/checkout`.
- **Honestidade:** Assinatura Mensal (`mensal_97`) e Acesso Total (`anual_497`) seguem "Em breve"/waitlist; só o Ebook Avulso tem checkout real. Não prometer compra inexistente.
- **Copy:** português do Brasil.
- **Gate por task:** `npx tsc --noEmit` (exit 0) + `npm run test`. NÃO usar `npm run build` (falha pré-existente em `/api/checkout`).

---

## File Structure

- Modify `src/app/(marketing)/landing-v2.css` — corrigir override do starfield + tighten da intro.
- Modify `src/components/marketing/OfferPricing.tsx` — reescrever os 3 tiers.
- Modify `src/app/(marketing)/oferta/page.tsx` — reframe da intro (posicionamento) + classe na section.

---

## Task 1: Starfield como fundo fixo (corrige o bug de layout)

**Files:**
- Modify: `src/app/(marketing)/landing-v2.css` (bloco `.mc-oferta*`, ~linhas 774-813)

**Interfaces:**
- Consumes: nada.
- Produces: nenhum export novo. Efeito: `.mc-oferta-starfield` volta a ser `position: fixed` (fundo real).

**Contexto do bug:** `.mc-oferta-wrapper > * { position: relative; z-index: 1 }` (linha 795) tem a mesma especificidade que `.mc-oferta-starfield { position: fixed }` (linha 789) e vem depois, então o canvas vira um bloco de ~897px no topo. A correção exclui o starfield dessa regra.

- [ ] **Step 1: Excluir o starfield da regra de posicionamento relativo**

Em `src/app/(marketing)/landing-v2.css`, substituir:

```css
.mc-oferta-wrapper > * {
  position: relative;
  z-index: 1;
}
```

por:

```css
.mc-oferta-wrapper {
  overflow-x: clip;
}
.mc-oferta-wrapper > *:not(.mc-oferta-starfield) {
  position: relative;
  z-index: 1;
}
```

(A `:not(.mc-oferta-starfield)` deixa o canvas manter seu `position: fixed`; o `overflow-x: clip` no wrapper elimina o scroll lateral residual.)

- [ ] **Step 2: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam (65).

Verificação visual (controlador, via app em `/oferta`): o starfield agora é `position: fixed` (não ocupa espaço no fluxo); a primeira dobra já mostra o header + intro + topo dos planos, sem uma tela inteira só de estrelas; sem scroll horizontal.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/landing-v2.css"
git commit -m "fix: starfield da /oferta volta a ser fundo fixo (nao empurra conteudo)"
```

---

## Task 2: Reescrever os 3 tiers de preço

**Files:**
- Modify: `src/components/marketing/OfferPricing.tsx` (o `default export function OfferPricing`, bloco `.plans-grid`, linhas 118-193)

**Interfaces:**
- Consumes: `EbookAvulsoCheckout`, `WaitlistForm` (já definidos no mesmo arquivo; planIds `mensal_97` e `anual_497` inalterados).
- Produces: nenhum export novo. Só muda o conteúdo dos 3 cards.

- [ ] **Step 1: Substituir o corpo do OfferPricing**

Em `src/components/marketing/OfferPricing.tsx`, substituir toda a função `export default function OfferPricing() { ... }` (linhas 118-195) por:

```tsx
export default function OfferPricing() {
  return (
    <div>
      <div className="plans-grid">
        <div className="plan">
          <h3>Start</h3>
          <div className="price">
            <b>R$47</b>
            <small>
              pagamento único
              <br />
              você vira dono da sua IA
            </small>
          </div>
          <EbookAvulsoCheckout />
          <ul>
            <li>1 ebook completo com todos os capítulos sobre rodar LLMs localmente</li>
            <li>Passo a passo de instalação e uso dos modelos</li>
            <li>Avaliação de qual o melhor modelo para o seu objetivo</li>
            <li>Triagem de perfil + roadmap personalizado — indica o melhor plano para assinar</li>
            <li>1 cupom de R$47 para migrar para a assinatura ou o acesso total</li>
            <li>Garantia de 7 dias — não gostou, devolvemos</li>
          </ul>
          <span className="foot">
            Por R$47, uma vez: um diagnóstico, um plano de ação e o fim das mensalidades.
          </span>
        </div>

        <div className="plan">
          <span className="plan-badge-soon mono">Em breve</span>
          <h3 style={{ marginTop: 20 }}>Regular</h3>
          <div className="price">
            <b>R$97</b>
            <small>
              pagamento único
              <br />
              acesso por 12 meses
            </small>
          </div>
          <WaitlistForm planId="mensal_97" />
          <ul>
            <li>Todos os benefícios do Start</li>
            <li>Acesso ao hub/portal por 12 meses</li>
            <li>1 benefício liberado por mês, você escolhe: um podcast, um relatório, uma apresentação ou uma pesquisa</li>
            <li>Cancela quando quiser — o reembolso segue as mesmas condições do Start (ver termos)</li>
          </ul>
          <span className="foot">Pra quem quer estudar no seu ritmo, sem assinatura</span>
        </div>

        <div className="plan recommended">
          <span className="plan-badge-soon mono">Em breve</span>
          <span className="plan-tag mono plan-tag-hot">Mais procurado</span>
          <h3 style={{ marginTop: 20 }}>Advanced</h3>
          <div className="price">
            <b>
              <span style={{ fontSize: "0.5em", fontWeight: 400, verticalAlign: "middle" }}>12x</span> R$47
            </b>
            <small>
              ou R$497 à vista
              <br />
              acesso completo 12 meses
            </small>
          </div>
          <WaitlistForm planId="anual_497" />
          <ul>
            <li>Acesso completo à plataforma</li>
            <li>Todos os ebooks lançados durante os 12 meses</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Gamificação de perfil para medir a profundidade do seu aprendizado</li>
            <li>Hub completo: relatórios, podcasts, pesquisas, apresentações, conteúdo personalizado e avaliação de novas ferramentas</li>
            <li>≈ R$19 por ebook — o mais barato do catálogo (2 lançamentos por mês)</li>
          </ul>
          <span className="foot">Pra quem já sabe que vai estudar o ano inteiro</span>
        </div>
      </div>

      <p className="plan-note" style={{ maxWidth: 640, margin: "24px auto 0" }}>
        Funciona sem placa de vídeo dedicada? Sim — o capítulo sobre Ollama e
        quantização mostra modelos que rodam só na CPU, incluindo em notebooks
        comuns.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): os 3 cards mostram o novo conteúdo (Ebook Avulso com garantia de 7 dias, cupom e roadmap; Mensal com "todos os benefícios do avulso" + hub; Acesso Total com gamificação, apresentações e ≈R$19/ebook). O botão "Comprar agora" do Ebook Avulso segue funcionando (checkout real).

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/OfferPricing.tsx
git commit -m "feat: reescreve os 3 tiers da /oferta com o conteudo detalhado"
```

---

## Task 3: Reframe da intro (posicionamento) + planos na primeira dobra

**Files:**
- Modify: `src/app/(marketing)/oferta/page.tsx` (a `<section>` e o `.sec-head`)
- Modify: `src/app/(marketing)/landing-v2.css` (adicionar `.mc-oferta-intro` no bloco `.mc-oferta*`)

**Interfaces:**
- Consumes: nada novo.
- Produces: nenhum export novo. `OfferPricing` (Task 2) permanece o mesmo componente renderizado.

- [ ] **Step 1: Reescrever a intro da página**

Em `src/app/(marketing)/oferta/page.tsx`, substituir o `<section>` inteiro (da abertura `<section>` até `</section>`) por:

```tsx
      <section className="mc-oferta-intro">
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag mono">
                <i>✦</i> Escolha seu plano
              </span>
              <h2>Deixe de alugar inteligência — comece a ser dono dela</h2>
            </div>
            <div className="aside">
              Por R$47, uma vez, você recebe um diagnóstico e um plano de ação — e
              para de pagar mensalidade. Sua IA roda no seu computador, offline,
              com privacidade e sem depender de modelos restritos.
            </div>
          </div>

          <OfferPricing />
        </div>
      </section>
```

- [ ] **Step 2: Compactar o topo da intro no CSS**

Em `src/app/(marketing)/landing-v2.css`, dentro do bloco `.mc-oferta*` (logo após a regra `.mc-oferta-wrapper > *:not(...)`), adicionar:

```css
.mc-oferta-wrapper .mc-oferta-intro {
  padding: 40px 0 72px;
}
```

(Deixa o topo compacto para o `.plans-grid` entrar na primeira dobra, agora que o starfield não empurra mais o conteúdo.)

- [ ] **Step 3: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): a intro comunica independência ("deixe de alugar inteligência…", subtítulo sobre R$47 = diagnóstico + plano + fim das assinaturas + offline/privacidade); o topo dos 3 planos aparece dentro da primeira dobra (top do `.plans-grid` < altura da viewport).

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/oferta/page.tsx" "src/app/(marketing)/landing-v2.css"
git commit -m "feat: intro da /oferta reposiciona R$47 (diagnostico + fim das assinaturas) e planos no topo"
```

---

## Task 4: Tag "Mais procurado" com fonte RGB animada (cores quentes)

**Files:**
- Modify: `src/app/(marketing)/landing-clone.css` (adicionar `.plan-tag-hot` junto às regras `.lp-guide .plan-tag`)

**Interfaces:**
- Consumes: a classe `plan-tag-hot` aplicada no card recomendado (Task 2 já renderiza `<span className="plan-tag mono plan-tag-hot">Mais procurado</span>`).
- Produces: nenhum export novo.

**Contexto:** o `.plan-tag` do plano recomendado já é estilizado em `landing-clone.css` (`.lp-guide .plan-tag`, ~linha perto de `.plan-tag`). A Task 2 troca o texto para "Mais procurado" e adiciona a classe `plan-tag-hot`. Esta task dá a ela uma fonte com cores quentes que trocam continuamente (efeito "RGB" quente), via gradiente animado recortado no texto. Respeita `prefers-reduced-motion` (gradiente estático).

- [ ] **Step 1: Adicionar o CSS da tag animada**

Em `src/app/(marketing)/landing-clone.css`, no fim do arquivo, adicionar:

```css
/* Tag "Mais procurado" — fonte em cores quentes que trocam continuamente */
.lp-guide .plan-tag.plan-tag-hot {
  background: linear-gradient(
    90deg,
    #ff3d3d, #ff7a1a, #ffc21a, #ff5e8a, #ff3d3d
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  font-weight: 700;
  animation: mc-hot-shift 4s linear infinite;
}
@keyframes mc-hot-shift {
  to { background-position: 200% center; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-guide .plan-tag.plan-tag-hot { animation: none; }
}
```

- [ ] **Step 2: Verificar o gate**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npm run test`
Expected: todos os testes passam.

Verificação visual (controlador): a tag do plano "Acesso Total 12 Meses" mostra "Mais procurado" com as letras trocando entre tons quentes (vermelho → laranja → âmbar → rosa) num loop suave; com `prefers-reduced-motion`, fica estática.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(marketing)/landing-clone.css"
git commit -m "feat: tag Mais procurado com fonte RGB quente animada na /oferta"
```

---

## Self-Review

**1. Cobertura do spec:**
- Frente A (starfield fundo fixo + overflow-x) → Task 1. ✅
- Frente B (planos na primeira dobra) → Task 1 (remove os 897px) + Task 3 (intro compacta). ✅
- Frente C (reescrever os 3 tiers) → Task 2. ✅
- Frente D (reposicionamento do R$47) → Task 3 (intro) + Task 2 (foot do Ebook Avulso). ✅
- Honestidade (mensal/anual "Em breve"/waitlist) → mantida na Task 2 (badges + WaitlistForm + planIds inalterados). ✅
- Cupom/garantia como copy (fora de escopo a mecânica) → Task 2 (bullets do Ebook Avulso). ✅

**2. Placeholders:** nenhum — todo passo traz código completo e comandos com saída esperada.

**3. Consistência de tipos:** `EbookAvulsoCheckout`/`WaitlistForm` e planIds (`mensal_97`, `anual_497`) usados na Task 2 são exatamente os já definidos em `OfferPricing.tsx`. A classe `.mc-oferta-intro` criada na Task 3 (page) casa com a regra CSS da Task 3. A correção `:not(.mc-oferta-starfield)` (Task 1) referencia a classe real do canvas (`Starfield.tsx` renderiza `className="mc-oferta-starfield"`).

**Ordem de dependências:** Task 1 primeiro (corrige o layout base). Tasks 2 e 3 independentes entre si; ambas tocam arquivos distintos (Task 2 = OfferPricing; Task 3 = page + CSS intro), sem colisão com a Task 1 (bloco CSS diferente).
