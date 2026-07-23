# Plano — Kit de Ecossistema para o DRAGUM

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar em `C:\Users\Grazi\Claude\Projects\dragum` os dois kits destilados do ecossistema (matrizcentral = método maduro; promobest = origem) + o prompt inicial `COMECE-AQUI.md`, conforme `spec.md` desta frente.

**Architecture:** Trabalho de **destilação de documentação**, não de código. Cada task lê fontes exatas (listadas) e escreve arquivos markdown novos seguindo o outline dado. Não há testes automatizados; o gate de cada task é a **checagem de contaminação** (grep) + conferência do outline. A "suíte" final é a Task 8 (simulação de bootstrap + greps globais).

**Tech Stack:** Markdown pt-BR. Sem dependências. Sem git no dragum (o `git init` é do Claude novo — spec, E3 passo 2). Commits só no repo matrizcentral (Task 8) e **sem push** (regra leitor-protegido).

## Global Constraints

- **Só destilado** — proibido copiar arquivo real de qualquer projeto (decisão travada #1 da spec).
- **Teste de contaminação** (critério 2 da spec): em `ecossistema-matrizcentral/` e `COMECE-AQUI.md`, é proibido aparecer: `rzolsrzyafijaogjcjjb`, `Stripe`, `Brevo`, `matrizcentral.com`, `CONTENT_HUB`, `Trilha A`–`Trilha G`, `Missão`, `Shopee`, `amzn`. No kit promobest esses termos só podem aparecer **rotulados como história**.
- Placeholders de template no formato `{{NOME_ASSIM}}`.
- Todos os arquivos em **pt-BR**, tom direto, arquivos curtos (alvo: 60–140 linhas por guia; o kit pratica a dieta de tokens que ensina).
- Caminho-base dos entregáveis: `C:\Users\Grazi\Claude\Projects\dragum\` (a pasta existe; NÃO tocar em `doc.md` nem `identidade-visual.md`).
- Clone do promobest (fonte da Task 6): `C:\Users\Grazi\AppData\Local\Temp\claude\C--Users-Grazi-Claude-Projects-matrizcentral\e083365a-dc19-48c2-bfb1-5ed56e5fbf9f\scratchpad\promobest\`. Se não existir: `git clone --depth 1 https://github.com/limajeferson/promobest.git` nesse scratchpad (credencial git da máquina funciona; `gh` NÃO está logado).
- Fontes matrizcentral (leitura, nunca cópia): `CLAUDE.md`, `docs/ECOSSISTEMA.md`, `docs/PLAYBOOK-EXECUCAO.md`, `docs/LICOES.md` (estrutura), `docs/ESTADO-ATUAL.md` (estrutura/convenções), `COMO-CONTINUAR.md`, `docs/frentes/lancamento-final/` (exemplo de spec/plano/README), `C:\Users\Grazi\.claude\settings.json` (plugins globais), `.claude\settings.local.json` (exemplo de permissões), e o formato de memória descrito em `docs/ECOSSISTEMA.md` § "Memória automática".

---

### Task 1: Guias 01 e 02 (filosofia + arquitetura de docs)

**Files:**
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\01-dieta-de-tokens.md`
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\02-arquitetura-de-docs.md`

**Interfaces:**
- Consumes: `docs/ECOSSISTEMA.md` (regras de navegação, mapa neural), `docs/ESTADO-ATUAL.md` (convenção sobrescrever-vs-append), `docs/PLAYBOOK-EXECUCAO.md` (fluxo padrão de frente), `COMO-CONTINUAR.md`.
- Produces: os nomes canônicos que TODOS os outros arquivos do kit usam: **ECOSSISTEMA.md** (mapa), **ESTADO-ATUAL.md** (pino), **PLAYBOOK-EXECUCAO.md** (método), **LICOES.md** (erros pagos), **frentes** (`docs/frentes/<slug>/{spec,plano,README}.md`). Não renomear em nenhuma task.

- [ ] **Step 1: Escrever `01-dieta-de-tokens.md`** — seções, nesta ordem:
  1. `# Dieta de tokens — a filosofia` — definição em 3 linhas: contexto pré-digerido para o Claude gastar tokens em raciocínio, não em releitura; nasceu no promobest (ver kit vizinho), amadureceu no matrizcentral.
  2. `## As 5 regras` — (a) **hub + links sob demanda**: um mapa de entrada indexa tudo; abrir só o que a tarefa pede; (b) **1 fato = 1 lugar canônico**: cada informação tem um arquivo dono; os outros linkam, não repetem; (c) **confirmar no arquivo, não supor**: na dúvida, abrir o canônico — evita alucinação; (d) **destilar para dentro do repo**: fonte externa (chat, NotebookLM, pesquisa) vira arquivo em `docs/insumos/` antes de ser usada; (e) **estado sobrescrito, história append-only**: seções de estado se sobrescrevem; só logs crescem.
  3. `## Anti-padrões` — tabela 2 colunas (anti-padrão → por quê custa caro): abrir tudo "pra garantir"; duplicar fato em 2 docs (drift); doc que afirma coisa falsa (pior que ausente); pendência não registrada (perdida).
  4. `## Como isso se materializa` — 1 parágrafo apontando para `02-arquitetura-de-docs.md`.

- [ ] **Step 2: Escrever `02-arquitetura-de-docs.md`** — seções:
  1. `# Arquitetura de docs — os 5 pilares` — intro de 2 linhas.
  2. `## Tabela dos pilares` — colunas: arquivo · papel · quando ler · quando atualizar. Linhas: **CLAUDE.md** (regras invariantes do projeto; carregado sempre; muda raramente) · **docs/ECOSSISTEMA.md** (mapa neural "leia quando…"; início de sessão; ao fechar frente) · **docs/ESTADO-ATUAL.md** (pino "você está aqui": próxima ação + estado do git + log; ao retomar, PRIMEIRO; ao fim de CADA bloco de trabalho, commitado junto) · **docs/PLAYBOOK-EXECUCAO.md** (método: skills/agentes/gates; ao planejar execução; quando o método evolui) · **docs/LICOES.md** (erros pagos, organizados por gatilho — ex.: migration, acesso, visual; ANTES de task que toca o gatilho; ao fechar frente com finding novo).
  3. `## Frentes` — toda unidade de trabalho vive em `docs/frentes/<slug>/` com `spec.md` (o quê/porquê, decisões travadas, não-objetivos), `plano.md` (o como, tasks bite-sized) e `README.md` (status + próximo passo). Ao retomar, abrir o README da frente ativa antes de perguntar ao usuário.
  4. `## O protocolo de retomada` — "continue de onde paramos" → ler ESTADO-ATUAL → CLAUDE.md → README da frente ativa → agir sem pedir permissão. Citar que o guia humano equivalente é um `COMO-CONTINUAR.md`.
  5. `## Convenção anti-drift` — seções de estado do ESTADO-ATUAL são sobrescritas; só o Log de sessões é append-only; tratar estado como append-only foi causa raiz de drift real (lição paga).

- [ ] **Step 3: Verificar** — `grep -inE "rzolsrzyafijaogjcjjb|stripe|brevo|matrizcentral\.com|CONTENT_HUB|Trilha [A-G]|Missão|Shopee|amzn" <os 2 arquivos>` → **0 hits**. Conferir que cada seção do outline existe. Checkpoint: reportar tamanho em linhas (alvo ≤140 cada).

---

### Task 2: Guias 03 e 04 (neuroconexão + método de execução)

**Files:**
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\03-memoria-neuroconexao.md`
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\04-metodo-execucao.md`

**Interfaces:**
- Consumes: `docs/ECOSSISTEMA.md` § "Memória automática"; formato de memória do harness (frontmatter `name/description/metadata.type`, tipos `user|feedback|project|reference`, links `[[nome]]`, índice `MEMORY.md`); `docs/PLAYBOOK-EXECUCAO.md` (árvore de skills, tabela de agentes, gates, prompt de subagente).
- Produces: o vocabulário de método usado pelo `COMECE-AQUI.md` (Task 7): "spec destilada", "writing-plans", "SDD", "gate", "revisão whole-branch".

- [ ] **Step 1: Escrever `03-memoria-neuroconexao.md`** — seções:
  1. `# Memória automática — a neuroconexão` — o que é: memória persistente do harness, POR PROJETO e POR MÁQUINA, em `<home>\.claude\projects\<slug-do-caminho>\memory\`.
  2. `## Formato` — 1 arquivo = 1 fato; frontmatter com `name` (kebab), `description` (1 linha p/ recall), `metadata.type` (`user` = quem é o usuário · `feedback` = como trabalhar, com **Why**/**How to apply** · `project` = trabalho em andamento, datas absolutas · `reference` = ponteiros externos); corpo curto; links `[[nome-de-outra-memoria]]` — linkar liberalmente, link sem alvo marca memória futura; `MEMORY.md` é índice de 1 linha por memória, nunca conteúdo.
  3. `## O que NÃO vai pra memória` — o que o repo já registra (código, git, CLAUDE.md) e o que só importa na conversa atual.
  4. `## Limite que importa` — memória NÃO viaja no git; se o projeto rodar em 2+ máquinas, a continuidade entre elas é o REPO (ESTADO-ATUAL + docs); a memória é conveniência local. (Lição real de trabalhar em 2 computadores.)
  5. `## Neuroconexão nos docs do repo` — o mesmo princípio de links vale nos docs: o mapa (ECOSSISTEMA) linka, os arquivos se referenciam por caminho relativo, nada duplica.

- [ ] **Step 2: Escrever `04-metodo-execucao.md`** — seções:
  1. `# Método de execução` — intro 2 linhas: skill de processo antes de skill de implementação.
  2. `## Árvore de decisão de skills` — bloco de código igual em estrutura ao do playbook, genericizado: ideia nova → `superpowers:brainstorming` → `superpowers:writing-plans` → execução; spec pronta sem "como" → `writing-plans`; plano pronto → `superpowers:subagent-driven-development`; bug → `superpowers:systematic-debugging` ANTES de qualquer outra; "continue de onde paramos" → ler ESTADO-ATUAL e executar, SEM skill de processo; auditoria/manutenção de docs → agentes Explore em paralelo, sem skill.
  3. `## Despacho de subagentes` — tabela trabalho → agente → modelo: task cujo plano já tem o conteúdo pronto → `general-purpose`/haiku (transcrição); task com integração/julgamento → sonnet; revisão comum → sonnet; revisão de **acesso/dinheiro/autenticação** → **opus, sempre** (foi o que pegou os furos graves); revisão final whole-branch → opus, sempre; busca ampla read-only → `Explore`, 2–4 em paralelo.
  4. `## Prompt de subagente (as 6 partes)` — o subagente não herda contexto: (1) uma linha de onde a task se encaixa; (2) caminho do brief da task ("leia primeiro, valores verbatim"); (3) lições do gatilho copiadas no brief (máx ~6); (4) interfaces reais das tasks anteriores; (5) resolução de ambiguidades que você notou; (6) caminho do arquivo de relatório + contrato de retorno enxuto. Nunca: colar histórico acumulado, mandar ler o plano inteiro, pré-julgar achados.
  5. `## O portão de qualidade` — os comandos do gate são POR PROJETO (definir no CLAUDE.md instanciado — ex.: typecheck + testes + lint). Regra transferível: **gate verde não é suficiente** — revisão por task + revisão final whole-branch são obrigatórias; a maioria dos furos graves vem da SPEC, não do código; verificação visual/manual é gate real quando o automatizado não cobre (se não puder verificar, não fingir — registrar pendência).
  6. `## Ordem de deploy` — genericizada: se push publica automático, **pré-requisito primeiro (migration/config), push depois, sempre**; se não puder cumprir o pré-requisito, salvar em branch (`git push origin master:refs/heads/<nome>`) em vez de pushar.
  7. `## Fluxo padrão de uma frente` — os 8 passos numerados: brainstorming→spec; writing-plans→plano; pre-flight (reler o plano procurando furos); SDD por task (brief→implementer→review→fixes); revisão final whole-branch; pré-requisitos de deploy→verificação→push; destilar lições→LICOES.md; atualizar ESTADO-ATUAL + README da frente, commitar junto.

- [ ] **Step 3: Verificar** — mesmo grep de contaminação da Task 1 nos 2 arquivos → 0 hits. Conferir outline. Checkpoint: reportar linhas.

---

### Task 3: Guias 05 e 06 (ferramentas + autonomia)

**Files:**
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\05-ferramentas.md`
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\06-autonomia-e-limites.md`

**Interfaces:**
- Consumes: `C:\Users\Grazi\.claude\settings.json` (plugins globais habilitados), `.claude\settings.local.json` do matrizcentral (formato de permissões), `docs/PLAYBOOK-EXECUCAO.md` § Autonomia + § sinais, `CLAUDE.md` § Autonomia.
- Produces: a lista dos **4 limites** em redação genérica, reusada verbatim pelo `COMECE-AQUI.md` (Task 7) e pelo `CLAUDE.md.template` (Task 4).

- [ ] **Step 1: Escrever `05-ferramentas.md`** — seções:
  1. `# Ferramentas do ecossistema` — intro: o que já vem de graça (global da máquina) vs o que cada projeto configura.
  2. `## Já é global (nada a fazer)` — plugins habilitados em `~/.claude/settings.json`: **superpowers** (skills de processo: brainstorming, writing-plans, SDD, debugging…) e **vercel** (deploy/Next.js); memória automática do harness; extensão **claude-in-chrome** (automação de navegador — navegar, ler página, screenshots; dicas pagas: janela visível/F11, `get_page_text` para texto, checar `visibilityState`).
  3. `## Por projeto` — `git init` + primeiro commit; `.claude/settings.local.json` com permissões `allow` para os comandos frequentes do gate (mostrar o JSON de exemplo com `Bash(npx tsc *)`, `Bash(npm run *)` e instrução de adaptar à stack); CLIs conforme a stack (ex.: `npx supabase login` + `link` se usar Supabase; `vercel` se usar Vercel) — **regra: testar o caminho antes de documentá-lo como funcionando**.
  4. `## Credenciais` — o Claude NUNCA digita chave/segredo em campo nenhum; logins interativos são do usuário (sugerir `! comando` no prompt para rodar na sessão); `gh` pode não estar logado mesmo com credencial git funcionando — testar `git ls-remote` antes de assumir.

- [ ] **Step 2: Escrever `06-autonomia-e-limites.md`** — seções:
  1. `# Autonomia e limites` — a regra permanente (citação adaptada): o usuário autoriza iniciativa por padrão; ao retomar, ler o estado e COMEÇAR; apresentar soluções decididas com o porquê em 1 linha, não menus; só virar pergunta o que é genuinamente do usuário: **dinheiro, jurídico, posicionamento de marca, escopo de produto**.
  2. `## Os 4 limites (a autonomia não remove)` — (1) nunca digitar chave/credencial em campo nenhum; (2) nunca `git push` que publique com pré-requisito pendente; (3) nunca publicar termos/política com efeito sobre cliente sem o usuário ver; (4) nunca agir em conta de terceiro (gateway de pagamento live, plataformas de mídia/loja).
  3. `## Sinais de que você está prestes a errar` — tabela pensamento → realidade, genericizada do playbook: "o gate está verde, pode subir" → gate verde não viu os furos graves; "o plano diz X" → a maioria dos furos vem do plano/spec; "os docs dizem que não dá" → teste antes de descartar (e antes de afirmar que dá); "é só um push" → push pode ser deploy; "vou sobrescrever esse arquivo" → leia antes; "depois eu registro" → pendência não registrada é perdida; "o usuário autorizou, posso tudo" → autonomia ≠ os 4 limites.

- [ ] **Step 3: Verificar** — grep de contaminação → 0 hits nos 2 arquivos ("Stripe live" do limite 4 deve ter virado "gateway de pagamento live"). Checkpoint: reportar linhas.

---

### Task 4: Templates (8 arquivos)

**Files:**
- Create: `...dragum\ecossistema-matrizcentral\templates\CLAUDE.md.template`
- Create: `...templates\ECOSSISTEMA.md.template`
- Create: `...templates\ESTADO-ATUAL.md.template`
- Create: `...templates\LICOES.md.template`
- Create: `...templates\settings.local.json.template`
- Create: `...templates\frente\spec.md.template`
- Create: `...templates\frente\plano.md.template`
- Create: `...templates\frente\README.md.template`

**Interfaces:**
- Consumes: estruturas reais dos arquivos do matrizcentral (esqueleto, não conteúdo); os 4 limites da Task 3; nomes canônicos da Task 1.
- Produces: templates que o Claude novo instancia no passo 2 do COMECE-AQUI. Todo template começa com o comentário: `<!-- TEMPLATE: substitua os {{PLACEHOLDERS}} e apague este comentário. Guia: ../0X-*.md -->`.

- [ ] **Step 1: `CLAUDE.md.template`** — esqueleto com: título `# CLAUDE.md — {{NOME_DO_PROJETO}}`; bloco de navegação (ler `docs/ECOSSISTEMA.md` primeiro; método em `docs/PLAYBOOK` se instanciado, senão apontar para o kit `04-metodo-execucao.md`); seção Autonomia (regra permanente + os 4 limites, texto da Task 3 verbatim); seção "Retomando trabalho entre sessões" (protocolo de 4 passos: ESTADO-ATUAL → README da frente → responder com contexto → atualizar ESTADO-ATUAL ao fim de cada bloco); seção Produto ({{DESCRICAO_DO_PRODUTO_EM_3_LINHAS}} + {{FONTE_UNICA_DE_VERDADE_DO_CONTEUDO}}); seção Verificação ({{COMANDO_TYPECHECK}}, {{COMANDO_TESTES}}, {{COMANDO_LINT}}, nota "gate verde não basta"); seção Restrições ({{RESTRICOES_DE_CUSTO_E_DEPS}}; Windows: caminhos com parênteses precisam de aspas; comunicar em pt-BR).
- [ ] **Step 2: `ECOSSISTEMA.md.template`** — esqueleto do mapa neural: título; "Comece aqui (regras de navegação)" (as 4 regras: retomada→ESTADO-ATUAL; seguir só os links necessários; 1 fato 1 lugar canônico; ordem de leitura do zero); "Status atual ({{DATA}})" com {{STATUS_EM_3_BULLETS}}; "Mapa neural (leia quando…)" com grupos vazios a preencher (Produto & Visão / Arquitetura / Código fonte-de-verdade / Specs & Plans por frente / Deploy); "Frentes já trabalhadas" (lista vazia com formato `- ✅ [slug](frentes/slug/README.md) — resumo`); rodapé com a instrução de manutenção ao fechar frente.
- [ ] **Step 3: `ESTADO-ATUAL.md.template`** — esqueleto do pino: título; citação-propósito ("pino você está aqui; leia primeiro ao retomar; atualize ao fim de cada bloco"); a convenção anti-drift verbatim (estado sobrescrito, só log append-only); `_Última atualização: {{DATA}} ({{RESUMO_DE_1_LINHA}})_`; seções: `## ⏭️ PRÓXIMA AÇÃO` ({{PROXIMA_ACAO}}); `## Estado do git` ({{BRANCH_E_SYNC}}); `## Frente ativa` ({{FRENTE_E_LINK}}); `## Decisões travadas` (lista); `## Pendências` (do usuário vs do Claude, separadas); `## 📜 Log de sessões (append-only)` com formato de entrada `### {{DATA}} — {{TITULO}}` + 3 bullets.
- [ ] **Step 4: `LICOES.md.template`** — título `# Lições — {{NOME_DO_PROJETO}}`; instrução de uso no topo (consultar a seção do gatilho ANTES de task que o toca; alimentar ao fechar frente; dedup antes de adicionar); seções-gatilho iniciais vazias com 1 exemplo de formato cada: `## Gatilho: migrations/banco`, `## Gatilho: acesso/dinheiro/auth`, `## Gatilho: visual/UI`, `## Gatilho: deploy`, `## Gatilho: docs/estado`; formato de lição: `- **[curta e acionável]** — contexto de 1 linha do erro pago.`
- [ ] **Step 5: `settings.local.json.template`** — JSON com `permissions.allow` contendo `"Bash({{COMANDO_TYPECHECK}} *)"`, `"Bash({{COMANDO_TESTES}} *)"`, `"Bash({{COMANDO_LINT}} *)"` e comentário-irmão em arquivo? (JSON não tem comentário → colocar a instrução no comentário HTML do topo NÃO é válido em JSON; solução: primeira linha do arquivo é o template header em linha própria acima do JSON, com instrução de apagá-la ao instanciar).
- [ ] **Step 6: `frente/spec.md.template`** — esqueleto: `# Spec — {{TITULO}}`; frente/slug/data; `## Contexto`; `## Decisões travadas (com o usuário)` (numeradas); `## Entregáveis`; `## Não-objetivos`; `## Critérios de aceitação` (numerados, verificáveis).
- [ ] **Step 7: `frente/plano.md.template`** — esqueleto compatível com SDD: header (Goal/Architecture/Tech Stack/Global Constraints); formato de task com Files/Interfaces (Consumes/Produces)/Steps com checkbox, cada step com conteúdo completo (código ou outline) + verificação + commit.
- [ ] **Step 8: `frente/README.md.template`** — `# {{TITULO_DA_FRENTE}}`; `**Status:** {{EMOJI_E_ESTADO}}`; `## O que é` (2 linhas + link spec/plano); `## Próximo passo` (exato, executável); `## Decisões já travadas` (lista).
- [ ] **Step 9: Verificar** — grep de contaminação nos 8 templates → 0 hits; conferir que todo `{{PLACEHOLDER}}` usa o formato correto e que cada template referencia o guia certo (01–06). Checkpoint.

---

### Task 5: `LEIA-ME.md` do kit matrizcentral (o hub — escrito por último para indexar o que existe)

**Files:**
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-matrizcentral\LEIA-ME.md`

**Interfaces:**
- Consumes: todos os arquivos das Tasks 1–4 (títulos e propósitos reais).
- Produces: o ponto de entrada que o `COMECE-AQUI.md` (Task 7) referencia como "leia isto primeiro".

- [ ] **Step 1: Escrever o hub** — seções:
  1. `# 🧠 Kit ecossistema-matrizcentral — LEIA-ME` — o que é: o método de trabalho destilado de um projeto real maduro; **semente, não morada** — o objetivo é instanciar, não morar aqui.
  2. `## Ordem de leitura no primeiro boot` — 1) este arquivo; 2) `01-dieta-de-tokens.md`; 3) `02-arquitetura-de-docs.md`; 4) instanciar os templates (ver § Instanciação); 5) os guias 03–06 sob demanda conforme a fase.
  3. `## Índice — leia quando…` — tabela arquivo → leia quando: 01 (sempre, é a filosofia) · 02 (antes de instanciar) · 03 (primeira vez que gravar memória / configurar 2ª máquina) · 04 (antes de planejar/executar qualquer frente) · 05 (setup inicial de ferramentas e permissões) · 06 (sempre — regras de conduta) · `templates/` (na instanciação).
  4. `## Instanciação (o primeiro trabalho do Claude novo)` — passo a passo: criar `CLAUDE.md`, `docs/ECOSSISTEMA.md`, `docs/ESTADO-ATUAL.md` e `docs/LICOES.md` a partir dos templates (preencher placeholders com o contexto do projeto, apagar o comentário de template); criar `.claude/settings.local.json`; `git init` + primeiro commit. Depois disso o kit vira consulta ocasional.
  5. `## O kit vizinho` — 2 linhas: `../ecossistema-promobest/` é a HISTÓRIA (de onde a dieta de tokens veio); leitura opcional, recomendada uma vez.

