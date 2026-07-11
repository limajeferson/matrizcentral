# Hardening — Críticos da auditoria

**Status:** ✅ 4 críticos corrigidos e verificados (11/07/2026) · branch `hardening-criticos`

**Objetivo:** Corrigir, antes de construir qualquer frente nova, os problemas que afetam clientes reais e a receita hoje — encontrados na auditoria completa (5 subagentes: segurança, pagamentos/e-mail, jornada, gamificação, frontend/conversão).

**Próximo passo:** revisar o diff da branch e decidir merge; depois seguir para a Frente 1 (Login real). Os achados ALTOS/MÉDIOS abaixo viram backlog das frentes seguintes.

---

## Os 4 críticos corrigidos

### #1 — Certificado falsificável (quiz de validação pontuado no cliente)
O quiz de validação aceitava `passed`/`score` enviados pelo navegador — qualquer comprador emitia o certificado (o entregável vendido) sem estudar. Foi confirmado por 3 auditores independentes.

**Correção:** a nota passou a ser recalculada no servidor (`scoreValidacao` em `src/lib/quiz-scoring.ts`) a partir do gabarito real; o cliente envia só as respostas escolhidas; as respostas são persistidas em `quiz_responses` com `is_correct`. O XP de validação só é concedido se a nota real ≥ 70%.
- `src/lib/quiz-scoring.ts` (novo `scoreValidacao` + tipos)
- `src/app/api/quiz/route.ts` (branch validação reescrito; + checagem de token expirado, fecha o bypass M2)
- `src/components/quiz/QuizValidacao.tsx`, `QuizValidacaoContainer.tsx` (enviam `answers`, não a nota)
- Testes: `src/lib/quiz-scoring.test.ts`, `src/app/api/quiz/route.test.ts` (inclui teste anti-forja)

### #3 — Certificado podia sumir para quem cumpriu tudo
A emissão só era tentada ao concluir `missao_final` no roadmap. Quem passava no quiz **depois** de concluir a trilha nunca recebia o certificado, sem conserto pela tela.

**Correção:** a emissão foi extraída para `src/lib/issue-certificate.ts` (`issueCertificateForToken`) e agora é disparada por **ambos** os gatilhos — conclusão da trilha (`/api/roadmap/complete`) e aprovação no quiz (`/api/quiz`). Idempotente e best-effort.

### #2 — Cliente paga e pode nunca receber o acesso
Se o e-mail (Brevo) falhasse ou o `insert` do token falhasse, o webhook respondia 200 e a Stripe não reentregava — o cliente pagava e ficava sem link, sem recuperação.

**Correção (defesa em camadas):**
1. **Webhook idempotente e recuperável** (`src/app/api/webhooks/stripe/route.ts`): cada passo (usuário → compra → token) é idempotente; se o token falhar, retorna 500 para a Stripe **reentregar** e completar o passo que faltou. XP de compra só na criação (sem duplicar). E-mail é best-effort (não derruba o webhook).
2. **Acesso na própria tela de sucesso** (`src/app/checkout/sucesso/`): resolve o token pelo `session_id` da Stripe e mostra "Começar meu diagnóstico →" — o cliente vê o link mesmo se o e-mail falhar. Verificado end-to-end no navegador.
   - `src/lib/access.ts`, `src/app/api/access-status/route.ts`, `src/app/checkout/sucesso/AccessReveal.tsx`
3. **Reenvio self-service** (`src/app/api/resend-access/route.ts`): reenvia o link por e-mail (rate-limit em memória, resposta genérica anti-enumeração).
- Testes: `src/app/api/webhooks/stripe/route.test.ts` (dedupe, recuperação de token faltante, falha→500).

### #4 — Promessa da landing vs. o que o R$47 entrega
A landing dizia "todo o sistema por R$47" (com gamificação + certificado), mas o card **Start** da `/oferta` sub-listava (omitia plataforma/gamificação/certificado) e o **Advanced** dava a entender que eram exclusivos dele. O código, na verdade, **entrega** plataforma + gamificação + certificado no R$47 (via token → dashboard).

**Correção:** o card Start passou a listar o que o R$47 realmente entrega (alinhado à landing e ao código); o Advanced foi reposicionado na **cadência de conteúdo** (catálogo completo + lançamentos ao longo de 12 meses), sem implicar exclusividade de gamificação/certificado.
- `src/components/marketing/OfferPricing.tsx`

---

## Verificação
- `npx tsc --noEmit` → exit 0
- `npm run test` → 106 testes passando (novos: scoreValidacao, anti-forja no quiz, recuperação no webhook)
- `npm run lint` → só o warning pré-existente (`<img>` em SystemSection)
- Navegador (localhost + Stripe/Supabase reais): `/oferta` alinhada; `/checkout/sucesso?session_id=…` mostra o link de acesso resolvido da sessão real.

---

## Backlog herdado da auditoria (para as próximas frentes)

**ALTOS**
- Reembolso/chargeback não revoga acesso (webhook não trata `charge.refunded`/`dispute`; `/api/download` e outras não checam `purchase.status`). `refund_window_expires` é gravado mas nunca aplicado. → resolver na frente de **Assinaturas** (ciclo de vida do pagamento).
- XP/badges/ranking forjáveis via chamada direta às APIs (sem sinal real de consumo). Mitigação estrutural depende de **Login real**; dedup de XP precisa de `unique(user_id, action_type, reference_id)` em `xp_events`.
- Token na URL, 1 ano, sem revogação — resolvido de raiz pela frente de **Login real**.

**MÉDIOS / BAIXOS**
- Sem rate limiting nas rotas públicas de escrita (`/api/checkout`, `/api/newsletter`, `/api/waitlist`).
- Waitlist sem validação de e-mail / dedupe (newsletter já tem).
- Checkout server-side não valida formato de e-mail (`isValidEmail` só no cliente).
- Copy: garantia "7 dias" na `/oferta` vs `refundWindowExpiry` de 30 dias no código; e-mail de token diz "seu ebook" (produto é plataforma).
- Links mortos: `/#features` no `Header`/`Footer` antigos; âncoras `#sistema/#preco/…` e logo sem link em `/sobre` e `/legal/*`; contador "3 Apresentações" sem itens correspondentes.
- Certificado do dashboard sem link de descoberta (card no dashboard); botão do quiz aponta pro dashboard, não pro certificado.
- Forms da `/oferta` travam em falha de rede (sem `.catch`); não enviam com Enter; inputs sem label.
