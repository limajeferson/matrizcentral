# Design: Reposicionamento de Copy, Diagnóstico Inicial e Roadmap de Evolução

**Data:** 2026-07-05
**Origem:** `new-prompt.md` (brief de consultoria de copy/UX para o produto)
**Branch:** `feat/landing-v3-copy-triagem-roadmap` (a partir do `master` pós-merge da landing v2)

## Objetivo

Reposicionar a Matriz Central de "infoproduto com quiz técnico" para "sistema
premium com diagnóstico personalizado e trilha de evolução", em três frentes
independentes que compartilham uma mesma narrativa: **assinatura de IA é
aluguel; a Matriz Central vende a alternativa (pagamento único + trilha +
certificação)**.

## Escopo — três frentes

### Frente A — Landing (copy + visual, dentro do `landing-v2` já existente)

1. **Hero** (`HeroV2.tsx`): badge trocado para "Para quem cansou de
   assinaturas — e usa IA todos os dias". Headline vira um componente de
   palavra rotativa: "Pare de pagar mensalidade" seguido de uma palavra que
   troca com efeito de "digitação com cursor piscando" entre: `do GPT`,
   `do Claude`, `do Gemini`, `de aluguel de servidor`, `de VPS` (ciclo
   contínuo, ~2.2s por palavra, cursor sempre visível). Sub-headline usa a
   variante 1 do brief ("Aprenda a rodar modelos de IA no seu computador e
   elimine a necessidade de pagar ChatGPT, Claude ou Gemini todo mês. Sem
   depender da nuvem. Sem precisar ser especialista."); as variantes 2–4
   ficam documentadas como comentário no código (array `HERO_SUBHEADLINE_VARIANTS`
   não usado ativamente) para um teste A/B futuro via PostHog — **não**
   implementar lógica de A/B agora.

2. **`ProblemSection` → `OpportunitySection`** (renomeia arquivo e
   componente): título pequeno "Uma forma mais inteligente de usar IA";
   headline "Sua IA. Suas regras." (ou equivalente do brief); corpo
   explicando que a Matriz Central ensina a rodar IA localmente, reduzindo
   (não eliminando) a dependência de mensalidade; mantém o comparativo
   R$2.640/ano vs R$47 (reaproveita `AnimatedCounter`/`annual-spend.ts`) mas
   reposicionado como consequência da escolha, não como abertura de medo.
   Tom: sem "problema/erro/risco/prejuízo".

3. **`SystemSection`**: 4 cards reformulados com a estrutura
   Benefício → Recurso → Descrição:
   - "Aprenda no seu ritmo" → Ebook Técnico
   - "Comece pelo caminho certo" → Diagnóstico Inicial
   - "Acompanhe sua evolução" → Roadmap Inteligente
   - "Comprove sua conquista" → Certificação Verificável
   Cada card ganha uma fotografia real (não ilustração/ícone grande) via
   hotlink direto a CDN do Unsplash (free-license, sem custo, sem download
   de binário — decisão já tomada para resolver o requisito "somente
   fotografias reais" sem violar a política de custo zero nem fabricar
   pessoas). Hover: micro-interação só em CSS (leve zoom + overlay sutil),
   sem GIF/WEBM/Lottie — mantém a seção leve.

4. **`ProcessSteps` → redesenho "glassmorphism"**: timeline horizontal no
   desktop / vertical no mobile, 3 painéis translúcidos com blur, borda
   branca sutil e glow violeta que intensifica ao entrar na viewport
   (`useScroll`/`whileInView` do framer-motion, já disponível via
   `motion-primitives.tsx`). Copy: números "01/02/03" (sem "Passo"),
   títulos "Comece pelo caminho certo" / "Siga sua trilha" / "Construa sua
   independência", detalhe pequeno com o nome da feature (Diagnóstico
   Inicial / Roadmap Inteligente / Certificação Verificável). Título da
   seção: "Seu caminho até uma IA independente".

5. **`PricingV2`**: remove "Preço simples", "A partir de" e o CTA "Ver
   todos os planos". Nova estrutura: pequeno título ("Um único pagamento"),
   preço R$47 em tipografia máxima com "Pagamento único · Sem mensalidade ·
   Sem renovação · Sem fidelidade", lista "o que você recebe" com ícone por
   item (📘 Ebook Técnico, 🧭 Diagnóstico Inicial, 🛣️ Roadmap Inteligente,
   🏆 Certificação Verificável), comparativo compacto reaproveitando
   `AnimatedCounter`, CTA único "Quero por R$47" com nota de acesso
   imediato abaixo. Nota discreta no rodapé da seção sobre planos futuros
   (texto simples, sem link/botão): "No futuro novos conteúdos poderão
   estar disponíveis por assinatura. O produto atual continua sendo
   vendido separadamente por R$47."

