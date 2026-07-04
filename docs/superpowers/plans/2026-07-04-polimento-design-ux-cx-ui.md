# Polimento de Design, UX, CX e UI — Landing + Oferta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os achados de uma auditoria em 4 frentes (Design Visual, UX, CX/Persuasão, UI/Acessibilidade) sobre `http://localhost:3000/` (landing) e `http://localhost:3000/oferta` (página de oferta), priorizando bugs de conversão/acessibilidade e depois copy/design.

**Architecture:** Mudanças pontuais em componentes de `src/components/marketing/` e no CSS escopado `src/app/(marketing)/landing-clone.css`. Um componente novo (`NetworkMotif`) e um favicon novo. Sem mudança de schema/backend.

**Tech Stack:** Next.js 14 (App Router), TypeScript, CSS puro escopado (`.lp-guide`).

## Global Constraints

- Cor primária: violeta (`--accent: #7c3aed`), sem introduzir cor de marca nova.
- Nenhum dado fabricado: sem prova social falsa (o achado do badge "Mais escolhido" deve virar uma afirmação verificável, não uma alegação sobre outros compradores).
- Honestidade sobre disponibilidade: os planos R$97/R$497 são "em breve" (lista de espera) — isso deve estar visível ANTES do clique, não só na página de oferta.
- Contraste de texto deve atingir WCAG AA (4.5:1 para texto normal) nos elementos tocados por este plano.
- A garantia de 30 dias (`refundWindowExpiry`, `src/lib/tokens.ts:16`) é uma feature REAL já implementada no backend — pode ser anunciada honestamente na copy.
- Fora de escopo desta rodada (adiado, não esquecido): unificação do design system entre a landing (`.lp-guide`) e o hub de conteúdo do dashboard (`GlassCard`/Tailwind); codificação por cor das categorias de feature; reforço tipográfico mono nos números de preço/XP. Documentado aqui para não parecer lacuna esquecida.
- Auditoria completa que originou este plano: 4 agentes (Design/UX/CX/UI-Acessibilidade) nesta sessão, navegando o site ao vivo via Playwright.

---

## Task 1: CSS — responsividade mobile e acessibilidade (contraste + foco)

**Files:**
- Modify: `src/app/(marketing)/landing-clone.css`

**Interfaces:** nenhuma — só CSS, sem mudança de markup/props.

**Contexto do gap:** achado UI#1 (crítico): `.plans-grid` nunca colapsa em mobile — o media query `@media (max-width:900px)` trata `.cards`/`.chart-feats`/`.demo-body`/`.sec-head` mas esqueceu `.plans-grid`, deixando a página de oferta com overflow horizontal em celular. Achados UI#2/UI#3: `--ink-mute` (3.45:1) e `.plan .foot` sobre o gradiente do card recomendado (3.77:1) ficam abaixo do mínimo WCAG AA (4.5:1). Achados UI#4/UI#9: inputs e botões só mudam cor de borda no foco, sem indicador robusto pra quem navega por teclado.

- [ ] **Step 1: Corrigir contraste de `--ink-mute`**

Em `src/app/(marketing)/landing-clone.css`, na declaração de variáveis (linha 9), troque:
```css
  --ink-mute: #8a8a8a;
```
por:
```css
  --ink-mute: #6b6b6b;
```

- [ ] **Step 2: Corrigir contraste do texto `.plan .foot` sobre o gradiente**

Localize o bloco (por volta da linha 637):
```css
.lp-guide .plan .foot {
  margin-top: 20px;
  font-size: 12px;
  color: #4c1d95;
  text-align: center;
}
```
Substitua por:
```css
.lp-guide .plan .foot {
  margin-top: 20px;
  font-size: 12px;
  color: #2a1155;
  text-align: center;
}
```

- [ ] **Step 3: Adicionar foco visível robusto em inputs**

Localize (por volta da linha 174):
```css
.lp-guide .email-input:focus {
  border-color: var(--accent);
}
```
Substitua por:
```css
.lp-guide .email-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
```

Localize (por volta da linha 566):
```css
.lp-guide .waitlist-form input:focus {
  border-color: var(--accent);
}
```
Substitua por:
```css
.lp-guide .waitlist-form input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
```

