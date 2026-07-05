# Brief de Contexto — Matriz Central (para agente Copywriter)

> Este documento existe para dar a um agente de copywriting (Claude Cowork ou
> similar) todo o contexto necessário para escrever ou revisar frases do site
> sem inventar fatos sobre o produto. Sempre que um número, claim ou nome de
> feature entrar num texto novo, ele deve bater com o que está aqui.

---

## 1. O que é o Matriz Central

Plataforma brasileira de infoprodutos **low-ticket** (R$47 hoje; R$47–97 no
catálogo futuro) no nicho de **IA local / DevTools**. Não é "curso de IA
genérico" — é uma trilha de estudo sobre como parar de depender de
assinaturas de IA na nuvem (ChatGPT Plus, Claude Pro, Gemini Advanced) e
rodar modelos de linguagem (LLMs) no próprio computador.

O modelo de negócio combina três coisas que a maioria dos concorrentes vende
separado:
1. **Conteúdo real** (ebook técnico, denso, com dados e comparativos)
2. **Personalização por perfil** (quiz de triagem gera uma trilha sob medida)
3. **Gamificação com prova de conhecimento** (XP, níveis, certificado
   verificável) — não é só "leia e acabou", é "leia, prove que aprendeu,
   ganhe um certificado com QR code público"

Site: matrizcentral.com.br (produção ainda não publicada — ver seção 8)

---

## 2. O problema que o produto resolve (a tese central)

Esta é a ideia mais importante para qualquer copy de topo de funil:

> **Assinatura de IA é aluguel sem escritura.** Você paga todo mês por
> ChatGPT Plus / Claude Pro / Gemini Advanced e nunca é dono de nada. O
> preço pode subir, o limite de uso pode mudar, o serviço pode sair do ar —
> e no fim do ano você gastou ~R$1.200–2.640 sem ter nada que seja seu.

Dado real usado na landing (ver `src/lib/annual-spend.ts`): duas
assinaturas de IA (~R$110/mês cada) somam **R$220/mês → R$2.640/ano**.

A alternativa vendida: pagar **R$47 uma única vez**, aprender a rodar um
LLM local, e nunca mais depender de mensalidade para ter IA disponível.

Contra-argumentos que o produto já responde (usar em FAQ/objeções):
- "Preciso de placa de vídeo boa?" → Não. O capítulo sobre Ollama e
  quantização cobre modelos que rodam só na CPU, inclusive em notebooks
  comuns.
- "Preciso saber programar?" → Não. Existe uma trilha sem código dentro do
  próprio ebook para quem não programa.
- "É só um PDF genérico?" → Não. É um sistema: ebook + triagem de perfil +
  roadmap + quiz de validação + certificado verificável.

**Nunca inventar números de economia diferentes destes** sem confirmar —
o valor de "gasto anual com IA" é uma estimativa documentada no código
(`MONTHLY_AI_SUBSCRIPTIONS_BRL = 220` em `src/lib/annual-spend.ts`), não
uma pesquisa de mercado.

---

## 3. Produto atual (o que já existe e pode ser vendido hoje)

### Ebook 1 — o único produto liberado para venda no momento

- **Título completo:** "Construa Seu Próprio ChatGPT Particular em Poucos
  Minutos — O Guia Definitivo para Rodar LLMs Localmente e Nunca Mais Pagar
  por Tokens ou Mensalidades"
- **Preço:** R$47, pagamento único (Stripe: PIX, cartão, boleto)
- **Formato:** 9 capítulos + apêndice, em Markdown/PDF
- **Estrutura real do conteúdo** (não simplificar nem inventar capítulos):
  0. Por Que Você Está Pagando Demais (o cálculo do gasto anual com IA)
  1. A Ilusão do Tamanho — maior mito da IA local (modelo grande ≠ melhor
     modelo para a tarefa)
  2. Arquitetura Importa Mais que Parâmetros
  3. Organograma de Decisão — qual modelo pro seu caso
  4. Tabela Comparativa (26 modelos)
  5. Performance por Hardware — resultados reais
  6. Setup Passo a Passo — do zero ao primeiro prompt (Ollama, LM Studio)
  7. Monte Sua Máquina — configurações por orçamento
  8. Linha do Tempo — como chegamos aqui
  9. O Que Vem a Seguir (módulo avançado)
  - Apêndice: Glossário
