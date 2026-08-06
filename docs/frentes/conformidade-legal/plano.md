# Conformidade legal — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development`.
> Os passos usam checkbox (`- [ ]`).

**Goal:** o site cumprir as obrigações objetivas do Decreto 7.962/2013, da LGPD e
do CDC aplicáveis a venda de produto digital, e passar numa checagem de produtor
de marketplace.

**Architecture:** seis tasks, commit por task. A ordem é por risco: primeiro a
declaração **falsa** que está no ar (privacidade), depois a **ausência** de
identificação do fornecedor, depois os documentos novos, e por último os itens de
fluxo que mexem em código. Todo texto legal nasce de uma fonte única de dados
(`src/data/legal.ts`) para não divergir entre páginas.

**Tech Stack:** Next.js 14.2.35 App Router · React 18 · TypeScript · Tailwind ·
Vitest (`environment: node`).

Spec: [`spec.md`](spec.md).

## Global Constraints

- **Proibido `npm install`** e proibido asset externo. Custo zero.
- **Gate antes de cada commit:** `npx tsc --noEmit` exit 0 · `npm run test` ·
  `npx next lint` sem **erros**. Baseline ao iniciar: **391 testes / 61
  arquivos**, 0 erros, 2 warnings `no-img-element` pré-existentes.
- **Vitest é `environment: node`** — teste só de lógica pura em `src/lib` e
  `src/data`. Componente se verifica rodando o app.
- **Escopos de CSS separados:** `.mcv2` (landing v2 e páginas legais, dark) ·
  `.lp-guide` (`/oferta`, claro) · `.mc-checkout` · área logada em tokens.
  As páginas `/legal/*` usam `.mcv2` + `.mc-legal`.
- **NUNCA inventar dado de identificação** (CNPJ, CPF, endereço, razão social).
  Onde o dado não existe, o código usa o sentinela definido na Task 2 e **falha
  visivelmente**.
- **Toda cláusula tem que ser verdadeira contra o código.** Antes de escrever
  "o acesso é liberado em X", conferir o fluxo real. Prometer o que o sistema não
  faz é criar o problema que esta frente existe para resolver.
- **Não copiar texto da Kiwify** nem de qualquer outro site. Texto original.
- **A seção Garantia dos termos (`#garantia`) NÃO muda.** Foi redigida e
  revisada na Onda 3. Preservar literalmente, incluindo os `id`.
- **Foro:** domicílio do consumidor (CDC art. 101, I). Foro de eleição contra
  consumidor é nulo — nunca escrever "fica eleito o foro da comarca de X".

---

### Task 1: A frase falsa sai do ar

**Contexto:** a política diz hoje *"Não vendemos nem compartilhamos seus dados
com terceiros para fins de marketing"* (`privacidade/page.tsx:63-64`). A intenção
era verdadeira, mas como está a frase é lida como "nenhum terceiro toca nos seus
dados" — e isso é falso: Stripe, Brevo, Supabase e Vercel são **operadores**.
Declaração falsa em política de privacidade é mais grave que omissão, e é a
primeira coisa a corrigir.

**Files:**
- Modify: `src/app/(marketing)/legal/privacidade/page.tsx:58-65` (seção LGPD)

**Interfaces:**
- Consumes: nada.
- Produces: nada — task isolada de texto.

- [ ] **Step 1: Conferir quais operadores existem de fato**

Rodar e colar o resultado no relatório — a lista do texto tem que sair daqui,
não de memória:

```bash
grep -rn "stripe\|brevo\|supabase" src/lib --include=*.ts -il
```

- [ ] **Step 2: Reescrever a frase**

Substituir a frase única por texto que separa as duas coisas. Manter o resto da
seção LGPD como está (ela vai ser ampliada na Task 3):

```tsx
<p>
  <strong>Nunca vendemos seus dados</strong> e não os compartilhamos com
  terceiros para que façam marketing próprio. Para operar a plataforma,
  porém, alguns fornecedores tratam dados por nossa conta e sob nossa
  instrução — pagamento, envio de e-mail, banco de dados e hospedagem.
  A lista completa, com o que cada um recebe, está na seção{" "}
  <a href="#operadores">Com quem compartilhamos</a>.
</p>
```

