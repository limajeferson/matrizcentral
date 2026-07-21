# Política de Reembolso — decisões travadas

> Registro das decisões tomadas no brainstorm de 2026-07-20. Este documento é a
> **fonte de verdade da política**; substitui
> `arquitetura-1/parte5-politica-de-reembolso-smart-gates.md`, que descrevia
> "smart gates" **que nunca foram implementados** (ver "Estado atual" abaixo).
>
> ⚠️ **Não é parecer jurídico.** Antes de publicar termos, revisar com advogado.

## Estado atual (levantado em 2026-07-20)

- `canRequestRefund` **não existe**. Não há endpoint, UI, nem tabela de pedidos.
- `purchases.refund_window_expires` é **gravada e nunca lida por nada**.
- O único código de reembolso é reativo: `charge.refunded`/`charge.dispute.created`
  → `revokePurchase()` revoga token + entitlement **depois** que a Stripe já estornou.
- Pedido de reembolso hoje: texto livre no `/suporte`; estorno manual no painel Stripe.
- Divergência publicada: termos dizem **7 dias**, a coluna grava **30 dias**.

## A decisão

**Dois níveis, com o piso legal intocado.**

| Janela | Natureza | Regra |
|---|---|---|
| **Dias 1–7** | Direito legal (art. 49 CDC) | **Incondicional.** Integral, sem justificativa, sem análise. Sempre concedido. |
| **Dias 8–30** | Garantia comercial (cortesia) | **Condicionada ao consumo comprovado** — ver abaixo. |
| **Dia 31+** | — | Encerrado. |

### Por que o piso legal é intocável

Pesquisa de 2026-07-20 (fontes no log da sessão):

- O art. 49 não tem equivalente ao art. 16(m) da Diretiva 2011/83/UE — o Brasil
  **não** tem dispositivo permitindo renúncia ao arrependimento por consumo de
  conteúdo digital.
- Corrente forte trata o art. 49 como **norma de ordem pública, irrenunciável**
  (nulidade pelo art. 51, I).
- **Nenhum precedente de STJ** sobre infoproduto consumido foi localizado. O único
  acórdão verificado em fonte oficial (TJDFT, Ac. 1200412, 1ª T. Rec. JEC-DF, 2019)
  trata de **fotografia sob encomenda** — produto personalíssimo; a analogia com
  ebook vendido em massa é imperfeita.
- **Ônus da prova é do fornecedor**, com inversão provável por hipossuficiência
  técnica (art. 6º, VIII) — "quem tem os logs é você".
- **Hotmart, Kiwify e Eduzz** oferecem garantia **incondicional** de 7–30 dias,
  sem gate de consumo. O mercado inteiro escolheu não brigar.
- Economia: um abusador custa **R$47**; um Procon/JEC custa múltiplos disso mais
  exposição. A cláusula restritiva compra pouco e custa caro.

### A condição dos dias 8–30

**Sinal:** o livro-razão de leitura (`reading_events`), construído na frente
[leitor-protegido](spec.md). Objetivo, passivo, com timestamp, server-side.

**Regra:** a garantia comercial pressupõe que a pessoa **usou o material**. Quem
não abriu o conteúdo não tem do que se arrepender depois do prazo legal — para
esse caso, a janela é a legal (dias 1–7).

### ⚠️ Limite do sinal (achado da revisão final, 2026-07-20) — REGRA VINCULANTE

**Ausência de evento NÃO é prova de não-consumo.** O registro de leitura depende
de JavaScript no cliente (`ReadTracker`), enquanto a leitura em si é
server-rendered e navega por `<Link>` real. Consequência: quem lê com **JS
desligado, bloqueador de script, leitor de tela agressivo** ou por outro cliente
HTTP consome o material inteiro e gera **zero eventos**.

Se a política usasse a ausência de eventos como gate automático, ela produziria
**falso negativo contra o cliente que pagou** — exatamente o oposto do objetivo
declarado ("garantir também a satisfação do usuário").