- [ ] **Step 4: Adicionar foco visível em botões, tabs e pills**

Logo após o bloco `.lp-guide .btn:disabled` (por volta da linha 113), adicione:
```css
.lp-guide .btn:focus-visible,
.lp-guide .tab:focus-visible,
.lp-guide .pill:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 5: Corrigir grid de planos no mobile (fix crítico)**

Localize o bloco de responsivo (final do arquivo, por volta da linha 689):
```css
@media (max-width: 900px) {
  .lp-guide .nav-links {
    display: none;
  }
  .lp-guide .demo-body {
    grid-template-columns: 1fr;
  }
  .lp-guide .sec-head {
    grid-template-columns: 1fr;
  }
  .lp-guide .cards,
  .lp-guide .chart-feats {
    grid-template-columns: 1fr;
  }
}
```
Substitua por:
```css
@media (max-width: 900px) {
  .lp-guide .nav-links {
    display: none;
  }
  .lp-guide .demo-body {
    grid-template-columns: 1fr;
  }
  .lp-guide .sec-head {
    grid-template-columns: 1fr;
  }
  .lp-guide .cards,
  .lp-guide .chart-feats,
  .lp-guide .plans-grid {
    grid-template-columns: 1fr;
  }
  .lp-guide .plan.recommended {
    transform: none;
  }
}
```

- [ ] **Step 6: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros (é só CSS, não deve haver nenhum, mas confirme que nada mais quebrou).

- [ ] **Step 7: Verificar visualmente**

Com `npm run dev` rodando, abra `http://localhost:3000/oferta` e redimensione a janela do navegador para 390px de largura — confirme que os 3 cards de plano empilham verticalmente (não ficam mais cortados/lado a lado). Pressione Tab repetidamente na página e confirme que os inputs de e-mail mostram um anel de foco visível (não só troca de cor de borda).

- [ ] **Step 8: Commit**

```bash
git add "src/app/(marketing)/landing-clone.css"
git commit -m "fix: corrige grid de planos no mobile e contraste/foco de acessibilidade"
```

---

## Task 2: Header — CTA contextual em /oferta + menu mobile (hambúrguer)

**Files:**
- Modify: `src/components/marketing/Header.tsx` (arquivo inteiro)
- Modify: `src/app/(marketing)/oferta/page.tsx`
- Modify: `src/app/(marketing)/landing-clone.css`

**Interfaces:**
- Produces: `Header({ ctaLabel, ctaHref }?: { ctaLabel?: string; ctaHref?: string }): JSX.Element` — client component agora (antes era server component sem props). Usado por `src/app/(marketing)/page.tsx` (sem props, usa defaults) e `src/app/(marketing)/oferta/page.tsx` (com props customizadas).

**Contexto do gap:** achado Design#11/UX#7: o CTA "Ver preço" do header, em `/oferta`, aponta pra própria página onde o usuário já está — link sem efeito, no slot mais visível do header. Achados UX#2/UI#5: `.nav-links` (Features/Preço) somem abaixo de 900px sem nenhum menu alternativo — visitante em tablet/mobile perde acesso à navegação.

- [ ] **Step 1: Reescrever `Header.tsx` com props e menu mobile**

Replace o conteúdo de `src/components/marketing/Header.tsx`:
```tsx
"use client";

import { useState } from "react";

interface HeaderProps {
  ctaLabel?: string;
  ctaHref?: string;
}

export default function Header({ ctaLabel = "Ver preço", ctaHref = "/oferta" }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="container nav">
        <span className="logo">
          Matriz<span>/</span>Central
        </span>
        <ul className="nav-links">
          <li>
            <a href="/#features">Features</a>
          </li>
          <li>
            <a href="/#preco">Preço</a>
          </li>
        </ul>
        <div className="nav-actions">
          <a className="btn btn-accent nav-cta-desktop" href={ctaHref}>
            {ctaLabel}
          </a>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <div className="nav-mobile-panel">
          <a href="/#features" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="/#preco" onClick={() => setOpen(false)}>
            Preço
          </a>
          <a className="btn btn-accent" href={ctaHref} onClick={() => setOpen(false)}>
            {ctaLabel}
          </a>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 2: Passar CTA contextual em `/oferta`**

Em `src/app/(marketing)/oferta/page.tsx`, troque:
```tsx
      <Header />