- [ ] **Step 3: Gate**

```bash
npx tsc --noEmit && npm run test
```
Esperado: exit 0 · 391 testes passando.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(marketing)/legal/privacidade/page.tsx"
git commit -m "fix(legal): corrige afirmacao falsa sobre compartilhamento de dados"
```

> ⚠️ O link `#operadores` fica apontando para uma âncora que **só existe depois
> da Task 3**. Isso é aceitável por uma task (âncora morta degrada para "não
> rola"), e a Task 3 é obrigatória. Não pular a Task 3.

---

### Task 2: Fonte única da identificação do fornecedor

**Contexto:** o Decreto 7.962, art. 2º, I e II, exige nome/razão social,
CNPJ ou CPF, endereço físico e eletrônico **em destaque e de fácil visualização**.
Hoje não existe nada disso no site. O dado é do usuário; esta task entrega a
estrutura e o comportamento de falha.

**Files:**
- Create: `src/data/legal.ts`
- Create: `src/data/legal.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export interface SellerIdentity { legalName: string; taxIdLabel: "CNPJ" | "CPF"; taxId: string; address: string; email: string; supportResponseDays: number; accessReleaseText: string; }`
  - `export const SELLER: SellerIdentity`
  - `export const IDENTITY_PLACEHOLDER = "__PREENCHER__"`
  - `export function isIdentityComplete(s: SellerIdentity): boolean`
  - `export function missingIdentityFields(s: SellerIdentity): string[]`

- [ ] **Step 1: Escrever o teste que falha**

```ts
import { describe, expect, it } from "vitest";
import {
  IDENTITY_PLACEHOLDER,
  isIdentityComplete,
  missingIdentityFields,
  type SellerIdentity,
} from "./legal";

const base: SellerIdentity = {
  legalName: "Fulano de Tal",
  taxIdLabel: "CPF",
  taxId: "000.000.000-00",
  address: "Rua X, 1 — Cidade/UF — CEP 00000-000",
  email: "contato@matrizcentral.com.br",
  supportResponseDays: 5,
  accessReleaseText: "imediatamente após a confirmação do pagamento",
};

describe("isIdentityComplete", () => {
  it("aceita identidade totalmente preenchida", () => {
    expect(isIdentityComplete(base)).toBe(true);
  });

  it("rejeita quando um campo esta com o placeholder", () => {
    expect(isIdentityComplete({ ...base, taxId: IDENTITY_PLACEHOLDER })).toBe(false);
  });

  it("rejeita campo vazio ou so com espacos", () => {
    expect(isIdentityComplete({ ...base, address: "   " })).toBe(false);
  });
});

describe("missingIdentityFields", () => {
  it("lista os campos pendentes pelo nome", () => {
    const r = missingIdentityFields({
      ...base,
      legalName: IDENTITY_PLACEHOLDER,
      address: "",
    });
    expect(r).toEqual(["legalName", "address"]);
  });

  it("devolve lista vazia quando esta tudo preenchido", () => {
    expect(missingIdentityFields(base)).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
npx vitest run src/data/legal.test.ts
```
Esperado: FAIL — `Cannot find module './legal'`.

- [ ] **Step 3: Implementar**

```ts
export interface SellerIdentity {
  /** Razão social (PJ) ou nome civil completo (PF). */
  legalName: string;
  taxIdLabel: "CNPJ" | "CPF";
  taxId: string;
  /** Endereço físico completo: logradouro, número, cidade/UF, CEP. */
  address: string;
  email: string;
  /** Prazo máximo de resposta do suporte, em dias (Decreto 7.962, art. 4º, I). */
  supportResponseDays: number;
  /** Quando o acesso é liberado (Decreto 7.962, art. 2º, VI). */
  accessReleaseText: string;
}

/**
 * Sentinela para campo que depende do usuário. Escolhido para ser
 * IMPOSSÍVEL de confundir com dado real se vazar para a tela.
 */
export const IDENTITY_PLACEHOLDER = "__PREENCHER__";

const IDENTITY_REQUIRED: (keyof SellerIdentity)[] = [
  "legalName",
  "taxId",
  "address",
  "email",
];

export function missingIdentityFields(s: SellerIdentity): string[] {
  return IDENTITY_REQUIRED.filter((k) => {
    const v = s[k];
    return typeof v !== "string" || v.trim() === "" || v === IDENTITY_PLACEHOLDER;
  });
}

export function isIdentityComplete(s: SellerIdentity): boolean {
  return missingIdentityFields(s).length === 0;
}

/**
 * 🔒 DEPENDE DO USUÁRIO: legalName, taxId e address.
 * O Claude não preenche esses campos — são dados pessoais/cadastrais reais.
 * Enquanto estiverem com IDENTITY_PLACEHOLDER, o bloco de identificação
 * NÃO é renderizado (ver SellerIdentityBlock, Task 5) — melhor não exibir
 * do que exibir identificação falsa.
 */
export const SELLER: SellerIdentity = {
  legalName: IDENTITY_PLACEHOLDER,
  taxIdLabel: "CPF",
  taxId: IDENTITY_PLACEHOLDER,
  address: IDENTITY_PLACEHOLDER,
  email: "contato@matrizcentral.com.br",
  supportResponseDays: 5,
  accessReleaseText: "imediatamente após a confirmação do pagamento",
};
```

- [ ] **Step 4: Rodar e ver passar**

```bash
npx vitest run src/data/legal.test.ts
```
Esperado: PASS — 5 testes.

- [ ] **Step 5: Gate e commit**

```bash
npx tsc --noEmit && npm run test
git add src/data/legal.ts src/data/legal.test.ts
git commit -m "feat(legal): fonte unica da identificacao do fornecedor (Decreto 7.962 art. 2)"
```

---

### Task 3: Política de Privacidade completa (LGPD)

**Contexto:** hoje faltam base legal por finalidade (art. 9º), os operadores
nominados, transferência internacional (arts. 33/34), os dez direitos do titular
(art. 18), prazos de retenção, e a medição de funil que a Onda 1 subiu
(`funnel_events` + `/api/track`, com `anon_id` pseudonimizado).

**Files:**
- Modify: `src/app/(marketing)/legal/privacidade/page.tsx` (corpo do `<article>`)

**Interfaces:**
- Consumes: `SELLER` de `src/data/legal.ts` (Task 2).
- Produces: âncoras `#operadores`, `#bases`, `#retencao`, `#internacional`,
  `#direitos` — usadas pela Task 1 e pelo `footer-nav`.

- [ ] **Step 1: Levantar a verdade antes de escrever**

Rodar e colar no relatório. **O texto tem que descrever o que estes comandos
mostram**, não o que seria bonito prometer:

```bash
grep -rn "funnel_events" src/ --include=*.ts --include=*.tsx | head
grep -rn "anon_id" src/lib/funnel.ts
grep -rn "newsletter_subscribers\|support_messages\|sent_emails" supabase/migrations/ | head
```

- [ ] **Step 2: Escrever as seções novas**

Substituir o corpo entre `<h2>Dados que coletamos</h2>` e o
`<p className="mc-legal-note">` final. Manter `id="cookies"` e `id="lgpd"`
existentes (o `footer-nav` aponta para eles).

Seções, nesta ordem — cada uma com `<h2 id="...">`:

1. **Quem é o controlador** — usa `SELLER.legalName`, `SELLER.taxIdLabel`,
   `SELLER.taxId`, `SELLER.email`. Renderizar via `SellerIdentityBlock`
   (Task 5) para não duplicar a regra de placeholder.
2. **`id="bases"` — O que tratamos, para quê e com que base legal.** Tabela com
   quatro colunas: dado · finalidade · base legal (LGPD art. 7º) · retenção.
   Linhas obrigatórias, com estas bases:
   - E-mail e dados da compra → entregar o produto → **execução de contrato**
     (art. 7º, V) → enquanto durar o acesso + prazo legal de guarda.
   - E-mail da newsletter → enviar novidades → **consentimento** (art. 7º, I) →
     até a revogação.
   - Mensagens de suporte → responder o atendimento → **execução de contrato** →
     enquanto durar a relação.
   - `anon_id` e eventos de funil → medir conversão de forma agregada →
     **legítimo interesse** (art. 7º, IX) → dado pseudonimizado, sem e-mail e
     sem URL com token.
   - Progresso de leitura, XP e certificado → operar a trilha e emitir o
     certificado → **execução de contrato**.
3. **`id="operadores"` — Com quem compartilhamos.** Lista nominal, com o que
   cada um recebe e para quê: **Stripe** (pagamento — os dados de cartão vão
   direto para eles, nunca passam pelo nosso servidor), **Brevo** (envio de
   e-mail — recebe e-mail e nome), **Supabase** (banco de dados), **Vercel**
   (hospedagem e logs de acesso). Frase explícita de que são **operadores**, que
   tratam sob nossa instrução, e que **não vendemos dado para ninguém**.
4. **`id="internacional"` — Transferência internacional.** Declarar que esses
   fornecedores processam fora do Brasil e que a transferência se apoia nas
   hipóteses do art. 33 da LGPD.
5. **`id="retencao"` — Por quanto tempo guardamos.** Consolidar os prazos da
   tabela + guarda de registros de acesso por 6 meses (Marco Civil, art. 15).
6. **`id="direitos"` — Seus direitos.** Os dez do art. 18, em lista: confirmação
   da existência de tratamento · acesso · correção · anonimização/bloqueio/
   eliminação de dado desnecessário ou excessivo · portabilidade · eliminação de
   dado tratado com consentimento · informação sobre compartilhamento ·
   informação sobre a possibilidade de não consentir e as consequências ·
   revogação do consentimento · revisão de decisão automatizada. Canal:
   `SELLER.email`, com prazo de resposta.

Manter `id="cookies"` dizendo o que é verdade: cookie de sessão (essencial) e a
medição própria pseudonimizada; **sem cookie de publicidade de terceiro**.

- [ ] **Step 3: Atualizar a data**

`mc-legal-updated` está em "julho de 2025". Trocar por "agosto de 2026".

- [ ] **Step 4: Gate**

```bash
npx tsc --noEmit && npm run test && npx next lint
```

- [ ] **Step 5: Commit**

```bash
git add "src/app/(marketing)/legal/privacidade/page.tsx"
git commit -m "feat(legal): politica de privacidade completa (bases legais, operadores, retencao, art. 18)"
```

---

### Task 4: Termos de Uso com licença de software

**Contexto:** a plataforma **é** software e não há contrato de licença. A seção
"Licenciamento" atual tem 3 linhas e fala só do conteúdo. Falta escopo da
licença, vedações, disponibilidade, suspensão, responsabilidade, foro.

**Files:**
- Modify: `src/app/(marketing)/legal/termos/page.tsx`

**Interfaces:**
- Consumes: `SELLER` (Task 2), `SellerIdentityBlock` (Task 5).
- Produces: âncoras `#licenca-software`, `#uso-permitido`, `#conta`,
  `#disponibilidade`, `#suspensao`, `#responsabilidade`, `#foro`.
  **Preserva** `#garantia`, `#reembolso`, `#licenciamento`, `#direitos`.

- [ ] **Step 1: Preservar o que já está certo**

⚠️ A seção `id="garantia"` (linhas ~42-67) foi redigida e revisada na Onda 3.
**Copiar literalmente para a nova estrutura, sem reescrever uma palavra.**
Mesma coisa para `id="reembolso"`.

- [ ] **Step 2: Escrever as seções novas**

1. **`id="licenca-software"` — Licença de uso.** Concessão **não exclusiva,
   pessoal, intransferível e revogável** de acesso à plataforma e ao conteúdo,
   para uso próprio e não comercial. Deixar explícito que **é licença de uso,
   não venda** — o usuário não adquire titularidade sobre o software nem sobre
   o conteúdo. Para o plano de entrada, a licença do material adquirido é por
   prazo indeterminado; para os passes, ela acompanha os 12 meses.
2. **`id="uso-permitido"` — O que não é permitido.** Compartilhar credenciais ou
   dar acesso a terceiro; redistribuir, revender, publicar ou hospedar o
   material; usar robô, scraper ou automação para baixar conteúdo em massa;
   fazer engenharia reversa, descompilar ou tentar contornar controles de
   acesso; remover avisos de autoria; usar a plataforma para atividade ilícita.
   **Consequência:** suspensão ou encerramento do acesso, e responsabilização
   pelas perdas. **Não** copiar a multa de "60x" da Kiwify — cláusula penal
   desse porte contra consumidor é atacável pelo art. 51 do CDC.
3. **`id="conta"` — Sua conta.** O acesso é individual; o titular responde pelo
   que acontece na conta dele e deve avisar em caso de uso não autorizado. O
   login é por link mágico enviado ao e-mail cadastrado — **conferir que isso
   ainda é verdade** antes de escrever (`src/lib/auth-session.ts`).
4. **`id="disponibilidade"` — Disponibilidade e manutenção.** Empenho em manter
   no ar, com possibilidade de interrupção para manutenção ou por causa alheia
   (falha de fornecedor, força maior). **Sem prometer percentual de uptime** —
   não há SLA contratado com a Vercel nem monitoramento que sustente o número.
   Se a indisponibilidade for prolongada e imputável a nós num passe de 12
   meses, o prazo é estendido pelo período correspondente.
5. **`id="suspensao"` — Suspensão e encerramento.** Podemos suspender em caso de
   violação das vedações, com aviso e oportunidade de correção quando a
   gravidade permitir. O usuário pode encerrar quando quiser; o encerramento não
   afeta a garantia vigente.
6. **`id="responsabilidade"` — Limites da nossa responsabilidade.** Redigir
   dentro do art. 51 do CDC: **não** excluir responsabilidade por vício do
   produto (seria nulo). Delimitar o que se pode: o conteúdo é **educacional** e
   não garante resultado específico; a execução de IA local depende do hardware
   e do software do usuário; não respondemos por decisão tomada com base no
   material nem por dano em equipamento decorrente de configuração feita pelo
   usuário. Declarar expressamente que **isto não afasta os direitos do CDC**.
7. **`id="foro"` — Lei aplicável e foro.** Lei brasileira; **foro do domicílio
   do consumidor**, na forma do art. 101, I, do CDC. Nunca eleger comarca.

- [ ] **Step 3: Atualizar a data para "agosto de 2026"**

- [ ] **Step 4: Gate e commit**

```bash
npx tsc --noEmit && npm run test && npx next lint
git add "src/app/(marketing)/legal/termos/page.tsx"
git commit -m "feat(legal): termos com licenca de uso do software, disponibilidade e foro do consumidor"
```

---

### Task 5: Identificação visível no rodapé e nas páginas legais

**Contexto:** o Decreto exige a identificação em **destaque e fácil
visualização** — não escondida num parágrafo. O rodapé aparece em toda página
pública, então é o lugar.

**Files:**
- Create: `src/components/legal/SellerIdentityBlock.tsx`
- Modify: `src/components/marketing/v2/FooterV2.tsx` (bloco `mc-footer-brand`,
  após `mc-footer-since`)
- Modify: `src/app/(marketing)/landing-v2.css` (estilo do bloco, escopo `.mcv2`)
- Modify: `src/components/marketing/v2/footer-nav.ts` (coluna Legal)

**Interfaces:**
- Consumes: `SELLER`, `isIdentityComplete` de `src/data/legal.ts` (Task 2).
- Produces: `export default function SellerIdentityBlock({ variant }: { variant?: "footer" | "page" })`

- [ ] **Step 1: Criar o componente**

```tsx
import { SELLER, isIdentityComplete } from "@/data/legal";

/**
 * Identificação do fornecedor — Decreto 7.962/2013, art. 2º, I e II.
 *
 * Se a identidade não estiver preenchida, NÃO renderiza nada. Exibir
 * "__PREENCHER__" seria pior que omitir: passaria a impressão de
 * identificação sem identificar. A ausência é detectável pelo teste de
 * isIdentityComplete e pelo checklist da frente.
 */
export default function SellerIdentityBlock({
  variant = "footer",
}: {
  variant?: "footer" | "page";
}) {
  if (!isIdentityComplete(SELLER)) return null;

  return (
    <address className={`mc-seller-identity mc-seller-identity--${variant}`}>
      <span>{SELLER.legalName}</span>
      <span>
        {SELLER.taxIdLabel} {SELLER.taxId}
      </span>
      <span>{SELLER.address}</span>
      <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
    </address>
  );
}
```

- [ ] **Step 2: Montar no rodapé**

Em `FooterV2.tsx`, logo depois do `<p className="mc-footer-since">`:

```tsx
<SellerIdentityBlock />
```

- [ ] **Step 3: Estilo no escopo `.mcv2`**

Em `landing-v2.css`, perto das regras `.mc-footer-*`:

```css
/* Identificacao do fornecedor (Decreto 7.962 art. 2). Precisa ser legivel,
   nao "letra miuda decorativa" - a exigencia e destaque e facil visualizacao. */
.mcv2 .mc-seller-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 14px;
  font-style: normal;
  font-size: 12px;
  line-height: 1.6;
  color: var(--mc-ink-soft, #b8b3cf);
}
.mcv2 .mc-seller-identity a {
  color: inherit;
  text-decoration: underline;
}
```

⚠️ Conferir o nome real do token de texto suave do `.mcv2` antes de usar
`--mc-ink-soft` — se não existir, usar o que o `.mc-footer-desc` usa.

- [ ] **Step 4: Link novo na coluna Legal**

Em `footer-nav.ts`, coluna "Legal", acrescentar:

```ts
{ label: "Uso Aceitável", href: "/legal/uso-aceitavel" },
```

- [ ] **Step 5: Verificar no navegador**

Com `SELLER` ainda em placeholder, o bloco **não deve aparecer** e o rodapé não
pode quebrar. Depois, preencher `SELLER` temporariamente com dados fictícios só
para conferir o layout nos dois temas, e **reverter antes do commit**.

- [ ] **Step 6: Gate e commit**

```bash
npx tsc --noEmit && npm run test && npx next lint
git add src/components/legal/SellerIdentityBlock.tsx src/components/marketing/v2/FooterV2.tsx "src/app/(marketing)/landing-v2.css" src/components/marketing/v2/footer-nav.ts
git commit -m "feat(legal): identificacao do fornecedor no rodape (Decreto 7.962 art. 2)"
```

---

### Task 6: Política de Uso Aceitável e requisitos do fluxo de compra

**Contexto:** junta o documento novo (E4 da spec) com os itens de fluxo (E5), que
são pequenos e todos de texto-na-tela. A Kiwify exige do produtor: material com
titularidade, sem promessa de enriquecimento, sem alegar parceria com a
plataforma. O Decreto exige prazo de entrega e prazo de atendimento declarados.

**Files:**
- Create: `src/app/(marketing)/legal/uso-aceitavel/page.tsx`
- Modify: `src/components/support/ContatoForm.tsx` (prazo de resposta)
- Modify: `src/components/marketing/OfferPricing.tsx` (prazo de liberação)

**Interfaces:**
- Consumes: `SELLER.supportResponseDays`, `SELLER.accessReleaseText` (Task 2).
- Produces: rota `/legal/uso-aceitavel`.

- [ ] **Step 1: Criar a página**

Estrutura igual às outras legais (`.mcv2` + `PixelGridBackground` +
`LandingHeader` + `mc-legal` + `FooterV2`), com `pageMetadata`. Copiar o
esqueleto de `legal/termos/page.tsx`. Duas partes:

**Parte 1 — O que você não pode fazer com o material.** Resumo das vedações dos
termos, em linguagem direta, com link para `#uso-permitido`.

**Parte 2 — Os compromissos que assumimos na comunicação.** Esta é a parte que
protege a conta no marketplace:
- Não prometemos resultado financeiro, ganho rápido nem enriquecimento.
- Não prometemos desempenho de hardware que não tenha sido medido.
- Todo número de benchmark vindo de terceiro é **atribuído à fonte**.
- Recurso ainda não publicado é marcado **"em breve"**, nunca anunciado como
  disponível.
- Não alegamos parceria, patrocínio ou endosso de empresa alguma sem contrato.

- [ ] **Step 2: Prazo de resposta no suporte**

Em `ContatoForm.tsx`, abaixo do botão de envio:

```tsx
<p className="text-xs text-muted-foreground mt-2">
  Respondemos em até {SELLER.supportResponseDays} dias úteis.
</p>
```

⚠️ **Conferir que o prazo é cumprível antes de publicar.** É promessa ao
consumidor; 5 dias é o teto do art. 4º, I do Decreto — prometer menos que isso
sem operação para sustentar cria o problema que a frente resolve.

- [ ] **Step 3: Prazo de liberação do acesso na oferta**

Em `OfferPricing.tsx`, dentro do `<p className="plans-note">` que já existe
(criado na Onda 3), acrescentar antes das outras linhas:

```tsx
Acesso liberado {SELLER.accessReleaseText}.
<br />
```

⚠️ Conferir o fluxo real no webhook (`src/app/api/webhooks/stripe/route.ts`)
antes de afirmar "imediatamente". Se houver processamento assíncrono que possa
demorar, ajustar `accessReleaseText` em `src/data/legal.ts` para a verdade.

- [ ] **Step 4: Sumário da contratação no e-mail de confirmação**

O art. 4º, VII do Decreto exige **confirmação imediata** do recebimento da
aceitação da oferta. Hoje `src/lib/email.ts` confirma o **acesso**, não a
**contratação** — não diz o que foi contratado nem em que condições.

Acrescentar ao e-mail de confirmação de compra um bloco curto com: o que foi
adquirido, o valor pago, a janela de garantia (30 dias, 7 sem justificar) e o
link dos termos. Reaproveitar o `emailShell()` que já existe (criado na Onda 2).

⚠️ Ler `src/lib/email.ts` antes: descobrir quais dados a função de confirmação
já recebe. **Se o valor pago não estiver disponível ali, não inventar campo** —
reportar e entregar o resto do bloco; mudar a assinatura para buscar dado do
webhook é escopo de outra task.

- [ ] **Step 5: Gate e commit**

```bash
npx tsc --noEmit && npm run test && npx next lint
git add "src/app/(marketing)/legal/uso-aceitavel" src/components/support/ContatoForm.tsx src/components/marketing/OfferPricing.tsx src/lib/email.ts
git commit -m "feat(legal): politica de uso aceitavel + prazos e sumario da contratacao"
```

---

## Definição de pronto

- [ ] Nenhuma afirmação falsa nos documentos legais (a frase de compartilhamento
      corrigida).
- [ ] `src/data/legal.ts` é a única fonte de identificação; nenhum CNPJ/CPF
      hardcoded em componente.
- [ ] Cada tratamento de dado com finalidade, base legal e retenção declaradas.
- [ ] Existe licença de uso cobrindo o **software**, não só o conteúdo.
- [ ] Foro do domicílio do consumidor; nenhuma comarca eleita.
- [ ] Prazos de liberação de acesso e de resposta de suporte declarados **e
      conferidos contra o código**.
- [ ] `/legal/uso-aceitavel` no ar e linkada no rodapé.
- [ ] Gate: `tsc` 0 · testes verdes · lint sem erros.
- [ ] `docs/ESTADO-ATUAL.md` atualizado.

## 🔒 Pendências do usuário (bloqueiam o "pronto")

1. **Razão social ou nome civil · CNPJ ou CPF · endereço físico completo.**
   Sem isso a Task 5 não renderiza nada e o Decreto segue descumprido. O Claude
   não preenche — são dados cadastrais reais.
2. **Revisão por advogado** antes de considerar a frente encerrada, com atenção
   às seções `#responsabilidade` e `#suspensao`.
