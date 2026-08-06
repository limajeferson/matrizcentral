# Spec — Conformidade legal para venda de produto digital

> **Frente nova, 2026-08-06.** Nasce da decisão de listar na Kiwify antes do
> lançamento pelo site: marketplace verifica conformidade do produtor na
> aprovação, e o que hoje está no ar não passa numa checagem básica.

## ⚠️ Ressalva que abre este documento

**Não sou advogado e este material não é parecer jurídico.** O que ele faz é
mapear obrigações objetivas da legislação brasileira aplicável a venda de produto
digital, apontar onde o site não as cumpre hoje, e redigir texto que endereça
cada uma. **Antes de publicar, o conjunto deve ser revisado por advogado** — em
especial as cláusulas de limitação de responsabilidade e de rescisão, que são as
que um juiz mais frequentemente afasta quando mal redigidas (art. 51 do CDC).

**Método sobre a fonte Kiwify:** os termos da Kiwify **não foram copiados**. Eles
regulam a relação *Kiwify ↔ produtor* e *Kiwify ↔ comprador* — copiá-los para o
nosso site produziria cláusulas inaplicáveis e promessas sobre infraestrutura que
não controlamos. O que foi extraído são (a) as **obrigações que a Kiwify impõe a
quem vende lá**, que passam a valer para nós, e (b) a **estrutura de assuntos**
que um contrato de licença de software cobre. O texto é original.

## Problema

O site vende produto digital hoje (Stripe, modo teste) e vai listar na Kiwify.
A camada legal está num estado que não sustenta nem uma coisa nem outra.

### O que existe hoje

| Documento | Estado |
|---|---|
| `/legal/termos` | 6 seções curtas. Garantia foi corrigida na Onda 3 e está boa. O resto é superficial. |
| `/legal/privacidade` | 5 seções. **Contém afirmação incorreta** (ver F-3). |
| Identificação do fornecedor | **Não existe em lugar nenhum do site.** |
| Licença de uso do software | **Não existe.** |
| Política de uso aceitável | **Não existe.** |

### Falhas encontradas, por origem legal

**Decreto 7.962/2013 — "Lei do E-commerce"** (regulamenta o CDC para venda online):

- **F-1 · art. 2º, I e II — identificação do fornecedor.** Exige nome
  empresarial, CNPJ (ou CPF, se pessoa física), endereço **físico** e eletrônico,
  em local de destaque e fácil visualização. **Hoje: só existe
  `contato@matrizcentral.com.br`.** É a falha mais grave do conjunto: é
  verificável em 10 segundos por qualquer um, é a primeira coisa que o Procon
  olha e é item de checagem na aprovação de produtor em marketplace.
- **F-2 · art. 2º, III a VI — condições integrais da oferta.** Características
  essenciais, discriminação de despesas adicionais, modalidades de pagamento,
  **prazo de execução/entrega**. A Onda 3 resolveu preço e parcelamento; falta
  dizer **em quanto tempo o acesso é liberado** e o que acontece se falhar.
- **F-3 · art. 4º, I — atendimento eletrônico.** Exige canal de atendimento e
  **resposta em até 5 dias**. O `/suporte` existe, mas **nenhum prazo é
  prometido** em lugar nenhum.
- **F-4 · art. 5º — arrependimento.** Exige informar o meio de exercer o
  arrependimento e **comunicar a instituição financeira** para o estorno. A
  garantia está redigida (Onda 3), mas não há **confirmação imediata** da
  contratação com sumário do contrato, exigida pelo art. 4º, VII.

**LGPD (Lei 13.709/2018):**

- **F-5 · afirmação incorreta no ar.** A política diz *"Não vendemos nem
  compartilhamos seus dados com terceiros"*. **Isso não é verdade como escrito**:
  o projeto usa Stripe (pagamento), Brevo (e-mail), Supabase (banco) e Vercel
  (hospedagem) — todos **operadores** que tratam dado pessoal por nossa conta.
  A frase pretendia dizer "não vendemos dados e não compartilhamos para marketing
  de terceiros", que é verdade; como está, é declaração falsa numa política de
  privacidade. **Corrigir isto é prioridade — declaração falsa é pior que
  omissão.**
