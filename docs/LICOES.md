# 📚 LIÇÕES — Matriz Central

> Base de lições destiladas de erros e acertos REAIS deste projeto (arquitetura
> inspirada no EMG — ver `docs/frentes/memoria-licoes/spec.md`). A fase cara
> (minerar reviews, reports e sessões) acontece **offline**, ao fim de cada
> frente; em execução, consulta-se só a seção do gatilho relevante.

## Como usar (runtime)

- **Montando um brief de task (SDD):** copie para o brief as lições da seção do
  gatilho da task (ex.: task com migration → seção `migration`). Máx. ~6 lições
  por brief; se houver mais, escolha as mais específicas ao caso.
- **Retomando sessão / iniciando frente:** leia o índice e as seções dos
  gatilhos que a frente vai tocar.
- A tabela "🚩 Sinais" do `PLAYBOOK-EXECUCAO.md` continua sendo o resumo de alto
  risco lido sempre; este arquivo é a base completa, consultada por gatilho.

## Como manter (offline — etapa 7 do fluxo de frente no PLAYBOOK)

1. Ao fechar uma frente, varra os findings das revisões (reports em
   `.superpowers/sdd/`) e o que a sessão registrou de erro/correção.
2. **Dedup antes de adicionar:** se uma lição existente cobre o caso, edite-a
   em vez de criar outra.
3. **Contradição resolve-se apagando:** lição invalidada pela realidade é
   removida (explicar no commit), nunca empilhada.
4. Formato obrigatório (uma lição = um bloco):

    ### L-NNN · Título curto
    - **Gatilho:** `tag` (1–2 da taxonomia abaixo)
    - **Não faça:** o erro observado, específico.
    - **Faça:** a correção, prescritiva.
    - **Fonte:** commit/report/sessão.

5. Numeração `L-NNN` sequencial global, nunca reutilizada (mesmo após remoção).

**Taxonomia de gatilhos (fixa):** `migration` · `acesso-dinheiro` · `spec` ·
`visual` · `deploy` · `subagentes` · `docs-continuidade` · `stripe-webhook`.
Criar tag nova exige editar este arquivo e o PLAYBOOK juntos.

---

## `migration`

### L-001 · `on delete cascade` em tabela de auditoria apaga a prova que ela existe para guardar
- **Gatilho:** `migration`
- **Não faça:** usar `on delete cascade` na FK de usuário de uma tabela append-only que serve de prova de consumo/auditoria para garantia comercial ou defesa de chargeback — excluir a conta apaga a evidência sem decisão explícita.
- **Faça:** deixar a FK sem cascade nas tabelas de auditoria (comentário SQL explicando o porquê); cascade só é aceitável em tabelas de estado/retomada, não nas de livro-razão.
- **Fonte:** .superpowers/sdd/task-2-report.md (commit `711ee2e`).

### L-002 · Indisponibilidade de um MCP não é permanente — reverificar antes de manter o workaround manual
- **Gatilho:** `migration`
- **Não faça:** assumir que, porque o MCP de um serviço (ex.: Supabase) está sem permissão nesta conta, o único caminho segue sendo o manual (navegador + injeção no Monaco) para sempre.
- **Faça:** reverificar periodicamente se o CLI oficial ganhou um comando direto que substitui o workaround manual — foi assim que `npx supabase db query --linked` aposentou a dependência do navegador no meio do projeto.
- **Fonte:** docs/ESTADO-ATUAL.md, log de 2026-07-20 ("LEITOR PROTEGIDO DESTRAVADO... descoberto o caminho definitivo de SQL").

## `acesso-dinheiro`

### L-003 · Checagem de acesso pago é fail-closed em qualquer erro ou dado ausente
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** tratar erro de banco, `null`/`undefined` inesperado ou linha ausente como "libera acesso" (fail-open) numa função de `canRead`/`getAccessContext`/`tryConsume`.
- **Faça:** qualquer branch de erro ou dado ausente numa checagem de acesso pago deve negar (`{allowed:false, reason:"error"}`), nunca permitir por omissão. Cobrir com teste os dois operandos de condições tipo `if (error || !purchases)` separadamente.
- **Fonte:** .superpowers/sdd/task-3-report.md (regra de acesso, MINOR 5, commit `75a5d35`).

