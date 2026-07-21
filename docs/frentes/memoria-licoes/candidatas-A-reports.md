# Candidatas A — mineração dos reports do SDD

Candidatas extraídas de `.superpowers/sdd/task-*-report.md`, `final-*-report.md`,
`frente-*-report.md`, `fix-cupom-report.md` e `progress.md`. Sem numeração
`L-NNN` — a curadoria final (Task 4) decide o que entra em `docs/LICOES.md`.

---

### CAND · Revogação de acesso deve ser por produto, não por usuário
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** liberar um produto pago (ex.: ebook) só porque o usuário TEM alguma compra `paid`, sem checar se é uma compra do produto certo — `active.some(p => p.status === "paid")`.
- **Faça:** exigir que a compra `paid` não-revogada seja do `product_id` específico daquele produto (ou de um produto "superset" que o inclua). Testar explicitamente: comprar produto A + produto B, reembolsar só A, confirmar que A fica bloqueado mesmo com B ainda pago.
- **Fonte:** .superpowers/sdd/task-3-report.md (commit `75a5d35`)

### CAND · Checagem de acesso pago é fail-closed em qualquer erro/dado ausente
- **Não faça:** tratar erro de banco, `null`/`undefined` inesperado ou linha ausente como "libera acesso" (fail-open) numa função de `canRead`/`getAccessContext`/`tryConsume`.
- **Gatilho:** `acesso-dinheiro`
- **Faça:** qualquer branch de erro ou dado ausente numa checagem de acesso pago deve negar (`{allowed:false, reason:"error"}`), nunca permitir por omissão. Cobrir com teste os dois operandos de condições tipo `if (error || !purchases)` separadamente.
- **Fonte:** .superpowers/sdd/task-3-report.md (regra de acesso, MINOR 5, commit `75a5d35`)

### CAND · Rota que grava prova de consumo deve validar acesso e revalidar dados do cliente
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** aceitar um endpoint que registra "prova de leitura/consumo" (livro-razão de auditoria) checando só se o `contentId` existe no catálogo geral, e confiar em `slug`/`index` enviados pelo cliente sem checagem cruzada.
- **Faça:** antes de gravar qualquer evento de consumo, resolver o direito de acesso do usuário àquele conteúdo específico (`canRead`) e revalidar `slug`/posição contra o estado real do documento no servidor — nunca aceitar como verdade o que o cliente mandou no corpo da requisição.
- **Fonte:** .superpowers/sdd/task-5-report.md (commit `3231c1f`)

### CAND · Elegibilidade a cupom/benefício deve sempre filtrar status=paid
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** conceder cupom/desconto/upgrade baseado em "existe uma compra do produto X", sem filtrar o status dessa compra.
- **Faça:** toda query de elegibilidade a benefício (cupom, upgrade, revogação) deve filtrar explicitamente `status = "paid"` — reembolso/disputa do produto-base não pode deixar o benefício ativo.
- **Fonte:** .superpowers/sdd/fix-cupom-report.md (commit `f8561f0`)

### CAND · Restringir acesso por produto exige cobrir produtos "superset"
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** ao corrigir uma checagem de acesso para exigir compra de um produto-base específico (ex.: "Start"), esquecer que outros produtos vendidos como "inclui tudo do Start" (passes/pacotes maiores) dão o mesmo direito sem exigir a compra do produto-base em si.
- **Faça:** mapear todos os produtos que "incluem" o item restrito antes de travar o acesso por `product_id` único — senão quem pagou o pacote mais caro fica bloqueado do conteúdo mais barato que ele também comprou.
- **Fonte:** .superpowers/sdd/task-3-report.md (Fix 2, commit `59d7e9d`)

### CAND · Concessão de XP/recompensa precisa ser idempotente em todos os pontos de emissão
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** conceder XP/badge/pontos via `insert` simples em múltiplos endpoints, confiando que cada um só roda uma vez — reentrega de webhook ou retry de rede duplica a recompensa.
- **Faça:** usar `upsert` com `onConflict` sobre um índice único (`user_id, action_type, reference_id`) em TODOS os pontos que concedem a recompensa, com `reference_id` sempre não-nulo — não só nos pontos "óbvios".
- **Fonte:** .superpowers/sdd/progress.md (Trilha B Task 2, commit `3be9181`, migration `0025`)