**Portanto:**
1. O livro-razão é **evidência corroborante**, nunca portão único.
2. Registro vazio → tratar como **inconclusivo**, e a decisão pende **a favor do
   consumidor** (concede o reembolso).
3. O livro-razão serve para **sustentar a negativa quando há consumo comprovado**
   e para **defesa em chargeback** — não para presumir má-fé no silêncio.
4. Qualquer texto de termos que venha a ser publicado deve refletir isso; não
   prometer aferição automática que o sistema não faz de forma completa.

> Mover o registro para o servidor **não** resolve sozinho: o `<Link>` do Next
> faz prefetch (hover/viewport), então gravar no render produziria **eventos
> falsos** — pior que o silêncio. Se algum dia for feito, exige guarda contra
> prefetch (`Next-Router-Prefetch` / `purpose: prefetch`).

**Limiar exato: a definir na frente do fluxo de reembolso**, com dados reais de
leitura em mãos. Travar um número agora seria chute. O limiar deve ser
**publicado nos termos** quando definido.

### O que NÃO entra na decisão

- ❌ **Quiz como porta do reembolso.** Não prova consumo (o material está aberto
  ao lado — mede busca, não leitura); é atrito hostil no pior momento; e não mede
  utilidade (dá pra gabaritar e ainda ter sido enganado pela oferta). O
  `reading_events` mede melhor, de graça e sem atrito. **O quiz vira frente
  própria, para validação/certificado** (`quiz_responses.validacao` +
  `certificates` já existem).
- ❌ **Reembolso proporcional.** Entrega única não é serviço continuado; sem base
  legal clara e sem precedente. Risco de leitura como burla ao art. 49.
- ❌ **Retenção de taxa** dentro dos 7 dias (art. 49, parágrafo único: valores
  integrais, monetariamente atualizados).
- ❌ **Exigir justificativa ou "aprovação" discricionária** nos dias 1–7.
- ❌ **Bloquear menu de contexto / seleção de texto.** Teatro: contornável em
  segundos, quebra acessibilidade e leitores de tela, e pune o cliente honesto que
  quer copiar um comando. Ver `spec.md`.

## Antiabuso — onde a trava realmente fica

A trava contra má-fé **não é a cláusula**; é a camada operacional:

1. **Revogação real** — com o leitor server-side (sem download), reembolso devolve
   o dinheiro **e** o acesso. A assimetria que justificava negar deixa de existir.
2. **Bloqueio de recompra** após reembolso, por identidade (e-mail/usuário).
3. **Histórico de reembolsos** por identidade — reincidência é o sinal real de
   má-fé, não o volume consumido numa compra.
4. **Rate limit** no endpoint de seção (dificulta varredura sequencial do documento).
5. **Marca d'água pessoal** no leitor — mata compartilhamento casual.

## Comunicação (regra travada)

- Pode-se anunciar **"30 dias de garantia"** — é verdade, você oferece 30.
- **Obrigatório:** qualificador **visível no ponto da promessa** (asterisco/link
  `*condições após o 7º dia`), não apenas no T&C. Base: art. 54, §4 (cláusula
  limitativa em destaque) e art. 37 (publicidade enganosa por omissão).
- Os termos devem explicar **as duas janelas separadamente**, com clareza sobre
  qual regra se aplica em cada uma.
- Prazo contado do **acesso liberado**, não da compra.

## Pendências desta política

- [ ] Definir o limiar de consumo dos dias 8–30 (com dados reais).
- [ ] Reconciliar `refundWindowExpiry` (hoje 30 dias, nunca lida) com as duas janelas.
- [ ] Reescrever `legal/termos` com as duas janelas (hoje diz 7 dias incondicionais).
- [ ] Aposentar/reescrever `arquitetura-1/parte5-…smart-gates.md` (descreve política
      que não existe e nunca existiu).
- [ ] **Revisão por advogado antes de publicar.**
- [ ] Aplicar **só a compras novas** — não retroagir condição a quem já comprou.