- **F-6 · art. 9º — base legal por finalidade.** Nenhum tratamento tem base legal
  declarada. Execução de contrato (entrega do produto), legítimo interesse
  (medição de funil), consentimento (newsletter) e obrigação legal (guarda de
  registros) são bases diferentes com consequências diferentes.
- **F-7 · art. 33 e 34 — transferência internacional.** Vercel, Supabase e Brevo
  processam fora do Brasil. Não há uma linha sobre isso.
- **F-8 · art. 18 — direitos do titular.** A política cita três (acesso,
  correção, exclusão). São **dez**, incluindo portabilidade, revogação de
  consentimento, informação sobre compartilhamento e oposição.
- **F-9 · retenção.** Nenhum prazo declarado para nada.
- **F-10 · medição de funil não declarada.** A Onda 1 subiu `funnel_events` +
  `/api/track` com `anon_id`. Mesmo sendo pseudonimizado e sem PII, é tratamento
  de dado e **não aparece na política**.

**Licença de uso do software** — a plataforma **é** software, e não há contrato:

- **F-11.** Não há concessão de licença declarada (escopo, pessoalidade,
  intransferibilidade), nem vedações (engenharia reversa, scraping,
  compartilhamento de conta, automação de download), nem consequência para
  violação. A seção "Licenciamento" atual fala só do **conteúdo**, em 3 linhas.
- **F-12.** Não há isenção de disponibilidade. Vendemos passe de **12 meses** com
  promessa implícita de plataforma no ar, sem nenhuma cláusula sobre manutenção,
  indisponibilidade ou força maior.
- **F-13.** Não há limitação de responsabilidade, prazo/rescisão, suspensão por
  abuso, nem lei aplicável e foro.

**Obrigações herdadas da Kiwify** (valem para nós ao vender lá):

- **F-14.** O produtor garante ter **titularidade ou licença** do material. Os
  relatórios da plataforma citam **benchmarks de terceiros** — hoje atribuídos às
  fontes (foi decisão da Trilha E), mas **não há uma declaração de política**
  sobre uso de material de terceiro.
- **F-15.** Vedadas promessas de enriquecimento rápido e resultados garantidos.
  A copy foi limpa na Onda 3, mas **não há regra escrita** que impeça a próxima
  peça de marketing de reintroduzir o problema.
- **F-16.** Vedado alegar parceria com a plataforma. Regra a registrar quando a
  Kiwify entrar como caixa.

## Escopo — o que esta frente entrega

Cinco entregas, na ordem de risco:

### E1 · Identificação do fornecedor (F-1)

Fonte única em `src/data/legal.ts`, consumida por footer, páginas legais e
e-mails. Renderiza a identificação exigida pelo Decreto 7.962.

**🔒 Depende do usuário:** razão social ou nome civil, CNPJ **ou** CPF, e
endereço físico completo. O Claude **não inventa e não adivinha** esses dados.
A entrega é a estrutura + um placeholder que **falha visivelmente** (não
silenciosamente) enquanto não for preenchido.

> **Decisão registrada (2026-08-06):** o usuário optou por **CPF** no cadastro da
> Kiwify. Para pessoa física, o Decreto 7.962 se satisfaz com nome civil + CPF +
> endereço. Vender como PF é legal; a escolha entre PF e PJ é do usuário e do
> contador dele.

### E2 · Política de Privacidade reescrita (F-5 a F-10)

Correção da afirmação falsa primeiro. Depois: tabela de tratamentos com
finalidade, base legal, dado tratado e retenção; lista dos operadores por nome e
função; transferência internacional; os dez direitos do art. 18; canal do
titular; a medição de funil declarada.

