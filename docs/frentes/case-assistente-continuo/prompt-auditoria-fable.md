# 🔍 Prompt portátil — auditoria da arquitetura por outro modelo

> **Para o usuário.** Esta auditoria **já foi disparada automaticamente** por
> subagente em 2026-09-07 — você não precisa fazer nada. Este arquivo existe
> para o caso de você querer repetir a auditoria manualmente, com o cérebro da
> sessão trocado para outro modelo, ou meses depois quando a spec tiver mudado.
>
> **Quando NÃO usar:** se a auditoria automática já rodou e você não mexeu na
> spec desde então, rodar de novo é gastar dinheiro para ouvir a mesma coisa.

---

## Antes de colar

1. Troque o modelo da sessão para o que vai auditar (`/model`).
2. **Lembre de voltar depois.** É o motivo pelo qual o prompt abaixo termina
   pedindo a recomendação de para onde voltar — ficar no modelo caro por
   esquecimento é o desperdício mais comum aqui.
3. Cole o bloco inteiro abaixo, do `---` em diante.

---

```
Você é auditor de uma decisão de arquitetura. Trabalhe e responda em português
do Brasil.

Não escreva código, não altere arquivo nenhum, não crie branch, não commite.
Sua saída é um parecer em texto. Leitura e pesquisa são permitidas.

## O que auditar

Leia, nesta ordem:
1. docs/frentes/case-assistente-continuo/spec-vps.md — a arquitetura proposta,
   o alvo da auditoria
2. docs/frentes/case-assistente-continuo/spec.md — a pesquisa anterior (86
   fontes) que a spec-vps parcialmente substitui
3. docs/frentes/case-assistente-continuo/README.md e referencias.md — contexto
   e as fontes reais que o usuário trouxe
4. CLAUDE.md — a governança do projeto (custo zero, limites de autonomia,
   convenções)

## Contexto que você precisa para julgar

Projeto: Matriz Central, plataforma brasileira que vende educação sobre IA
rodando localmente (sem Big Tech, sem mensalidade, sem token pago). O ativo do
negócio é CREDIBILIDADE TÉCNICA — promessa que não se cumpre custa caro aqui.

A frente audita um "case": construir um assistente de voz para o dono do
projeto e transformar a construção em conteúdo para a plataforma. Duas decisões
já foram tomadas PELO USUÁRIO e não estão em discussão — audite as
consequências delas, não as decisões:
- VPS Oracle Cloud Always Free (custo zero estrito)
- Escopo "só o dono + receita documentada" — a plataforma nunca hospeda voz de
  terceiro

## Mire aqui — a §10 da spec lista os pontos que o autor sabe que são frágeis

Não distribua elogio pelo que está bem. Ataque estes cinco, e qualquer outro
que você encontrar:

1. O reenquadramento jurídico da §1.1. A spec afirma que, sendo a VPS do
   próprio usuário e o uso pessoal e não econômico, o art. 4º, I da LGPD
   continua cobrindo. Isso aguenta pressão? Atenção ao detalhe que a spec
   talvez tenha ignorado: o uso vira "conteúdo para uma plataforma que vende" —
   isso ainda é "não econômico"? E se o assistente transcrever conversas em que
   há terceiros, a Lei 9.296/1996 (interceptação) entra? A spec anterior tratou
   disso supondo processamento local; supor com servidor no meio é a mesma
   coisa?
2. "Cada onda é utilizável sozinha". É promessa checável. Percorra as Ondas 1→4
   e diga se alguma depende em segredo de outra posterior.
3. Custo zero permanente. O Oracle Always Free tem histórico de recuperar
   instância ociosa e de falta de capacidade ARM. A spec não tem plano para a
   instância morrer. Qual o desenho mínimo que evita perder o trabalho — e ele
   cabe no custo zero?
4. SQLite limita a Onda 3 mais do que o autor supõe?
5. PWA gravando áudio no iOS. O autor admite que não verificou. Verifique o que
   der para verificar e diga o que é fato e o que é suposição.

## O que você tem autoridade para fazer

Você pode DISCORDAR DA ARQUITETURA INTEIRA e propor outra, desde que ela
respeite as duas decisões travadas do usuário e a governança de custo zero do
CLAUDE.md. Se a sua proposta for melhor, diga com todas as letras — não amacie.

Você NÃO tem autoridade para: alterar as duas decisões travadas, propor gasto
recorrente, ou propor que a plataforma hospede dados de terceiros.

## Formato da resposta

- Veredito em uma linha: seguir como está / seguir com correções / repensar a
  arquitetura.
- Achados, do mais grave ao menos, cada um com: qual afirmação da spec está
  errada ou frágil, por quê, e a correção concreta. Diga o que é fato
  verificado e o que é a sua avaliação.
- O que está certo e não deve ser mexido — curto, só para eu não "consertar" o
  que funciona.
- Recomendação de modelo para a próxima etapa. O trabalho seguinte é
  transformar esta spec num plano de implementação detalhado e depois executá-lo
  com subagentes (implementador + revisor). Diga qual perfil de modelo você
  recomenda para cada etapa — planejamento, implementação, revisão — e POR QUÊ,
  em termos de natureza da tarefa (raciocínio longo x execução mecânica x
  ceticismo adversarial). Se achar que uma etapa não precisa do modelo mais
  caro, diga.
```

---

## Por que o prompt é assim

**Nomeia os pontos frágeis em vez de dizer "revise".** "Revise isto" produz
elogio educado — o modelo encontra o que está bom porque é mais fácil. Apontar
o alvo é o que faz a auditoria render.

**Diz o que não é discutível.** Sem isso, a auditoria volta propondo pagar por
uma VPS melhor ou hospedar para os membros — as duas coisas que já foram
decididas — e o parecer inteiro se perde.

**Proíbe escrever código.** Um auditor que começa a implementar deixa de
auditar, e o trabalho dele colide com o de quem está construindo.

**Pede a recomendação de modelo no fim.** Essa parte não é cerimônia: é o
lembrete de que a sessão está num modelo caro e precisa voltar. Vale ler a
resposta dele com ceticismo — nenhum modelo tem visão privilegiada sobre a
economia da própria inferência —, mas o raciocínio sobre a *natureza* de cada
etapa (raciocínio longo x execução mecânica x ceticismo adversarial) costuma ser
útil.