### L-004 · Revogação de acesso deve ser por produto, não por usuário
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** liberar um produto pago (ex.: ebook) só porque o usuário TEM alguma compra `paid`, sem checar se é uma compra do produto certo — `active.some(p => p.status === "paid")`.
- **Faça:** exigir que a compra `paid` não-revogada seja do `product_id` específico daquele produto (ou de um produto "superset" que o inclua). Testar explicitamente: comprar produto A + produto B, reembolsar só A, confirmar que A fica bloqueado mesmo com B ainda pago.
- **Fonte:** .superpowers/sdd/task-3-report.md (commit `75a5d35`).

### L-005 · Restringir acesso por produto exige cobrir produtos "superset"
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** ao corrigir uma checagem de acesso para exigir compra de um produto-base específico (ex.: "Start"), esquecer que outros produtos vendidos como "inclui tudo do Start" (passes/pacotes maiores) dão o mesmo direito sem exigir a compra do produto-base em si.
- **Faça:** mapear todos os produtos que "incluem" o item restrito antes de travar o acesso por `product_id` único — senão quem pagou o pacote mais caro fica bloqueado do conteúdo mais barato que ele também comprou.
- **Fonte:** .superpowers/sdd/task-3-report.md (Fix 2, commit `59d7e9d`).

### L-006 · Elegibilidade a cupom/benefício deve sempre filtrar status=paid
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** conceder cupom/desconto/upgrade baseado em "existe uma compra do produto X", sem filtrar o status dessa compra.
- **Faça:** toda query de elegibilidade a benefício (cupom, upgrade, revogação) deve filtrar explicitamente `status = "paid"` — reembolso/disputa do produto-base não pode deixar o benefício ativo.
- **Fonte:** .superpowers/sdd/fix-cupom-report.md (commit `f8561f0`).

### L-007 · Rota que grava prova de consumo deve validar acesso e revalidar dados do cliente
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** aceitar um endpoint que registra "prova de leitura/consumo" (livro-razão de auditoria) checando só se o `contentId` existe no catálogo geral, e confiar em `slug`/`index` enviados pelo cliente sem checagem cruzada.
- **Faça:** antes de gravar qualquer evento de consumo, resolver o direito de acesso do usuário àquele conteúdo específico (`canRead`) e revalidar `slug`/posição contra o estado real do documento no servidor — nunca aceitar como verdade o que o cliente mandou no corpo da requisição.
- **Fonte:** .superpowers/sdd/task-5-report.md (commit `3231c1f`).

### L-008 · Invariante de segurança novo precisa cobrir TODOS os caminhos de entrega existentes
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** introduzir um invariante de segurança (ex.: "documento nunca vai inteiro ao cliente, só seção por seção") só na tela nova, deixando uma tela antiga que serve o mesmo conteúdo (ex.: página legada de dashboard por token) continuar entregando o corpo inteiro do documento, sem seccionamento e sem registrar evento.
- **Faça:** ao definir um invariante de segurança sobre um tipo de conteúdo, levantar TODOS os pontos do código que servem aquele conteúdo (grep pelo campo/arquivo, não só pela feature nova) antes de considerar o invariante cumprido — e decidir explicitamente (redirecionar ou aceitar por escrito, com dono e prazo) o que fazer com cada caminho remanescente, em vez de deixar em aberto sem dono.
- **Fonte:** .superpowers/sdd/progress.md (achado C3, Frente Leitor Protegido, revisão final whole-branch); docs/frentes/leitor-protegido/README.md ("Decisão aberta — C3", ainda não remediado).

### L-009 · Ausência de evento/registro de consumo não é prova de não-consumo
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** tratar a AUSÊNCIA de um evento de leitura/consumo (gravado via `useEffect` no cliente, ou qualquer livro-razão) como prova de que o cliente não consumiu o conteúdo, ao desenhar política de garantia/reembolso/antiabuso — JS desabilitado, bloqueador ou acesso direto por link geram zero eventos mesmo com leitura real.
- **Faça:** tratar o livro-razão de consumo como evidência corroborante (a favor do usuário quando existe), nunca como gate único que nega algo a um cliente pagante pela ausência de registro; a trava contra má-fé é operacional (revogação real de acesso), não um cheque binário "log vazio = não consumiu".
- **Fonte:** .superpowers/sdd/progress.md (achado C2, Frente Leitor Protegido, revisão final whole-branch); docs/frentes/lancamento-final/README.md (regra vinculante adotada).

