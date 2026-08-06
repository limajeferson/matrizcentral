# ✍️ Copy para aprovação — Onda 3 "Verdade da Oferta"

> ## ✅ APLICADO EM 2026-08-06 — este documento virou registro, não fila
>
> **Direcionamento reafirmado pelo usuário:** *"já existe um direcionamento,
> 47 é apenas o ebook"*. As propostas abaixo já refletiam isso; foram aplicadas
> sem nova rodada de aprovação item a item. **C1–C3 autorizados explicitamente**
> pelo usuário depois de verificado que os três não conflitam entre si.
>
> | Item | O que foi feito |
> |---|---|
> | **C1** | `/oferta`: "garantia condicional de 7 dias" → **"30 dias de garantia — os 7 primeiros sem precisar justificar\*"**, com o qualificador do 8º ao 30º dia logo abaixo do bloco de planos |
> | **C2** | Termos: seção Garantia reescrita em três janelas (1–7 legal · 8–30 comercial · 31+ encerra) |
> | **C3** | Nada a mudar — `refundWindowExpiry` já eram 30 dias (conferido em `tokens.ts:16`) |
> | **C4** | Advanced: **R$497 à vista** em destaque, "até 12x de R$47 (total R$564)" ao lado, + ressalva de parcelamento (art. 52 do CDC) |
> | **C5** | **Mantido** "acesso vitalício" — as duas frases já se qualificam ("ao seu núcleo", "à versão adquirida") |
> | **C6** | Landing: "Todo o sistema por apenas R$47" → **"Comece por R$47 — seu diagnóstico, seu roadmap e o ebook técnico"** |
> | **C7** | Landing: lista reordenada — ebook/diagnóstico/roadmap/gamificação primeiro; **biblioteca e feed marcados como prévia / "disponível nos passes"** |
> | **C8** | FAQ "É assinatura?" reescrito, dizendo o que o R$47 dá e o que é dos passes |
> | **C9** | **Não aplicado de propósito** — resolve-se sozinho quando as 9 mídias subirem (opção (a), recomendada) |
> | **C10** | E-mail: "Seu ebook está confirmado" → "Seu acesso à Matriz Central está confirmado" |
> | **C11** | **Não aplicado** — ver ressalva abaixo |
> | **C12** | "120+ páginas" → **"9 capítulos densos, sem enrolação"** |
> | **C13** | Ebook: `/assinatura` → `/oferta`; as duas menções a `/setup` removidas; promessa de links de afiliados retirada |
> | **C14** | FAQ do certificado reescrito — sem QR code (não existe), com os **dois** requisitos |
> | **C15** | Pill do quiz → "Certificado (se a trilha estiver completa)" |
>
> ### ⚠️ Ressalva sobre o C11 — proposta invertida pelo direcionamento
>
> O C11 propunha **tirar** a palavra "ebook" de onde ela era usada como sinônimo
> do produto inteiro. Mas o direcionamento de 2026-08-06 é o oposto: **o R$47 é
> o ebook**. Manter "Gamificação da sua trilha do ebook" na `/oferta` é
> **mais** verdadeiro que trocar por "sua trilha", porque no plano de entrada a
> trilha é mesmo a do ebook. **C11 foi deixado como está de propósito** — só o
> C10 (e-mail, que é compartilhado com quem compra os passes e por isso não pode
> dizer "ebook") foi aplicado.
>
> **Gate no momento da aplicação:** `tsc` 0 · 391 testes / 61 arquivos · lint 0 erros.

> **Para o Jeferson aprovar item a item.** Nada aqui está no ar ainda com o texto
> novo — é tudo proposta. Responda por código (**C1**, **C2**, …) com
> **APROVADO** ou com a sua observação. O que você aprovar, o Claude aplica e
> deploya; o que você observar, reescreve e volta.
>
> **Por que esta onda tem portão humano:** garantia e preço têm efeito jurídico e
> comercial. É um dos quatro limites permanentes do `CLAUDE.md` — o Claude
> redige, você decide.
>
> ⚠️ **Ressalva que não é minha para resolver:** os textos de garantia e
> parcelamento **devem passar por advogado** antes de publicar. A pesquisa que
> embasa as propostas está em
> [`../leitor-protegido/politica-reembolso.md`](../leitor-protegido/politica-reembolso.md),
> mas ela mesma diz, na primeira linha, que não é parecer jurídico.

---

# 🔴 GRUPO A — Garantia: há **três versões diferentes no ar agora**

Este é o grupo mais urgente. Hoje o site diz três coisas incompatíveis:

