# Backlog editorial — insumos de conteúdo rastreados

> Coisas que **viram conteúdo/marketing** da plataforma, não frentes de código.
> Registradas aqui para não se perderem. Nada aqui está em execução.

## 🎮 Case Dragum — "alavancagem de projeto local com IA"

**Registrado em 2026-07-26. Status: backlog, sem ação.**

O usuário passou 2 dias fora deste repo construindo um jogo em
`C:\Users\Grazi\Claude\Projects\dragum` — o projeto que recebeu os kits destilados
do ecossistema na frente `kit-ecossistema-dragum` (2026-07-23). Ele quer usar o
próprio processo como **case aberto no fórum** da Matriz Central.

**O que é o jogo (como o usuário descreveu):**

- Jogo de **crescimento exponencial e áreas**.
- **Mesmo padrão de continuidade desta plataforma**: roda em mais de um
  computador, o estado da execução viaja pelo git (é literalmente o kit do
  ecossistema em uso real).
- **NFT** para criar um mercado paralelo de personagens/heróis.
- **Criptomoeda própria** para movimentar o marketplace do jogo.
- Mais de uma forma de interação; **o foco atual é jogabilidade / sala de jogo**.

**Por que isso é bom material (o ângulo editorial):**

O produto vende "IA local como alavanca de projeto próprio". O Dragum é a **prova
viva disso, feita pelo fundador, em tempo real** — não um depoimento, um diário de
construção. E ele traz um público que a plataforma ainda não fala: dev/gamer/cripto.

**Formatos candidatos (quando a sala de jogo existir):**

| Formato | Ângulo |
|---|---|
| Tópico-diário no fórum | "Estou construindo um jogo com IA local — acompanhe" (série, não post único) |
| Relatório | Como o *kit de ecossistema* (spec → plano → SDD → git como memória) foi transplantado para um projeto do zero |
| Vídeo/podcast | A conversa sobre economia do jogo: NFT como mercado secundário de heróis vs. o que a IA local resolve na produção |
| Post de blog | "Multi-computador sem dor: continuidade de projeto pelo git" — puxa o público certo e leva para a oferta |

**⚠️ Ponto de coerência a respeitar:** o `ESTADO-ATUAL.md` tem uma **decisão
travada de que NFT foi descartado** — mas isso é sobre **acesso ao produto Matriz
Central** (NFT não resolvia transferência de licença, quebrava custo zero e
adicionava atrito de carteira). **Não conflita com o Dragum**, onde o NFT é
mecânica de jogo, não porta de acesso. Ao publicar, deixar essa distinção
explícita — senão parece contradição.

**Gatilho para sair do backlog:** a sala de jogo do Dragum estar jogável. Antes
disso não há o que mostrar.

---

## 🏪 Marketplace (Kiwify) — DESBLOQUEADO: decisão revertida em 2026-08-05

> ### 🔄 DECISÃO NOVA DO USUÁRIO (2026-08-05) — esta seção foi revertida
>
> **"Primeiro subir num marketplace como a Kiwify, para acelerar os ganhos, e
> vamos evoluindo produtos e plataforma para seguir o nosso modelo."**
>
> A listagem na Kiwify passa a vir **antes** do lançamento pelo site, não depois.
> Das três razões que sustentavam o adiamento (abaixo), **duas caíram e uma
> continua valendo**:
>
> - ❌ **Exclusividade — não se aplica.** Era razão contra a *Hotmart* (cláusula
>   5.1). A **Kiwify não tem exclusividade**: vender lá e no site ao mesmo tempo
>   é permitido. Hotmart segue fora por essa razão.
> - ⚖️ **Posicionamento — assumido pelo usuário.** Listar como "ebook R$47"
>   reposiciona uma plataforma multi-formato para baixo. É trade-off de marca
>   (caixa agora vs. preço-âncora depois) e a escolha é do usuário, que optou
>   por velocidade de receita.
> - ⚠️ **Copy não-verdadeira — CONTINUA DE PÉ E VIRA PRÉ-REQUISITO.** A página
>   promete "120+ páginas" e o ebook tem ~15–20. Num marketplace isso é mais
>   perigoso que no site: reembolso em massa derruba o ranking e pode
>   **suspender a conta**.
>
> **Consequência na fila:** a **Onda 3 (Verdade da Oferta) passa a vir ANTES da
> listagem na Kiwify.** Ela já tinha portão humano (garantia e preço têm efeito
> jurídico e comercial), então isso adianta um portão existente em vez de criar
> um novo.
>
> **Ganhos colaterais da decisão:** o "até 12x" da `/oferta` **passa a ser
> verdade** (Stripe BR não parcela, Kiwify parcela) e a garantia se alinha à
> incondicional de 7 dias que os marketplaces exigem — a mesma do CDC art. 49.
>
> **Pendência do usuário:** criar a conta Kiwify e fornecer as chaves de
> API/webhook. A integração (Onda 6, `spec.md` item K1) é do Claude; a chave
> **o usuário digita** — o Claude nunca digita credencial.

---

### Registro histórico — a decisão anterior (2026-07-28), agora superada

O lançamento seria **pelo site**, com a **Kiwify apenas como caixa** (checkout), e
a entrega seguindo na nossa plataforma. Listar o produto num marketplace de
afiliados ficaria para depois.

**Por que não naquele momento — três razões concretas:**

1. **Hotmart tem cláusula de exclusividade de venda (5.1)** — pesquisada e
   registrada em [`../../ESTADO-ATUAL.md`](../../ESTADO-ATUAL.md). Entrar lá
   **bloqueia a venda direta no site**, que é onde a plataforma vive.
2. **O produto não é um ebook.** O `CLAUDE.md` define a Matriz Central como
   plataforma multi-formato; o ebook é material de apoio. Listar como
   "ebook R$47" reposiciona para baixo e coloca o produto para competir com
   ebook de R$9,90.
3. **Copy ainda não está verdadeira.** A página de vendas promete "120+ páginas"
   e o ebook tem ~15–20. Levar isso a um marketplace com afiliados é o caminho
   mais rápido para reembolso em massa — e taxa alta de reembolso derruba o
   ranking do produto e pode suspender a conta.

**Gatilho para sair do backlog (os três, juntos):**
- [ ] Copy corrigida e no ar (Onda 3, itens `C1`–`C12`)
- [ ] Pelo menos uma venda real validada ponta a ponta pelo site
- [ ] Número de conversão medido (`funnel_events` + Web Analytics já estão no ar)

**Quando destravar:** começar pela **Kiwify**, que **não tem exclusividade** e já
será nosso caixa. Hotmart só se a exclusividade for aceitável — decisão de
posicionamento, não técnica.

---

## Outros insumos rastreados

- **Slides e infográficos do NotebookLM** (Trilha E): existem, mas **não há
  vitrine para esses formatos** no hub. Avaliar formato novo no `CONTENT_HUB`.
- **Relatório Kimi K3** cita "pesos liberam 27/07/2026" — **revisitar a partir
  dessa data**, o texto envelhece sozinho.
- **Reclamação de cobrança Anthropic** (`reclamacao-anthropic/`) — guia pronto,
  aguarda o usuário. Não é conteúdo público.
