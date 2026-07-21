# Spec — Memória de Lições (EMG aplicado ao fluxo de trabalho)

> **Frente:** `memoria-licoes` · **Origem:** brainstorm de 2026-07-21 a partir da
> análise do usuário sobre o paper *Experience Memory Graph* (EMG) — diálogo
> completo no `texto-para-salvar-prompt-temporario.md` (local, não versionado).
> **Status:** spec aprovada por autorização prévia do usuário ("atue no que você
> decidir ser recomendado"); interpretação decidida pelo Claude e registrada abaixo.

## O que o usuário pediu

Avaliar se o modelo do EMG ("substituir o loop pelo graph") faz sentido "no nosso
ecossistema, na estrutura e arquitetura **para aprendizado e melhoria do
projeto**" — e, se fizer, aplicar.

## A decisão de interpretação (registrada para não reabrir)

O prompt gerado pelo NotebookLM presume um ecossistema que **não é o nosso**:
agentes em runtime rodando modelos locais 4B–8B (Ollama/LM Studio), em Python,
presos em reflection loops. A Matriz Central é uma plataforma de conteúdo
Next.js/TypeScript **sem nenhum agente em runtime**. Quem itera em loop aqui é o
**Claude durante o desenvolvimento**, usando modelos de alta capacidade — o caso
em que o próprio material reconhece que o loop reflexivo funciona.

Portanto:

- ❌ **Rejeitado: implementação literal** (classes de grafo de trajetória,
  Fused Gromov-Wasserstein, banco vetorial, RAG em runtime). Não há consumidor no
  produto; violaria o custo-zero (dependências novas); resolveria um problema que
  este projeto não tem. Esta rejeição é definitiva salvo o produto ganhar agentes
  em runtime no futuro.
- ✅ **Adotado: a arquitetura do EMG aplicada ao fluxo de trabalho do projeto** —
  a divisão *offline pesado / runtime leve*: destilar falhas em regras compactas
  fora do momento de execução, e injetar a regra pronta no momento certo, em vez
  de re-raciocinar do zero.
- 📻 **Registrado, não executado: EMG como conteúdo do produto.** "Loops vs
  Grafos: como agentes aprendem com erros" é candidato a relatório da biblioteca
  (o produto ensina IA local; o tema é o público-alvo exato). Vai para o backlog
  da Trilha E — decisão de escopo de conteúdo pertence àquela frente.

## O mapeamento EMG → nosso fluxo (o coração da spec)

| Conceito do paper | Equivalente no projeto |
|---|---|
| Grafo de falha (trajetória que errou) | O diff do implementador **antes** da revisão (`.superpowers/sdd/review-*.diff`, lado "antes") |
| Grafo especialista (gabarito) | O estado **após** os fixes da revisão |
| Comparação matemática (FGW) | A própria revisão por task/final — já produz o delta em texto |
| Operações delete/insert/relabel | Formato da lição: **não faça X / faça Y no lugar / no contexto Z** |
| Fase offline (treino) | **Destilação ao fim de cada frente**: minerar reports+diffs+log e gravar lições |
| Banco vetorial + RAG | **`docs/LICOES.md`** indexado por gatilho (tags grep-áveis) — o consumidor é o Claude lendo markdown; similaridade de cosseno é substituída por lookup por categoria |
| Injeção no prompt em runtime | Lições do gatilho relevante entram no **brief de cada task** (SDD) e na leitura de retomada |

**Por que sem banco vetorial:** no paper, o retrieval semântico existe porque o
consumidor é um modelo 4B sem capacidade de julgamento. Nosso consumidor é o
Claude, que lê um arquivo indexado e escolhe a seção certa. Embedding aqui seria
cerimônia sem ganho — YAGNI.

## Entregáveis

### 1. `docs/LICOES.md` — a base de lições

Formato de cada lição (compacto, uma lição = um bloco):

```markdown
### L-NNN · <título curto>
- **Gatilho:** `migration` | `acesso-dinheiro` | `spec` | `visual` | `deploy` |
  `subagentes` | `docs-continuidade` | `stripe-webhook` (tags fixas, pode ter 2)
- **Não faça:** <o erro observado, específico>
- **Faça:** <a correção, prescritiva>
- **Fonte:** <commit/report/sessão que originou>
```

Organizado em seções por gatilho (o "índice" do retrieval). Regras do arquivo:

- **Lição ≠ log.** Só entra o que é **reutilizável** (mudaria uma decisão futura).
  Fato pontual ("a 0028 foi aplicada") não é lição; "migration primeiro, push
  depois" é.
- **Dedup obrigatório:** antes de adicionar, procurar lição existente que já
  cubra; se cobrir parcialmente, **editar** a existente.
- **Contradição resolve-se apagando:** lição que a realidade invalidou é
  removida (com nota no commit), não empilhada.
- Numeração `L-NNN` sequencial, nunca reutilizada.

### 2. Backfill inicial (a fase offline, primeira rodada)

Minerar por subagentes os corpora existentes — cada um com um eixo:

1. `.superpowers/sdd/task-*-report.md` + `final-*-report.md` (findings de revisão);
2. Log de sessões do `ESTADO-ATUAL.md` + READMEs de frentes (lições narradas);
3. `PLAYBOOK-EXECUCAO.md` (a tabela "Sinais" e regras já destiladas — migram ou
   são referenciadas, sem duplicar).

Saída esperada: ~15–40 lições curadas (qualidade > quantidade; o curador corta).

### 3. Integração no processo (o "runtime leve")

- **`PLAYBOOK-EXECUCAO.md`:** o fluxo padrão de frente ganha a etapa **7.5 —
  destilar lições** (varrer os findings da frente recém-fechada → `LICOES.md`);
  a receita de prompt de subagente ganha o item: **incluir no brief as lições do
  gatilho da task** (ex.: task de migration carrega a seção `migration`).
- **`CLAUDE.md`:** uma linha apontando para `docs/LICOES.md` na seção de
  verificação/método.
- **`ECOSSISTEMA.md` + `ESTADO-ATUAL.md`:** referência no mapa e registro da frente.

## Não-objetivos

- Nenhum código de produto; nenhuma dependência; nenhum banco.
- Não substituir a tabela "Sinais" do playbook — ela é o resumo de alto risco
  lido sempre; `LICOES.md` é a base completa consultada por gatilho.
- Não automatizar a destilação com hooks/CI — o custo de manter supera o ganho
  no tamanho atual do projeto (reavaliar se a base passar de ~80 lições).

## Critérios de sucesso

1. `LICOES.md` existe, com lições reais mineradas dos artefatos (não inventadas),
   cada uma com fonte rastreável.
2. Um brief de task de migration montado segundo o playbook atualizado incluiria
   as lições de `migration` — verificável lendo o playbook.
3. Zero regressão no gate (`tsc`/test/lint intocados — é frente de docs).
4. A pergunta "devíamos implementar o EMG?" tem resposta permanente e fundamentada
   nesta spec (evita re-litígio futuro).

## Riscos

- **Base virar lixão append-only** (mesmo drift que o ESTADO-ATUAL sofreu) →
  mitigado pelas regras de dedup/remoção e pelo curador único na destilação.
- **Lições genéricas demais** ("teste bem") → o formato exige o par
  não-faça/faça específico com fonte; genérica é cortada na curadoria.