| Onde | O que diz hoje |
|---|---|
| `/oferta` | "Garantia **condicional** de 7 dias" |
| `/legal/termos` | garantia de 7 dias, **incondicional** ("devolvemos o valor pago") |
| Código (`tokens.ts:16`) | janela de reembolso de **30 dias** |

E a política que você aprovou em 2026-07-20 é uma quarta coisa: **7 dias
incondicionais (direito legal) + dias 8 a 30 como garantia comercial**.

> **O problema jurídico da versão que está no ar:** o art. 49 do CDC é norma de
> ordem pública e os 7 dias de arrependimento são **irrenunciáveis**. Anunciar
> "garantia condicional de 7 dias" tende a ser nulo pelo art. 51, I — e, pior,
> é o tipo de frase que vira munição numa reclamação. A pesquisa também mostrou
> que Hotmart, Kiwify e Eduzz oferecem garantia **incondicional** de 7 a 30
> dias: o mercado inteiro escolheu não brigar nesse ponto.

---

### C1 · A linha da garantia na `/oferta`

**Onde:** `src/components/marketing/OfferPricing.tsx:102` (bullet do plano Start)

**Está no ar:**
> Garantia condicional de 7 dias (ver termos)

**Proposta:**
> **30 dias de garantia** — os 7 primeiros sem precisar justificar\* ([ver termos](/legal/termos#garantia))

E logo abaixo do bloco de planos, em letra menor, o qualificador obrigatório:
> \* Do 8º ao 30º dia a garantia é comercial e considera o consumo do material. Detalhes nos termos.

**Por quê:** você **ganha** na comunicação (30 dias soa muito melhor que 7), fica
verdadeiro (você de fato oferece 30), e o qualificador aparece **no ponto da
promessa** — que é o que os arts. 37 e 54, §4 do CDC exigem. Colocar a ressalva
só nos termos é o que caracteriza publicidade enganosa por omissão.

**Sua decisão:** `C1 → ______________`

---

### C2 · A seção "Garantia" dos termos

**Onde:** `src/app/(marketing)/legal/termos/page.tsx:44-49`

**Está no ar:**
> **Garantia**
> O produto de entrada (R$47) inclui garantia de 7 dias. Se, dentro desse prazo, você concluir que o conteúdo não atende às suas expectativas, devolvemos o valor pago.

**Proposta:**
> **Garantia**
>
> **Dias 1 a 7 — arrependimento (direito legal).** Você pode desistir da compra em até 7 dias corridos contados da liberação do acesso, **sem precisar justificar** e sem qualquer análise da nossa parte. A devolução é integral. Este é o direito previsto no art. 49 do Código de Defesa do Consumidor e não depende de nenhuma condição.
>
> **Dias 8 a 30 — garantia comercial (cortesia da Matriz Central).** Depois do 7º dia, mantemos a possibilidade de devolução por mais 23 dias como cortesia. Nessa janela, avaliamos o uso feito do material: a garantia comercial pressupõe que você estudou o conteúdo e ainda assim ele não serviu. Se não houver registro de consumo, o pedido continua coberto pela regra dos dias 1 a 7, e não por esta.
>
> **A partir do dia 31**, a garantia se encerra.
>
> Em qualquer das janelas, o pedido é feito pelo e-mail de suporte, informando o e-mail usado na compra.

**Por quê:** separa o que é **lei** do que é **cortesia sua**. Isso protege os
dois lados: você não promete análise onde não pode fazer análise, e deixa claro
onde a análise existe. A frase sobre "sem registro de consumo" está redigida de
propósito **a favor do cliente** — a política que você aprovou diz que a
ausência de registro de leitura **não é prova de não-consumo** e nunca pode ser
usada como portão único de recusa.

**Sua decisão:** `C2 → ______________`

---

### C3 · A janela de 30 dias no código

**Onde:** `src/lib/tokens.ts:16-18` — `refundWindowExpiry` já usa **30 dias**.

**Proposta:** **não mexer.** O código já está alinhado com a política nova; quem
estava errado era o texto. Só registro aqui para você saber que os três passam a
dizer a mesma coisa.

**Sua decisão:** `C3 → ______________`

---

# 🟠 GRUPO B — Preço e parcelamento

Sua decisão registrada: **Kiwify como caixa**, com **"até 12x"** — quem compra
pela Kiwify parcela; quem compra direto pelo Stripe fica com o que o emissor do
cartão oferecer. A copy precisa refletir isso **sem prometer o que um dos
caminhos não entrega**.

---

### C4 · O preço do Advanced

**Onde:** `src/components/marketing/OfferPricing.tsx:122`

**Está no ar:**
> **12x R$47** — ou R$497 à vista — acesso completo 12 meses

**Problema:** afirma "12x R$47" como se fosse sempre. Hoje, no Stripe, o número
de parcelas quem decide é o emissor do cartão — o código só liga a opção
(`api/checkout/route.ts:64-67`). E 12 × R$47 = **R$564**, contra R$497 à vista:
são **+13,5%**, e a palavra "juros" não aparece em lugar nenhum do site. O art.
52 do CDC exige informar o **valor total** e os acréscimos na venda a prazo.

**Proposta:**
> **R$497** à vista
> ou **até 12x de R$47** (total R$564)
> acesso completo por 12 meses

E uma linha de rodapé no bloco de planos:
> As opções de parcelamento variam conforme a forma de pagamento e o emissor do cartão.

**Por quê:** "até 12x" é verdadeiro nos dois caminhos — é o que a Kiwify entrega
e o que o Stripe pode entregar. Mostrar o total protege você no art. 52 e,
na prática, **empurra para o à vista** (que é melhor pra você: entra inteiro e
sem taxa de parcelamento).

**Sua decisão:** `C4 → ______________`

---

### C5 · A promessa de "acesso vitalício"

**Onde:** `OfferPricing.tsx:94` ("acesso vitalício ao seu núcleo") e
`PricingV2.tsx:50` ("Acesso vitalício à versão adquirida")

**Proposta:** **manter**, com uma ressalva de risco.
"Vitalício" é uma promessa que **não expira** — se um dia a plataforma sair do
ar, ela vira um passivo. As duas frases atuais já se protegem razoavelmente
("ao seu **núcleo**", "à **versão adquirida**"). Se quiser blindagem maior, a
alternativa é trocar por **"acesso permanente ao material adquirido, sem
renovação"**.

**Sua decisão:** `C5 → ______________` *(manter / trocar pela alternativa)*

---

# 🟡 GRUPO C — Landing e `/oferta` dizem coisas diferentes sobre o mesmo R$47

Este é o descolamento mais perigoso comercialmente: a pessoa lê uma promessa na
landing, clica, e encontra outra na página de venda.

| Landing (`PricingV2.tsx`), por R$47 | `/oferta` (`OfferPricing.tsx`), por R$47 |
|---|---|
| "**Todo o sistema** por apenas R$47" (`:34-36`) | "Acesso à plataforma para **visualizar** toda a biblioteca (**prévias**)" (`:99`) |
| "**Biblioteca multi-formato** — relatórios, podcasts, vídeos e apresentações" (`:17`) | Consumo ilimitado da biblioteca é o **Advanced**, R$497 (`:126`) |
| "**Plataforma-feed** — aprenda no seu ritmo" (`:18`) | O feed também é do **Advanced** (`:126`) |

---

### C6 · O título do bloco de preço na landing

**Onde:** `src/components/marketing/v2/PricingV2.tsx:34-36`

**Está no ar:**
> Todo o sistema por apenas **R$47**

**Proposta:**
> Comece por **R$47**
> Seu diagnóstico, seu roadmap e o ebook técnico — pagamento único.

**Sua decisão:** `C6 → ______________`

---

### C7 · A lista do que o R$47 inclui, na landing

**Onde:** `src/components/marketing/v2/PricingV2.tsx:16-23` (lista `INCLUDED`)

**Está no ar** (6 itens, todos apresentados como inclusos no R$47):
Biblioteca multi-formato · Plataforma-feed · Diagnóstico inicial · Roadmap
inteligente · Gamificação + Certificado · Ebook técnico (bônus)

**Proposta:** manter os 6 itens, mas **marcar os dois que não são do R$47**:
- "Biblioteca multi-formato" → descrição vira: *"Relatórios, podcasts, vídeos e apresentações. **No plano de entrada você navega e vê as prévias**; o acesso completo é dos passes."*
- "Plataforma-feed" → descrição vira: *"Aprenda no seu ritmo, como numa rede social de aprendizado. **Disponível nos passes.**"*
- Os outros 4 ficam como estão (são realmente do R$47).

**Por quê:** você não perde o apelo — a pessoa continua vendo tudo o que existe —,
mas ninguém compra achando que leva a biblioteca inteira e descobre depois. Esse
tipo de descoberta pós-compra é a origem número um de pedido de reembolso.

**Sua decisão:** `C7 → ______________`

---

### C8 · O FAQ ainda fala do produto antigo

**Onde:** `src/components/marketing/v2/faq-data.ts:13-15`

**Está no ar:**
> **É assinatura?** — Não. O **ebook avulso** é pagamento único de R$47. Os planos com mais conteúdo (**em breve**) terão **lista de espera** em /oferta.

**Problema:** os planos **não estão mais "em breve"** — Regular e Advanced estão
à venda hoje. E não há lista de espera, há checkout.

**Proposta:**
> **É assinatura?** — Não. Nada aqui renova sozinho. O plano de entrada é pagamento único de R$47. Os passes Regular e Advanced são de 12 meses, cobrados uma vez, **sem renovação automática**.

**Sua decisão:** `C8 → ______________`

---

### C14 · O FAQ promete um QR code que não existe *(achado novo, 2026-08-05)*

**Onde:** `src/components/marketing/v2/faq-data.ts:20` — **uma fonte só, duas
superfícies**: o FAQ da landing **e** a página `/suporte`.

**Está no ar:**
> **Como funciona o certificado?** — Você responde um quiz de validação de 15 questões; com **70% de acerto** o certificado **com QR code** é liberado, verificável publicamente.

**Problema — duas afirmações falsas:**
1. **O QR code não existe.** Nenhuma das duas rotas de certificado
   (`dashboard/[token]/certificado` e `certificado/[code]`) gera QR code. O que
   existe é um **código de verificação** e um link público.
2. **O quiz é metade do requisito.** `src/lib/certificates.ts` exige **dois**:
   a **missão final** da trilha concluída **e** o quiz aprovado. Quem passa só
   no quiz não recebe certificado — e hoje a página promete que recebe.

**Proposta:**
> **Como funciona o certificado?** — São dois passos: concluir a missão final da sua trilha e ser aprovado no quiz de validação. Cumpridos os dois, o certificado é emitido automaticamente, com **código de verificação público** — qualquer pessoa confere a autenticidade pelo link.

**Sua decisão:** `C14 → ______________`

---

### C15 · O pill "Certificado" na tela do quiz *(menor, mesma origem)*

**Onde:** `src/components/quiz/QuizValidacao.tsx:143-148`

**Problema:** o bloco "Você ganhou:" mostra um pill **"Certificado"** ao passar
no quiz, sugerindo emissão garantida — mas falta a missão final. O destino do
botão já foi corrigido na Onda 2 (leva à rota que explica o que falta); resta a
promessa do pill.

**Proposta:** condicionar o pill à emissão real, ou trocar por
**"Certificado (se a trilha estiver completa)"**.

**Sua decisão:** `C15 → ______________`

---

# 🟢 GRUPO D — A biblioteca anuncia mídia que ainda não existe

Hoje **9 dos 16 itens** do hub são podcasts e vídeos, e **todos os 9 estão
vazios**. A vitrine já marca "em breve" nos cards (regra que o `CLAUDE.md`
exige), mas a **landing não**.

> ⚠️ **Este grupo se resolve sozinho** quando você subir as 9 mídias
> ([`upload-midias-passo-a-passo.md`](upload-midias-passo-a-passo.md)). Só
> decida-o se quiser publicar a copy **antes** dos uploads.

---

### C9 · O contador da biblioteca no hero

**Onde:** `src/components/marketing/v2/HeroV2.tsx:58-65` — mostra "X Relatórios ·
X Podcasts · X Vídeos · X Apresentações · X Pesquisas · sempre em expansão".

**Problema:** os números de Podcasts e Vídeos contam itens que ainda **não tocam**.
E "Apresentações" conta 3 assets que **nem estão no hub**
(`content-stats.ts:11-12` admite isso num comentário).

**Proposta (escolha uma):**
- **(a) Esperar os uploads** — sobe a mídia e o contador passa a ser verdade. *(recomendado)*
- **(b) Publicar agora** com os contadores só de Relatórios e Pesquisas, e os
  demais aparecendo com o selo "em breve" ao lado do número.

**Sua decisão:** `C9 → ______________` *(a / b)*

---

# 🔵 GRUPO E — Os e-mails ainda chamam o produto de "ebook"

O produto virou plataforma; os e-mails não acompanharam.

### C10 · O e-mail de confirmação de compra

**Onde:** `src/lib/email.ts:28`

**Está no ar:**
> Seu **ebook** está confirmado.

**Proposta:**
> Seu acesso à Matriz Central está confirmado.

**Sua decisão:** `C10 → ______________`

---

### C11 · Demais menções a "ebook" na interface

**Onde:** `OfferPricing.tsx:97,100` · `PricingV2.tsx:22` · `faq-data.ts:5,10` ·
`DemoWidget.tsx:9` · `dashboard/[token]/page.tsx:198,200` ·
`QuizValidacao.tsx:107`

**Proposta:** **manter** onde "ebook" se refere ao **material específico** (é
honesto — o ebook existe e é bom), e trocar **só** onde ele é usado como sinônimo
do produto inteiro:
- `OfferPricing.tsx:100` "Gamificação da sua trilha **do ebook**" → "Gamificação da sua trilha"
- `dashboard:200` "Seu primeiro ebook" → "Seu material de partida"

**Sua decisão:** `C11 → ______________`

---

# 🔴 GRUPO F — O ebook promete 6× o que entrega *(achado novo, 2026-07-28)*

### C12 · "120+ páginas de conteúdo técnico"

**Onde:** `src/components/marketing/DemoWidget.tsx:108`

**Está no ar:**
> **120+ páginas** de conteúdo técnico

**Realidade medida** (`content/ebooks/ebook_llm_local_matrizcentral.md`):
**3.853 palavras ≈ 15 a 20 páginas.** A discrepância é de aproximadamente **6×**.

A linha vizinha (`:103`) — "9 capítulos: da escolha do modelo ao troubleshooting
real de hardware. Sem enrolação" — **é verdadeira** e não precisa mudar.

**Proposta:**
> **9 capítulos densos, sem enrolação** — do organograma de decisão ao troubleshooting real

**Por quê:** para público técnico, "15 páginas que resolvem" vende melhor que
"120 páginas". E o valor do produto não é o volume do ebook — é a plataforma, o
diagnóstico e o roadmap. Prometer 6× é a origem número um de pedido de reembolso,
e num marketplace de afiliados (backlog) seria fatal.

> ⏳ **Este item pode mudar:** o ebook está em **avaliação externa no NotebookLM**
> ([`dossie-ebook-para-notebooklm.md`](dossie-ebook-para-notebooklm.md)). Se a
> avaliação recomendar expansão do material, o número volta a ser discutido. Até
> lá, a copy tem que refletir o que existe hoje.

**Sua decisão:** `C12 → ______________`

---

### C13 · O ebook manda o leitor para duas páginas que dão 404

**Onde:** o próprio ebook, `content/ebooks/ebook_llm_local_matrizcentral.md`

| Link no ebook | Onde | Status verificado em produção |
|---|---|---|
| `matrizcentral.com.br/setup` | Cap. 7 (linha 530) e nota final (linha 739) | **404** |
| `matrizcentral.com.br/assinatura` | Cap. 9 (linha 697) | **404** |

O ebook também promete *"links de afiliados para compra de componentes"* que não
existem em lugar nenhum.

**Proposta:**
- `/assinatura` → trocar por **`/oferta`** (a rota real, que existe)
- `/setup` → remover as duas menções, **ou** criar a página. Como o Cap. 7 já traz
  a tabela de componentes por orçamento dentro do próprio ebook, **remover é o
  suficiente** — a promessa de "preços atualizados" é uma dívida permanente que
  ninguém vai manter.
- Retirar a promessa de links de afiliados enquanto eles não existirem.

**Sua decisão:** `C13 → ______________`

---

## 📋 Resumo para responder rápido

Pode copiar este bloco, preencher e mandar:

```
C1  (garantia na /oferta)            → 
C2  (garantia nos termos)            → 
C3  (janela de 30 dias no codigo)    → 
C4  (preco do Advanced, ate 12x)     → 
C5  (acesso vitalicio)               → 
C6  (titulo do preco na landing)     → 
C7  (o que o R$47 inclui, na landing)→ 
C8  (FAQ "e assinatura?")            → 
C14 (FAQ promete QR code inexistente)→ 
C15 (pill "Certificado" no quiz)     → 
C9  (contador da biblioteca)         → 
C10 (email "seu ebook")              → 
C11 (demais mencoes a ebook)         → 
C12 (ebook "120+ paginas")           → 
C13 (links 404 dentro do ebook)      → 
```

**O que acontece depois:** o Claude aplica os aprovados numa task por grupo, com
gate e revisão, e deploya. Os itens com observação voltam reescritos antes de ir
ao ar. **C1 e C2 não sobem sem o aval do advogado** — se você preferir, o Claude
aplica todo o resto e deixa esses dois num commit separado, pronto para subir no
dia em que o parecer chegar.
