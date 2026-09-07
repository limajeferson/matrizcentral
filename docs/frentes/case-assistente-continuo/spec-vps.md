# Spec — Núcleo em VPS: assistente de voz multi-dispositivo

**Data:** 2026-09-07 · **Status:** design aprovado pelo usuário, aguardando
auditoria por segundo modelo antes do `writing-plans`.

Complementa (não substitui) a [`spec.md`](spec.md), que é a pesquisa: o que é
possível em Android e por quê. **Esta spec é a arquitetura do que vamos
construir.** Onde as duas divergirem, esta manda — a `spec.md` descreve um alvo
(celular executando o modelo) que deixou de ser o nosso.

---

## 1. O que mudou, e por que

A `spec.md` concluiu que o assistente contínuo não é construível em Android por
terceiro: o `SoundTrigger` é fechado, a CPU não dorme, o SO fechou as portas
laterais. Esse veredito **continua verdadeiro** — e continua sendo o melhor
capítulo do case.

O que ele não previa é que **a restrição toda existia porque o modelo rodaria no
aparelho.** Com o núcleo numa VPS, o celular só grava e envia. Nada do §2 se
aplica: sem DSP, sem foreground service, sem dreno de bateria, sem política de
gravação da Play Store — porque não há app nativo nem escuta contínua.

E não se perde nada no caminho, porque **o formato vencedor já era push-to-talk**
(§5 da `spec.md`, confirmado pelo Handy na §9.2). A VPS não troca um formato bom
por um ruim; ela tira o único formato bom da prisão do aparelho.

### 1.1 O que essa mudança QUEBRA — dito sem maquiagem

**O áudio sai do dispositivo.** A §4 da `spec.md` construiu o alicerce jurídico
sobre "processamento 100% local, logo o desenvolvedor não é controlador". Isso
não sobrevive intacto e não vamos fingir que sobrevive — fingir é o pecado
exato do Rabbit R1, e o ativo desta plataforma é credibilidade técnica.

**O que de fato se preserva, e por que ainda vale:** o que as pessoas querem
dizer com "local" é *não depender de Big Tech, não pagar por token, e os dados
serem seus*. Uma VPS que **você** aluga preserva os três. O vocabulário honesto
muda de **"local"** para **"soberano" / "self-hosted"** — e a distinção entre os
dois é, ela própria, conteúdo que quase ninguém explica direito.

**Onde a LGPD fica** (dado o escopo decidido em §2): a VPS é do usuário, para
uso pessoal e não econômico → **art. 4º, I** continua cobrindo. O que mataria
essa cobertura é a Matriz Central hospedar para membros — decidido que **não**.

## 2. Decisões travadas (usuário, 2026-09-07)

1. **Oracle Cloud Always Free (ARM Ampere).** Custo zero ao pé da letra.
   Consequência operacional: se não houver capacidade ARM na região, **o Claude
   para e consulta** — não sobe alternativa paga por conta própria.
2. **Escopo: só o usuário + case documentado.** O assistente é ferramenta
   pessoal dele; o produto para a plataforma é a **receita** (tutorial, código
   aberto, diário de construção). A Matriz Central **nunca** hospeda nem toca em
   áudio de terceiro. Custo marginal por membro = zero.

## 3. Arquitetura

```
CLIENTES
 ├─ PC       → atalho global (ou o próprio Handy, se aceitar endpoint remoto)
 └─ Celular  → PWA push-to-talk (Android e iOS; sem loja, sem política de app)
        │  HTTPS + chave do usuário
        ▼
VPS Oracle ARM — Always Free
 ┌──────────────────────────────────────────────┐
 │ Caddy .............. TLS automático           │
 │ API Python (FastAPI)                          │
 │   POST /transcrever  → motor Whisper          │
 │   POST /lembrar  GET /buscar → memória        │
 │   POST /agir → executores                     │
 │ SQLite único (transcrições + vetores)         │
 └──────────────────────────────────────────────┘
```

### 3.1 Por que cada peça

| Peça | Motivo |
|---|---|
| **Python / FastAPI** | `faster-whisper` é Python; não há alternativa razoável. É também o que os tutoriais do ViktorKav usam — o case fica **reproduzível** por quem ler. |
| **SQLite + sqlite-vec** | Um assistente de uma pessoa não justifica Postgres. Um arquivo; backup é copiar. Mesma escolha que a `spec.md` §2 já fazia. |
| **Caddy** | TLS automático. Nginx exigiria certbot e mais uma peça para explicar no tutorial. |
| **PWA, não app nativo** | Roda em Android **e** iOS, sem loja, sem revisão, sem política de gravação. Custo zero e um artefato a menos para manter. |
| **Subdomínio de `matrizcentral.com.br`** | Domínio já pago. Zero custo novo. |

### 3.2 O risco técnico que o design não resolve sozinho

**ARM.** O CTranslate2 — motor do `faster-whisper` — é otimizado para x86 com
AVX. Em Ampere isso pode decepcionar. O plano B é o **whisper.cpp**, que tem
NEON de primeira qualidade porque nasceu para Apple Silicon.

**Qual dos dois ganha em Ampere é medição, não opinião.** Vira a primeira coisa
a fazer (Onda 0). Escolher o motor no papel seria exatamente o erro que esta
frente existe para não cometer.

## 4. As ondas

Cada onda entrega algo **utilizável sozinho**. Se a obra parar em qualquer
ponto, o que já foi feito continua servindo. Essa é a defesa contra o modo de
morte da categoria: escopo grande, nada entregue.

### Onda 0 — Prova de terreno (spike; a saída é uma resposta, não código)

Três perguntas empíricas que nenhum modelo responde lendo:

