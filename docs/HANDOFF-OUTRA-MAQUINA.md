# 💻 Handoff entre máquinas — o que o git NÃO leva

> **Para o Claude da outra máquina.** Este arquivo veio pelo git. Ele lista o que
> **não veio** e que você precisa pedir ao usuário, que vai transferir pela rede.
>
> **Para o usuário:** é só seguir a ordem. O item 1 é o único que impede o
> projeto de funcionar; o resto é conforto ou volume.
>
> _Levantado em 2026-07-28, na máquina `Grazi`, com o git 100% sincronizado
> (`origin/master` = local, zero commits pendentes)._

---

## Passo 0 — antes de pedir qualquer coisa

```bash
git pull origin master
npm install
```

`node_modules/` e `.next/` não viajam **de propósito** — são regenerados pelo
`npm install` e pelo primeiro build. Não peça esses ao usuário.

---

## 🔴 1. `.env.local` — SEM ISTO NADA FUNCIONA

**Onde fica:** raiz do projeto (`matrizcentral/.env.local`)
**Tamanho:** ~4 KB · **Nunca vai para o git** (contém segredos)

Sem ele: sem banco, sem login, sem pagamento, sem e-mail. O `npm run dev` sobe
mas quase tudo quebra.

**As 8 chaves que o arquivo precisa ter:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
BREVO_API_KEY
NEXT_PUBLIC_URL
VERCEL_OIDC_TOKEN
```

**Como o usuário transfere:** copiar o arquivo pela rede, ou colar o conteúdo
num arquivo novo. **Nunca colar os valores no chat** — nem aqui, nem lá.

> 💡 **Alternativa que dispensa a transferência:** com o Vercel CLI logado,
> `vercel env pull .env.local` baixa tudo direto do projeto. É o caminho mais
> seguro. Exige `vercel link` antes (ver item 5).

**Como verificar que chegou certo (sem imprimir valores):**
```bash
grep -oE "^[A-Z_]+" .env.local | sort
```
Tem que listar exatamente as 8 chaves acima.

---

## 🟠 2. `.superpowers/sdd/progress.md` — a memória de execução

**Onde fica:** `.superpowers/sdd/progress.md`
**Tamanho:** 344 linhas · **Ignorado pelo git** (é scratch de execução)

É o **ledger do subagent-driven-development**: registra task a task o que foi
feito, o que a revisão pegou, o que virou lição. Sem ele, uma sessão nova não
sabe o que já foi executado e pode **refazer trabalho já concluído** — o erro
mais caro que esse fluxo tem.

**O que pedir:** só o `progress.md`. O resto da pasta (257 arquivos, ~3 MB de
diffs e relatórios de revisão antigos) é histórico; transfira só se sobrar tempo.

**Como verificar:**
```bash
tail -5 .superpowers/sdd/progress.md
```
A última linha deve falar da **Onda 2, Task 2 (tipografia Outfit + Inter)**.

> Se o arquivo não vier, dá para reconstruir o essencial pelo `git log` e pelo
> `docs/ESTADO-ATUAL.md` — mas o detalhe das revisões se perde.

---

## 🟡 3. `notebooklm/textos/` — insumos dos relatórios

**Tamanho:** 36 KB · **Ignorado pelo git**

CSVs e textos brutos que originaram os relatórios publicados. Pequeno e barato
de transferir. Só é necessário se for **editar ou auditar relatórios existentes**.

---

## 🟡 4. `notebooklm/audio/` e `notebooklm/video/` — as 9 mídias (353 MB)

**Tamanho:** 229 MB de áudio (6 podcasts) + 124 MB de vídeo (3 vídeos)
**Ignorado pelo git de propósito** — arquivo binário grande não entra em repo.

**Só transfira se for subir as mídias a partir da outra máquina.** O roteiro de
upload está em
[`frentes/lancamento-publico/OPERACAO-MARKETING.md`](frentes/lancamento-publico/OPERACAO-MARKETING.md).

**Estado atual:** o canal do YouTube já existe
([@centralmatriz](https://www.youtube.com/@centralmatriz)), mas **nenhum dos 9
arquivos foi publicado ainda**. Se o upload for feito na máquina `Grazi`, esses
353 MB **não precisam viajar**.

**Como verificar (se transferir):**
```bash
ls notebooklm/audio/ notebooklm/video/
```
Devem aparecer 6 `.m4a` e 3 `.mp4`.

---

## 🟢 5. Coisas que você NÃO deve pedir — regenere no lugar

| Item | Como regenerar |
|---|---|
| `node_modules/` | `npm install` |
| `.next/` | primeiro `npm run dev` ou build |
| `.vercel/project.json` | `vercel link` (team `promobest`, projeto `matrizcentral`) |
| `.claude/settings.local.json` | o Claude Code recria; permissões são por máquina |
| Migrations do Supabase | **já estão aplicadas no remoto** (até a `0030`) — o banco é compartilhado, não é por máquina |

---

## ⚪ 6. Arquivos locais de rascunho — pergunte antes de transferir

Estes estão na raiz, **untracked de propósito** (constam na lista "nunca
commitar" do `plano.md`). A maioria é descartável:

| Arquivo | O que é | Vale transferir? |
|---|---|---|
| `SETUP.md` | **Guia de montagem do ambiente em máquina nova** (132 linhas) | **Sim** — é literalmente o que serve agora. Verificado: contém só um *template* de `.env` com valores em branco, **nenhum segredo** |
| `CLAUDE.local-draft.md` | rascunho antigo do `CLAUDE.md` | não |
| `claude-chat.md` | conversa sobre retomar projeto entre máquinas | não |
| `texto-para-salvar-prompt-temporario.md` | diálogo sobre EMG/graph | talvez — é insumo de estudo |
| `proxima-tarefa.md` | prompt da segmentação de público | **não** — já foi executado, está obsoleto |
| `erro-de-limite.md`, `erro.png`, `youtube-baixar-imagens.md` | resíduos de sessões antigas | não |

> **Sugestão ao usuário:** o `SETUP.md` está limpo de segredos e resolveria
> exatamente este problema toda vez. Vale considerar versioná-lo (removendo-o da
> lista de "nunca commitar") — mas isso é decisão sua, porque ele foi mantido
> local de propósito e eu não sei se há outro motivo.

---

## ✅ Checklist — "estou pronto para trabalhar"

Rode tudo e confira:

```bash
git log --oneline -1                          # deve bater com o da outra máquina
grep -oE "^[A-Z_]+" .env.local | sort | wc -l # deve dar 8
npx tsc --noEmit                              # exit 0
npm run test                                  # 364 testes / 58 arquivos
npx next lint                                 # 0 erros (2 warnings no-img-element sao pre-existentes)
```

⚠️ **`npm run build` falha de propósito** sem `STRIPE_SECRET_KEY` no shell —
é conhecido e não é regressão. Para buildar: `STRIPE_SECRET_KEY=dummy npm run build`.

Depois disso, leia [`ESTADO-ATUAL.md`](ESTADO-ATUAL.md) e continue de onde parou.

---

## 📍 Onde o projeto está (resumo de 2026-07-28)

- **Onda 1** (Receita & Descoberta) — ✅ fechada, no ar e verificada em produção
- **Onda 2** (Identidade & Polish) — 🔄 Tasks 1 e 2 feitas (favicon + tipografia);
  **próxima é a Task 3**, logo cubo no header e nos rodapés
- **Canal do YouTube** criado (`@centralmatriz`); **9 mídias ainda não publicadas**
- **Aguardando o usuário:** aprovar copies `C1`–`C13`, subir as mídias, criar
  conta Kiwify
- **Ebook:** avaliação externa do NotebookLM chegou (nota 5.5/10) — está em
  [`pedido-correcao.md`](pedido-correcao.md), ainda **sem plano de aplicação**