- [ ] **Step 2: Verificar** — grep de contaminação → 0 hits; todo arquivo listado no índice existe no disco (conferir com `ls`); ordem de leitura cita só arquivos existentes. Checkpoint.

---

### Task 6: Kit promobest (4 arquivos)

**Files:**
- Create: `C:\Users\Grazi\Claude\Projects\dragum\ecossistema-promobest\LEIA-ME.md`
- Create: `...ecossistema-promobest\01-origem-4-pilares.md`
- Create: `...ecossistema-promobest\02-do-promobest-ao-matrizcentral.md`
- Create: `...ecossistema-promobest\03-bootstrap-prompt.md`

**Interfaces:**
- Consumes: clone no scratchpad — `docs/ECOSYSTEM_GUIDE.md` (íntegra), `docs/ECOSYSTEM_BOOTSTRAP_PROMPT.md` (íntegra), `INDEX.md`, `CONTEXT_SYNC.md` (estrutura das 4 seções), `.claude/` (nomes de agents/skills/hooks), `CLAUDE_CODE_MASTER_PLAN.md` (só o papel). Se o clone sumiu, re-clonar (ver Global Constraints).
- Produces: nada consumido por outras tasks (kit histórico, autocontido).

- [ ] **Step 1: Ler as fontes no clone** — na ordem: `ECOSYSTEM_GUIDE.md`, `ECOSYSTEM_BOOTSTRAP_PROMPT.md`, `INDEX.md`, `CONTEXT_SYNC.md` (cabeçalho + nomes de seções), `ls .claude/agents .claude/skills .claude/hooks`.
- [ ] **Step 2: Escrever `01-origem-4-pilares.md`** — destilar do GUIDE: a filosofia original ("transformar o Claude de resolvedor de problemas em engenheiro de execução: contexto pré-digerido → 100% dos tokens na lógica"); os 4 pilares com 2–3 linhas cada: **Obsidian** (memória humana, links `[[assim]]` — a neuroconexão original), **NotebookLM** (síntese de fontes externas), **Claude Code** (execução), **Graphify** (grafo de código sem LLM, regenerado por hook de commit); a hierarquia de governança original (tabela: `.claude/CLAUDE.md` sempre carregado · `CLAUDE_CODE_MASTER_PLAN` sob demanda · `CONTEXT_SYNC` briefing da tarefa atual · `STATUS_YYYY-MM-DD` snapshot/handoff); rotular TUDO como história ("no promobest, …").
- [ ] **Step 3: Escrever `02-do-promobest-ao-matrizcentral.md`** — tabela de evolução conceito → promobest → matrizcentral → por quê mudou: mapa (`INDEX.md` com `[[links]]` Obsidian → `docs/ECOSSISTEMA.md` com links markdown → sem depender de app externo); pino de retomada (`CONTEXT_SYNC.md` por missão → `ESTADO-ATUAL.md` contínuo com log append-only → menos arquivos, estado sobrescrito anti-drift); snapshots (`STATUS_YYYY-MM-DD.md` datados → log de sessões dentro do ESTADO-ATUAL → 1 lugar canônico); agentes (personas locais em `.claude/agents/` → despacho por modelo via plugin superpowers → menos manutenção); skills (locais: encerrar-missao, auditoria-periodica… → plugin superpowers global → padronizadas entre projetos); lições (espalhadas nos STATUS → `LICOES.md` por gatilho → consultável antes da task); memória humana (Obsidian → memória automática do harness com `[[links]]` → o conceito de neuroconexão sobreviveu à troca de ferramenta). Fechar com: o que foi ABANDONADO (Graphify, personas fixas, STATUS datados) e a regra que sobreviveu a tudo: dieta de tokens + 1 fato 1 lugar.
- [ ] **Step 4: Escrever `03-bootstrap-prompt.md`** — destilar o `ECOSYSTEM_BOOTSTRAP_PROMPT.md` original: apresentar em 3 linhas o que era (prompt que se colava num projeto novo para reproduzir a governança/dieta de tokens); reproduzir a ESSÊNCIA do prompt atualizada para o ecossistema atual (a versão moderna dele é exatamente o `COMECE-AQUI.md` + kit — dizer isso explicitamente); nota final: "se você está lendo isto no dragum, o bootstrap já aconteceu — este arquivo é o registro de que a ideia de 'ecossistema que se replica' nasceu no promobest".
- [ ] **Step 5: Escrever `LEIA-ME.md`** — hub curto: este kit é HISTÓRIA, não método ativo (o método ativo é o kit vizinho); índice dos 3 arquivos com 1 linha cada; quando ler (uma vez, por curiosidade/contexto; ou quando quiser entender POR QUE o método é como é).
- [ ] **Step 6: Verificar** — aqui os termos históricos SÃO permitidos, mas: conferir que toda menção a promobest/Shopee/missões está em moldura histórica ("no promobest…", "era…"); nenhuma instrução do kit manda o Claude do dragum FAZER algo com essas ferramentas (Graphify/Obsidian são descritos, não prescritos). Grep `dragum` nos 4 arquivos → só aparece no `03` (nota final) e opcionalmente no LEIA-ME. Checkpoint.

