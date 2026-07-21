# CLAUDE.md — Matriz Central

Contexto para sessões do Claude Code neste repositório. Mantenha conciso.

> **› Contexto completo e navegação:** leia [`docs/ECOSSISTEMA.md`](docs/ECOSSISTEMA.md) primeiro — é o hub que indexa specs, arquitetura, memória e o fluxo de deploy.
>
> **› Como executar (método, agentes, modelos, portão de qualidade):**
> [`docs/PLAYBOOK-EXECUCAO.md`](docs/PLAYBOOK-EXECUCAO.md).

## Autonomia (regra permanente)

O usuário autoriza, de forma padrão e recorrente: **atue com iniciativa, decida o
que for melhor e entregue — sem pedir permissão a cada passo.** Ao retomar, leia o
estado e **comece a trabalhar**; não pergunte "por onde começo?". Apresente
soluções decididas com o porquê em uma linha, não menus de opções.

Só vire pergunta o que é genuinamente do usuário: **dinheiro, jurídico,
posicionamento de marca, escopo de produto**. E há quatro limites que a autonomia
não remove:

1. **Nunca digitar chave/credencial** em campo nenhum, mesmo autorizado.
2. **Nunca `git push` na `master`** com pré-requisito de deploy pendente (a Vercel
   publica automático) — ver "Ordem de deploy" no playbook.
3. **Nunca publicar termos/política** com efeito sobre o cliente sem o usuário ver.
4. **Nunca agir em conta de terceiro** (Stripe live, Spotify, YouTube).

Detalhe e casos: [`docs/PLAYBOOK-EXECUCAO.md`](docs/PLAYBOOK-EXECUCAO.md).

## Retomando trabalho entre sessões

Se o usuário disser **"continue de onde paramos"**, pedir para continuar,
perguntar "qual a próxima frente/etapa", ou pedir alinhamento com a última
entrega:
1. **Leia [`docs/ESTADO-ATUAL.md`](docs/ESTADO-ATUAL.md) PRIMEIRO** — é o pino
   "você está aqui": objetivo, frente ativa, última ação, **próxima ação**,
   estado do git, decisões travadas e pendências. Ele é a fonte de verdade da
   retomada (as tasks do painel não sobrevivem ao `/clear`).
2. Abra o `README.md` da frente ativa indicada lá (`docs/frentes/<slug>/README.md`)
   — tem o "Próximo passo" exato e as decisões já travadas.
3. Responda já com esse contexto resumido e siga a próxima ação, sem pedir pro
   usuário repetir o que já está documentado.
4. **Ao FIM de cada bloco de trabalho, atualize `docs/ESTADO-ATUAL.md`** (seção
   "Onde paramos AGORA", "Estado do git" e o "Log de sessões") e commite junto —
   é isso que mantém a continuidade viva entre sessões e entre computadores.

O guia humano de retomada (pro usuário) é [`COMO-CONTINUAR.md`](COMO-CONTINUAR.md).

**Specs e planos novos vão em `docs/frentes/<slug>/spec.md` e `/plano.md`**
— não mais em `docs/superpowers/specs|plans/` (estrutura antiga, só histórico
já migrado).

## Produto (não é um ebook)

