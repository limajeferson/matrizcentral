# Leitor Protegido — Spec

> Brainstorm de 2026-07-20. Política de reembolso que motivou esta frente:
> [`politica-reembolso.md`](politica-reembolso.md).

## Problema

O ebook é o **único ativo baixável** do produto (`/api/download` serve
`content/ebooks/ebook_llm_local_matrizcentral.md` com `Content-Disposition:
attachment`). Isso cria duas dores:

1. **Reembolso assimétrico.** Uma vez baixado, o arquivo é irrecuperável: você
   devolve o dinheiro e a pessoa fica com o produto. Foi essa assimetria que
   motivou a ideia de negar reembolso a quem baixou — o que a pesquisa jurídica
   mostrou ser inviável dentro dos 7 dias legais.
2. **Rastro de auditoria inútil.** O download grava `purchases.downloaded`, um
   **boolean sem timestamp**, sem log por evento. É o pior sinal do sistema e
   justamente o mais importante — sem ele não há defesa contra chargeback (o ônus
   da prova é do fornecedor).

**A solução não é jurídica, é de produto:** se o conteúdo nunca sai da
plataforma, a revogação passa a ser real e a assimetria desaparece.

## Objetivo

Substituir o download por um **leitor server-side** da biblioteca de texto
(ebook + relatórios), com posição de leitura persistida, acesso revogável e
livro-razão de consumo auditável.

## Decisões travadas

| Decisão | Escolha |
|---|---|
| Download | **Aposentado.** `/api/download` sai; o ebook passa a existir só no leitor. |
| Escopo | **Ebook + relatórios** (markdown). Podcast/vídeo ficam fora (embeds externos, não protegíveis). |
| Unidade de leitura | **Seção** (`##`), uma por vez. Não paginação sintética. |
| Autenticação | **Sessão obrigatória** (não `?token=`). |
| Proteção | Atrito + atribuição. **Sem** bloqueio de menu/seleção. |

### Por que seção, e não página

Markdown não tem páginas, e paginação sintética quebra: muda o tamanho da fonte
ou gira o dispositivo e a "página 12" vira outra coisa. A seção é estável entre
dispositivos, dá uma unidade natural para salvar posição, e servir uma por vez
significa que **o documento inteiro nunca existe numa única resposta** — copiar
tudo exige N requisições sequenciais, que são registráveis e limitáveis.

### Por que não bloquear menu de contexto / seleção

Contornável em segundos (`Ctrl+U`, DevTools, modo leitura); **quebra
acessibilidade** (leitores de tela e tradutores dependem de seleção); e pune o
cliente honesto — num produto sobre IA local, copiar um comando para o terminal é
uso legítimo constante. Proteção real exige DRM pago e ainda falha. O objetivo é
**atrito + atribuição**, não prevenção.

## Arquitetura

### Entrega de conteúdo

- Rota `/biblioteca/[slug]` — **server component**, resolve sessão, checa acesso,
  lê o markdown do disco, corta em seções, renderiza **apenas a seção corrente**.
- O markdown bruto **nunca** é enviado ao cliente. Sem endpoint que devolva o
  documento inteiro.
- Reaproveita a Frente 4: `parseMarkdown`/`extractHeadings` (`src/lib/markdown.ts`),
  `Markdown.tsx`, `ArticleToc`.
- Novo helper puro `src/lib/reader.ts`: corta `MdBlock[]` em seções por heading
  de nível 2, resolve índice ↔ slug, calcula vizinhos (anterior/próxima).

### Persistência

Duas tabelas, papéis separados de propósito (o erro do `purchases.downloaded` foi
misturar produto e auditoria num boolean):

```
reading_progress   -- retomada (produto). Uma linha por (user, conteúdo); sobrescreve.
  user_id, content_id, section_slug, section_index, updated_at
  PK (user_id, content_id)

reading_events     -- auditoria (prova de consumo). Append-only, imutável.
  id, user_id, content_id, section_slug, section_index, created_at
```

`reading_events` é a evidência que sustenta a garantia comercial e a defesa
contra chargeback. Nunca sofre update ou delete.

### Acesso e revogação

- Gate server-side reusando `entitlement-access` / `consumption` já existentes.
- **Recusa quando** `purchases.status ∈ {refunded, disputed}` — é isso que torna
  a revogação real. `revokePurchase()` (Trilha B) já grava esse status.
- Fail-closed: erro de banco → nega.

### Ponte para quem já comprou (obrigatório)