### L-010 · Concessão de XP/recompensa precisa ser idempotente em todos os pontos de emissão
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** conceder XP/badge/pontos via `insert` simples em múltiplos endpoints, confiando que cada um só roda uma vez — reentrega de webhook ou retry de rede duplica a recompensa.
- **Faça:** usar `upsert` com `onConflict` sobre um índice único (`user_id, action_type, reference_id`) em TODOS os pontos que concedem a recompensa, com `reference_id` sempre não-nulo — não só nos pontos "óbvios".
- **Fonte:** .superpowers/sdd/progress.md (Trilha B Task 2, commit `3be9181`, migration `0025`).

### L-011 · Rota que emite sessão a partir de token precisa rate limit e scrub de URL
- **Gatilho:** `acesso-dinheiro`
- **Não faça:** criar uma rota que troca um token por uma sessão autenticada (resgate/magic-link) sem rate limit, deixando o token na URL/histórico do navegador depois de usado, ou devolvendo a mesma mensagem genérica para "token inválido" e "erro de infraestrutura".
- **Faça:** aplicar rate limit (por IP quando não há e-mail no corpo), tirar o token da URL com `history.replaceState`/`location.replace` logo após o uso, e distinguir 404 (token inválido/expirado) de 500 (erro de banco, com CTA de tentar de novo) — confundir os dois manda cliente pagante para "fale com o suporte" por um blip transitório.
- **Fonte:** .superpowers/sdd/task-6-report.md (fix pós-revisão, commit `e2b4c7b`).

### L-012 · Gate de acesso por enum fechado de `product_id` exige auditoria de dados legados antes do deploy
- **Gatilho:** `acesso-dinheiro`, `migration`
- **Não faça:** introduzir uma checagem de acesso pago que só reconhece um conjunto fechado de `product_id` sem antes auditar os dados de produção — uma linha legada fora do enum (ex.: `product_id='ebook'`) trava um comprador real que já pagou.
- **Faça:** antes de subir um gate de acesso baseado em enum/lista fechada, rodar `select status, product_id, count(*) from purchases group by 1,2` (ou equivalente) e normalizar qualquer valor fora do esperado, com autorização explícita do usuário quando envolver `UPDATE` em tabela de dinheiro.
- **Fonte:** docs/ESTADO-ATUAL.md, log de 2026-07-20 ("LEITOR PROTEGIDO DESTRAVADO..."); docs/frentes/leitor-protegido/README.md (bloqueador 2, "Conferir compras legadas — o risco mais caro da frente").

## `spec`

### L-013 · Revisão de acesso/dinheiro precisa reavaliar a spec, não só confiar no gate verde do brief
- **Gatilho:** `spec`
- **Não faça:** considerar uma task de acesso/dinheiro concluída só porque os testes do próprio brief passam, ou revisar apenas a implementação presumindo que a spec já está correta — se o brief/spec tem um requisito errado, o teste dele reflete e endossa o mesmo erro.
- **Faça:** em revisão de acesso/dinheiro, reavaliar o requisito de negócio a partir de cenários reais (que produto foi revogado, quem mais tinha o quê) e, quando o bug tem cara de "faltou pensar nisso", perguntar se a causa raiz está na spec — corrigindo a spec junto, não só o código, para a próxima frente parecida não repetir o furo.
- **Fonte:** .superpowers/sdd/task-3-report.md (Fix pós-revisão, IMPORTANT 1, commit `75a5d35`); docs/ESTADO-ATUAL.md log de 2026-07-20 ("FRENTE LEITOR PROTEGIDO... furos graves, quase todos da própria spec").
  — resumida também no PLAYBOOK (tabela 🚩 Sinais: "O gate está verde, pode subir" / "O plano diz X, então X está certo").

### L-014 · Brief de migration deve incluir os tipos TS da tabela nova na mesma task
- **Gatilho:** `spec`
- **Não faça:** escrever uma task de "criar migration X" sem instruir também a adicionar os tipos correspondentes em `src/types/index.ts` — a task seguinte que consome a tabela nova quebra o `tsc` (`never`/`never[]`) e precisa expandir escopo por conta própria para destravar.
- **Faça:** toda task de migration no brief deve empacotar os dois passos juntos: SQL da tabela + bloco de tipos espelhando as colunas, no mesmo commit.
- **Fonte:** .superpowers/sdd/task-3-report.md ("Ajuste fora do brief").