```
por:
```tsx
      <Header ctaLabel="Voltar para o início" ctaHref="/" />
```

- [ ] **Step 3: Adicionar CSS do menu mobile**

Em `src/app/(marketing)/landing-clone.css`, logo após o bloco `.lp-guide .btn:disabled` (por volta da linha 113, considerando os adicionais da Task 1 acima dele), adicione:
```css
.lp-guide .nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lp-guide .nav-toggle {
  display: none;
  background: none;
  border: 1px solid var(--line);
  border-radius: 10px;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
}
.lp-guide .nav-mobile-panel {
  display: none;
}
```

No bloco `@media (max-width: 900px)` (final do arquivo, já com os ajustes da Task 1), adicione estas regras dentro do mesmo bloco:
```css
  .lp-guide .nav-cta-desktop {
    display: none;
  }
  .lp-guide .nav-toggle {
    display: flex;
  }
  .lp-guide .nav-mobile-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 32px 20px;
    border-top: 1px solid var(--line);
    background: #fff;
  }
  .lp-guide .nav-mobile-panel a {
    padding: 10px 0;
    color: var(--ink);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }
  .lp-guide .nav-mobile-panel .btn {
    margin-top: 8px;
    justify-content: center;
  }
```

Note: o resultado final do bloco `@media (max-width: 900px)` deve conter TODAS as regras já existentes (da Task 1) MAIS estas novas — não substitua, adicione dentro do mesmo bloco.

- [ ] **Step 4: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Verificar visualmente**

Com `npm run dev` rodando: abra `http://localhost:3000/oferta` — o botão do header deve dizer "Voltar para o início" e apontar pra `/`. Redimensione pra 390px em `http://localhost:3000/` — os links "Features"/"Preço" devem sumir e um botão ☰ deve aparecer; clique nele e confirme que abre um painel com os links + o CTA, e que clicar num link fecha o painel.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/Header.tsx "src/app/(marketing)/oferta/page.tsx" "src/app/(marketing)/landing-clone.css"
git commit -m "feat: cta contextual do header em /oferta + menu mobile hamburguer"
```

---

## Task 3: Oferta — validação de e-mail, badges consistentes, hierarquia de destaque e objeção de hardware

**Files:**
- Modify: `src/components/marketing/OfferPricing.tsx` (arquivo inteiro)
- Modify: `src/app/(marketing)/landing-clone.css`

**Interfaces:** nenhuma nova — `OfferPricing(): JSX.Element` continua sem props.

**Contexto do gap:** achado UX#4/UX#5: nenhum formulário valida formato de e-mail, e o formulário de lista de espera falha silenciosamente quando o campo está vazio (diferente do checkout, que mostra erro). Achados Design#6/CX#1/CX#2/Design#9: o badge "Mais escolhido" é uma alegação de prova social sobre um plano que ninguém ainda comprou (só captura e-mail); falta o selo "Em breve" no card anual; os 3 cards têm pesos visuais quase idênticos (2 gradientes competindo), deixando o card avulso "órfão" ao lado. Achados CX#4/CX#5/CX#6/CX#7: os bullets não são paralelos entre os planos (difícil comparar o que muda), falta a conta explícita de custo por ebook no plano anual, falta resposta à objeção mais óbvia do público ("funciona sem GPU?"), e falta uma garantia/redução de risco no único plano que vende de verdade hoje — mas existe uma garantia real de 30 dias já implementada no backend (`refundWindowExpiry`, `src/lib/tokens.ts:16`) que pode ser anunciada.

- [ ] **Step 1: Reescrever `OfferPricing.tsx`**

Replace o conteúdo de `src/components/marketing/OfferPricing.tsx`:
```tsx
"use client";