Compradores atuais têm **token, não conta**. Aposentar o download sem ponte
quebra acesso de cliente pagante.

- `/entrar/resgate?token=<token>` valida o token e vincula/cria a conta do e-mail
  da compra, criando sessão.
- ⚠️ **NÃO é uso único** (divergência consciente registrada em 2026-07-20): o
  `/dashboard/[token]` ainda depende do token, então invalidá-lo aqui quebraria o
  fluxo antigo. **Efeito colateral aceito e rastreado:** como `tokenAccessExpiry`
  é de 365 dias, uma URL de dashboard vazada permite gerar sessões de 30 dias
  repetidamente por até um ano. **Fechar quando a Trilha G aposentar o fluxo de
  token** — aí o resgate pode consumir o token.
- Enquanto houver tokens válidos, `/api/download` responde **410 Gone** com
  instrução e link para o resgate — não 404 mudo.

### Marca d'água

Rodapé discreto por seção, server-rendered: e-mail do comprador + identificador
curto. Barato, legal, e mata compartilhamento casual sem atrapalhar a leitura.

> **Implementado com `userId`, não com código da compra** (2026-07-20): a tela do
> leitor resolve a sessão, não a compra — buscar a compra só para a marca d'água
> seria uma consulta a mais sem ganho. Atribuição é equivalente.

### Antiabuso

- `createRateLimiter` (Trilha B) no avanço de seção — varredura sequencial rápida
  é limitada e fica registrada em `reading_events`.
- Sem bloqueio de menu/seleção (ver acima).

## UX / CX

- **Uma seção por vez**, com anterior/próxima, sumário lateral (desktop) e sheet
  (mobile), e barra de progresso ("4 de 18").
- **Retomada explícita:** ao voltar, abre onde parou com um aviso dispensável —
  *"Você parou em Instalando o Ollama"* + link "começar do início". Nunca
  teleportar sem avisar; é desorientador.
- **Dark-aware desde o nascimento** (tokens semânticos). A frente nasce depois da
  Trilha C, então não herda o débito.
- Mobile-first: rolagem curta por seção, alvos de toque grandes, sumário em sheet.
- Sem tela de "conteúdo protegido" ou aviso de vigilância — o registro é
  silencioso e declarado nos termos, não intimidatório na interface.

## Não-objetivos

- DRM, bloqueio de cópia, ofuscação de texto.
- Proteger podcast/vídeo (embeds Spotify/YouTube; impossível e quase todos ainda
  são "em breve").
- Construir o fluxo de reembolso — **spec própria, depois desta**.
- Quiz (vira frente de validação/certificado, ver `politica-reembolso.md`).
- Leitura offline / PWA.

## Testes

**Puros (vitest, node-env):**
- `reader.ts`: corte em seções (documento sem `##`; heading duplicado; seção
  vazia; slugs colidentes), navegação nos limites (primeira/última), resolução
  slug↔índice.
- Construtor da marca d'água.
- Decisão de acesso: `refunded`/`disputed` → nega; erro → nega (fail-closed).

**Integração (mock Supabase, padrão `buildSupabaseMock`):**
- Upsert de `reading_progress` (idempotente na mesma seção).
- `reading_events` append-only (revisita gera evento novo; nunca update).
- Ponte de resgate: uso único; token inválido/expirado recusa.

**Verificação ao vivo (gate real):**
- Leitor em mobile e desktop, dark e claro.
- Retomada entre sessões e entre dispositivos.
- Acesso negado após reembolso (simular `status='refunded'`).
- Teclado: navegação entre seções e sumário.

## Riscos

| Risco | Mitigação |
|---|---|
| Quebrar acesso de comprador atual | Ponte de resgate + `410` explicativo, não remoção seca |
| Leitura pior que o arquivo | Verificação ao vivo em mobile é gate; retomada e sumário compensam |
| Conteúdo copiável mesmo assim | Aceito e declarado. Objetivo é atrito + atribuição |
| Expectativa de "levar o arquivo" | Comunicar na `/oferta` como acesso à plataforma, não entrega de arquivo |
| Migration nova | `0027` já reservada para o fórum (Trilha D) → esta usa **`0028`** |

## Decomposição

Esta spec cobre **só o leitor**. Na sequência, specs próprias:

1. **Leitor protegido** ← esta.
2. **Fluxo de reembolso** — autoatendimento, estorno via API Stripe, revogação,
   bloqueio de recompra, tabela de auditoria, termos reescritos.
3. **Quiz de validação/certificado** por trilha.