- O produto é uma **plataforma multi-formato de IA local**: relatórios, podcasts, vídeos, apresentações e pesquisas da comunidade, num **feed/hub** com gamificação (XP/níveis/certificado). O ebook é material de apoio, não o produto.
- **Fonte única de conteúdo:** `src/data/content-hub.ts` (`CONTENT_HUB`). Nunca inventar títulos numa vitrine — mapear desse array.
- **Regra "em breve":** item com `embedUrl === null` (exceto `relatorio`/`pesquisa`) ainda não está publicado → exibir selo "em breve". Enquadrar a biblioteca como "em expansão", nunca "tudo já disponível".
- **Estado (07/2026):** **plataforma completa no ar** em `www.matrizcentral.com.br` (Vercel, auto-deploy na `master`). Landing v2 (`src/app/(marketing)`: `SystemSection` método + `ContentLibrarySection` experiência + footer + `/sobre` + `/legal/*` + newsletter) **e** a área logada (`/feed`, `/forum`, `/conta`, `/suporte`, `/oferta`, dashboard). Roadmap (login, assinaturas, feed, fórum, blog, suporte/CRM) + SP1 + redesign do feed **entregues**. Programa **"design v2"** (17 modelos 21st.dev, 5 frentes) **encerrado como fila própria** — Frentes 1–4 no ar, a Frente 5 virou a Trilha D do programa **"lançamento final"** (`docs/frentes/lancamento-final/`, ativo, 7 trilhas). **Migrations aplicadas via SQL Editor até `0026` — `0028` existe no disco e NÃO está aplicada.** ⚠️ **Há commits locais não pushados** (frente `leitor-protegido` bloqueada de propósito) — **não dar `git push` sem checar `docs/ESTADO-ATUAL.md` primeiro.** Andamento e próxima ação: `docs/ESTADO-ATUAL.md`; mapa: `docs/ECOSSISTEMA.md`.

## Verificação (gotcha importante)

- **`npm run build` FALHA** ao coletar `/api/checkout`: `src/lib/stripe.ts` instancia `new Stripe(process.env.STRIPE_SECRET_KEY!)` no topo do módulo e a chave não existe no shell de build. É pré-existente e não relacionado à maioria das mudanças.
- **Gate real:** `npx tsc --noEmit` (exit 0) + `npm run test`. Para conferir o visual, rode o app (`npm run dev`) — não confie só no build.
- **Vitest roda em `environment: "node"`** (sem jsdom/testing-library) → testes automatizados só para **lógica pura** em `src/lib`/`src/data`. Componentes são verificados rodando o app (dev + navegador/Playwright), extraindo a lógica testável para helpers puros.
- **Lições de erros já pagos:** [`docs/LICOES.md`](docs/LICOES.md) — consultar a
  seção do gatilho antes de tasks de migration/acesso/deploy; alimentar ao fechar
  cada frente (etapa 7 do playbook).

## CSS por página (manter escopo)

- Landing v2: `src/app/(marketing)/landing-v2.css`, tudo sob **`.mcv2`** (dark + violeta elétrico).
- `/oferta`: `.lp-guide` (tema claro). `/checkout`: `.mc-checkout`. Novo CSS deve ficar no escopo certo para não vazar entre páginas.
- **Tokens de cor** (`.mcv2`): `--mc-accent` `#7c5cff` (voz única da marca) e semânticos `--mc-success` (verde, garantia/sucesso), `--mc-trust` (azul, pagamento/privacidade), `--mc-gold` (ouro, certificado/gamificação), `--mc-warn` (âmbar, "em breve"/escassez). Reusar; violeta é o único acento "alto".

## Restrições / ambiente

- **Custo zero:** sem dependências npm novas e sem assets externos; só tiers gratuitos. Animações/efeitos com Canvas 2D nativo, CSS e libs já instaladas (framer-motion).
- **Supabase — o Claude aplica SQL/migrations sozinho (não é pendência do usuário).**
  Caminho preferido (desde 2026-07-21): **`npx supabase db query --linked`**
  (aceita `-f arquivo.sql`; projeto `rzolsrzyafijaogjcjjb` já linkado/logado nesta
  máquina; verificar com um `select` em seguida). Fallback: **navegador** (Chrome
  logado → SQL Editor; digitar no Monaco NÃO foca — injetar via `javascript_tool`
  com `monaco.editor.getModels()[última].setValue(...)` e Run). O que NÃO funciona:
  MCP do Supabase (sem permissão nesta conta) e `supabase db push` (histórico de
  migrations divergente). Migration nova: criar o arquivo em `supabase/migrations/`
  **e** aplicar no remoto na mesma sessão.
- **Windows / Git Bash:** caminhos com `(marketing)` precisam de aspas. Dev server: a porta 3000 costuma estar ocupada e o Next pula para 3001/3002 — force com `npm run dev -- -p 3000`.
- Comunicar em **português do Brasil**.
