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

## `acesso-dinheiro`

## `spec`

## `visual`

## `deploy`

## `subagentes`

## `docs-continuidade`

## `stripe-webhook`