### L-015 · Specs multi-task precisam de pre-flight ponta a ponta antes de começar a execução
- **Gatilho:** `spec`
- **Não faça:** liberar um plano de várias tasks sequenciais para execução sem verificar se toda constante/função que uma task posterior consome foi de fato definida por uma task anterior.
- **Faça:** rodar um passo de pre-flight que percorre as interfaces entre tasks do plano antes da primeira task começar — achar o furo (ex.: `READER_CONTENT_IDS` usado na Task 5 mas nunca definido na Task 2) ali é muito mais barato do que no meio da execução.
- **Fonte:** .superpowers/sdd/progress.md (Frente Leitor Protegido, Pre-flight, commit `7985f86`).
  — resumida também no PLAYBOOK (seção "Fluxo padrão de uma frente", passo 3: "Pre-flight — reler o plano procurando furos ANTES de despachar").

### L-016 · Código literal em brief deve considerar o tsconfig real do projeto
- **Gatilho:** `spec`
- **Não faça:** colar `[...new Set(...)]` (spread de `Set`) em código de brief sem checar se o `tsconfig.json` do projeto tem `target`/`downlevelIteration` que permitam isso — o repo não tem, e o erro (`TS2802`) já se repetiu em duas tasks diferentes.
- **Faça:** usar `Array.from(new Set(...))` como padrão neste projeto para qualquer código novo de brief que precise espalhar um `Set`; ou, ao escrever um brief novo, checar o `tsconfig.json` antes de embutir sintaxe ES2015+ literal.
- **Fonte:** .superpowers/sdd/task-4b-report.md (commit `4d5ed53`) e .superpowers/sdd/task-6b-report.md (commit `48837ef`).

### L-017 · Política que colide com direito irrenunciável do CDC precisa de pesquisa jurídica antes de travar
- **Gatilho:** `spec`
- **Não faça:** travar uma política comercial (ex.: condicionar reembolso nos primeiros dias a "consumo comprovado") sem checar antes se ela esbarra em norma de ordem pública — a decisão teve que ser revogada depois de já estar planejada/documentada como travada.
- **Faça:** antes de travar qualquer política que toca direito irrenunciável do consumidor (ex.: art. 49 do CDC, arrependimento incondicional em 7 dias), pesquisar a base legal primeiro; só travar o que sobrevive à checagem, e registrar a revogação com a causa (não apagar o histórico da decisão errada).
- **Fonte:** docs/frentes/lancamento-final/README.md ("✅ Decisão da garantia — RESOLVIDA em 2026-07-20").

### L-018 · Plano escrito de uma vez e executado meses depois precisa de revalidação de caminhos contra o código real
- **Gatilho:** `spec`
- **Não faça:** executar um plano/spec escrito numa sessão anterior presumindo que os caminhos de arquivo e trechos de código citados continuam corretos — o layout muda conforme outras frentes entregam nesse meio-tempo.
- **Faça:** antes de executar um plano antigo, fazer um sweep revalidando caminhos e referências de código contra o estado real do repositório.
- **Fonte:** docs/frentes/lancamento-final/README.md ("✅ Revalidação dos planos (2026-07-20)").

### L-036 · Valor externo tipado como união literal precisa de validador na fonte única — nem `in`, nem cast `as`
- **Gatilho:** `spec`, `acesso-dinheiro`
- **Não faça:** validar uma string vinda de fora (banco, request, e-mail) contra uma união literal usando `valor in OBJETO` (o operador `in` aceita chaves de protótipo como `"toString"`) nem confiar num cast cego `valor as MeuTipo` — no feed, o cast cego de `users.capacity_tier` faria `CAPACITY_PATHS[tier]` virar `undefined` e o Server Component lançar, derrubando a página inteira para aquele usuário.
- **Faça:** exportar UM validador do módulo fonte-única (ex.: `toCapacityTier(value: unknown): Tier | undefined` com allow-list derivada de `Object.keys(FONTE)`), usá-lo em TODO ponto de entrada do valor (rotas, páginas, e-mails) e degradar `undefined` para o comportamento neutro (card não renderiza, e-mail sem a dica). Teste de regressão: chaves de protótipo → `undefined`.
- **Fonte:** .superpowers/sdd/progress.md (frente segmentacao-publico, S8 fix2 `76c2095` e fix pós-revisão final `b2ea9e5`).

