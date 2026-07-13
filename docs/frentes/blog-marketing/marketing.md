# Marketing — Matriz Central

> Artefato de **planejamento** (não código). Cobre funil de vendas, calendário
> editorial, sazonalidade e estratégias de aquisição/retenção, alinhado ao
> produto real: plataforma multi-formato de IA local com **passes de pagamento
> único** (sem mensalidade) e custo zero de infraestrutura.

## 1. Funil de vendas

O eixo de posicionamento é **anti-mensalidade**: tudo é pago uma vez, sem
recorrência forçada. O funil existe para levar um visitante frio até a compra
do Start (R$47) e, depois, até o upgrade para Regular/Advanced.

```
TOPO           MEIO              FUNDO            UPSELL
Blog/SEO  →  Newsletter    →   /oferta (R$47)  →  Regular R$97 /
(orgânico)   (/api/newsletter)  Start             Advanced R$497 (ou 12x R$47)
                                                    + cupom R$47/30 dias
```

### Topo — Blog / SEO
- **Objetivo:** capturar tráfego orgânico de quem pesquisa sobre IA local,
  privacidade de dados, hardware para IA, ou "alternativa a assinatura de IA".
- **Superfície:** `/blog` (lista) + `/blog/[slug]` (post), ambos públicos, sem
  login — é o convite de entrada, não pode ter atrito.
- **CTA no post:** ao final de cada artigo, convite para `/oferta` (compra
  direta) e/ou captura de e-mail via newsletter (para quem ainda não decidiu).
- **Métrica:** sessões orgânicas no `/blog`, páginas por sessão, tempo na
  página, cliques no CTA de `/oferta`.

### Meio — Newsletter (captura já existente)
- **Objetivo:** reter quem visitou mas não comprou ainda; nutrir com contexto
  até a decisão.
- **Superfície:** formulário de captura → `POST /api/newsletter` → tabela
  `newsletter_subscribers` (migration `0011`, aplicar quando for ativar o
  envio recorrente).
- **Nutrição:** sequência de e-mails via Brevo (domínio `matrizcentral.com.br`
  já autenticado — DKIM/DMARC OK, ver §4) explicando o modelo de passe único,
  reforçando prova social (feed/fórum) e half-price do cupom quando aplicável.
- **Métrica:** taxa de captura (visitantes → e-mail), taxa de abertura/clique
  da sequência de nutrição, taxa de conversão e-mail → compra Start.

### Fundo — `/oferta` (Start, R$47)
- **Objetivo:** converter em compra, pagamento único, atrito mínimo (Stripe
  Checkout, sem criar conta antes de pagar).
- **O que o Start entrega:** ebook + triagem/diagnóstico + roadmap + relatório
  de benchmark + esteira do certificado, e a plataforma em modo **visualização**
  (vê tudo, mas não consome — sem abrir feed, artigos, relatórios,
  apresentações). Gamificação pontua só a trilha do ebook.
- **Gatilho embutido de upgrade:** todo Start ganha **1 cupom de R$47, válido
  por 30 dias**, para migrar para Regular ou Advanced — é o principal motor do
  upsell (ver §1.4).
- **Métrica:** taxa de conversão `/oferta` → checkout concluído, ticket médio,
  tempo entre visita e compra.

### Upsell — Regular (R$97) / Advanced (R$497 ou 12x R$47)
- **Objetivo:** expandir o valor do cliente já convertido, dentro da janela de
  30 dias do cupom (maior propensão a compra, contexto ainda quente).
- **Regular:** passe de 12 meses, consome 1 conteúdo por mês (escolhe entre
  todos), desbloqueios acumulam pelos 12 meses. E-mail de "novo ciclo" quando
  o slot mensal reabre — gatilho de reengajamento recorrente sem cobrança
  recorrente.
- **Advanced:** passe de 12 meses, consumo ilimitado de toda a plataforma +
  feed + gamificação plena. E-mail de "novos conteúdos" a cada publicação —
  motivo de retorno contínuo.
- **Gatilho de e-mail:** o cupom de 30 dias deve aparecer em pelo menos 2
  e-mails da sequência pós-compra do Start (dia 1 e dia ~20) para não deixar a
  janela expirar sem lembrete.
- **Métrica:** taxa de uso do cupom (janela de 30 dias), taxa de upgrade
  Start→Regular/Advanced, receita incremental por cliente (LTV).

### Funil resumido por métrica
| Etapa | Métrica principal | Métrica secundária |
|---|---|---|
| Topo (blog) | sessões orgânicas | páginas/sessão, CTR do CTA |
| Meio (newsletter) | taxa de captura de e-mail | taxa de abertura/clique |
| Fundo (`/oferta`) | conversão em compra Start | tempo até a compra |
| Upsell (Regular/Advanced) | taxa de uso do cupom em 30 dias | receita incremental (LTV) |

## 2. Calendário editorial

### Cadência
- **1 post/semana** (sustentável para conteúdo de qualidade sem depender de
  equipe dedicada); publicar sempre no mesmo dia da semana para criar hábito
  de retorno (sugestão: terça-feira).
- Cada post novo dispara o e-mail de "novos conteúdos" já existente para
  assinantes Advanced (reaproveita o gatilho de retenção da Frente 2) e pode
  alimentar a sequência de nutrição da newsletter.

### Pilares de conteúdo (rotação sugerida, 1 por semana)
1. **IA local** — o que é, como funciona, diferenças entre rodar localmente
   vs. em nuvem (ex.: "O que muda quando a IA roda no seu computador").
