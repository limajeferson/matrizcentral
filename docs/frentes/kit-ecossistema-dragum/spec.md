# Spec — Kit de Ecossistema para o DRAGUM

> **Frente:** `kit-ecossistema-dragum` · **Data:** 2026-07-23
> **O quê/porquê.** O usuário vai iniciar um projeto novo (DRAGUM, um MOBA com IP
> original baseado num jogo open-source) em `C:\Users\Grazi\Claude\Projects\dragum`
> e quer que o Claude da sessão nova **herde o ecossistema de trabalho** criado no
> promobest e amadurecido no matrizcentral: dieta de tokens, arquitetura de docs,
> neuroconexão de memórias, método de execução, ferramentas e autonomia.

## Contexto

- O **matrizcentral** é o ecossistema **maduro**: `ECOSSISTEMA.md` (mapa neural,
  leitura sob demanda), `ESTADO-ATUAL.md` (pino de retomada), `PLAYBOOK-EXECUCAO.md`
  (método: skills → agentes → gates → deploy), `LICOES.md` (erros pagos), frentes
  (`spec.md`/`plano.md`/`README.md`), memória automática com links `[[nome]]`.
- O **promobest** (github.com/limajeferson/promobest, privado, credencial git da
  máquina funciona; `gh` NÃO está logado) é a **origem**: `ECOSYSTEM_GUIDE.md`
  (4 pilares: Obsidian + NotebookLM + Claude + Graphify), `INDEX.md` (links
  `[[obsidian]]` — a neuroconexão original), `CONTEXT_SYNC.md` (ancestral do
  ESTADO-ATUAL), `ECOSYSTEM_BOOTSTRAP_PROMPT.md` (prompt para replicar a dieta de
  tokens em projeto novo), `.claude/` próprio (agents, skills, hooks).
- A pasta `dragum` **já existe** com `doc.md` (visão do jogo, 363 linhas) e
  `identidade-visual.md`. O conceito completo do projeto está num notebook do
  NotebookLM: `https://notebooklm.google.com/notebook/e6300062-80e4-4550-90d8-2cd55379c376`.
- Plugins **superpowers** e **vercel** são globais (`~/.claude/settings.json`) —
  o dragum já nasce com eles. A memória automática também é do harness (global),
  mas **por máquina** (não viaja no git).

## Decisões travadas (com o usuário)

1. **Formato: SÓ DESTILADO.** Nenhuma cópia fiel de arquivos dos projetos. Guias
   conceituais genericizados + templates com placeholders. (Escolha explícita do
   usuário em 2026-07-23, contra as alternativas "cópias fiéis" e "híbrido".)
2. **Fluxo da sessão nova: spec destilada + 1 checkpoint.** O Claude do dragum
   destila a spec do jogo direto do NotebookLM + `doc.md` (sem brainstorming
   longo), apresenta **um resumo único** para aprovação do usuário, e só então
   roda `/superpowers:writing-plans`.
3. **Muitos arquivos pequenos, não um arquivão** — o kit pratica a dieta de
   tokens que ensina: hub (`LEIA-ME.md`) + arquivos abertos sob demanda.
4. **O kit é semente, não morada.** O primeiro trabalho do Claude novo é
   instanciar os templates como arquivos do DRAGUM; depois o kit vira consulta
   ocasional.

## Entregáveis (3)

### E1 — `dragum/ecossistema-matrizcentral/` (o ecossistema maduro: COMO trabalhar)

```
ecossistema-matrizcentral/
├── LEIA-ME.md                    # hub do kit: o que é, ordem de leitura no 1º boot,
│                                 # índice "leia quando…" por arquivo, instrução de instanciação
├── 01-dieta-de-tokens.md         # filosofia: hub + links sob demanda; 1 fato = 1 lugar
│                                 # canônico; confirmar no arquivo em vez de supor
├── 02-arquitetura-de-docs.md     # os 5 pilares: ECOSSISTEMA (mapa) · ESTADO-ATUAL (pino,
│                                 # seções de estado SOBRESCRITAS, só log é append-only) ·
│                                 # PLAYBOOK (método) · LICOES (erros pagos, por gatilho) ·
│                                 # frentes (spec/plano/README por slug)
├── 03-memoria-neuroconexao.md    # memória automática: 1 arquivo = 1 fato, frontmatter,
│                                 # links [[nome]], MEMORY.md índice; POR MÁQUINA (a
│                                 # continuidade entre máquinas é o repo via git)
├── 04-metodo-execucao.md         # árvore de skills (brainstorming→writing-plans→SDD;
│                                 # systematic-debugging p/ bug; "continue"→ler estado, SEM
│                                 # skill); despacho de subagentes (haiku/sonnet/opus por tipo,
│                                 # opus em dinheiro/acesso); como escrever prompt de subagente
│                                 # (brief por arquivo, sem herdar contexto); gates de
│                                 # qualidade ("gate verde não basta" — revisão por task +
│                                 # whole-branch); verificação visual como gate real;
│                                 # ordem de deploy (migration primeiro, push depois)
├── 05-ferramentas.md             # o que JÁ É GLOBAL (plugins superpowers+vercel, memória,
│                                 # extensão Chrome) vs por projeto (git init, permissões em
│                                 # .claude/settings.local.json, CLIs: supabase link, vercel);
│                                 # gh não logado nesta máquina, credencial git funciona
├── 06-autonomia-e-limites.md     # a regra permanente (iniciativa, soluções e não menus) +
│                                 # os 4 limites (credenciais, push com deploy pendente,
│                                 # termos/política, conta de terceiro) + sinais de que está
│                                 # prestes a errar (tabela do playbook, genericizada)
└── templates/
    ├── CLAUDE.md.template
    ├── ECOSSISTEMA.md.template
    ├── ESTADO-ATUAL.md.template
    ├── LICOES.md.template
    ├── settings.local.json.template
    └── frente/
        ├── spec.md.template
        ├── plano.md.template
        └── README.md.template
```