### CAND · Rota que emite sessão a partir de token precisa rate limit e scrub de URL
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** criar uma rota que troca um token por uma sessão autenticada (resgate/magic-link) sem rate limit, deixando o token na URL/histórico do navegador depois de usado, ou devolvendo a mesma mensagem genérica para "token inválido" e "erro de infraestrutura".
- **Faça:** aplicar rate limit (por IP quando não há e-mail no corpo), tirar o token da URL com `history.replaceState`/`location.replace` logo após o uso, e distinguir 404 (token inválido/expirado) de 500 (erro de banco, com CTA de tentar de novo) — confundir os dois manda cliente pagante para "fale com o suporte" por um blip transitório.
- **Fonte:** .superpowers/sdd/task-6-report.md (fix pós-revisão, commit `e2b4c7b`)

### CAND · Ausência de evento client-side não é prova de não-consumo
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** desenhar uma política de negócio (ex.: janela de garantia/reembolso) que trata a AUSÊNCIA de um evento de leitura gravado via `useEffect` no cliente como prova de que o cliente não consumiu o conteúdo — JS desabilitado, bloqueador ou acesso direto por link geram zero eventos mesmo com leitura real.
- **Faça:** tratar o livro-razão de eventos como evidência corroborante (a favor do usuário quando existe), nunca como gate único que nega algo a um cliente pagante pela simples ausência de registro.
- **Fonte:** .superpowers/sdd/progress.md (achado C2, Frente Leitor Protegido, revisão final whole-branch)

### CAND · Invariante de segurança novo precisa cobrir TODOS os caminhos de entrega existentes
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** introduzir um invariante de segurança (ex.: "documento nunca vai inteiro ao cliente, só seção por seção") só na tela nova, deixando uma tela antiga que serve o mesmo conteúdo (ex.: página legada de dashboard) continuar entregando o corpo inteiro do mesmo documento, sem seccionamento e sem registrar evento.
- **Faça:** ao definir um invariante de segurança sobre um tipo de conteúdo, levantar TODOS os pontos do código que servem aquele conteúdo (grep pelo campo/arquivo, não só pela feature nova) antes de considerar o invariante cumprido.
- **Fonte:** .superpowers/sdd/progress.md (achado C3, Frente Leitor Protegido, revisão final whole-branch)

### CAND · `on delete cascade` em tabela de auditoria apaga a prova que ela existe para guardar
- **Gatilho:** `migration`
- **Não faça:** usar `on delete cascade` na FK de usuário de uma tabela append-only que serve de prova de consumo/auditoria para garantia comercial ou defesa de chargeback — excluir a conta apaga a evidência sem decisão explícita.
- **Faça:** deixar a FK sem cascade nas tabelas de auditoria (comentário SQL explicando o porquê); cascade só é aceitável em tabelas de estado/retomada, não nas de livro-razão.
- **Fonte:** .superpowers/sdd/task-2-report.md (commit `711ee2e`)

### CAND · Guard de dedupe de webhook precisa uma flag por side-effect que pode falhar sozinho
- **Gatilho:** `stripe-webhook`
- **Não faça:** usar um guard de dedupe do tipo `if (!purchaseWasCreated && !tokenWasCreated)` quando existe um terceiro side-effect (ex.: criar entitlement) que pode falhar isoladamente numa entrega e ter sucesso na reentrega — a reentrega vê os dois primeiros já feitos, pula o guard inteiro e nunca reexecuta a etapa que ainda faltava (ex.: e-mail de confirmação nunca é enviado).
- **Faça:** toda etapa do webhook que pode falhar independentemente ganha sua própria flag `algoWasCreated`, e o guard de dedupe inclui todas elas — só pula quando TODAS já tiveram sucesso antes.
- **Fonte:** .superpowers/sdd/task-9-report.md (commit `1d674b5`)

### CAND · Webhook da Stripe deve propagar erro de banco como 500, nunca engolir
- **Gatilho:** `stripe-webhook`
- **Não faça:** capturar uma falha de `UPDATE`/`INSERT` no handler de webhook (ex.: revogar acesso em `charge.refunded`/`dispute`) e responder 200 mesmo assim — a Stripe não reentrega, e a revogação nunca acontece.
- **Faça:** propagar o erro de banco como 500 no handler do webhook, para a Stripe reentregar o evento automaticamente; cobrir com teste o caminho de erro do DB retornando 500.
- **Fonte:** .superpowers/sdd/progress.md (Trilha B Task 1, commit `06b118f`, achado "Critical")