import { useState } from "react";
import type { WaitlistPlanId } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function WaitlistForm({ planId }: { planId: WaitlistPlanId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setValidationError("Informe seu e-mail para continuar.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setValidationError("Informe um e-mail válido.");
      return;
    }
    setValidationError(null);
    setStatus("loading");

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, planId }),
    });

    setStatus(response.ok ? "done" : "error");
  };

  if (status === "done") {
    return <p className="waitlist-done">✓ Anotado! Avisamos assim que abrir.</p>;
  }

  return (
    <div>
      <div className="waitlist-form">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="button" className="btn btn-ghost" onClick={handleSubmit} disabled={status === "loading"}>
          {status === "loading" ? "..." : "Avise-me"}
        </button>
      </div>
      {validationError && <p className="hero-error">{validationError}</p>}
      {status === "error" && <p className="hero-error">Não deu certo, tenta de novo.</p>}
    </div>
  );
}

function EbookAvulsoCheckout() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!email) {
      setError("Informe seu e-mail para continuar.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      setLoading(false);
      setError("Não foi possível iniciar o checkout. Tente novamente.");
      return;
    }

    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div>
      <div className="waitlist-form">
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn-dark"
        style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Redirecionando..." : "Comprar agora"}
      </button>
      {error && (
        <p className="hero-error" style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function OfferPricing() {
  return (
    <div>
      <div className="plans-grid">
        <div className="plan">
          <h3>Ebook Avulso</h3>
          <div className="price">
            <b>R$47</b>
            <small>
              pagamento único
              <br />
              1 ebook completo
            </small>
          </div>
          <EbookAvulsoCheckout />
          <ul>
            <li>Ebook completo (9 capítulos) sobre rodar LLMs localmente</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Garantia de 30 dias — não gostou, devolvemos</li>
          </ul>
          <span className="foot">Ideal pra testar antes de assinar</span>
        </div>

        <div className="plan">
          <span className="plan-badge-soon mono">Em breve</span>
          <h3 style={{ marginTop: 20 }}>Assinatura Mensal</h3>
          <div className="price">
            <b>R$97</b>
            <small>
              por mês
              <br />
              1 ebook novo/mês
            </small>
          </div>
          <WaitlistForm planId="mensal_97" />
          <ul>
            <li>1 ebook novo por mês — 12 no ano</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Acesso ao hub de conteúdo (relatórios, podcasts, pesquisas)</li>
            <li>Cancela quando quiser</li>
          </ul>
          <span className="foot">Pra quem quer estudar todo mês, sem compromisso longo</span>
        </div>

        <div className="plan recommended">
          <span className="plan-badge-soon mono">Em breve</span>
          <span className="plan-tag mono">Melhor custo por ebook</span>
          <h3 style={{ marginTop: 20 }}>Acesso Total 12 Meses</h3>
          <div className="price">
            <b>R$497</b>
            <small>
              à vista ou 12x R$47
              <br />
              acesso completo 12 meses
            </small>
          </div>
          <WaitlistForm planId="anual_497" />
          <ul>
            <li>Todos os ebooks lançados durante os 12 meses</li>
            <li>Triagem de perfil + roadmap personalizado</li>
            <li>Quiz de validação com certificado de conclusão</li>
            <li>Hub de conteúdo completo (relatórios, podcasts, pesquisas)</li>
            <li>≈ R$41 por ebook — o mais barato do catálogo</li>
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

Note: o card "Assinatura Mensal" muda de `className="plan gradient"` para `className="plan"` (fundo branco liso, igual ao Avulso) — isso resolve dois achados ao mesmo tempo: o card recomendado (Anual) deixa de competir visualmente com um gradiente vizinho igual, e o card Avulso deixa de parecer "órfão" ao lado de dois cards gradiente (agora só 1 dos 3 tem tratamento elevado).

- [ ] **Step 2: Adicionar CSS do "carimbo" centralizado no badge do card recomendado**

Em `src/app/(marketing)/landing-clone.css`, logo após o bloco `.lp-guide .plan.recommended {...}` (por volta da linha 532), adicione:
```css
.lp-guide .plan.recommended .plan-tag {
  left: 50%;
  right: auto;
  top: -14px;
  transform: translateX(-50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificar visualmente**

Abra `http://localhost:3000/oferta`: o card "Assinatura Mensal" deve estar branco liso (igual ao Avulso), só o "Acesso Total 12 Meses" deve ter o gradiente roxo elevado, com o selo "Melhor custo por ebook" centralizado no topo do card (parecendo um carimbo) e "Em breve" no canto. Teste os formulários: clique em "Avise-me" sem preencher e-mail (deve mostrar erro), digite "abc" sem @ e tente enviar (deve mostrar "Informe um e-mail válido."), repita no campo do Ebook Avulso.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/OfferPricing.tsx "src/app/(marketing)/landing-clone.css"
git commit -m "fix: valida e-mail nos formularios de oferta e corrige hierarquia/badges dos planos"
```

---

## Task 4: Copy honesta e consistente — Hero, PricingSection, FinalCta, FeaturesGrid

**Files:**
- Modify: `src/components/marketing/Hero.tsx` (arquivo inteiro)
- Modify: `src/components/marketing/PricingSection.tsx` (arquivo inteiro)
- Modify: `src/components/marketing/FinalCta.tsx` (arquivo inteiro)
- Modify: `src/components/marketing/FeaturesGrid.tsx` (só a descrição do item "Pesquisa com a Comunidade")

**Interfaces:** nenhuma mudança de assinatura — os 4 componentes continuam sem props.

**Contexto do gap:** achado CX#3: o H1 promete "Poucos Minutos" mas o parágrafo logo abaixo (`.hero-note`) promete "menos de uma hora" — inconsistência de claim que gera desconfiança em público técnico. Achado CX#9: "o guia definitivo" é frase genérica intercambiável com qualquer produto de IA. Achado CX#8: a dor do público (custo de APIs de nuvem) não é nomeada antes da solução. Achado UX#3: a landing promete "planos disponíveis em /oferta", mas ao chegar lá o usuário descobre que só o avulso vende de verdade — sensação de isca-e-troca. Achado CX#10: "Comece Sua Trilha de Estudo Hoje" usa a palavra "Hoje" sugerindo urgência sem nenhum motivo real declarado. Achado CX#11: a copy da pesquisa comunitária pressupõe volume de respostas que pode não existir ainda no lançamento.

- [ ] **Step 1: Reescrever `Hero.tsx`**

Replace o conteúdo de `src/components/marketing/Hero.tsx`:
```tsx
import DemoWidget from "@/components/marketing/DemoWidget";

export default function Hero() {
  return (
    <div className="container hero" id="hero">
      <span className="badge mono">
        <i>✦</i> Para quem quer dominar IA — programando ou não
      </span>
      <h1>Construa Seu Próprio ChatGPT Particular em Menos de uma Hora</h1>
      <p>
        Cansado de pagar mensalidade em ChatGPT Plus ou Claude Pro pra um
        serviço que pode mudar de preço ou sair do ar? Este ebook mostra como
        rodar sua própria IA local — sem mensalidade, sem depender da nuvem
        e sem precisar ser especialista.
      </p>

      <div className="hero-cta">
        <a className="btn btn-accent" href="/oferta">
          Quero por R$47
        </a>
        <a className="btn btn-ghost" href="#features">
          Ver o que você recebe
        </a>
      </div>

      <p className="hero-note">
        Pare de Pagar por IA — Monte sua própria IA Local, sem depender de
        mensalidade ou nuvem.
      </p>

      <DemoWidget />
    </div>
  );
}
```

- [ ] **Step 2: Reescrever `PricingSection.tsx`**

Replace o conteúdo de `src/components/marketing/PricingSection.tsx`:
```tsx
const FEATURES: string[] = [
  "Ebook completo (9 capítulos) sobre rodar LLMs localmente",
  "Triagem de perfil personalizada",
  "Roadmap de estudo sob medida para o seu perfil",
  "Quiz de validação com certificado de conclusão",
];

export default function PricingSection() {
  return (
    <section className="pricing" id="preco">
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag mono">
              <i>✦</i> Preço simples
            </span>
            <h2>A partir de R$47, sem mensalidade</h2>
          </div>
          <div className="aside">
            Comece com o ebook avulso, disponível agora. Os planos com mais
            ebooks e acesso completo já têm lista de espera aberta em /oferta.
          </div>
        </div>

        <div className="plan-single">
          <div className="plan gradient">
            <span className="plan-tag mono">A partir de</span>
            <h3>Ebook Avulso</h3>
            <div className="price">
              <b>R$47</b>
              <small>
                pagamento único
                <br />
                1 ebook completo
              </small>
            </div>
            <a className="btn btn-dark" href="/oferta">
              Ver todos os planos
            </a>
            <ul>
              {FEATURES.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <span className="foot">
              Planos mensal e anual (em breve) com mais ebooks — veja em /oferta
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Reescrever `FinalCta.tsx`**

Replace o conteúdo de `src/components/marketing/FinalCta.tsx`:
```tsx
export default function FinalCta() {
  return (
    <div className="container">
      <div className="cta">
        <h2>Comece Sua Trilha de Estudo</h2>
        <p>
          Descubra seu perfil, siga um roadmap sob medida e valide o que
          aprendeu com um certificado verificável.
        </p>
        <a className="btn btn-accent" href="/oferta">
          Quero por R$47
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Ajustar a descrição da "Pesquisa com a Comunidade" em `FeaturesGrid.tsx`**

Em `src/components/marketing/FeaturesGrid.tsx`, localize o item do array `FEATURES` com `title: "Pesquisa com a Comunidade"` e troque a linha:
```tsx
    description:
      "Responda em segundos e veja o que o resto da comunidade está usando — sem enrolação, dado real.",
```
por:
```tsx
    description:
      "Responda em segundos e acompanhe os dados da comunidade crescendo em tempo real.",
```

- [ ] **Step 5: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 6: Verificar visualmente**

Abra `http://localhost:3000/` — confirme que o H1 e a nota abaixo dele não prometem mais tempos diferentes (ambos "menos de uma hora" ou nenhuma menção conflitante), que a seção de preço menciona "(em breve)" pros planos maiores, e que a seção final não usa mais "Hoje".

- [ ] **Step 7: Commit**

```bash
git add src/components/marketing/Hero.tsx src/components/marketing/PricingSection.tsx src/components/marketing/FinalCta.tsx src/components/marketing/FeaturesGrid.tsx
git commit -m "fix: corrige inconsistencias de copy e expectativa antes do clique para /oferta"
```

---

## Task 5: Elemento de assinatura visual (NetworkMotif) + favicon

**Files:**
- Create: `src/components/marketing/NetworkMotif.tsx`
- Create: `src/app/icon.svg`
- Modify: `src/components/marketing/Hero.tsx` (arquivo inteiro — parte de Task 4 já aplicada)
- Modify: `src/components/marketing/FinalCta.tsx` (arquivo inteiro — parte de Task 4 já aplicada)
- Modify: `src/app/(marketing)/landing-clone.css`

**Interfaces:**
- Produces: `NetworkMotif({ className }?: { className?: string }): JSX.Element` — Server Component, usado por `Hero.tsx` e `FinalCta.tsx`.

**Contexto do gap:** achados Design#1/#3/#8: o hero, a grid de features e o CTA final não têm nenhum elemento gráfico próprio — são visualmente intercambiáveis com qualquer template de SaaS/IA genérico ("cara de IA genérica"). Achado Design#12: falta favicon (404 no console em toda navegação). Esta task introduz UM motivo gráfico reutilizável (um grafo de nós conectados, remetendo a rede neural/LLM local — o tema central do produto) em baixo contraste no hero e no CTA final, e a mesma linguagem visual simplificada no favicon — a "assinatura" única do produto, aplicada com restrição (não em todo lugar).

- [ ] **Step 1: Criar o componente `NetworkMotif`**

Create `src/components/marketing/NetworkMotif.tsx`:
```tsx
export default function NetworkMotif({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1" fill="none">
        <line x1="60" y1="80" x2="180" y2="40" />
        <line x1="180" y1="40" x2="300" y2="90" />
        <line x1="300" y1="90" x2="420" y2="50" />
        <line x1="420" y1="50" x2="540" y2="110" />
        <line x1="180" y1="40" x2="220" y2="160" />
        <line x1="300" y1="90" x2="340" y2="200" />
        <line x1="420" y1="50" x2="460" y2="180" />
        <line x1="220" y1="160" x2="340" y2="200" />
        <line x1="340" y1="200" x2="460" y2="180" />
        <line x1="60" y1="80" x2="220" y2="160" />
      </g>
      <g fill="currentColor">
        <circle cx="60" cy="80" r="5" />
        <circle cx="180" cy="40" r="4" />
        <circle cx="300" cy="90" r="6" />
        <circle cx="420" cy="50" r="4" />
        <circle cx="540" cy="110" r="5" />
        <circle cx="220" cy="160" r="4" />
        <circle cx="340" cy="200" r="6" />
        <circle cx="460" cy="180" r="4" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Criar o favicon com a mesma linguagem visual**

Create `src/app/icon.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#7c3aed"/>
  <g stroke="#ffffff" stroke-width="1.6">
    <line x1="9" y1="20" x2="16" y2="9"/>
    <line x1="16" y1="9" x2="23" y2="20"/>
    <line x1="9" y1="20" x2="23" y2="20"/>
  </g>
  <g fill="#ffffff">
    <circle cx="9" cy="20" r="2.6"/>
    <circle cx="16" cy="9" r="2.6"/>
    <circle cx="23" cy="20" r="2.6"/>
  </g>
</svg>
```

Note: o Next.js App Router detecta automaticamente `src/app/icon.svg` como o favicon do site, sem precisar de configuração adicional em `layout.tsx`.

- [ ] **Step 3: Usar o motivo no Hero**

Replace o conteúdo de `src/components/marketing/Hero.tsx`:
```tsx
import DemoWidget from "@/components/marketing/DemoWidget";
import NetworkMotif from "@/components/marketing/NetworkMotif";

export default function Hero() {
  return (
    <div className="container hero" id="hero">
      <NetworkMotif className="hero-motif" />
      <span className="badge mono">
        <i>✦</i> Para quem quer dominar IA — programando ou não
      </span>
      <h1>Construa Seu Próprio ChatGPT Particular em Menos de uma Hora</h1>
      <p>
        Cansado de pagar mensalidade em ChatGPT Plus ou Claude Pro pra um
        serviço que pode mudar de preço ou sair do ar? Este ebook mostra como
        rodar sua própria IA local — sem mensalidade, sem depender da nuvem
        e sem precisar ser especialista.
      </p>

      <div className="hero-cta">
        <a className="btn btn-accent" href="/oferta">
          Quero por R$47
        </a>
        <a className="btn btn-ghost" href="#features">
          Ver o que você recebe
        </a>
      </div>

      <p className="hero-note">
        Pare de Pagar por IA — Monte sua própria IA Local, sem depender de
        mensalidade ou nuvem.
      </p>

      <DemoWidget />
    </div>
  );
}
```

- [ ] **Step 4: Usar o motivo no CTA final**

Replace o conteúdo de `src/components/marketing/FinalCta.tsx`:
```tsx
import NetworkMotif from "@/components/marketing/NetworkMotif";

export default function FinalCta() {
  return (
    <div className="container">
      <div className="cta">
        <NetworkMotif className="cta-motif" />
        <h2>Comece Sua Trilha de Estudo</h2>
        <p>
          Descubra seu perfil, siga um roadmap sob medida e valide o que
          aprendeu com um certificado verificável.
        </p>
        <a className="btn btn-accent" href="/oferta">
          Quero por R$47
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Adicionar CSS de posicionamento do motivo**

Em `src/app/(marketing)/landing-clone.css`, localize:
```css
.lp-guide .hero {
  padding: 72px 0 40px;
  text-align: center;
}
```
Substitua por:
```css
.lp-guide .hero {
  padding: 72px 0 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.lp-guide .hero-motif {
  position: absolute;
  top: -40px;
  right: -60px;
  width: 420px;
  height: 280px;
  color: var(--accent);
  opacity: 0.08;
  pointer-events: none;
  z-index: 0;
}
.lp-guide .hero > *:not(.hero-motif) {
  position: relative;
  z-index: 1;
}
```

Localize:
```css
.lp-guide .cta {
  background: var(--ink);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 56px 40px;
  text-align: center;
}
```
Substitua por:
```css
.lp-guide .cta {
  background: var(--ink);
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 56px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.lp-guide .cta-motif {
  position: absolute;
  bottom: -60px;
  left: -40px;
  width: 360px;
  height: 240px;
  color: #fff;
  opacity: 0.06;
  pointer-events: none;
  z-index: 0;
}
.lp-guide .cta > *:not(.cta-motif) {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 6: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 7: Verificar visualmente**

Abra `http://localhost:3000/` — deve aparecer um padrão sutil de linhas/pontos conectados no canto superior direito do hero (bem discreto, atrás do texto) e outro similar, em branco bem discreto, no canto inferior esquerdo do bloco escuro de CTA final. Confirme que o título/parágrafo continuam legíveis (o motivo deve estar atrás, não sobre o texto). Recarregue a página e confirme (no DevTools > Network, ou na aba do navegador) que o favicon agora é o ícone roxo com os 3 pontos conectados, sem 404 no console.

- [ ] **Step 8: Commit**

```bash
git add src/components/marketing/NetworkMotif.tsx src/app/icon.svg src/components/marketing/Hero.tsx src/components/marketing/FinalCta.tsx "src/app/(marketing)/landing-clone.css"
git commit -m "feat: adiciona motivo visual de assinatura (rede de nos) e favicon"
```

---

## Task 6: Gráfico de XP — rótulos de semana

**Files:**
- Modify: `src/components/marketing/AdvantagesSection.tsx`
- Modify: `src/app/(marketing)/landing-clone.css`

**Interfaces:** nenhuma — `AdvantagesSection(): JSX.Element` continua sem props.

**Contexto do gap:** achado Design#4: o gráfico de "curva de XP" ocupa bastante espaço vertical mas não tem eixo, valores ou marcações — é puramente decorativo, o tipo de "linha ascendente = progresso" sem especificidade que passa a sensação de clichê de landing genérica.

- [ ] **Step 1: Adicionar rótulos de semana abaixo do gráfico**

Em `src/components/marketing/AdvantagesSection.tsx`, localize:
```tsx
          <div className="chart-wrap">
            <svg viewBox="0 0 800 220" width="100%" preserveAspectRatio="none" style={{ display: "block" }}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15 L800 220 L0 220 Z"
                fill="url(#xpFill)"
              />
              <path
                d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="3"
              />
            </svg>
          </div>
```
Substitua por:
```tsx
          <div className="chart-wrap">
            <svg viewBox="0 0 800 220" width="100%" preserveAspectRatio="none" style={{ display: "block" }}>
              <defs>
                <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15 L800 220 L0 220 Z"
                fill="url(#xpFill)"
              />
              <path
                d="M0 200 C120 195 180 170 260 150 C360 125 420 80 520 55 C620 32 700 22 800 15"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="chart-weeks mono">
            <span>Sem 1</span>
            <span>Sem 2</span>
            <span>Sem 3</span>
            <span>Sem 4</span>
            <span>Sem 5</span>
            <span>Sem 6</span>
          </div>
```

- [ ] **Step 2: Adicionar CSS dos rótulos**

Em `src/app/(marketing)/landing-clone.css`, logo após o bloco `.lp-guide .chart-wrap {...}` (por volta da linha 411), adicione:
```css
.lp-guide .chart-weeks {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--ink-mute);
  font-size: 10px;
}
```

- [ ] **Step 3: Verificar que compila**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificar visualmente**

Abra `http://localhost:3000/` e role até "Seu XP cresce a cada semana de estudo real" — confirme que aparecem os rótulos "Sem 1" a "Sem 6" abaixo do gráfico, alinhados da esquerda pra direita.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/AdvantagesSection.tsx "src/app/(marketing)/landing-clone.css"
git commit -m "style: adiciona rotulos de semana ao grafico de XP"
```

---

## Verificação final manual (não automatizada)

1. `npm run dev`
2. Abrir `/` e `/oferta` em 1280px — conferir: motivo visual sutil no hero e no CTA final, favicon roxo, gráfico de XP com rótulos de semana, copy sem inconsistência de tempo/urgência fabricada.
3. Redimensionar para 390px — conferir: menu hambúrguer funciona na home, grid de 3 planos empilha em `/oferta`, nenhum overflow horizontal.
4. Testar os 3 formulários de `/oferta` com e-mail vazio e com e-mail inválido (sem "@") — todos devem mostrar erro inline.
5. Conferir que o card "Assinatura Mensal" está branco liso e só "Acesso Total 12 Meses" tem o gradiente + selo centralizado "Melhor custo por ebook" + "Em breve".
6. `npx tsc --noEmit` limpo e `npx vitest run` — todos os testes continuam passando (nenhuma mudança de lógica de negócio nesta rodada).