### E3 · Termos de Uso reescritos, com licença de software (F-11 a F-13)

Mantém a seção Garantia da Onda 3 **sem alteração** (já está correta e revisada).
Acrescenta: concessão de licença, vedações de uso, contas e segurança,
disponibilidade e manutenção, suspensão e rescisão, limitação de
responsabilidade redigida dentro do que o art. 51 do CDC admite, alterações dos
termos com aviso, lei aplicável e foro do domicílio do consumidor (art. 101, I —
foro de eleição contra consumidor é nulo).

### E4 · Política de Uso Aceitável e de Conteúdo (F-14 a F-16)

Documento novo, curto, em `/legal/uso-aceitavel`. Dois lados: o que o aluno não
pode fazer com o material, e o que **nós** nos comprometemos a não fazer na
comunicação (sem promessa de resultado, sem enriquecimento rápido, atribuição de
fonte de terceiro obrigatória). Este segundo lado é o que protege a conta no
marketplace — e é o que, na prática, teria evitado o "120+ páginas".

### E5 · Requisitos do Decreto no fluxo de compra (F-2, F-3, F-4)

O único item com **código**, não só texto:
- Prazo de liberação do acesso declarado na `/oferta` e no checkout.
- Prazo de resposta do suporte (5 dias, art. 4º) visível no `/suporte`.
- Sumário das condições **antes** de finalizar a compra, com o link dos termos
  alcançável do checkout (parcialmente feito na Onda 1).
- E-mail de confirmação da contratação contendo o sumário do contratado
  (art. 4º, VII) — hoje o e-mail confirma acesso, não a **contratação**.

## Fora de escopo

- **Abrir CNPJ, escolher regime tributário, emitir nota fiscal.** É do usuário e
  do contador.
- **Parecer jurídico.** O texto entregue é insumo para revisão, não substituto.
- **Cookie banner com consentimento granular.** Hoje só há cookie essencial e
  medição própria pseudonimizada, sem cookie de terceiro para publicidade —
  a política declarada resolve. Se um dia entrar pixel de anúncio, vira frente
  própria.
- **Termos da relação com a Kiwify.** Quem redige são eles; nós aceitamos.

## Critérios de sucesso

1. Identificação do fornecedor visível em todas as páginas públicas, vinda de
   fonte única.
2. Nenhuma afirmação falsa ou não verificável nos documentos legais — em
   especial, a frase sobre compartilhamento corrigida.
3. Cada tratamento de dado com finalidade, base legal e retenção declaradas.
4. Existe contrato de licença cobrindo o software, não só o conteúdo.
5. Foro do consumidor, não foro de eleição.
6. Prazos de liberação de acesso e de resposta de suporte declarados.
7. Gate do projeto verde: `tsc` 0 · testes verdes · lint sem erros.
8. **Portão humano:** o conjunto é apresentado ao usuário antes de ir ao ar.

## Riscos

- **O maior risco é o texto novo prometer o que não cumprimos.** Toda cláusula
  deve ser conferida contra o comportamento real do código. Exemplo concreto: não
  prometer prazo de resposta de suporte menor que o que se consegue entregar.
- **Limitação de responsabilidade mal redigida é pior que ausente** — o art. 51
  do CDC anula cláusula que exonere fornecedor por vício do produto, e uma
  cláusula nula contamina a leitura do resto.
- **Placeholder de CNPJ/CPF vazando para produção** seria pior que não ter a
  seção: passaria a impressão de identificação sem identificar. Por isso o
  requisito de falhar visivelmente.

## Referências

- [Decreto 7.962/2013 (Planalto)](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm)
- [Política de Conteúdo Kiwify](https://kiwify.com.br/politica-de-conteudo/)
- [Licença de Uso de Software Kiwify](https://kiwify.com.br/licenca-de-uso-de-software/) — consultada para estrutura de assuntos, não copiada
- CDC: arts. 6º III, 49, 51, 101 I · LGPD: arts. 9º, 18, 33, 34
