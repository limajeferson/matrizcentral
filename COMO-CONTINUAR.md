# 🧭 Como continuar o projeto (guia rápido)

Este arquivo é pra **você** (humano). Ele explica como retomar o trabalho a
qualquer momento — depois de um `/clear`, num novo dia, ou no outro computador
quando voltar de férias — sem perder o fio da meada.

---

## ✅ O jeito mais simples de retomar (nesta máquina)

Abra o Claude Code na pasta do projeto e digite:

> **continue de onde paramos**

O Claude vai ler o arquivo [`docs/ESTADO-ATUAL.md`](docs/ESTADO-ATUAL.md), que é
o "pino do você-está-aqui", e retomar exatamente do ponto — dizendo o que já foi
feito e qual é a próxima ação. Você não precisa lembrar de nada nem repetir
contexto.

## 💻 Retomar no OUTRO computador (voltando de férias)

1. Abrir o terminal na pasta do projeto e puxar o que foi feito:
   ```
   ! git pull origin master
   ```
2. Reinstalar as dependências (elas não vão no git):
   ```
   ! npm install
   ```
3. Garantir que o `.env.local` existe com as chaves (ele **não** vai no git, por
   segurança). Se faltar, copie do outro computador ou refaça pelo
   [`SETUP.md`](SETUP.md).
4. Digitar no Claude Code:
   > **continue de onde paramos**

Pronto — o `docs/ESTADO-ATUAL.md` viajou junto no `git pull`, então a nova
máquina sabe exatamente onde o projeto está.

> **Sobre as duas máquinas (`Grazi` = da esposa, em uso agora; `jefer` = a sua):**
> tudo que garante a continuidade está **no repositório** e viaja no `git pull` —
> `ESTADO-ATUAL.md`, docs e código. A única coisa que **não** viaja é a "memória
> automática" do Claude (fica na pasta local de cada computador), mas ela é só uma
> conveniência: a fonte de verdade é o repo. Ou seja, ao voltar pro `jefer` e dar
> `git pull` + `continue de onde paramos`, você retoma sem perder nada.

## 🧠 Os arquivos que formam o "cérebro" do projeto

Você não precisa editar nenhum deles à mão — o Claude cuida disso. Mas é bom
saber o que cada um faz:

| Arquivo | Pra que serve |
|---|---|
| `docs/ESTADO-ATUAL.md` | **O mais importante.** Onde o projeto está AGORA, o que foi feito, a próxima ação. É o primeiro que o Claude lê ao retomar. |
| `docs/ECOSSISTEMA.md` | O mapa geral: todas as frentes, arquitetura, memória, deploy. |
| `docs/frentes/<nome>/README.md` | Uma pasta por frente de trabalho, cada uma com seu status e próximo passo. |
| `CLAUDE.md` | As regras do projeto, lidas automaticamente pelo Claude no início. |
| `COMO-CONTINUAR.md` | Este arquivo — o guia pra você. |
| `prompt-pedido.md` | Seu registro manual do pedido original (histórico). |

## ⚠️ ATENÇÃO — tem trabalho pronto que ainda NÃO está no ar (20/07/2026)

Normalmente tudo que o Claude faz vai pro ar sozinho. **Desta vez não.** Existe
uma frente inteira construída e revisada (o **leitor protegido**, que substitui o
download do ebook por leitura dentro da plataforma) parada de propósito no seu
computador, esperando **três coisas que precisam do navegador**:

1. Aplicar uma mudança no banco (a migration `0028`);
2. Conferir se alguma compra antiga tem dado fora do padrão — se tiver, essa
   pessoa **pagou e ficaria sem acesso**;
3. Olhar as telas novas no navegador (nunca foram vistas por ninguém).

**O que fazer:** abra o Claude Code e diga **"continue de onde paramos"**. Ele lê
o estado, vê esses bloqueios e conduz. Se o navegador estiver funcionando, ele
resolve os dois primeiros sozinho.

**O que NÃO fazer:** não peça pra "subir" ou "fazer push" antes disso. Subir agora
coloca no ar um leitor que *parece* funcionar mas não registra nada — e o registro
é o que sustenta a regra da garantia.

## 🗺️ Onde o projeto está (resumo em 1 parágrafo)

O site **já está no ar** em `www.matrizcentral.com.br` (deploy automático a cada
push na `master`). Já foram entregues: a auditoria + os 4 críticos, **todas as 6
frentes do roadmap** (login, assinaturas, feed, fórum, blog, suporte/CRM), a
evolução da plataforma (casa unificada/SP1, redesign do feed, histórias) e o
**programa "design v2" (Frentes 1 a 4)**. Agora o projeto está no **programa de
lançamento final** — 7 trilhas (A a G) até a versão final: a **A** (e-mail
resolvido; falta só a Stripe sair do modo teste, que depende de você) e a **B**
(segurança do dinheiro: reembolso revoga acesso, XP não-duplicável, limites de
requisição) **já estão no ar**. As trilhas **C a G** estão planejadas e esperando.
Fora dessa fila, foi construída a frente do **leitor protegido** (veja o aviso
acima — é a única coisa pronta que ainda não subiu). Banco em dia até a `0026`; a
`0028` é a que falta aplicar. A próxima ação exata está sempre em
`docs/ESTADO-ATUAL.md` — é só dar **"continue de onde paramos"**.

## ▶️ Comandos úteis (digite no Claude Code)

- **continue de onde paramos** — retoma do ponto exato.
- **qual a próxima frente?** — o Claude consulta o estado e responde.
- **roda o site pra eu ver** — sobe o `npm run dev` e abre no navegador.
- **/superpowers:brainstorming** — para desenhar uma frente/feature nova.

> Dica: pode dar `/clear` sem medo. Enquanto o `docs/ESTADO-ATUAL.md` estiver
> commitado, a continuidade está garantida — em qualquer sessão, em qualquer
> computador.
