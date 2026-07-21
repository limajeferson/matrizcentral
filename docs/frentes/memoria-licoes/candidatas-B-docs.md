# Candidatas B — mineração dos docs de continuidade

Candidatas extraídas de `docs/ESTADO-ATUAL.md` (seção "📓 Log de sessões") e dos
READMEs de frente `hardening-criticos`, `leitor-protegido`, `lancamento-final` e
`design-v2`. Foco distintivo deste corpus: lições de **processo e continuidade**
(drift de docs, ordem de deploy, decisões revertidas, handoffs perdidos) — outra
natureza de lição que os reports técnicos do SDD (mineração A). Sem numeração
`L-NNN` — a curadoria final (Task 4) decide o que entra em `docs/LICOES.md`.

---

### CAND · Seções de estado tratadas como append-only causam drift entre o topo e o corpo do documento
- **Gatilho:** `docs-continuidade`
- **Não faça:** empilhar atualizações nas seções de estado de um doc de continuidade
  ("PRÓXIMA AÇÃO", "Estado do git", tabela de frentes) sem sobrescrever o que já
  não vale — o topo do arquivo passa a contradizer o meio.
- **Faça:** tratar seções de estado como *sobrescritas* a cada atualização; só um
  log explicitamente append-only (ex.: "Log de sessões") acumula histórico.
  Registrar essa convenção no topo do próprio arquivo para não reabrir a dúvida.
- **Fonte:** docs/ESTADO-ATUAL.md, nota de convenção (topo do arquivo) e log de
  sessões de 2026-07-20 ("Follow-up: reconciliação do mapa neural...", achado
  "Drift dos docs corrigido").

### CAND · Push pra master com migration criada mas não aplicada no remoto derruba a feature em silêncio
- **Gatilho:** `deploy`, `migration`
- **Não faça:** dar `git push` numa `master` com auto-deploy quando existe
  migration nova no disco ainda não aplicada no banco remoto — a feature "parece
  funcionar" (erro engolido/retorno nulo) enquanto o rastro de dados fica vazio,
  falha silenciosa.
- **Faça:** aplicar toda migration pendente no remoto e verificar com um `select`
  de checagem *antes* do push; documentar isso como bloqueador explícito no
  README da frente enquanto não for feito.