### L-019 · Componente aparentemente morto pode ainda ter consumidor em outra página — grep antes de remover
- **Gatilho:** `spec`
- **Não faça:** planejar a remoção de um componente antigo (ex.: `Header.tsx`/`Footer.tsx`) só porque a página principal já não o usa mais.
- **Faça:** grepar o nome do componente/arquivo em todo o repositório antes de remover — outra página (ex.: `/oferta`) pode ainda depender dele, e a ação certa é repontar, não apagar.
- **Fonte:** docs/frentes/lancamento-final/README.md ("F5: `Header.tsx`/`Footer.tsx` ainda são usados por `/oferta` → repontar, não remover").

## `visual`

### L-020 · Componente compartilhado que vira dark-aware precisa auditar contextos de cor fixa existentes
- **Gatilho:** `visual`
- **Não faça:** trocar as cores hardcoded de um componente compartilhado (`text-zinc-900` → `text-foreground`) para deixá-lo dark-aware, sem checar todos os lugares onde ele já é usado dentro de um wrapper de cor fixa (ex.: `GlassCard` com `bg-white/70` fixo) — o texto vira quase-branco sobre fundo branco no tema padrão escuro.
- **Faça:** ao tornar um componente compartilhado dark-aware, dar a ele uma variante explícita (`surface="themed"|"light"`) e varrer todos os consumidores existentes para decidir qual variante cada um precisa, antes de fechar a mudança.
- **Fonte:** .superpowers/sdd/final-fixes-leitor-report.md (I1, commit `f25a999`).

### L-021 · Overlay/sheet mobile construído do zero nasce sem focus-trap se não for checklist desde a v1
- **Gatilho:** `visual`
- **Não faça:** tratar "sem focus-trap" num sheet/dialog mobile próprio (sem Radix/headless UI) como minor a ser corrigido depois — o padrão se repetiu em pelo menos três frentes diferentes (sumário do leitor, card de perfil flutuante, drawer mobile do design v2).
- **Faça:** ao construir qualquer overlay/sheet/dialog do zero, incluir Tab/Shift+Tab cíclico entre os elementos focáveis + fechar com Escape/clique-fora como parte da primeira versão, não como item deferido de revisão.
- **Fonte:** .superpowers/sdd/final-fixes-leitor-report.md (M6, commit `d1eb300`); .superpowers/sdd/progress.md (Frente 1 Design v2 e revisão do frente-C).

### L-022 · Fix visual pontual deve varrer por duplicações do mesmo dado/regra em outros componentes
- **Gatilho:** `visual`
- **Não faça:** considerar um fix visual "completo" só porque o componente apontado pelo usuário foi corrigido, quando o mesmo dado ou a mesma regra de estilo é renderizado em mais de um lugar da UI.
- **Faça:** ao corrigir um bug visual específico (ex.: opacidade/traço de um valor de preço), grepar por outros componentes que exibem o mesmo dado antes de considerar o fix encerrado.
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-21 ("o valor aparecia em dois comparativos (`PricingV2` e `OpportunitySection`) e o segundo tinha passado batido").