### CAND · Mapeamento product_id → plano precisa de fonte única entre webhook e checkout
- **Gatilho:** `stripe-webhook`
- **Não faça:** duplicar os literais de `product_id` da Stripe (ex.: `"regular_pass"`, `"advanced_pass"`) em `checkout/route.ts`, `webhooks/stripe/route.ts` e em qualquer lógica de acesso — se um id mudar num lugar só, o passe é vendido mas nenhum entitlement é criado, sem erro visível.
- **Faça:** definir as constantes de `product_id` em um único módulo de dados e importar dele em todos os pontos (webhook, checkout, checagem de acesso) — nunca literais soltos repetidos.
- **Fonte:** .superpowers/sdd/progress.md (Frente Leitor Protegido, commit `3a24eba`)

### CAND · Teste do próprio brief pode "abençoar" um bug de acesso
- **Gatilho:** `spec`
- **Não faça:** considerar uma task de acesso/dinheiro concluída só porque os testes do brief passam — se o brief foi escrito com um requisito errado, o teste dele reflete e endossa o mesmo erro (ex.: um teste que espera reembolso parcial não derrubar acesso, quando deveria).
- **Faça:** em revisão de acesso/dinheiro, reavaliar o requisito de negócio a partir de cenários reais (que produto foi revogado, quem mais tinha o quê), não só confirmar que os testes do brief estão verdes.
- **Fonte:** .superpowers/sdd/task-3-report.md (Fix pós-revisão, IMPORTANT 1, commit `75a5d35`)

### CAND · Brief de migration deve incluir os tipos TS da tabela nova na mesma task
- **Gatilho:** `spec`
- **Não faça:** escrever uma task de "criar migration X" sem instruir também a adicionar os tipos correspondentes em `src/types/index.ts` — a task seguinte que consome a tabela nova quebra o `tsc` (`never`/`never[]`) e precisa expandir escopo por conta própria para destravar.
- **Faça:** toda task de migration no brief deve empacotar os dois passos juntos: SQL da tabela + bloco de tipos espelhando as colunas, no mesmo commit.
- **Fonte:** .superpowers/sdd/task-3-report.md ("Ajuste fora do brief")

### CAND · Specs multi-task precisam de pre-flight ponta a ponta antes de começar a execução
- **Gatilho:** `spec`
- **Não faça:** liberar um plano de várias tasks sequenciais para execução sem verificar se toda constante/função que uma task posterior consome foi de fato definida por uma task anterior.
- **Faça:** rodar um passo de pre-flight que percorre as interfaces entre tasks do plano antes da primeira task começar — achar o furo (ex.: `READER_CONTENT_IDS` usado na Task 5 mas nunca definido na Task 2) ali é muito mais barato do que no meio da execução.
- **Fonte:** .superpowers/sdd/progress.md (Frente Leitor Protegido, Pre-flight, commit `7985f86`)

### CAND · Código literal em brief deve considerar o tsconfig real do projeto
- **Gatilho:** `spec`
- **Não faça:** colar `[...new Set(...)]` (spread de `Set`) em código de brief sem checar se o `tsconfig.json` do projeto tem `target`/`downlevelIteration` que permitam isso — o repo não tem, e o erro (`TS2802`) já se repetiu em duas tasks diferentes.
- **Faça:** usar `Array.from(new Set(...))` como padrão neste projeto para qualquer código novo de brief que precise espalhar um `Set`; ou, ao escrever um brief novo, checar o `tsconfig.json` antes de embutir sintaxe ES2015+ literal.
- **Fonte:** .superpowers/sdd/task-4b-report.md (commit `4d5ed53`) e .superpowers/sdd/task-6b-report.md (commit `48837ef`)

### CAND · Componente compartilhado que vira dark-aware precisa auditar contextos de cor fixa existentes
- **Gatilho:** `visual`
- **Não faça:** trocar as cores hardcoded de um componente compartilhado (`text-zinc-900` → `text-foreground`) para deixá-lo dark-aware, sem checar todos os lugares onde ele já é usado dentro de um wrapper de cor fixa (ex.: `GlassCard` com `bg-white/70` fixo) — o texto vira quase-branco sobre fundo branco no tema padrão escuro.
- **Faça:** ao tornar um componente compartilhado dark-aware, dar a ele uma variante explícita (`surface="themed"|"light"`) e varrer todos os consumidores existentes para decidir qual variante cada um precisa, antes de fechar a mudança.
- **Fonte:** .superpowers/sdd/final-fixes-leitor-report.md (I1, commit `f25a999`)