Placeholders nos templates no formato `{{NOME_DO_PROJETO}}`, `{{STACK}}`, etc.,
com comentário no topo dizendo como instanciar. Conteúdo destilado dos arquivos
reais do matrizcentral **removendo todo estado específico** (Stripe, Supabase,
trilhas, URLs de produção); exemplos curtos anonimizados só quando ilustram o
nível de detalhe que funciona.

### E2 — `dragum/ecossistema-promobest/` (a origem: DE ONDE veio)

```
ecossistema-promobest/
├── LEIA-ME.md                        # por que este kit existe: história, não método ativo
├── 01-origem-4-pilares.md            # Obsidian + NotebookLM + Claude + Graphify, destilado
│                                     # do ECOSYSTEM_GUIDE.md; a filosofia "contexto
│                                     # pré-digerido → 100% dos tokens na lógica"
├── 02-do-promobest-ao-matrizcentral.md  # a evolução: INDEX→ECOSSISTEMA · CONTEXT_SYNC→
│                                     # ESTADO-ATUAL · STATUS_*→log de sessões · agents/skills
│                                     # locais→plugins globais (superpowers) · o que foi
│                                     # mantido, o que caiu e POR QUÊ
└── 03-bootstrap-prompt.md            # o ECOSYSTEM_BOOTSTRAP_PROMPT original, destilado e
                                      # atualizado para o estado atual do ecossistema
```

Fonte: clone shallow do promobest **já feito no scratchpad da sessão**
(`<scratchpad>/promobest`); apagar o clone ao final. Se o scratchpad tiver sido
limpo, re-clonar com `git clone --depth 1 https://github.com/limajeferson/promobest.git`.

### E3 — `dragum/COMECE-AQUI.md` (o prompt inicial)

Escrito como **prompt de missão** para o Claude da primeira sessão do dragum
(o usuário dirá apenas "leia o COMECE-AQUI.md e execute"). Roteiro:

1. **Herdar** — ler `ecossistema-matrizcentral/LEIA-ME.md` (e o do promobest
   para entender a origem), na ordem que o LEIA-ME indica.
2. **Instanciar** — criar `CLAUDE.md`, `docs/ECOSSISTEMA.md`,
   `docs/ESTADO-ATUAL.md` do DRAGUM a partir dos templates; `git init` + primeiro
   commit.
3. **Extrair o conceito do NotebookLM** — abrir via extensão Chrome
   (`claude-in-chrome`) a URL
   `https://notebooklm.google.com/notebook/e6300062-80e4-4550-90d8-2cd55379c376`,
   ler fontes/notas e **destilar para `docs/insumos/`** (o NotebookLM é fonte
   externa; o repo é a morada). Dicas pagas, inline: Chrome logado na conta
   Google; F11 para viewport cheio; `get_page_text` para texto (não screenshot);
   janela oculta congela SPA (checar `visibilityState`); **se não conseguir
   abrir, parar e pedir ao usuário — nunca inventar o conteúdo do notebook**.
4. **Spec destilada** — combinar NotebookLM + `doc.md` + `identidade-visual.md`
   numa spec do jogo; apresentar **um resumo único** para aprovação do usuário
   (checkpoint único — sem sessão longa de perguntas).
5. **`/superpowers:writing-plans`** → plano → execução via
   subagent-driven-development, com o método herdado (gates, revisões,
   ESTADO-ATUAL atualizado ao fim de cada bloco).

Regras que não podem esperar leitura de kit, inline e curtas: autonomia + 4
limites; comunicar em pt-BR.

## Não-objetivos

- **Não** copiar arquivos reais de nenhum dos dois projetos (decisão travada #1).
- **Não** decidir nada do jogo (engine, licença do jogo open-source, gameplay,
  monetização) — isso é da sessão nova, com o conceito do NotebookLM.
- **Não** criar o `CLAUDE.md` do dragum — quem instancia é o Claude novo (passo 2
  do COMECE-AQUI), com o contexto do jogo em mãos.
- **Não** acessar o NotebookLM nesta frente — a URL só é referenciada no
  COMECE-AQUI; quem navega é o Claude do dragum.
- **Não** mexer no matrizcentral além de `docs/frentes/kit-ecossistema-dragum/`
  (spec, plano, README) — e **sem `git push`** (regra leitor-protegido vigente).

## Critérios de aceitação

1. As três entregas existem nos caminhos exatos acima, em pt-BR.
2. **Teste de contaminação:** nenhum arquivo do kit contém estado específico do
   matrizcentral/promobest apresentado como se fosse regra do dragum (Stripe,
   Supabase `rzolsrzyafijaogjcjjb`, trilhas A–G, missões, URLs de produção).
   Referências históricas são permitidas **apenas** no kit promobest e rotuladas
   como história.
3. **Teste de bootstrap (simulação):** lendo só `COMECE-AQUI.md` +
   `ecossistema-matrizcentral/LEIA-ME.md`, um Claude sem nenhum outro contexto
   sabe: (a) a ordem de leitura, (b) o que instanciar e de qual template,
   (c) como acessar o NotebookLM e o que fazer se falhar, (d) qual skill invocar
   em cada fase, (e) quais são os 4 limites da autonomia.
4. Cada template instancia sem contradição com os guias 01–06.
5. Clone do promobest removido do scratchpad ao final.
6. Frente registrada no matrizcentral: spec + plano + README da frente,
   `ESTADO-ATUAL.md` e `ECOSSISTEMA.md` atualizados, commit local (sem push).
