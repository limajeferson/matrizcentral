# Comunidade: Identidade + Feed Central + Fórum

**Status:** 🔜 Planejada (aguardando início numa sessão dedicada, modelo Opus)

**Objetivo:** Construir a plataforma de comunidade da Matriz Central — um feed central no modelo de mídia/rede social especializada em IA, e um portal de fórum onde assinantes trocam insights organizados por tópicos que eles mesmos podem criar. Depende de um pré-requisito técnico que hoje não existe: identidade persistente de usuário (login real), já que o acesso atual é só por token temporário.

## Decisões já tomadas (nesta sessão, 08/07/2026)

- **Identidade:** vai precisar de login real (ex.: Supabase Auth com magic link por e-mail — o e-mail do comprador já existe na tabela `users`). Isso é um pré-requisito técnico, não uma frente de produto em si, mas deve ser resolvido antes do feed e do fórum.
- **Decomposição:** confirmado que são pelo menos 2 frentes de produto independentes (feed central; portal de fórum), mais a fundação de autenticação. A ordem entre feed e fórum, e a arquitetura de cada um, ainda **não foram decididas** — ficou para a sessão de brainstorm dedicada.
- **Por que adiado:** o usuário quer tocar essa frente numa sessão separada, usando o modelo Opus, pelo peso de arquitetura/engenharia envolvido (identidade de usuário é uma mudança estrutural que atravessa todo o produto).

## Prompt de retomada (colar numa sessão nova, modelo Opus)

```
Vamos iniciar a frente "Comunidade: Identidade + Feed Central + Fórum" do
projeto Matriz Central. Contexto já registrado em
docs/frentes/comunidade-identidade-feed/README.md — leia esse arquivo
primeiro (e docs/ECOSSISTEMA.md, que já deve ter sido lido automaticamente
via CLAUDE.md).

Escopo: construir (1) autenticação real de usuário (hoje o acesso é só por
token temporário, sem identidade persistente — isso bloqueia tudo abaixo),
(2) um feed central no modelo de mídia/rede social especializada em IA, e
(3) um portal de fórum onde assinantes trocam insights organizados por
tópicos que eles mesmos podem criar. Já decidimos que login real é
pré-requisito e que são frentes de produto independentes — mas a ordem
entre feed e fórum, e a arquitetura de cada uma, ainda não foram definidas.

Use 'superpowers:brainstorming' para desenhar a estrutura (comece pela
frente de autenticação, já que é pré-requisito das outras duas — e dentro
do brainstorm, decomponha o restante em sub-frentes se fizer sentido).
Depois, use 'superpowers:writing-plans' para elaborar o plano de
implementação de cada frente decidida. Na operação, use
'superpowers:subagent-driven-development' para orquestrar a execução em
etapas, com revisão a cada task.

Pode seguir agora com todas as frentes. Você tem autonomia, eu autorizo,
não precisa ficar pedindo permissão, atue sempre no que você decidir ser
recomendado e foque na entrega objetiva.
```

## Restrições que já valem pra essa frente

- Custo zero: Supabase Auth é gratuito no tier atual; qualquer serviço de moderação/busca/tempo-real precisa caber no free tier ou ser adiado.
- Vale reavaliar a UX do token de acesso atual: login real pode substituí-lo ou coexistir (ex.: token pra quem comprou uma vez, login pra quem quer voltar e interagir com a comunidade) — decisão em aberto pro brainstorm.
