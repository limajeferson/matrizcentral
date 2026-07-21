# 🎛️ Playbook de Execução — Matriz Central

> **Para o Claude.** Como trabalhar neste projeto: qual skill usar em cada tipo de
> trabalho, quais agentes despachar, em que modelo, e qual é o portão de qualidade.
> Consolidado em 2026-07-20 a partir do que funcionou (e do que quase deu errado).
>
> Fonte de verdade do **andamento**: [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md).
> Este arquivo é sobre **método**, não sobre estado.

---

## 🔓 Autonomia (regra permanente do usuário)

O usuário declarou, em várias sessões e de forma explícita:

> *"Você tem autonomia, eu autorizo, não precisa ficar pedindo permissão, atue
> sempre no que você decidir ser recomendado e foque na entrega objetiva."*

**Como aplicar:**

- **Tenha iniciativa.** Ao retomar, leia o estado e **comece a trabalhar** — não
  pergunte "posso começar?" nem "por onde quer que eu vá?". A próxima ação está
  escrita; execute.
- **Apresente soluções, não menus.** Quando houver escolha técnica, decida com
  base no que é melhor para o projeto, explique em uma linha por que, e siga. Só
  transforme em pergunta o que for genuinamente do usuário (dinheiro, jurídico,
  posicionamento de marca, escopo de produto).
- **Não peça permissão para o que já está autorizado:** aplicar migrations, criar
  arquivos, despachar subagentes, refatorar, rodar o app, corrigir o que a revisão
  apontar.

**O que ainda exige o usuário (não é falta de autonomia — é limite real):**

| Situação | Por quê |
|---|---|
| Digitar chave/credencial em qualquer campo | O Claude nunca insere segredos, mesmo autorizado |
| `git push` na `master` com deploy pendente de pré-requisito | Publica em produção; ver "Ordem de deploy" |
| Decisão jurídica/de política com efeito sobre cliente | Ex.: termos de garantia. Levantar, recomendar, **não publicar sozinho** |
| Upload em conta de terceiro (Spotify, YouTube, Stripe live) | Conta do usuário |

---

## 🧭 Qual skill usar (árvore de decisão)

```
O que o usuário pediu?
├─ Ideia nova / "vamos construir X" / problema sem solução definida
│    → superpowers:brainstorming  →  superpowers:writing-plans  →  execução
├─ Já existe spec, falta o "como"
│    → superpowers:writing-plans
├─ Já existe plano, é hora de construir
│    → superpowers:subagent-driven-development
├─ Bug / "não está funcionando"
│    → superpowers:systematic-debugging  (antes de qualquer skill de domínio)
├─ "Continue de onde paramos"
│    → ler ESTADO-ATUAL.md → executar a próxima ação. SEM skill de processo.
└─ Manutenção de docs / auditoria / consolidação
     → agentes Explore em paralelo (ver "Auditoria" abaixo). SEM skill.
```

**Regra de ouro:** skill de processo vem **antes** de skill de implementação.
Brainstorming define o quê; writing-plans define o como; SDD constrói.

---

## 🤖 Despacho de agentes — o que funcionou aqui

### Padrão por tipo de trabalho

| Trabalho | Agente | Modelo | Observação |
|---|---|---|---|
| Implementar task cujo plano **já tem o código** | `general-purpose` | **haiku** | É transcrição + teste. Barato e suficiente. |
| Implementar task com integração/julgamento | `general-purpose` | **sonnet** | Multi-arquivo, decisões de layout, mocks. |
| Revisar task comum | `general-purpose` | **sonnet** | |
| Revisar **controle de acesso / dinheiro / autenticação** | `general-purpose` | **opus** | Não economize aqui. Foi o que pegou os furos graves. |
| Revisão final whole-branch | `general-purpose` | **opus** | Sempre. Vê o que revisão por task não vê. |
| Busca ampla / auditoria read-only | `Explore` | padrão | Paralelizar 2–4 por vez. |
| Pesquisa externa (jurídico, mercado) | `general-purpose` | padrão | Exigir fontes e honestidade sobre incerteza. |

### Como escrever o prompt de um subagente

O subagente **não herda seu contexto**. Monte exatamente o que ele precisa:

