```
async function canRequestRefund(purchaseId) {
  const purchase = await db.purchases.findById(purchaseId)
  const token = await db.tokens.findByPurchaseId(purchaseId)
  
  // Gate 1: Dentro da janela de 30 dias?
  if (new Date() > purchase.refund_window_expires) {
    return {
      allowed: false,
      reason: "Fora da janela de 30 dias",
      message: "Seu período de reembolso expirou em 15/01/2024"
    }
  }

  // Gate 2: Completou a triagem?
  if (token.triaged) {
    return {
      allowed: false,
      reason: "Completou triagem",
      message: `Você completou a triagem em 10/01/2024 e recebeu 
                seu Ebook 2 GRATUITO. Reembolso não disponível 
                após triagem.`
    }
  }

  // Gate 3: Fez download do arquivo?
  if (purchase.downloaded) {
    return {
      allowed: false,
      reason: "Arquivo foi baixado",
      message: `Você baixou "LLM Local Setup.pdf" em 08/01/2024. 
                Após download, não há reembolso (produto digital).`
    }
  }

  // OK, permitir reembolso
  return {
    allowed: true,
    reason: "Elegível para reembolso",
    conditions: [
      "✅ Dentro de 30 dias",
      "✅ Não completou triagem",
      "✅ Não fez download"
    ]
  }
}
```

___
Página de Reembolso (UI)

┌─────────────────────────────────────────────┐
│     SOLICITAR REEMBOLSO                     │
└─────────────────────────────────────────────┘

Compra: "LLM Local Setup" - R$47
Data: 05/01/2024
Dias restantes: 12/30

┌─────────────────────────────────────────────┐
│ STATUS DA SUA ELEGIBILIDADE                 │
├─────────────────────────────────────────────┤
│ ✅ Dentro da janela de 30 dias             │
│ ✅ Não completou triagem                   │
│ ✅ Não fez download                        │
│                                             │
│ ✅ VOCÊ É ELEGÍVEL PARA REEMBOLSO          │
└─────────────────────────────────────────────┘

Motivo do reembolso (obrigatório):
┌─────────────────────────────────────┐
│ [Mudei de ideia]                    │
│ [Conteúdo não é o que esperava]     │
│ [Muito técnico para mim]            │
│ [Outro]                             │
└─────────────────────────────────────┘

[SIM, REEMBOLSAR] [NÃO, CONTINUAR]

---

Exemplo com bloqueio:
┌─────────────────────────────────────────────┐
│ ❌ NÃO ELEGÍVEL PARA REEMBOLSO              │
├─────────────────────────────────────────────┤
│ ❌ Você completou a triagem em 08/01      │
│    (Recebeu Ebook 2 gratuito)               │
│                                             │
│ Por política: após triagem, reembolso não   │
│ é permitido.                                │
│                                             │
│ PORÉM: Você tem acesso a:                  │
│ ✅ Ebook "LLM Local Setup"                 │
│ ✅ Ebook "Claude Code" (GRÁTIS)            │
│ ✅ Suporte na comunidade                   │
│ ✅ Atualizações futuras                    │
│                                             │
│ Se o conteúdo não atender, entre em       │
│ contato conosco: support@...                │
└─────────────────────────────────────────────┘

___
Terms & Conditions (T&C)
# Política de Reembolso

## Elegibilidade

Você pode solicitar reembolso SE E SOMENTE SE:

1. ✅ Dentro de 30 dias da compra
2. ✅ NÃO completou a triagem de perfil
3. ✅ NÃO fez download de nenhum arquivo

## Inelegibilidade

Reembolso NÃO é permitido se:

- Você completou a triagem (recebeu conteúdo grátis)
- Você fez download de qualquer arquivo
- Passou 30 dias da compra
- Seu token foi utilizado para acessar dashboard

## Razão

Após triagem, você recebe acesso a produtos GRATUITOS 
(livros 2, materiais personalizados). A triagem caracteriza 
uso efetivo do produto.

Após download, você tem acesso permanente ao conteúdo digital. 
Reembolso não é apropriado.

## Processo

1. Acesse: seuproduto.com/dashboard
2. Clique: "Solicitar Reembolso"
3. Confirme as condições
4. Reembolso processado em 3-5 dias úteis (Stripe)

## Exceções

Se você acredita que deveria ser elegível, 
entre em contato: support@seuproduto.com