1. A Oracle tem capacidade ARM Always Free na região? *(Se não: **parar e
   consultar o usuário**.)*
2. `faster-whisper` ou `whisper.cpp` em Ampere — qual, com que latência para
   um áudio de 10 s, com qual modelo (`large-v3-turbo` vs `small`)?
3. O Handy aceita endpoint remoto, ou o cliente de desktop é nosso?

**Entrega:** relatório curto + decisão do motor. Código do spike é descartável e
rotulado como tal.

### Onda 1 — A espinha: ditado multi-dispositivo

- VPS provisionada e **endurecida**: SSH só por chave, senha desabilitada,
  firewall fechado exceto 443, atualizações automáticas.
- `POST /transcrever` autenticado por chave, com limite de tamanho e de taxa.
- **PWA** push-to-talk (`MediaRecorder`), instalável.
- Cliente de desktop (Handy ou script com atalho global — depende da Onda 0).

**Entrega:** você fala no celular e no PC; o texto aparece. **Já útil sem mais
nada.**

### Onda 2 — Memória

- `sqlite-vec` + embeddings locais.
- `POST /lembrar`, `GET /buscar` (similaridade).
- Resumo incremental noturno — o mecanismo da `spec.md` §2, que existe porque a
  janela de contexto de um SLM é pequena e o log cresce sem parar.

**Entrega:** *"o que eu falei sobre X semana passada?"* responde.

### Onda 3 — Intenção e ação

- Classificador de intenção: nota, pergunta ou ordem. **Regra ou modelo pequeno
  — decidido na onda, com medição, não agora.**
- **Duas ações reais, e só duas.** É a disciplina da `spec.md` §5, e é
  exatamente o que o Rabbit R1 ignorou ao prometer um agente universal.

**Entrega:** falar → acontecer.

### Onda 4 — O case vira conteúdo

- Receita reproduzível ponta a ponta, repositório aberto, diário de construção.
- O capítulo **"por que isto não roda no seu celular"** — a pesquisa de Android,
  que aqui deixa de ser veredito e vira o material que ninguém mais tem.
- Item novo em `CONTENT_HUB` da plataforma.

**Entrega:** a receita publicada.

## 5. Governança de custo

| Item | Custo |
|---|---|
| VPS (Oracle Always Free) | R$ 0 |
| Domínio (subdomínio de `matrizcentral.com.br`) | R$ 0 — já pago |
| TLS (Let's Encrypt via Caddy) | R$ 0 |
| Modelos (Whisper, embeddings) | R$ 0 — pesos abertos |
| Dependências npm na plataforma | **nenhuma** — repositório separado |

**Teto duro:** qualquer coisa que exija pagamento **para o trabalho e consulta o
usuário.** Sem exceção, e sem "só desta vez".

## 6. Onde o código mora

Repositório **novo e separado**: `Projetos/assistente-local`. Não entra no
`matrizcentral` — é Python, é outro produto, e a plataforma tem regra de não
adicionar dependência. As **decisões** ficam aqui, em `docs/frentes/`, que é
onde a governança do projeto as procura.

## 7. Integração com o ecossistema

**Em runtime, separados de propósito.** A plataforma nunca vê o áudio; é isso
que mantém a Matriz Central fora da posição de controladora.

**A integração é editorial.** A receita vira conteúdo do hub. O modelo é *"não
vendemos o assistente, ensinamos você a ter o seu"* — que é a tese que a
plataforma já vende (IA soberana, sem mensalidade, sem Big Tech), com custo
marginal zero por membro e sem abrir frente de suporte.

## 8. O que NÃO vamos fazer (YAGNI explícito)

- **Não reescrever o Handy.** Ele já é o "primeiro corte" da `spec.md` §5,
  pronto e aberto. Refazê-lo queimaria o case em software que já funciona.
- **Não fazer app nativo.** PWA resolve, em duas plataformas, sem loja.
- **Não rodar LLM de raciocínio antes da Onda 3** — e talvez nem lá, se regra
  resolver.
- **Não hospedar para terceiros.**
- **Não prometer "always-on".** Não é o que vamos entregar.

## 9. Critérios de sucesso

1. Falar no celular e no PC produz texto correto, pela mesma VPS, sem app de
   loja.
2. Custo mensal recorrente **R$ 0**, verificável no painel.
3. Cada onda é utilizável sozinha — checável parando na anterior.
4. Nenhuma superfície promete o que o código não entrega (a regra da Onda 3 da
   `lancamento-publico`, aplicada aqui).
5. Um terceiro consegue reproduzir o resultado lendo a receita.
6. Nenhum áudio de terceiro toca infraestrutura da Matriz Central.

## 10. Pontos que eu sei que são frágeis

Listados de propósito, para a auditoria mirar aqui em vez de elogiar o resto:

1. **O reenquadramento jurídico da §1.1.** Afirmo que a VPS do próprio usuário,
   em uso pessoal, mantém o art. 4º, I. É a peça mais frágil e a mais cara se
   estiver errada.
2. **"Cada onda é utilizável sozinha".** É promessa checável. A Onda 1 pode
   depender em segredo da 2 ou da 3 de um jeito que eu não enxerguei.
3. **Custo zero permanente.** Oracle Always Free tem histórico de recuperar
   instâncias ociosas. Se a instância morrer sozinha, o case morre junto — e não
   há plano para isso nesta spec.
4. **A escolha de SQLite** pode limitar a Onda 3 mais do que eu suponho.
5. **A afirmação de que o PWA resolve** não foi testada: gravação de áudio em
   PWA no iOS tem histórico de restrição, e eu não verifiquei.