- **Fonte:** docs/frentes/leitor-protegido/README.md ("🚨 LEIA ANTES DE FAZER
  QUALQUER COISA"); docs/ESTADO-ATUAL.md log de 2026-07-16 (Trilha B: "Migrations
  0025/0026 aplicadas no remoto... ANTES do push (senão o upsert quebraria)").

### CAND · Gate de acesso por enum fechado de `product_id` exige auditoria de dados legados antes do deploy
- **Gatilho:** `migration`, `acesso-dinheiro`
- **Não faça:** introduzir uma checagem de acesso pago que só reconhece um
  conjunto fechado de `product_id` sem antes auditar os dados de produção — uma
  linha legada fora do enum (ex.: `product_id='ebook'`) trava um comprador real
  que já pagou.
- **Faça:** antes de subir um gate de acesso baseado em enum/lista fechada, rodar
  `select status, product_id, count(*) from purchases group by 1,2` (ou
  equivalente) e normalizar qualquer valor fora do esperado, com autorização
  explícita do usuário quando envolver `UPDATE` em tabela de dinheiro.
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-20 ("LEITOR PROTEGIDO DESTRAVADO
  (2 dos 3 bloqueadores caíram)..."); docs/frentes/leitor-protegido/README.md
  (bloqueador 2, "Conferir compras legadas — o risco mais caro da frente").

### CAND · Política que colide com direito irrenunciável do CDC precisa de pesquisa jurídica antes de travar, não depois
- **Gatilho:** `spec`
- **Não faça:** travar uma política comercial (ex.: condicionar reembolso nos
  primeiros dias a "consumo comprovado") sem checar antes se ela esbarra em
  norma de ordem pública — a decisão teve que ser revogada depois de já estar
  planejada/documentada como travada.
- **Faça:** antes de travar qualquer política que toca direito irrenunciável do
  consumidor (ex.: art. 49 do CDC, arrependimento incondicional em 7 dias),
  pesquisar a base legal primeiro; só travar o que sobrevive à checagem, e
  registrar a revogação com a causa (não apagar o histórico da decisão errada).
- **Fonte:** docs/frentes/lancamento-final/README.md ("✅ Decisão da garantia —
  RESOLVIDA em 2026-07-20 (substitui o que havia aqui)").

### CAND · Ausência de registro de consumo não é prova de não-consumo
- **Gatilho:** `acesso-dinheiro`, `spec`
- **Não faça:** tratar a falta de um evento de leitura/consumo no livro-razão
  como prova de que o cliente não usou o produto, ao decidir reembolso ou
  antiabuso.
- **Faça:** tratar o livro-razão de consumo como evidência corroborante, nunca
  como portão único; a trava contra má-fé é operacional (revogação real de
  acesso), não um cheque binário de "log vazio = não consumiu".
- **Fonte:** docs/frentes/lancamento-final/README.md (política vigente, "regra
  vinculante": "Ausência de registro de leitura NÃO é prova de não-consumo").

### CAND · Quando o bug é estrutural, a revisão precisa reavaliar a spec, não só a implementação
- **Gatilho:** `spec`
- **Não faça:** revisar apenas o código do implementador presumindo que a spec
  já está correta — furos graves (revogação por usuário em vez de produto, rota
  de prova de consumo sem checar acesso, `on delete cascade` apagando a própria
  prova de auditoria) foram rastreados até a própria spec, não até erros de
  implementação.
- **Faça:** quando a revisão encontra um bug com cara de "faltou pensar nisso",
  perguntar se a causa raiz está na spec antes de corrigir só o código — e
  corrigir a spec junto, para a próxima frente parecida não repetir o mesmo furo.
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-20 ("FRENTE LEITOR PROTEGIDO
  construída (6 tasks) — NÃO PUSHADA": "As revisões pegaram furos graves, quase
  todos da própria spec").

### CAND · Migrar um item de trabalho para outro programa exige fechar explicitamente a fila de origem
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar um item de trabalho migrado/absorvido por um novo
  programa (ex.: "Frente 5" de um programa virou "Trilha D" de outro) sem
  atualizar o README de origem — cria risco de duas filas concorrentes
  descrevendo o mesmo trabalho de formas divergentes.
- **Faça:** ao migrar/absorver um item entre programas, no mesmo commit da
  decisão, atualizar o doc de origem para "migrado para X, esta fila está
  encerrada" e apontar para o novo local.
- **Fonte:** docs/frentes/design-v2/README.md ("Frente 5... migrada para a
  Trilha D... Programa design-v2: encerrado como fila própria"); docs/ESTADO-ATUAL.md
  log de 2026-07-20 ("Duas filas concorrentes eliminadas").

### CAND · Achados de auditoria sem task correspondente viram órfãos sem uma seção dedicada de rastreio
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar achados de auditoria/revisão sem task em nenhum plano —
  eles somem silenciosamente (ex.: reconciliação do histórico de migrations
  divergente, gating de APIs de mutação, decisões C3/I4 do leitor-protegido).
- **Faça:** manter uma seção dedicada (ex.: "Rastreadas, sem dono") no README do
  programa listando pendências sem plano/dono, para não serem confundidas com
  resolvidas nem esquecidas entre sessões.
- **Fonte:** docs/frentes/lancamento-final/README.md ("📌 Rastreadas, sem dono").

### CAND · Plano escrito de uma vez e executado meses depois precisa de revalidação de caminhos contra o código real
- **Gatilho:** `spec`
- **Não faça:** executar um plano/spec escrito numa sessão anterior presumindo
  que os caminhos de arquivo e trechos de código citados continuam corretos — o
  layout muda conforme outras frentes entregam nesse meio-tempo (ex.: subpáginas
  que um plano apontava para `dashboard/` na verdade já viviam sob
  `dashboard/[token]/`).
- **Faça:** antes de executar um plano antigo (ex.: specs/planos planejados
  todos de uma vez, meses antes da execução), fazer um sweep revalidando
  caminhos e referências de código contra o estado real do repositório.
- **Fonte:** docs/frentes/lancamento-final/README.md ("✅ Revalidação dos planos
  (2026-07-20)").

### CAND · Componente aparentemente morto pode ainda ter consumidor em outra página — grep antes de remover
- **Gatilho:** `spec`
- **Não faça:** planejar a remoção de um componente antigo (ex.: `Header.tsx`/
  `Footer.tsx`) só porque a página principal já não o usa mais.
- **Faça:** grepar o nome do componente/arquivo em todo o repositório antes de
  remover — outra página (ex.: `/oferta`) pode ainda depender dele, e a ação
  certa é repontar, não apagar.
- **Fonte:** docs/frentes/lancamento-final/README.md ("F5: `Header.tsx`/
  `Footer.tsx` ainda são usados por `/oferta` → repontar, não remover").

### CAND · Levantar "todos os usuários de um helper" precisa incluir rotas de webhook/infra, não só páginas
- **Gatilho:** `stripe-webhook`
- **Não faça:** ao migrar todos os pontos de uso de um helper (ex.:
  `isTokenExpired`) para um novo padrão, enumerar apenas os call sites dentro do
  fluxo de páginas do app.
- **Faça:** incluir explicitamente rotas de webhook/infra na varredura de
  usuários de um helper — elas ficam fora do fluxo visível de páginas e são
  fáceis de esquecer, mas continuam escrevendo dados que o helper depois vai
  rejeitar (ou aceitar incorretamente).
- **Fonte:** docs/frentes/lancamento-final/README.md ("G4: o webhook da Stripe é
  um 14º usuário de `isTokenExpired`, fora da migração de propósito").

### CAND · Fix visual pontual deve varrer por duplicações do mesmo dado/regra em outros componentes
- **Gatilho:** `visual`
- **Não faça:** considerar um fix visual "completo" só porque o componente
  apontado pelo usuário foi corrigido, quando o mesmo dado ou a mesma regra de
  estilo é renderizado em mais de um lugar da UI.
- **Faça:** ao corrigir um bug visual específico (ex.: opacidade/traço de um
  valor de preço), grepar por outros componentes que exibem o mesmo dado antes
  de considerar o fix encerrado.
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-21 ("o valor aparecia em dois
  comparativos (`PricingV2` e `OpportunitySection`) e o segundo tinha passado
  batido").

### CAND · Indisponibilidade de um MCP não é permanente — reverificar antes de manter o workaround manual
- **Gatilho:** `migration`
- **Não faça:** assumir que, porque o MCP de um serviço (ex.: Supabase) está sem
  permissão nesta conta, o único caminho para sempre segue sendo o manual (ex.:
  navegador + injeção no Monaco).
- **Faça:** reverificar periodicamente se o CLI oficial ganhou um comando direto
  que substitui o workaround manual — isso mudou o método padrão de aplicar
  migration no meio do projeto (`npx supabase db query --linked` aposentou a
  dependência do navegador).
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-20 ("LEITOR PROTEGIDO
  DESTRAVADO (2 dos 3 bloqueadores caíram) + descoberto o caminho definitivo de
  SQL").

### CAND · Webhook de pagamento não pode responder 200 quando um passo crítico falha
- **Gatilho:** `stripe-webhook`, `acesso-dinheiro`
- **Não faça:** um webhook de pagamento responder 200 quando um passo
  downstream crítico falha (ex.: inserir o token de acesso) — a plataforma de
  pagamento não reentrega o evento e o cliente pagou sem receber acesso.
- **Faça:** desenhar cada passo do webhook como idempotente; se um passo crítico
  falhar, retornar 500 para forçar reentrega. Passos não-críticos (ex.: e-mail)
  podem ser best-effort e não devem derrubar o webhook; oferecer também um
  caminho de recuperação self-service (reenvio, tela de sucesso que resolve o
  acesso pela sessão) como segunda camada de defesa.
- **Fonte:** docs/frentes/hardening-criticos/README.md ("#2 — Cliente paga e
  pode nunca receber o acesso").

### CAND · Críticos de auditoria que tocam dinheiro/clientes reais bloqueiam a fila de features novas
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** seguir construindo frentes novas de produto quando uma
  auditoria já identificou críticos que afetam clientes reais ou receita hoje
  (ex.: certificado forjável, cliente que pode pagar e nunca receber acesso).
- **Faça:** tratar achados críticos de auditoria que tocam dinheiro/acesso de
  clientes reais como bloqueadores da fila — resolvê-los antes de retomar
  features novas, mesmo que isso signifique abrir uma frente de hardening fora
  da ordem planejada.
- **Fonte:** docs/frentes/hardening-criticos/README.md (Objetivo: "Corrigir,
  antes de construir qualquer frente nova, os problemas que afetam clientes
  reais e a receita hoje").

### CAND · Passo de verificação que depende de recurso de ambiente instável precisa de prova alternativa quando o recurso falta
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar a verificação visual (navegador automatizado) como o
  único caminho para fechar um invariante sensível — se o recurso cair numa
  sessão, o bloqueador trava a frente inteira até a próxima sessão em que ele
  voltar.
- **Faça:** quando um passo de verificação depende de um recurso de ambiente
  instável (ex.: MCP de navegador indisponível), verificar por construção o que
  for possível sem ele (ex.: provar por análise estática que um dado sensível
  nunca sai do servidor) e deixar marcado, explicitamente, só o que realmente
  exige olho humano.
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-20 ("LEITOR PROTEGIDO
  DESTRAVADO...": "Invariante do leitor provado por construção... Falta: olho
  humano no visual").

---

Total: 16 candidatas.