- **Tom de voz do próprio ebook** (referência de estilo, ver seção 6):
  direto, com dado concreto logo na abertura ("Abra sua última fatura...
  Agora multiplique por 12"), nunca vago, sempre com número ou tabela
  sustentando a afirmação.

### Catálogo futuro (ainda NÃO à venda — só usar como "em breve" / waitlist)

- Setup Claude Code — Do Zero ao Deploy (R$67)
- MCP: Integrações Avançadas (R$57)
- CEO + IA: Decisões Financeiras (R$77)
- NotebookLM + Obsidian: Combo Infinito (R$47)
- Harness + PTC: Automação (R$47)

**Regra de copy:** nunca apresentar esses títulos como "disponíveis agora".
Eles só existem como parte dos planos de assinatura (ver seção 4), que
também estão em lista de espera.

---

## 4. Estrutura de oferta e preços (página `/oferta`)

Três planos, apenas o primeiro está ativo para compra:

| Plano | Preço | Status | O que inclui |
|---|---|---|---|
| **Ebook Avulso** | R$47 pagamento único | ✅ Ativo (checkout Stripe real) | 1 ebook completo (9 capítulos), triagem de perfil + roadmap personalizado, quiz de validação com certificado |
| **Assinatura Mensal** | R$97/mês | 🔜 Lista de espera | 1 ebook novo por mês (12/ano), mesma triagem/certificado, acesso ao hub de conteúdo (relatórios, podcasts, pesquisas), cancela quando quiser |
| **Acesso Total 12 Meses** | R$497 à vista ou 12x R$47 | 🔜 Lista de espera (plano "recomendado") | Todos os ebooks lançados no período, mesma triagem/certificado, hub completo, ≈R$41/ebook (o mais barato do catálogo) |

Garantia do ebook avulso: **30 dias**, com uma regra importante de "smart
gate" — o reembolso só é permitido se o comprador **não completou a
triagem** e **não fez download**. Depois de receber o ebook grátis extra
(baseado no perfil) e o roadmap, a compra deixa de ser reembolsável por
design. **Não simplificar isso para "garantia incondicional de 30 dias"**
em copy — é uma garantia condicional, e afirmar o contrário é falso.

CTA padrão do site inteiro: **"Quero por R$47"** / **"Começar por R$47"**
→ sempre aponta para `/oferta`.

---

## 5. A jornada do usuário (o que ele vive depois de comprar)

1. **Compra** → checkout Stripe → token único gerado → email automático
   com o link de acesso
2. **Triagem** (`/quiz/[token]`) → quiz de perfil (democratizado: pergunta
   se a pessoa programa e ramifica perguntas técnicas ou não-técnicas a
   partir daí) → classifica em 1 de 8 perfis → ganha XP e desbloqueia um
   roadmap de estudo personalizado
3. **Dashboard** (`/dashboard/[token]`) → mostra o perfil descoberto, o
   roadmap, o ebook comprado para download, progresso em XP
4. **Validação** → quiz de 15 questões sobre o conteúdo do ebook, com dica
   sempre visível em cada pergunta, aprovação a partir de **70% de
   acerto**
5. **Certificado** → PDF com nome, data, nota e um **QR code verificável
   publicamente** em `matrizcentral.com.br/verify/[código]`

### Os 8 perfis de triagem (usar nomes exatos, não parafrasear)

`dev_python_aia`, `dev_nodejs_web`, `devops_infra`, `ceo_financeiro`,
`pm_product`, `founder_builder`, `estudante_curioso`,
`profissional_produtividade`.

A primeira pergunta do quiz ("O que te traz aqui?") já é desenhada para
acolher tanto quem programa quanto quem não programa — isso é um
diferencial de copy importante: **o produto não pressupõe conhecimento
técnico**. Frases como "só pra programador" ou "exclusivo para devs"
contradizem o posicionamento real.

### Gamificação (headline de UX, útil para copy de benefício)

- XP por ação: comprar (100), completar triagem (50), concluir ebook
  (150), passar no quiz de validação (100), streaks de estudo (100–300)
- 6 níveis: Aprendiz → Estudante → Praticante → Especialista → Mestre →
  Lenda
- Badges e certificados verificáveis publicamente

Isso justifica a metáfora de copy "seu XP cresce a cada semana de estudo
real" — já usada na landing.

---

## 6. Tom de voz e identidade (o "como falar")

### Princípios de tom
- **Direto e baseado em dado**, nunca vago ou motivacional genérico. Cada
  afirmação forte vem acompanhada de um número, tabela ou comparação.
- **Anti-assinatura como eixo emocional**: o inimigo do copy não é "IA
  cara", é "pagar mensalidade pra sempre por algo que podia ser seu".
- **Sem jargão excludente**: falar tanto com quem programa quanto com quem
  não programa, sem soar condescendente com nenhum dos dois.
- **Sem hype vazio**: nunca usar "revolucionário", "definitivo" (exceto no
  próprio título do ebook, que já existe), "game changer" ou superlativos
  sem lastro.
- Português do Brasil, informal-profissional (tratamento "você", frases
  curtas, sem gerundismo).

### Identidade visual (contexto para copy que acompanha a UI)
A landing (`/`) foi redesenhada com uma identidade **dark + violeta
elétrico**, tipografia display gigante em caixa alta (estilo cartaz),
formas com cantos chanfrados, e animações de scroll — pensada para
transmitir "sistema sério de estudo", não "curso motivacional". Isso
importa para o copywriter porque:
- Headlines devem funcionar bem em **caixa alta e poucas palavras** (a
  tipografia é gigante — frases longas quebram o layout)
- O contraste emocional é "sério e técnico" vs. "hype de infoproduto
  barato" — o copy deve reforçar essa seriedade, não miná-la com
  exclamações em excesso

### Exemplos de copy já validado (usar como calibre de tom)
- Hero atual: **"Pare de alugar sua IA."** / "Construa seu próprio ChatGPT
  particular em menos de uma hora."
- Seção do problema: **"Assinatura de IA é aluguel sem escritura."**
- Seção de sistema: **"Um sistema, não um ebook solto."**
- Preço: **"R$47. Sem mensalidade."**
- CTA: **"Quero por R$47"**

---

## 7. O que NÃO fazer (erros de copy a evitar)

- Não inventar prova social numérica ("+10.000 alunos", "nota 4.9/5") —
  o produto ainda não tem esses números publicamente auditados.
- Não prometer suporte 1:1, mentoria ou comunidade — não existe no
  produto atual.
- Não chamar os planos "Mensal" e "Anual" de disponíveis — são lista de
  espera (`/api/waitlist`), não checkout ativo.
- Não simplificar a garantia de 30 dias como incondicional (ver seção 4).
- Não citar preços de mensalidades de concorrentes de IA com precisão que
  o time não validou — usar sempre a mesma estimativa (~R$110/mês por
  assinatura, ~R$2.640/ano para duas) já usada no código.
- Não misturar produtos do catálogo futuro como se fizessem parte do
  ebook avulso atual.

---

## 8. Status do projeto (para dar contexto de estágio, não para citar no site)

- Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase +
  Stripe + Brevo, hospedado com custo zero (tiers gratuitos).
- Em desenvolvimento local; ainda não publicado em produção no domínio
  matrizcentral.com.br.
- Landing principal (`/`) passou por um redesign completo (identidade
  dark/violeta, animações Framer Motion) — trabalho mais recente do
  projeto.
- Único produto realmente comprável hoje: o Ebook Avulso por R$47.

---

## Como usar este documento com o agente copywriter

Cole este arquivo inteiro como contexto antes de pedir qualquer geração ou
revisão de texto. Ao pedir uma frase nova, especifique:
1. **Onde** ela vai aparecer (hero, seção de preço, FAQ, email, anúncio...)
2. **Qual seção deste brief** ela precisa respeitar (ex.: "seção 2 e 4" para
   copy de preço, "seção 5" para copy de dashboard)
3. Se é para **manter o tom validado** (seção 6) ou **testar um tom novo**

Isso evita que o agente misture claims do catálogo futuro com o produto
atual, ou invente números de economia/prova social que não existem.