---

### Task 7: `COMECE-AQUI.md` (o prompt inicial na raiz)

**Files:**
- Create: `C:\Users\Grazi\Claude\Projects\dragum\COMECE-AQUI.md`

**Interfaces:**
- Consumes: `ecossistema-matrizcentral/LEIA-ME.md` (Task 5), os 4 limites (Task 3), vocabulário de método (Task 2).
- Produces: o arquivo que o usuário vai apontar na primeira sessão do dragum ("leia o COMECE-AQUI.md e execute").

- [ ] **Step 1: Escrever o prompt de missão** — estrutura:
  1. `# 🐉 COMECE AQUI — missão da primeira sessão` — endereçado ao Claude ("Você é o Claude da primeira sessão do DRAGUM…"); contexto em 3 linhas: DRAGUM é um universo de fantasia cujo 1º jogo é um MOBA com IP original baseado num jogo open-source; a visão está em `doc.md` e `identidade-visual.md`; o conceito completo está num notebook do NotebookLM (URL abaixo).
  2. `## Regras que valem desde já` — autonomia (iniciativa, soluções decididas, sem menus) + os 4 limites verbatim da Task 3; comunicar em pt-BR; **nunca inventar conteúdo do NotebookLM — se não conseguir abrir, pare e peça ao usuário**.
  3. `## Passo 1 — Herdar o ecossistema` — ler `ecossistema-matrizcentral/LEIA-ME.md` e seguir a ordem de leitura dele; opcional-recomendado: `ecossistema-promobest/LEIA-ME.md` para a origem.
  4. `## Passo 2 — Instanciar` — seguir § Instanciação do LEIA-ME: CLAUDE.md, docs/ECOSSISTEMA.md, docs/ESTADO-ATUAL.md, docs/LICOES.md, .claude/settings.local.json, `git init` + primeiro commit (incluindo os kits e este arquivo).
  5. `## Passo 3 — Extrair o conceito do NotebookLM` — URL exata: `https://notebooklm.google.com/notebook/e6300062-80e4-4550-90d8-2cd55379c376`; usar a extensão Chrome (`claude-in-chrome`): checar tabs com contexto, criar tab, navegar; **dicas pagas** (bullets): Chrome precisa estar logado na conta Google do usuário; F11 para viewport cheio; `get_page_text` para extrair texto (não screenshot); janela oculta congela a SPA — checar `visibilityState`; ler fontes E notas do notebook; **destilar** o que importa para `docs/insumos/` (arquivos md por tema) — o NotebookLM é fonte externa, o repo é a morada (regra d da dieta de tokens).
  6. `## Passo 4 — Spec destilada (1 checkpoint)` — combinar `docs/insumos/` + `doc.md` + `identidade-visual.md` numa spec do jogo em `docs/frentes/<slug>/spec.md` (template do kit); SEM sessão longa de perguntas: apresentar ao usuário **um resumo único** (decisões propostas + não-objetivos + o que ficou ambíguo) e pedir UMA aprovação; só perguntas genuínas de produto/dinheiro/marca.
  7. `## Passo 5 — Plano e execução` — aprovada a spec: `/superpowers:writing-plans` → `docs/frentes/<slug>/plano.md` → executar via `superpowers:subagent-driven-development` com o método do guia `04-metodo-execucao.md` (gates, revisões, opus em acesso/dinheiro); atualizar `docs/ESTADO-ATUAL.md` ao fim de CADA bloco e commitar junto.
  8. `## Se algo falhar` — NotebookLM não abre → parar e pedir; ferramenta indisponível → testar antes de descartar, registrar no ESTADO-ATUAL o que falta.