### L-037 · `router.refresh()` preserva estado de client component — fluxo de "refazer" precisa de callback explícito
- **Gatilho:** `visual`
- **Não faça:** assumir que, após um submit que chama `router.refresh()`, um client component "volta ao normal" sozinho — o refresh atualiza o payload RSC mas **preserva o estado local** dos client components; se a condição que monta o componente não inverte (ex.: `capacityTier` continua truthy), um flag local como `refazendo=true` fica preso e a UI trava no quiz concluído até F5.
- **Faça:** dar ao componente filho um callback `onDone?: () => void` disparado no sucesso do submit e resetar o estado local do pai explicitamente (`setRefazendo(false)`), mantendo o `router.refresh()` para os dados. Fluxos que já funcionam por inversão de condição de montagem não precisam do callback (prop opcional).
- **Fonte:** revisão final da frente segmentacao-publico (Important #2, fix `b2ea9e5`).

### L-038 · Verificação visual de fluxo logado precisa de sessão preexistente — mintar credencial é linha vermelha
- **Gatilho:** `visual`
- **Não faça:** planejar o roteiro visual de uma frente com passos que exigem login presumindo que a sessão se resolve na hora — gerar segredo de sessão/magic-link por conta própria é bloqueado pelo classificador de permissões (e a linha é correta: coordenador não minta credencial), e o e-mail de magic link de conta de teste não chega em lugar nenhum.
- **Faça:** tratar "sessão logada disponível" como pré-requisito de ambiente do roteiro (como o navegador em L-030): verificar ANTES se o Chrome tem sessão viva (local ou produção); se não tiver, executar os passos deslogados, entregar os passos logados como roteiro numerado para o usuário e registrar a pendência — sem fingir e sem contornar o bloqueio.
- **Fonte:** sessão 2026-07-21 (fechamento da frente segmentacao-publico, itens 3–6 do roteiro da Task S8).

## `deploy`

### L-023 · Nunca pushar código que dependa de migration nova antes de aplicá-la e verificá-la no remoto
- **Gatilho:** `deploy`, `migration`
- **Não faça:** dar `git push` numa `master` com auto-deploy quando existe código que depende de uma migration nova (ex.: `upsert(... onConflict: "...")` sobre índice único, ou leitura de coluna) ainda não aplicada no banco remoto — os testes passam porque mockam o Supabase, mas em produção o `ON CONFLICT` falha (ou a feature falha em silêncio, retornando `null`).
- **Faça:** sequenciar sempre: terminar o código localmente → aplicar a migration no remoto (SQL Editor) e confirmar com um `select`/checagem do índice → conferir se dados legados quebram alguma regra nova → verificação visual → só então `git push`.
- **Fonte:** .superpowers/sdd/progress.md (Trilha B, ">>> ORDEM DE DEPLOY (CRITICO)"); docs/frentes/leitor-protegido/README.md ("🚨 LEIA ANTES DE FAZER QUALQUER COISA"); docs/ESTADO-ATUAL.md log de 2026-07-16 (Migrations 0025/0026 aplicadas antes do push).
  — resumida também no PLAYBOOK (seção "🚀 Ordem de deploy": "Migration primeiro. Push depois. Sempre.").

## `subagentes`

### L-024 · Coordenador deve assumir gate e commit quando um subagente cai no meio por falha de API
- **Gatilho:** `subagentes`
- **Não faça:** descartar ou reiniciar do zero uma task cujo subagente implementador caiu no meio por instabilidade de API — o trabalho já feito (arquivos criados/editados) pode estar correto e só falta fechar o ciclo.
- **Faça:** ao detectar que um subagente caiu no meio, o coordenador verifica o estado real do working tree antes de decidir, e se o trabalho estiver correto, ele mesmo roda o gate (`tsc`/testes) e faz o commit — sem perder o progresso já feito pelo agente que caiu.
- **Fonte:** .superpowers/sdd/progress.md (Design v2 Frente 2, "Item PostCard + relativeTime", commit `2eb211d`).

### L-039 · Fix pontual re-roda o gate INTEIRO (tsc + testes + lint), não só o pedaço que o fix tocou
- **Gatilho:** `subagentes`
- **Não faça:** aceitar report de fix que declara gate limpo re-rodando só `tsc`/testes — um fix que removeu o último uso de um import deixou o import morto, `next lint` passou a falhar com 2 erros (`no-unused-vars` é error no preset) e o report anterior de "lint 0 erros" ficou falso sem ninguém notar até o re-review rodar o eslint de verdade.
- **Faça:** todo dispatch de fix exige o trio completo no report (`tsc --noEmit` 0 · suíte verde · `next lint` 0 erros) com output real; o re-reviewer confere o gate de forma independente quando o fix mexeu em imports/estrutura.
- **Fonte:** re-review da Task S8 da frente segmentacao-publico (.superpowers/sdd/task-s8-report.md, fix2 `76c2095`).

### L-035 · Citação de fonte feita por subagente de mineração/pesquisa só vale depois de aberta e conferida
- **Gatilho:** `subagentes`
- **Não faça:** aceitar o output de um subagente de mineração/pesquisa confiando que os arquivos/URLs citados como fonte sustentam a alegação — na mineração da base de lições, 2 de 23 candidatas citavam arquivos reais que **não continham** o que a candidata afirmava (a alegação vinha de outra fonte do mesmo lote).
- **Faça:** o revisor desse tipo de task abre por amostragem as fontes citadas e confere que cada uma sustenta a alegação específica; fonte que não sustenta é achado Important (mesmo quando a lição/claim em si é verdadeira por outra fonte).
- **Fonte:** review da Task 2 da frente memoria-licoes (.superpowers/sdd/task-2lic-report.md, fix `677b310`).

## `docs-continuidade`

### L-025 · Seções de estado tratadas como append-only causam drift entre o topo e o corpo do documento
- **Gatilho:** `docs-continuidade`
- **Não faça:** empilhar atualizações nas seções de estado de um doc de continuidade ("PRÓXIMA AÇÃO", "Estado do git", tabela de frentes) sem sobrescrever o que já não vale — o topo do arquivo passa a contradizer o meio.
- **Faça:** tratar seções de estado como *sobrescritas* a cada atualização; só um log explicitamente append-only (ex.: "Log de sessões") acumula histórico. Registrar essa convenção no topo do próprio arquivo para não reabrir a dúvida.
- **Fonte:** docs/ESTADO-ATUAL.md, nota de convenção (topo do arquivo) e log de sessões de 2026-07-20 (achado "Drift dos docs corrigido").
  — resumida também no PLAYBOOK (seção "🔍 Auditoria": "as seções de estado do ESTADO-ATUAL.md devem ser sobrescritas, não append-only").

### L-026 · Reports de subagentes nomeados só por número de task colidem entre frentes
- **Gatilho:** `docs-continuidade`
- **Não faça:** nomear o report de uma task só como `task-N-report.md` quando o projeto já roda várias frentes em paralelo/sequência — o mesmo caminho é reaproveitado por uma frente diferente semanas depois e sobrescreve o conteúdo anterior, que se perde de vez porque `.superpowers/` não é versionado no repo.
- **Faça:** usar sufixo de frente no nome do report desde a primeira task (`task-N-<slug-da-frente>-report.md`) — nunca reaproveitar `task-N-report.md` puro entre frentes diferentes.
- **Fonte:** .superpowers/sdd/task-5-report.md, .superpowers/sdd/task-6-report.md (notas de sobrescrita de report anterior).
  — resumida também no PLAYBOOK (seção "Handoff por arquivo": "esses nomes colidem entre frentes diferentes — se for sobrescrever, verifique antes").

### L-027 · Frente que termina com commits locais não pushados precisa registrar isso de forma redundante
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar implícito, só no meio do log de progresso, que uma frente tem commits locais bloqueados de propósito (migration pendente, verificação visual pendente) — a próxima sessão (possivelmente em outro computador) pode dar `git push` sem saber do bloqueio.
- **Faça:** registrar o bloqueio de forma redundante e destacada (marcador tipo `>>> NADA PUSHADO`, mais a razão exata) tanto no `progress.md`/README da frente quanto no `docs/ESTADO-ATUAL.md` do projeto — dois lugares, não um.
- **Fonte:** .superpowers/sdd/progress.md (marcadores ">>> NADA PUSHADO", Frente Leitor Protegido).

### L-028 · Migrar um item de trabalho para outro programa exige fechar explicitamente a fila de origem
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar um item de trabalho migrado/absorvido por um novo programa (ex.: "Frente 5" de um programa virou "Trilha D" de outro) sem atualizar o README de origem — cria risco de duas filas concorrentes descrevendo o mesmo trabalho de formas divergentes.
- **Faça:** ao migrar/absorver um item entre programas, no mesmo commit da decisão, atualizar o doc de origem para "migrado para X, esta fila está encerrada" e apontar para o novo local.
- **Fonte:** docs/frentes/design-v2/README.md ("Frente 5... migrada para a Trilha D... Programa design-v2: encerrado como fila própria"); docs/ESTADO-ATUAL.md log de 2026-07-20 ("Duas filas concorrentes eliminadas").

### L-029 · Achados de auditoria sem task correspondente viram órfãos sem uma seção dedicada de rastreio
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar achados de auditoria/revisão sem task em nenhum plano — eles somem silenciosamente (ex.: reconciliação de histórico de migrations divergente, gating de APIs de mutação, decisões C3/I4 do leitor-protegido).
- **Faça:** manter uma seção dedicada (ex.: "Rastreadas, sem dono") no README do programa listando pendências sem plano/dono, para não serem confundidas com resolvidas nem esquecidas entre sessões.
- **Fonte:** docs/frentes/lancamento-final/README.md ("📌 Rastreadas, sem dono").
  — resumida também no PLAYBOOK (tabela 🚩 Sinais: "Depois eu registro" / "Pendência não registrada é pendência perdida").

### L-030 · Passo de verificação que depende de recurso de ambiente instável precisa de prova alternativa
- **Gatilho:** `docs-continuidade`
- **Não faça:** deixar a verificação visual (navegador automatizado) como o único caminho para fechar um invariante sensível — se o recurso cair numa sessão, o bloqueador trava a frente inteira até a próxima sessão em que ele voltar.
- **Faça:** quando um passo de verificação depende de um recurso de ambiente instável (ex.: MCP de navegador indisponível), verificar por construção o que for possível sem ele (ex.: provar por análise estática que um dado sensível nunca sai do servidor) e deixar marcado, explicitamente, só o que realmente exige olho humano.
- **Fonte:** docs/ESTADO-ATUAL.md log de 2026-07-20 ("LEITOR PROTEGIDO DESTRAVADO...": "Invariante do leitor provado por construção... Falta: olho humano no visual").

## `stripe-webhook`

### L-031 · Guard de dedupe de webhook precisa uma flag por side-effect que pode falhar sozinho
- **Gatilho:** `stripe-webhook`
- **Não faça:** usar um guard de dedupe do tipo `if (!purchaseWasCreated && !tokenWasCreated)` quando existe um terceiro side-effect (ex.: criar entitlement) que pode falhar isoladamente numa entrega e ter sucesso na reentrega — a reentrega vê os dois primeiros já feitos, pula o guard inteiro e nunca reexecuta a etapa que ainda faltava (ex.: e-mail de confirmação nunca é enviado).
- **Faça:** toda etapa do webhook que pode falhar independentemente ganha sua própria flag `algoWasCreated`, e o guard de dedupe inclui todas elas — só pula quando TODAS já tiveram sucesso antes.
- **Fonte:** .superpowers/sdd/task-9-report.md (commit `1d674b5`).

### L-032 · Webhook de pagamento nunca responde 200 quando um passo crítico falha
- **Gatilho:** `stripe-webhook`, `acesso-dinheiro`
- **Não faça:** capturar uma falha de banco/side-effect crítico no handler de webhook (ex.: revogar acesso em `charge.refunded`/`dispute`, inserir o token de acesso) e responder 200 mesmo assim — a Stripe não reentrega o evento, e o cliente paga sem receber acesso (ou a revogação nunca acontece).
- **Faça:** desenhar cada passo do webhook como idempotente; propagar erro de banco/passo crítico como 500 no handler para forçar reentrega automática. Passos não-críticos (ex.: e-mail) podem ser best-effort e não devem derrubar o webhook; oferecer também um caminho de recuperação self-service (reenvio, tela de sucesso que resolve o acesso pela sessão) como segunda camada de defesa. Cobrir com teste o caminho de erro do DB retornando 500.
- **Fonte:** .superpowers/sdd/progress.md (Trilha B Task 1, commit `06b118f`, achado "Critical"); docs/frentes/hardening-criticos/README.md ("#2 — Cliente paga e pode nunca receber o acesso").

### L-033 · Mapeamento product_id → plano precisa de fonte única entre webhook e checkout
- **Gatilho:** `stripe-webhook`
- **Não faça:** duplicar os literais de `product_id` da Stripe (ex.: `"regular_pass"`, `"advanced_pass"`) em `checkout/route.ts`, `webhooks/stripe/route.ts` e em qualquer lógica de acesso — se um id mudar num lugar só, o passe é vendido mas nenhum entitlement é criado, sem erro visível.
- **Faça:** definir as constantes de `product_id` em um único módulo de dados e importar dele em todos os pontos (webhook, checkout, checagem de acesso) — nunca literais soltos repetidos.
- **Fonte:** .superpowers/sdd/progress.md (Frente Leitor Protegido, commit `3a24eba`).

### L-034 · Levantar "todos os usuários de um helper" precisa incluir rotas de webhook/infra, não só páginas
- **Gatilho:** `stripe-webhook`
- **Não faça:** ao migrar todos os pontos de uso de um helper (ex.: `isTokenExpired`) para um novo padrão, enumerar apenas os call sites dentro do fluxo de páginas do app.
- **Faça:** incluir explicitamente rotas de webhook/infra na varredura de usuários de um helper — elas ficam fora do fluxo visível de páginas e são fáceis de esquecer, mas continuam escrevendo dados que o helper depois vai rejeitar (ou aceitar incorretamente).
- **Fonte:** docs/frentes/lancamento-final/README.md ("G4: o webhook da Stripe é um 14º usuário de `isTokenExpired`, fora da migração de propósito").