2. **Hardware** — guias práticos de dimensionamento ("Quanto de hardware você
   precisa para rodar IA localmente", comparativos de GPU/RAM/custo).
3. **Privacidade** — dados que não saem da máquina, LGPD, casos de uso
   sensíveis (jurídico, saúde, financeiro) que não podem ir para nuvem de
   terceiros.
4. **Custo / fim da mensalidade** — comparação de custo total (assinatura
   mensal de IA em nuvem ao longo de 12 meses vs. passe único), o eixo central
   do posicionamento da marca.
5. **Casos de uso** — aplicações reais (produtividade, estudo, pequenos
   negócios), depoimentos/prova social do feed e do fórum.

Rotação sugerida: semana 1 = IA local, semana 2 = hardware, semana 3 =
privacidade, semana 4 = custo, semana 5 = caso de uso, repete. Datas
sazonais (§3) substituem o pilar da semana quando coincidirem.

### Formato de post
- Título + resumo (usados em `/blog` e nos metadados de SEO), corpo em
  markdown (`content/blog/*.md`, manifesto em `src/data/blog.ts`), CTA para
  `/oferta` ao final. Extensão alvo: 600–1000 palavras (suficiente para SEO,
  sem exigir produção pesada).

## 3. Sazonalidade

Calendário de temas por época do ano, para encaixar na rotação de pilares
quando a data for relevante:

| Período | Tema sazonal | Ângulo |
|---|---|---|
| Janeiro (início de ano) | "Organize sua IA para o ano" | resoluções, produtividade pessoal, comece o ano sem depender de mensalidade |
| Fevereiro–Março (volta às aulas) | IA local para estudantes/pesquisa | custo acessível para quem estuda, privacidade de dados acadêmicos |
| Maio–Junho (meio de ano) | Balanço de custo | "quanto você já pagaria em assinaturas de IA até aqui" — reforça o eixo anti-mensalidade |
| Setembro–Outubro (pré-Black Friday) | Comparativo de preço | prepara a narrativa "pague uma vez" antes da onda de descontos recorrentes de concorrentes |
| Novembro (Black Friday) | Oferta/cupom em destaque | maior apelo ao cupom de R$47/30 dias e ao Advanced parcelado (12x R$47) |
| Dezembro (fim de ano) | Retrospectiva + planejamento do ano seguinte | "o que a comunidade construiu" (prova social do feed/fórum), gancho para o tema de janeiro |

## 4. Estratégias

### SEO on-page
- **Títulos:** claros, com a palavra-chave principal no início (ex.: "IA
  local: guia de hardware para rodar modelos em casa").
- **Descrições (meta description):** usar o campo `excerpt` do post como base
  da `generateMetadata` (já implementado em `/blog/[slug]`) — resumo de 1–2
  frases com a keyword e um motivo para clicar.
- **Palavras-chave por pilar:** "IA local", "rodar IA sem internet",
  "privacidade de dados IA", "alternativa a assinatura de IA", "custo de IA
  em nuvem vs local", "hardware para IA em casa".
- **Estrutura:** um H1 por post (título), subtítulos H2 para escaneabilidade,
  link interno para `/oferta` e para outros posts do mesmo pilar (linkagem
  interna ajuda indexação e mantém o visitante no site).

### E-mail de nutrição (Brevo)
- Domínio `matrizcentral.com.br` já autenticado no Brevo (DKIM/DMARC
  configurados, entregabilidade confirmada — ver `ESTADO-ATUAL.md`), pronto
  para sequências de nutrição além dos e-mails transacionais já existentes.
- **Sequência sugerida (newsletter → compra):**
  1. Boas-vindas — o que é a Matriz Central, o eixo anti-mensalidade.
  2. Prova social — destaque do feed/fórum, o que a comunidade já construiu.
  3. Objeção de custo — comparação Start (R$47 único) vs. assinatura mensal
     de IA em nuvem ao longo de 12 meses.
  4. Chamada para `/oferta` com prazo/urgência leve (sem inventar escassez
     falsa — alinhado à política de posicionamento honesto do produto).
- **Sequência pós-compra (Start → upgrade):** reaproveita os e-mails já
  implementados na Frente 2 (confirmação de compra, novo ciclo, novos
  conteúdos) e adiciona 2 lembretes do cupom de R$47/30 dias (dia 1 e dia
  ~20 após a compra) para maximizar a taxa de upgrade antes da expiração.

### Prova social
- **Feed e fórum** (Frentes 3 e 4) são a prova social nativa da plataforma:
  destacar trechos/depoimentos reais (com consentimento) em posts do blog e
  na sequência de e-mail ("veja o que a comunidade está discutindo").
- Posts do blog podem linkar para tópicos do fórum relevantes ao tema
  (fecha o ciclo: SEO traz visitante → prova social do fórum aumenta
  confiança → CTA converte).

### Eixo anti-mensalidade (fio condutor)
- Toda peça de marketing (post, e-mail, CTA) deve reforçar a mesma mensagem
  central: **você paga uma vez, não todo mês**. É o diferencial competitivo
  frente a concorrentes de IA em nuvem com assinatura recorrente, e deve
  aparecer explicitamente em pelo menos um pilar por mês (pilar "custo/fim da
  mensalidade") e em pelo menos um e-mail por sequência de nutrição.

## 5. Custo e operação

- **Custo zero de infraestrutura:** blog é arquivos markdown versionados no
  repositório (sem CMS pago, sem banco de dados novo); newsletter usa a
  tabela já criada (`newsletter_subscribers`) e o Brevo (tier gratuito já em
  uso para e-mail transacional).
- **Operação:** 1 post/semana é sustentável com produção assistida
  (redação + revisão), sem exigir equipe editorial dedicada.