- [ ] **Step 2: Verificar** — grep de contaminação → 0 hits; a URL do notebook está exata (conferir char a char com a spec); todos os caminhos citados existem (`ls` em cada um); os 4 limites batem com `06-autonomia-e-limites.md`. Checkpoint.

---

### Task 8: Verificação final + limpeza + registro da frente

**Files:**
- Modify: `C:\Users\Grazi\Claude\Projects\matrizcentral\docs\ESTADO-ATUAL.md` (topo + log)
- Modify: `C:\Users\Grazi\Claude\Projects\matrizcentral\docs\ECOSSISTEMA.md` (linha na lista de frentes)
- Create: `C:\Users\Grazi\Claude\Projects\matrizcentral\docs\frentes\kit-ecossistema-dragum\README.md`

**Interfaces:**
- Consumes: tudo das Tasks 1–7.
- Produces: frente fechada e registrada (critério 6 da spec).

- [ ] **Step 1: Grep global de contaminação** — em `ecossistema-matrizcentral/` + `COMECE-AQUI.md`: `grep -rinE "rzolsrzyafijaogjcjjb|stripe|brevo|matrizcentral\.com|CONTENT_HUB|Trilha [A-G]|Missão|Shopee|amzn" ...` → **0 hits**. Qualquer hit: corrigir e re-rodar.
- [ ] **Step 2: Simulação de bootstrap (critério 3 da spec)** — reler APENAS `COMECE-AQUI.md` + `ecossistema-matrizcentral/LEIA-ME.md` como se fosse um Claude sem contexto e responder por escrito: (a) qual a ordem de leitura? (b) o que instanciar e de qual template? (c) como acessar o NotebookLM e o que fazer se falhar? (d) qual skill em cada fase? (e) quais os 4 limites? — Se alguma resposta exigir arquivo fora dos dois, corrigir o hub/prompt.
- [ ] **Step 3: Consistência templates × guias (critério 4)** — conferir que cada `{{PLACEHOLDER}}` tem contexto suficiente no template ou no guia referenciado; que `CLAUDE.md.template` § limites == guia 06 == COMECE-AQUI.
- [ ] **Step 4: Limpeza (critério 5)** — `rm -rf <scratchpad>/promobest` e confirmar com `ls`.
- [ ] **Step 5: Registrar a frente no matrizcentral** — criar `README.md` da frente (status ✅, o que é, onde estão os entregáveis — fora do repo, na pasta dragum —, decisões travadas); adicionar linha em `docs/ECOSSISTEMA.md` § frentes; atualizar `docs/ESTADO-ATUAL.md` (seção "Onde paramos", nota de que os entregáveis vivem em `Projects\dragum`, log de sessão).
- [ ] **Step 6: Commit (SEM push)** — `git add docs/frentes/kit-ecossistema-dragum/ docs/ESTADO-ATUAL.md docs/ECOSSISTEMA.md && git commit -m "docs(kit-ecossistema-dragum): frente fechada - kits destilados + COMECE-AQUI entregues na pasta dragum"`. **Não pushar** (regra leitor-protegido).

---

## Self-review (feito na escrita do plano)

- **Cobertura da spec:** E1 = Tasks 1–5; E2 = Task 6; E3 = Task 7; critérios 1–6 = Task 8 (+ verificações por task). Decisões travadas 1–4 aparecem como Global Constraints e na estrutura das tasks.
- **Placeholders:** nenhum "TBD/depois"; cada step de escrita traz o outline com o conteúdo real a produzir (trabalho de destilação: fontes exatas + outline completo = instrução completa).
- **Consistência:** nomes canônicos definidos na Task 1 e reusados nas 2–7; os 4 limites definidos na Task 3 e reusados verbatim nas 4 e 7; LEIA-ME (Task 5) escrito após o conteúdo que indexa.