### CAND · Overlay/sheet mobile construído do zero nasce sem focus-trap se não for checklist desde a v1
- **Gatilho:** `visual`
- **Não faça:** tratar "sem focus-trap" num sheet/dialog mobile próprio (sem Radix/headless UI) como minor a ser corrigido depois — o padrão se repetiu em pelo menos três frentes diferentes (sumário do leitor, card de perfil flutuante, drawer mobile do design v2).
- **Faça:** ao construir qualquer overlay/sheet/dialog do zero, incluir Tab/Shift+Tab cíclico entre os elementos focáveis + fechar com Escape/clique-fora como parte da primeira versão, não como item deferido de revisão.
- **Fonte:** .superpowers/sdd/final-fixes-leitor-report.md (M6, commit `d1eb300`); .superpowers/sdd/frente-C-report.md; .superpowers/sdd/progress.md (Frente 1, Design v2)

### CAND · Nunca pushar código que dependa de uma migration nova antes de aplicá-la no remoto
- **Gatilho:** `deploy`
- **Não faça:** dar `git push` de código que usa `upsert(... onConflict: "...")` sobre um índice único que só existe numa migration ainda não aplicada no banco remoto — os testes passam porque mockam o Supabase, mas em produção o `ON CONFLICT` falha (ou nunca deduplica) silenciosamente.
- **Faça:** sequenciar sempre: terminar o código localmente → aplicar a migration no remoto (SQL Editor) e confirmar com um `select`/checagem do índice → só então dar push do código que depende dela.
- **Fonte:** .superpowers/sdd/progress.md (Trilha B, ">>> ORDEM DE DEPLOY (CRITICO)")

### CAND · Reports de subagentes nomeados só por número de task colidem entre frentes
- **Gatilho:** `docs-continuidade`
- **Não faça:** nomear o report de uma task só como `task-N-report.md` quando o projeto já roda várias frentes em paralelo/sequência — o mesmo caminho é reaproveitado por uma frente diferente semanas depois e sobrescreve o conteúdo anterior, que se perde de vez porque `.superpowers/` não é versionado no repo.
- **Faça:** usar sufixo de frente no nome do report desde a primeira task (`task-N-<slug-da-frente>-report.md`), do mesmo jeito que já é feito para blog/suporte/fórum/feed — nunca reaproveitar `task-N-report.md` puro entre frentes diferentes.
- **Fonte:** .superpowers/sdd/task-3-report.md, .superpowers/sdd/task-5-report.md, .superpowers/sdd/task-6-report.md (notas de sobrescrita de report anterior)

### CAND · Frente que termina com commits locais não pushados precisa registrar isso de forma redundante
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar implícito, só no meio do log de progresso, que uma frente tem commits locais bloqueados de propósito (migration pendente, verificação visual pendente) — a próxima sessão (possivelmente em outro computador) pode dar `git push` sem saber do bloqueio.
- **Faça:** registrar o bloqueio de forma redundante e destacada (marcador tipo `>>> NADA PUSHADO`, mais a razão exata) tanto no `progress.md` da frente quanto no `docs/ESTADO-ATUAL.md` do projeto — dois lugares, não um.
- **Fonte:** .superpowers/sdd/progress.md (marcadores ">>> NADA PUSHADO", Frente Leitor Protegido)

### CAND · Coordenador deve assumir gate e commit quando um subagente cai no meio por falha de API
- **Gatilho:** `subagentes`
- **Não faça:** descartar ou reiniciar do zero uma task cujo subagente implementador caiu no meio por instabilidade de API — o trabalho já feito (arquivos criados/editados) pode estar correto e só falta fechar o ciclo.
- **Faça:** ao detectar que um subagente caiu no meio, o coordenador verifica o estado real do working tree antes de decidir, e se o trabalho estiver correto, ele mesmo roda o gate (`tsc`/testes) e faz o commit — sem perder o progresso já feito pelo agente que caiu.
- **Fonte:** .superpowers/sdd/progress.md (Design v2 Frente 2, "Item PostCard + relativeTime", commit `2eb211d`)

---

Total: 23 candidatas de 43 reports lidos.