1. **Uma linha** dizendo onde a task se encaixa no projeto.
2. **O caminho do brief** (`scripts/task-brief PLANO N`) — "leia isto primeiro, é
   seu requisito, com os valores exatos a usar verbatim".
   - **2b.** **As lições do gatilho da task** (`docs/LICOES.md`): copie para o brief as
     lições da(s) seção(ões) que a task toca (migration, acesso-dinheiro, visual…).
     Máx. ~6; escolha as mais específicas. É a defesa contra repetir erro já pago.
3. **Interfaces das tasks anteriores** que o brief não pode conhecer (assinaturas
   reais, não presumidas).
4. **Sua resolução de qualquer ambiguidade** que você notou no brief.
5. **O caminho do arquivo de relatório** + contrato: "retorne só status, commit,
   uma linha de gate e preocupações — não cole o relatório".
6. **Constraints globais verbatim** do plano.

**Nunca:** colar histórico acumulado de tasks anteriores; mandar o agente ler o
plano inteiro; pré-julgar achados ("não sinalize X"); pedir para revisar sem
passar o diff como arquivo.

### Handoff por arquivo (economiza contexto)

```bash
# Brief da task N
bash "<skill-dir>/scripts/task-brief" docs/frentes/<frente>/plano.md N

# Pacote de revisão (BASE = commit ANTES do implementador, nunca HEAD~1)
bash "<skill-dir>/scripts/review-package" BASE HEAD
```

Relatórios vão em `.superpowers/sdd/task-N-report.md`. **Atenção:** esses nomes
colidem entre frentes diferentes — se for sobrescrever, verifique antes.

---

## ✅ O portão de qualidade (não-negociável)

```bash
npx tsc --noEmit          # exit 0
npm run test              # tudo verde
npx next lint             # 0 erros (2 warnings de <img> são pré-existentes)
```

`npm run build` **falha de propósito** sem `STRIPE_SECRET_KEY` — é pré-existente,
ignore.

**Mas o gate verde não é suficiente.** Nesta sessão, 322 testes passando não
mostraram nenhum destes:

- revogação de acesso por usuário em vez de por produto;
- prova de consumo forjável por HTTP;
- texto branco sobre card branco;
- retomada de leitura que se apagava sozinha.

**Todos foram pegos pela revisão, e quase todos eram erro da spec, não do código.**
Por isso: **revisão por task + revisão final whole-branch são obrigatórias**, e o
loop se repete até fechar. Não aceite "quase".

### Verificação visual é gate real

Vitest roda em `environment: "node"` — componentes **não** são testáveis
automatizadamente. Para qualquer coisa visual: `npm run dev -- -p 3000` e conferir
no navegador (dark **e** claro, desktop **e** mobile). Se o navegador não estiver
disponível, **não finja que verificou** — deixe roteiro numerado no relatório e
registre como pendência.

---

## 🚀 Ordem de deploy (a regra que quase quebrou a produção duas vezes)

A `master` tem **auto-deploy na Vercel**. Portanto:

> **Migration primeiro. Push depois. Sempre.**

Na Trilha B, pushar antes da `0025` teria quebrado **todo ganho de XP** em
produção (o `ON CONFLICT` exige o índice único; os testes passavam porque mockam
o banco). No leitor, pushar antes da `0028` faz o registro de leitura **falhar em
silêncio**.

**Checklist antes de qualquer push que dependa de schema:**

1. Aplicar a migration no remoto **e verificar com `select`**.
2. Conferir se dados legados quebram alguma regra nova.
3. Verificação visual.
4. `git push`.

**Se não puder aplicar a migration** (navegador fora do ar): **não pushe**. Salve
numa branch (`git push origin master:refs/heads/<nome>`) — isso protege o trabalho
sem publicar. Foi o que foi feito com a branch `leitor-protegido`.

---

## 🗄️ Supabase — como aplicar SQL

**Caminho válido: navegador.** Chrome já logado → SQL Editor do projeto
`rzolsrzyafijaogjcjjb` → query nova. Digitar no Monaco **não foca** — injetar via
`javascript_tool`:

```js
monaco.editor.getModels()[<último>].setValue(`<SQL>`)
```

…e clicar Run. **Sempre verificar com um `select` depois.**

**O que NÃO funciona (testado, não presumido):**

| Caminho | Estado |
|---|---|
| MCP do Supabase | ❌ **Sem permissão nesta conta** (testado 2026-07-20) |
| `npx supabase db push` | ❌ Falha — histórico de migrations divergente |