6. **`FinalCtaV2` + `FooterV2` → `ClosingSection`**: uma seção de
   encerramento única. Headline forte (variação de "Pare de pagar aluguel
   para usar IA. Comece a construir algo que é seu."), subheadline curta,
   CTA "Quero por R$47" + nota "Pagamento único. Acesso imediato. Sem
   mensalidade.". Depois, separado por divisor, um rodapé institucional
   discreto (marca + descrição curta + navegação: O Sistema / Como
   Funciona / Preço / FAQ / Oferta + copyright). O rodapé NÃO repete a big
   idea — a headline de fechamento é quem carrega a mensagem final.

**Fora de escopo desta frente:** qualquer mudança em `/oferta` (mantém como
está — já tem seus próprios planos e copy).

### Frente B — Triagem → "Diagnóstico Inicial"

Reformular completamente o banco de perguntas e a apresentação, **sem
quebrar o modelo de dados existente** (mesmos 8 `ProfileId` internos, mesma
função pura `scoreTriagem`).

1. **Novo banco de perguntas** (`src/data/quiz-triagem.ts`): substituir as
   20 perguntas atuais (com ramificação técnica Python/JS/Go/"não
   programo") por 7 perguntas sem jargão técnico e sem ramificação
   (`showIf` não é mais necessário — todas sempre visíveis):
   1. Como você utiliza IA hoje? (todos os dias / algumas vezes por semana
      / estou começando / ainda não utilizo)
   2. Qual é seu principal objetivo? (economizar com assinaturas / mais
      privacidade / trabalhar sem depender da internet / aprender IA local
      / automatizar tarefas)
   3. Como você prefere aprender? (caminho mais simples / entender como
      funciona / equilíbrio entre teoria e prática)
   4. Qual computador você pretende utilizar? (notebook básico /
      intermediário / desktop / ainda não sei)
   5. Você pretende utilizar IA principalmente para: (trabalho / estudos /
      empresa / projetos pessoais / ainda estou descobrindo)
   6. Quanto tempo você pretende dedicar inicialmente? (até 30 min / ~1h /
      algumas horas / aos poucos)
   7. O que mais incomoda você hoje? (pagar assinatura todo mês / limites
      de uso / falta de privacidade / depender da internet / não saber por
      onde começar)

   Cada opção carrega `points: Partial<Record<ProfileId, number>>`
   remapeados para os 8 perfis internos (ex.: "empresa" em Q5 pontua
   `ceo_financeiro`/`founder_builder`; "aprender IA local" em Q2 pontua
   `estudante_curioso`; "automatizar tarefas" pontua `founder_builder`;
   etc. — o agente implementador define a matriz completa de pontos
   seguindo a intenção de cada perfil já documentada nos migrations de
   seed, sem inventar perfis novos).

2. **Renomeação de UI, sem tocar rota/token/schema**:
   - Rota `/quiz/[token]` mantém o path técnico (não é visível ao usuário
     como URL de marketing), mas todo texto visível troca "Quiz de
     Perfil"/"Perguntas"/"Ver meu perfil" por linguagem de "Diagnóstico
     Inicial" (ex.: botão final "Ver minha trilha recomendada").
   - `src/components/quiz/QuizTriagem.tsx`: copy dos textos de progresso e
     botão atualizada; nenhuma mudança estrutural de fluxo (mesmo POST em
     `/api/quiz`, mesmo redirect para `/dashboard/[token]`).
   - Dashboard (`src/app/dashboard/[token]/page.tsx`): o bloco que hoje
     mostra `CategoryBadge variant="roadmap">Perfil</CategoryBadge>` +
     `profile.name` + `profile.description` passa a se chamar "Sua Trilha
     Recomendada", com uma pequena reformulação de layout (Objetivo
     principal / Ponto de partida / Tempo estimado), reaproveitando os
     mesmos campos `profile.name`/`profile.description` como fonte de
     texto — sem exigir migração de schema nesta frente (o texto de
     `profiles.description` já descreve o perfil; a apresentação é o que
     muda, não o dado).

**Fora de escopo desta frente:** o texto de `profiles.name`/`description`
no banco continua com nomenclatura técnica interna (ex. "Dev Python + IA
Local") — são identificadores internos, não aparecem mais como "seu
perfil" na UI; a Frente C trata do conteúdo de roadmap propriamente dito.

### Frente C — Roadmap como "sistema de evolução"

1. **Nova forma fixa de `study_roadmap`**: em vez de "semanas" arbitrárias
   por perfil, todos os perfis passam a usar as mesmas 5 chaves fixas:
   `fundacao_local`, `modelos_performance`, `fluxo_trabalho`, `automacoes`,
   `missao_final`. Cada chave: `{ title, objective, checklist: string[] }`.
   Migration `0007_roadmap_etapas_fixas.sql` faz `update profiles set
   study_roadmap = ...` para os 8 perfis existentes, adaptando o conteúdo
   hoje distribuído em `week_1..4` para as 5 etapas fixas (a etapa
   `missao_final` referencia o Quiz de Validação existente — "Complete o
   quiz de validação para desbloquear seu certificado", reaproveitando o
   fluxo real já implementado em `QuizValidacaoContainer`).

2. **Progresso real por usuário**: nova tabela
   `roadmap_progress (token text references tokens(token), stage_key text,
   completed_at timestamptz not null default now(), primary key (token,
   stage_key))` — migration `0008_roadmap_progress.sql`. Nova rota
   `POST /api/roadmap/complete` (body `{ token, stageKey }`) que insere a
   conclusão (idempotente via `on conflict do nothing`) e concede XP via
   `xp_events` (reaproveita o padrão de XP já existente — mesma tabela,
   mesmo tipo de insert usado hoje para outras ações).

3. **`RoadmapCard.tsx` reescrito**: recebe `roadmap` (5 etapas fixas) e
   `completedStages: string[]` (vindo de `roadmap_progress`, buscado no
   dashboard server component). Renderiza:
   - Header "Sua Trilha Recomendada" + barra de progresso ("Etapa X de 5"
     + barra visual proporcional).
   - Cada etapa em sequência: concluídas mostram ✓ e título compacto;
     a etapa ativa (primeira não concluída) mostra objetivo + checklist +
     botão "Concluir Etapa" (chama `/api/roadmap/complete` e recarrega);
     etapas futuras aparecem bloqueadas com 🔒 e "Disponível após concluir
     a Etapa anterior" (sem detalhes).
   - Última etapa usa o rótulo "Missão Final" na UI (não "Certificação") —
     o certificado é a consequência exibida ao completar o Quiz de
     Validação, que já é o mecanismo real de certificação hoje.

**Fora de escopo desta frente:** geração de PDF/QR code do certificado
(já é um gap conhecido do produto, não introduzido nem resolvido aqui);
esta frente só cobre a experiência de roadmap com etapas bloqueadas e
progresso, reaproveitando o Quiz de Validação existente como "Missão
Final".

## Testes e verificação

- `src/lib/quiz-scoring.ts` não muda de assinatura — testes existentes
  (se houver) continuam válidos; adicionar teste cobrindo o novo banco de
  7 perguntas produzindo um `ProfileId` plausível para ao menos 2 cenários
  de resposta.
- Nova função pura (ex. `src/lib/roadmap-progress.ts`) para calcular etapa
  ativa e % de progresso a partir de `completedStages` — testada com
  Vitest (comportamento real, não mock).
- `npm run build` e `npm run test` passam ao final de cada task.
- Verificação end-to-end no navegador: hero com palavra rotativa, seção de
  oportunidade, cards do sistema com fotos, timeline glassmorphism,
  pricing reformulado, closing section, fluxo completo do Diagnóstico
  Inicial (7 perguntas, sem branch técnico) até o dashboard mostrando
  "Sua Trilha Recomendada" e o Roadmap com etapas bloqueadas/desbloqueadas
  reais (testar concluir a Etapa 1 e ver a Etapa 2 desbloquear).

## Restrições globais

- Custo zero: fotos via hotlink Unsplash (grátis), sem serviço pago novo.
- Nenhuma mudança em `/oferta`, checkout, Stripe, ou nos textos de preço
  de planos futuros além do já especificado na Frente A item 5.
- `scoreTriagem` e a interface `TriagemQuestion`/`TriagemAnswer` não mudam
  de forma — só o conteúdo de `quiz-triagem.ts` muda.
- Nunca prometer "nunca mais pagar por IA" — o posicionamento correto é
  "reduzir ou eliminar a dependência de assinatura para quem roda IA
  local" (ver `docs/copywriter-brief.md`, seção 7).
- Sem hype ("revolucionário", "definitivo", "game changer").
- Commits em pt-BR, trailers padrão:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` e
  `Claude-Session: https://claude.ai/code/session_012bbzHLj2xcGJHZY89EPJDp`.
