# Spec — Núcleo em VPS: assistente de voz multi-dispositivo

**Data:** 2026-09-07 · **Revisão 2** (auditoria aplicada) · **Status:** pronta
para o `writing-plans`.

Complementa (não substitui) a [`spec.md`](spec.md), que é a pesquisa: o que é
possível em Android e por quê. **Esta spec é a arquitetura do que vamos
construir.** Onde as duas divergirem, esta manda — a `spec.md` descreve um alvo
(celular executando o modelo) que deixou de ser o nosso.

> **Revisão 2 (2026-09-07):** auditada por outro modelo, com alvo nos pontos
> que eu mesmo marquei como frágeis. Três afirmações minhas estavam **erradas
> de fato**, não de opinião. O registro do que aceitei e do que recusei está na
> [§12](#12-registro-da-auditoria).

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
(§5 da `spec.md`, confirmado pelo Handy na §9.2).

### 1.1 O que essa mudança quebra — dito sem maquiagem

**O áudio sai do dispositivo.** A §4 da `spec.md` construiu o alicerce sobre
"processamento 100% local". Isso não sobrevive intacto e não vamos fingir que
sobrevive — fingir é o pecado exato do Rabbit R1, e o ativo desta plataforma é
credibilidade técnica.

**E o argumento de defesa que eu tinha escrito estava errado.** A revisão 1
dizia que uma VPS preserva o "não depender de Big Tech". **A Oracle é Big
Tech.** Publicar aquela frase seria entregar a própria credibilidade num
comentário de leitor atento.

**O argumento correto é outro, e é mais forte: substituibilidade.** O que
importa não é de quem é a máquina — é que **modelo, dados e código são seus, e
a infraestrutura é trocável sem reescrever nada.** Hoje Oracle; amanhã seu PC,
um Raspberry Pi, outro provedor. Soberania não é onde o processo roda; é não
depender de onde ele roda.

**Isso só é verdade se for construído assim** — e é por isso que a
portabilidade do núcleo (§3.3) deixou de ser refinamento e virou requisito. O
mesmo desenho resolve duas coisas ao mesmo tempo: é o argumento de soberania
**e** o plano de contingência do §5.2.

*"A Oracle é Big Tech — e eis por que isso não importa"* vira tópico do
capítulo de conteúdo, não uma fragilidade escondida.

## 2. Decisões travadas (usuário, 2026-09-07)

1. **Oracle Cloud Always Free (ARM Ampere).** Custo zero ao pé da letra.
   Se não houver capacidade ARM, **o Claude para e consulta** — não sobe
   alternativa paga por conta própria.
2. **Escopo: só o usuário + case documentado.** O assistente é ferramenta
   pessoal dele; o produto é a **receita**. A Matriz Central **nunca** hospeda
   nem toca em áudio de terceiro.

> **🔒 O cadastro da Oracle é do usuário, não do Claude.** Criar conta OCI exige
> cartão de crédito para verificação, 2FA e credenciais — limite 1 do
> `CLAUDE.md`, que nenhuma autorização remove. O Claude mede, provisiona
> recursos e configura; **a conta o usuário cria.**

## 3. Arquitetura

```
CLIENTES
 ├─ Celular  → PWA push-to-talk  ──→ POST /transcrever  (áudio)
 └─ PC       → Handy (local) + atalho ──→ POST /nota    (texto já transcrito)
        │  HTTPS + chave do usuário
        ▼
VPS ARM — Always Free
 ┌──────────────────────────────────────────────┐
 │ Caddy .............. TLS automático           │
 │ API Python (FastAPI)                          │
 │   POST /transcrever  → áudio  → texto         │
 │   POST /nota         → texto já pronto        │
 │   GET  /buscar       → memória (vetor + FTS5) │
 │   POST /agir         → executores de rede     │
 │ SQLite único (transcrições + vetores + FTS5)  │
 └──────────────────────────────────────────────┘
```

### 3.1 Duas portas de entrada, e o motivo

**O Handy não aceita servidor de transcrição remoto.** Fato verificado no
README dele: só motores locais (Whisper via ggml, Parakeet); a única saída para
API externa é **pós-processamento de texto**, não STT. É desktop apenas, sem
Android nem iOS.

Isso responde a pergunta 3 da Onda 0 antes de ela ser feita — **não** — e muda
o contrato da API: ela precisa aceitar **texto já transcrito**, não só áudio.
Decidido agora, não depois, porque é contrato.

O desenho resultante é melhor que o original: no PC, o Handy transcreve
**localmente** (mais rápido que uma volta pela VPS, e sem áudio saindo da
máquina) e manda só o texto para a memória. **Menos áudio na rede, não mais.**

### 3.2 Por que cada peça

| Peça | Motivo |
|---|---|
| **Python / FastAPI** | `faster-whisper` é Python. É também o que os tutoriais do ViktorKav usam — o case fica **reproduzível**. |
| **SQLite + sqlite-vec + FTS5** | Um assistente de uma pessoa acumula milhares de notas, não milhões. O **FTS5** entra junto porque busca vetorial sozinha erra consulta exata: *"o código do portão é 4589"* se recupera por texto, não por similaridade. Custo zero, embutido no SQLite. |
| **Caddy** | TLS automático. Nginx exigiria certbot e mais uma peça no tutorial. |
| **PWA, não app nativo** | Roda sem loja, sem revisão, sem política de gravação. Ver §3.4 para o que isso custa no iOS. |
| **ffmpeg** | O iOS grava `mp4/AAC` e o Android `webm/opus`. Normalizar para WAV 16 kHz é obrigatório de qualquer forma para o whisper.cpp. |

### 3.3 A VPS é descartável — requisito, não refinamento

Tudo o que constitui a máquina (Caddy, serviço Python, systemd, firewall,
atualizações) sai de **um script idempotente versionado** no repositório.

**Critério de aceite da Onda 1: destruir a instância e recriá-la em menos de 15
minutos, rodando só o script.** O estado — um arquivo SQLite de dezenas de MB —
tem backup noturno **cifrado e fora da Oracle** (repositório privado ou
`rclone`, ambos gratuitos). Object Storage da própria Oracle não serve como
destino único: morre junto com a tenancy.

Isto existe por três motivos que se somam: é o plano de contingência (§5.2), é
o argumento de soberania (§1.1), e é o capítulo mais reproduzível da receita.

### 3.4 O risco técnico, e o que a auditoria já resolveu

**ARM.** O CTranslate2 é otimizado para x86 com AVX; em Ampere pode
decepcionar. O plano B é o **whisper.cpp**, com NEON de primeira. Qual ganha é
**medição** (Onda 0) — escolher no papel seria o erro que esta frente existe
para não cometer.

**A auditoria reporta que a cota Always Free caiu para 2 OCPU / 12 GB em
15/06/2026** (era 4/24). Confirmar no console na Onda 0. A consequência prática:
medir `small` e `medium` quantizados junto com o `large-v3-turbo` — o critério é
**latência aceitável em push-to-talk**, não "melhor modelo".

**iOS.** `MediaRecorder` funciona no Safari desde 14.5. Mas há relato aberto
(fórum Apple, 2025) de que, **em PWA instalada**, a gravação funciona uma vez e
só volta após reiniciar o aparelho — e a permissão de microfone não persiste.
Na aba do Safari funciona normalmente. **Portanto: o caminho iOS é aba do
Safari com favorito; instalar como PWA é bônus a testar em aparelho real, nunca
promessa.** E "iOS" não aparece em superfície pública antes de alguém gravar num
iPhone de verdade.

## 4. As ondas

Cada onda entrega algo **utilizável sozinho**. A auditoria encontrou duas
falhas nessa promessa na revisão 1; ambas corrigidas abaixo.

### Onda 0 — Prova de terreno (spike; a saída é uma resposta, não código)

1. Há capacidade ARM Always Free na região? Qual a cota real hoje?
   *(Sem capacidade: **parar e consultar**.)*
2. `faster-whisper` ou `whisper.cpp` em Ampere — qual, com que latência para
   10 s de áudio, em `large-v3-turbo` / `medium` / `small`?
3. Qual modelo de **embedding multilíngue** cabe e responde? (Português não é
   detalhe: um embedding só-inglês inutiliza a Onda 2.)
4. `sqlite-vec` tem wheel `linux/aarch64`? Qual versão pinar?
5. Um LLM de 1–2B cabe **junto** com o Whisper nessa máquina? *(Define se a
   Onda 3 usa modelo ou regra — sem número, ela chega no escuro.)*

~~Handy aceita endpoint remoto?~~ **Respondida: não** (§3.1).

**Entrega:** relatório curto + decisão dos motores. Código do spike é
descartável e rotulado como tal.

### Onda 1 — A espinha: ditado no celular

- VPS provisionada, **endurecida** (SSH só por chave, senha off, firewall) e
  **recriável pelo script** (§3.3).
- `POST /transcrever` autenticado, com limite de tamanho e taxa, normalizando
  `mp4/AAC` e `webm/opus` por ffmpeg.
- **PWA** push-to-talk. Android é o alvo verificado; iOS é aba do Safari.

**Escopo é celular, não desktop** — e isso é correção da auditoria: no PC o
Handy já dita localmente, melhor e mais rápido que uma volta pela VPS. Um
"cliente de desktop" na Onda 1 entregaria **zero**.

**Entrega:** você fala no celular, o texto aparece. Útil sem mais nada.

### Onda 2 — Memória (sem LLM)

- Ingestão, embeddings, `sqlite-vec` + **FTS5** (busca híbrida).
- `POST /nota` — a porta do Handy no desktop (§3.1). **É aqui que o desktop
  entra**, e faz sentido: memória é o que o Handy sozinho não tem.
- `GET /buscar`.

**O "resumo incremental noturno" saiu daqui.** Resumir é *gerar*, exige LLM, e a
§8 proíbe LLM antes da Onda 3 — a revisão 1 se contradizia. E responder *"o que
eu falei sobre X?"* é **recuperação**, não geração: não precisa de modelo.

**Entrega:** o que você ditou em qualquer aparelho vira memória buscável.

### Onda 3 — Intenção e ação

- Classificador: nota, pergunta ou ordem. **Regra ou modelo pequeno — decidido
  com o número da Onda 0**, não agora.
- Resumo incremental noturno, **se** um LLM entrar aqui.
- **Duas ações reais, e só duas.**

As duas ações da `spec.md` §5 (criar nota, enviar SMS) **morreram com a
mudança de alvo** — PWA não dispara SMS e a VPS não tem acesso ao aparelho. O
que uma VPS faz é **ação de rede**: bot do Telegram (gratuito), e-mail, webhook,
arquivo. Quais duas, decide o plano.

**Entrega:** falar → acontecer.

### Onda 4 — O case vira conteúdo

- Receita reproduzível, repositório aberto, diário de construção.
- Capítulo **"por que isto não roda no seu celular"** (a pesquisa de Android).
- Capítulo **"a Oracle é Big Tech — e por que isso não importa"** (§1.1).
- Item novo em `CONTENT_HUB`. **É a única onda que toca o repositório da
  plataforma.**

## 5. Governança de custo

| Item | Custo |
|---|---|
| VPS (Oracle Always Free) | R$ 0 |
| Subdomínio de `matrizcentral.com.br` | R$ 0 — já pago |
| TLS (Let's Encrypt via Caddy) | R$ 0 |
| Modelos (Whisper, embeddings) | R$ 0 — pesos abertos |
| Backup fora da Oracle (repo privado ou `rclone`) | R$ 0 |
| Dependências npm na plataforma | **nenhuma** — repositório separado |

**Teto duro:** qualquer coisa que exija pagamento **para o trabalho e consulta o
usuário.**

### 5.2 A instância vai morrer — o plano é sobreviver a isso

A Oracle recupera instância ociosa: 7 dias com CPU no p95 **< 20%**, rede
< 20% **e** memória < 20%. A instância é **removida, possivelmente sem aviso**.

**O perfil deste assistente é exatamente o que ela reclama:** picos de poucos
segundos, algumas vezes por dia. O p95 de CPU em 7 dias fica perto de zero. A
pergunta não é *se*, é *quando*.

A resposta é a §3.3 — **recriar em 15 minutos e restaurar o arquivo** —, não
tentar parecer ocupado. O trabalho real que o sistema tem de qualquer forma
(backup noturno, manutenção de índice, health-check) levanta as métricas de
quebra, e a receita **diz isso em voz alta** em vez de esconder. Ver §12 para o
limite que eu recuso a cruzar aqui.

**🔒 Decisão do usuário, quando aparecer:** a Oracle empurra o Pay-As-You-Go
como remédio para capacidade e ociosidade. PAYG com uso dentro do Always Free
custa R$ 0 — **mas exige cartão e remove o teto duro contra cobrança
acidental.** É dinheiro e risco: o Claude não migra sozinho.

## 6. Onde o código mora

Repositório **novo e separado**: `Projetos/assistente-local`. Não entra no
`matrizcentral` — é Python, é outro produto, e a plataforma tem regra de não
adicionar dependência. As **decisões** ficam em `docs/frentes/`.

## 7. Integração com o ecossistema

**Em runtime, separados de propósito.** A plataforma nunca vê o áudio.

**A integração é editorial.** O modelo é *"não vendemos o assistente, ensinamos
você a ter o seu"* — a tese que a plataforma já vende, com custo marginal zero
por membro e sem abrir frente de suporte.

## 8. Fronteira jurídica — reescrita pela auditoria

A revisão 1 herdou da `spec.md` a estrutura "o desenvolvedor não é controlador
porque é local". **Isso estava mal argumentado: aqui não existe
desenvolvedor-terceiro.** Dono do dado, operador da VPS e titular da voz são a
mesma pessoa. Enquanto o áudio for só a voz do dono, **a LGPD não tem a quem
proteger.** Esse é o argumento forte, e a revisão 1 não o usava.

**Lei 9.296/1996:** gravação por um dos interlocutores **não é crime** (art.
10-A, §1º, com o STJ reafirmando em 2022). O tipo penal é captação por
terceiro. **O local de armazenamento não é elemento do crime** — o servidor no
meio não muda nada.

Duas ameaças reais, que a revisão 1 não enxergava:

**(a) Voz de terceiro.** Vira **regra de escopo, não nota de rodapé:** *o
assistente transcreve a fala do próprio usuário em push-to-talk; não é gravador
de reunião nem de ambiente.* É a mesma conclusão da `spec.md` §4 — a VPS a
tornou **mais** importante, não menos.

**(b) Uso econômico.** O case existe para virar conteúdo de uma plataforma que
vende. Se transcrições reais virarem material publicado, o "exclusivamente
particular" do art. 4º, I fica difícil de sustentar. **Separação rígida:** o
produto editorial é receita, código e diário; **nenhuma transcrição real e
nenhum áudio real viram conteúdo.** Demonstração usa áudio roteirizado para
esse fim.

**Aviso na receita:** membros que reproduzirem são pessoas naturais em uso
pessoal — o art. 4º, I vale para eles. Mas a receita **não pode** sugerir gravar
reunião ou terceiros, e precisa do aviso explícito. Texto com efeito sobre
membro = **limite 3 do `CLAUDE.md`: o usuário lê antes de publicar.**

## 9. O que NÃO vamos fazer

- Não reescrever o Handy — ele já é o "primeiro corte" da `spec.md`, pronto.
- Não fazer app nativo.
- Não rodar LLM antes da Onda 3.
- Não hospedar para terceiros.
- Não prometer "always-on".
- Não prometer iOS antes de gravar num iPhone real.

## 10. Critérios de sucesso

1. Falar no celular produz texto correto, sem app de loja.
2. Custo recorrente **R$ 0**, verificável no painel.
3. Cada onda é utilizável sozinha.
4. Nenhuma superfície promete o que o código não entrega.
5. Um terceiro reproduz o resultado lendo a receita.
6. Nenhum áudio de terceiro toca infraestrutura da Matriz Central.
7. **Nenhuma transcrição ou áudio real do usuário vira conteúdo publicado.**
8. **A instância é destruída e recriada em < 15 min, com o backup restaurado —
   testado, não presumido.**

## 11. O que continua em aberto

- A cota real do Always Free hoje (2 OCPU/12 GB é o que a auditoria reporta;
  confirmar no console).
- Latência real dos motores em Ampere — Onda 0.
- Quais duas ações a Onda 3 entrega.
- Se a home region ficar fora do Brasil, o áudio do dono sai do país. Sob o art.
  4º, I é irrelevante; para a **narrativa** da receita, é detalhe que leitor
  crítico aponta. Tratar no texto, não esconder.

## 12. Registro da auditoria

**Aceito e aplicado:** o argumento de soberania trocado por substituibilidade
(§1.1) · VPS descartável e backup fora da Oracle como requisito (§3.3, §5.2) ·
Handy sem STT remoto e a segunda porta da API (§3.1) · Onda 1 sem desktop ·
resumo noturno movido para a Onda 3 · FTS5 na busca híbrida · embedding
multilíngue e wheel aarch64 na Onda 0 · a fronteira jurídica reescrita (§8) ·
iOS via aba do Safari · normalização por ffmpeg · cadastro OCI é do usuário ·
critérios 7 e 8.

**Aceito com limite — e o limite é meu, não da auditoria:** a sugestão de que o
trabalho noturno "também evita a reclamação por ociosidade" vale **enquanto for
trabalho real** (backup, índice, health-check). **Se não bastar, a resposta é
recriar em 15 minutos, não fabricar carga para enganar a métrica.** Um case que
ensina a driblar a política de uso justo de um provedor é um case que eu não
quero assinar, e contradiz a credibilidade técnica que é o ativo da plataforma.
Fica escrito para que ninguém "otimize" isso depois.

**Recomendação de modelo por etapa** (adotada): planejamento no modelo de
raciocínio máximo, porque o plano precisa transformar estas armadilhas em
critérios verificáveis · implementação em modelo intermediário, com escalada em
três pontos — interpretar os números da Onda 0, qualquer texto com efeito sobre
membro, e o script de recriação da VPS · revisão no modelo máximo, em contexto
limpo e com instrução adversarial, porque o modo de morte desta frente é
prometer o que o código não entrega.