Migration nova: criar o arquivo em `supabase/migrations/` **e** aplicar no remoto
**na mesma sessão**. Isso é responsabilidade do Claude, não hand-off do usuário.

---

## 🔍 Auditoria (como foi feita, para repetir)

Despachar **3 agentes `Explore` em paralelo**, cada um com um eixo:

1. **Continuidade** — links quebrados, contradições entre docs, contradições
   *dentro* do mesmo doc, afirmações obsoletas. Pedir simulação: *"lendo só o
   ESTADO-ATUAL, você saberia o que está no ar, o que é local, e a próxima ação?"*
2. **Veracidade** — rodar os comandos e conferir cada afirmação numérica contra a
   realidade. Documento que afirma algo falso é pior que documento ausente.
3. **Pendências** — consolidar follow-ups espalhados, separando **órfãs** (reais,
   sem plano) de **zumbis** (escritas como abertas, já resolvidas).

**Lição estrutural registrada:** as seções de *estado* do `ESTADO-ATUAL.md` devem
ser **sobrescritas**, não append-only. Só o log de sessões é append-only. Tratá-las
como append-only foi a causa raiz do drift.

---

## 📋 Fluxo padrão de uma frente (do zero ao ar)

```
1. brainstorming        → spec.md          (decisões travadas + não-objetivos)
2. writing-plans        → plano.md         (tasks bite-sized, código completo, TDD)
3. Pre-flight           → reler o plano procurando furos ANTES de despachar
4. subagent-driven-development:
     por task: brief → implementer → review-package → reviewer → fixes → re-review
     ledger: .superpowers/sdd/progress.md  (uma linha por task fechada)
5. Revisão final whole-branch (opus)
6. Migration no remoto → verificação visual → push
7. Destilar lições  → varrer os findings da frente em .superpowers/sdd/ e
                      atualizar docs/LICOES.md (dedup primeiro; regras no
                      próprio arquivo). Frente sem finding novo: etapa vazia, ok.
8. Atualizar ESTADO-ATUAL (topo + log) + README da frente, e commitar junto
```

**O ledger é o mapa de recuperação.** Depois de um `/clear` ou compactação,
confie nele e no `git log` — não na sua memória.

---

## 🎯 Por frente pendente — o que usar

| Frente | Skill | Agentes | Cuidado específico |
|---|---|---|---|
| **Destravar leitor-protegido** | nenhuma (é operação) | navegador; `Explore` se precisar mapear | Migration → dados legados → visual → push. **Nesta ordem.** |
| **Trilha C — dark-aware** | SDD | implementer sonnet, review sonnet | Verificação visual é o gate. `Markdown.tsx` já está feito. |
| **Trilha D — fórum aninhado** | SDD | implementer sonnet, review sonnet | Migration `0027`. Preservar o gating de escrita existente. |
| **Trilha E — conteúdo** | writing-plans (spec-E existe) | `general-purpose` p/ redigir | Insumo pronto no `texto-para-salvar-prompt-temporario.md`. |
| **Trilha F — polish/a11y** | SDD | implementer sonnet | **F6 foi reescrita** — não implemente a garantia antiga. Teclado é gate. |
| **Trilha G — tech-debt** | SDD | implementer sonnet, **G1/G3 review opus** | G1 e G3 mexem em acesso/auth: verificação ao vivo obrigatória. |
| **Auditoria final** | nenhuma | 3 `Explore` paralelos | Ver "Auditoria" acima. |

---

## 🚩 Sinais de que você está prestes a errar

| Pensamento | Realidade |
|---|---|
| "O gate está verde, pode subir" | Gate verde não viu nenhum dos furos graves desta sessão |
| "O plano diz X, então X está certo" | Quase todos os furos vieram **do plano**, não do código |
| "Os docs dizem que não dá" | Teste antes de descartar. E teste antes de assumir que dá |
| "É só um push" | Na `master`, push = deploy em produção |
| "Vou sobrescrever esse arquivo" | Leia antes. Um arquivo tinha conteúdo do usuário dentro |
| "Depois eu registro" | Pendência não registrada é pendência perdida |
| "O usuário autorizou, então posso tudo" | Autonomia ≠ credenciais, ≠ publicar termos, ≠ deploy quebrado |
