# Frente — Lançamento Público

**Status:** 🔄 **ativa** (aberta em 2026-07-26). É a **fila ativa** do projeto —
absorve as Trilhas F e G do programa `lancamento-final`.

**Objetivo:** deixar a plataforma pronta para receber tráfego pago e orgânico —
sem perder venda, sem perder dado, sem prometer o que o código não entrega.

## Próximo passo

**Onda 2, Task 1** — o cubo da marca no favicon. Plano detalhado (7 tasks):
[`plano-onda2.md`](plano-onda2.md). A task de maior risco é a **2**
(tipografia): mexe em todas as páginas públicas de uma vez, então é commit
próprio e verificação visual antes de seguir.

## Documentos

| Documento | O quê |
|---|---|
| [`spec.md`](spec.md) | A auditoria de 2026-07-26 (achados com arquivo:linha) + as 6 ondas + decisões |
| [`plano.md`](plano.md) | Plano mestre: restrições globais, sequência das ondas, **correções aos planos F e G antigos** |
| [`plano-onda1.md`](plano-onda1.md) | Onda 1 detalhada, 6 tasks — ✅ executada |
| [`plano-onda2.md`](plano-onda2.md) | Onda 2 detalhada, 7 tasks |
| [`backlog-conteudo.md`](backlog-conteudo.md) | Insumos editoriais rastreados — inclui o **case Dragum** |

## As 6 ondas

| Onda | Nome | Estado |
|---|---|---|
| 1 | Receita & Descoberta | ✅ **fechada** (2026-07-26) |
| 2 | Identidade & Polish *(era Trilha F)* | 📋 **planejada** — [`plano-onda2.md`](plano-onda2.md) |
| 3 | Verdade da Oferta | 🔒 **portão humano** — Claude redige, usuário aprova |
| 4 | Tech-debt & Segurança *(era Trilha G)* | 📐 planejar ao iniciar |
| 5 | Motor de Marketing | 📐 planejar ao iniciar |
| 6 | Kiwify + Auditoria final | 📐 planejar ao iniciar |

## Decisões travadas

- **Kiwify como caixa** (usuário, 2026-07-26), mantendo a entrega na nossa
  plataforma. A Stripe continua no código; a virada é a Onda 6.
- **Medição é própria** (`funnel_events` + `/api/track`), sem dependência npm,
  sem PII — `anon_id` opaco, nunca e-mail, nunca URL com token.
- **A `/oferta` mantém o rodapé antigo, consertado** — não repontar para o
  `FooterV2` (temas de CSS incompatíveis: `.lp-guide` claro vs `.mcv2` dark).
- **Onda 3 não deploya sem o usuário ver** — garantia e preço têm efeito jurídico.
- **O jogo Dragum é conteúdo, não frente** — ver [`backlog-conteudo.md`](backlog-conteudo.md).

## Aguardando o usuário (não bloqueia as ondas)

- **Subir as 9 mídias** e devolver as URLs → destrava a E5
  ([`../lancamento-final/handoff-midia.md`](../lancamento-final/handoff-midia.md)).
- **Conta Kiwify** (criação + chaves) → destrava a Onda 6.
- **Ligar "Web Analytics"** no painel da Vercel → o script da Task 5 passa a
  carregar (sem isso ele só não existe; nada quebra).
- **Aprovar a copy da Onda 3** (garantia, preço, o que R$47 entrega).
