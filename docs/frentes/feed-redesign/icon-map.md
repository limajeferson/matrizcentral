# Icon map — varredura de emojis (Frente D)

Tabela de todos os emojis removidos da UI e dos e-mails, e o que os substituiu.
Ícones vêm de `src/components/ui/icons/index.tsx` (SVG inline, `viewBox="0 0 24 24"`,
`stroke="currentColor"`, zero-dep). O mapa `ContentType → ícone` vive em
`src/lib/content-icons.ts` (`CONTENT_ICON`); o mapa de badges vive em
`BADGE_ICONS`/`BadgeIconId` (mesmo arquivo de ícones), consumido por
`src/data/badges.ts` (campo `icon: BadgeIconId`) e renderizado por `BadgeShelf`.

## UI

| emoji | onde estava | vira |
|---|---|---|
| 📄 | `src/lib/feed.ts` — mapa `EMOJI.relatorio` (campo `FeedCard.emoji`) | `CONTENT_ICON.relatorio` → `IconReport` |
| 🎧 | `src/lib/feed.ts` — mapa `EMOJI.podcast` | `CONTENT_ICON.podcast` → `IconPodcast` |
| 🎬 | `src/lib/feed.ts` — mapa `EMOJI.video` | `CONTENT_ICON.video` → `IconVideo` |
| 📊 | `src/lib/feed.ts` — mapa `EMOJI.pesquisa` | `CONTENT_ICON.pesquisa` → `IconSurvey` |
| 🏅 | `src/app/feed/page.tsx` — item de atividade da comunidade (`🏅 {a.text}`) | `IconBadge` (decorativo, ao lado do texto) |
| 🧭 | `src/data/badges.ts` — `BADGES.autoconhecimento.icon` | id `"compass"` → `IconCompass` (via `BADGE_ICONS`) |
| 📄 | `src/data/badges.ts` — `BADGES.primeiro_relatorio.icon` | id `"report"` → `IconReport` |
| 🎧 | `src/data/badges.ts` — `BADGES.ouvinte_dedicado.icon` | id `"headphones"` → `IconHeadphones` |
| ⭐ | `src/data/badges.ts` — `BADGES.iniciado.icon` | id `"star"` → `IconStar` |
| 🏁 | `src/data/badges.ts` — `BADGES.missao_cumprida.icon` | id `"flag"` → `IconFlag` |
| ✅ | `src/data/badges.ts` — `BADGES.validado.icon` | id `"check"` → `IconCheck` |
| 🔥 | `src/data/badges.ts` — `BADGES.especialista.icon` | id `"flame"` → `IconFlame` |
| 🔒 | `src/components/auth/ContentGate.tsx` — ícone decorativo do bloqueio | `IconLock` |
| ✔ | `src/components/content/CompleteContentButton.tsx` — estado "Concluído" | `IconCheck` + texto "Concluído" |
| 📥 | `src/app/dashboard/[token]/page.tsx` — botão "Baixar Ebook LLM Local" | removido; texto limpo + `IconArrow` no fim do botão |
| 🚀 | `src/app/dashboard/[token]/page.tsx` — botão "Explorar hub de conteúdo" | removido; texto limpo + `IconArrow` |
| 🏆 | `src/app/dashboard/[token]/page.tsx` — botão "Ver ranking" | removido; texto limpo + `IconArrow` |
| 📄 | `src/app/dashboard/[token]/conteudo/page.tsx` — `TYPE_LABEL.relatorio` | texto limpo "Relatório" + `CONTENT_ICON.relatorio` (via `TypeBadge`) |
| 🎙️ | `src/app/dashboard/[token]/conteudo/page.tsx` — `TYPE_LABEL.podcast` | texto limpo "Podcast" + `CONTENT_ICON.podcast` |
| 🎬 | `src/app/dashboard/[token]/conteudo/page.tsx` — `TYPE_LABEL.video` | texto limpo "Vídeo" + `CONTENT_ICON.video` |
| 📊 | `src/app/dashboard/[token]/conteudo/page.tsx` — `TYPE_LABEL.pesquisa` | texto limpo "Pesquisa" + `CONTENT_ICON.pesquisa` |
| ✔ | `src/app/dashboard/[token]/conteudo/page.tsx` — selo "✔ concluído" no card | `IconCheck` + texto "concluído" |
| 🎧 | `src/app/dashboard/[token]/conteudo/[id]/page.tsx` — "Em breve 🎧" | removido, só texto ("Em breve") |

## E-mails (`src/lib/email.ts`)

| emoji | onde estava | vira |
|---|---|---|
| 🚀 | `sendTokenEmail` — subject "Seu token chegou! Descubra seu perfil 🚀" | removido, só texto |
| 🎉 | `sendLevelUpEmail` — subject "Você subiu de nível! Agora você é {levelName} 🎉" | removido, só texto |
| 🏆 | `sendCertificateEmail` — subject "Seu certificado está pronto: {title} 🏆" | removido, só texto |
| 🔑 | `sendMagicLinkEmail` — subject "Seu link de acesso à Matriz Central 🔑" | removido, só texto |
| 🎉 | `sendPassPurchaseEmail` — subject "Seu passe {nome} está ativo 🎉" | removido, só texto |
| 📅 | `sendNewCycleEmail` — subject "Novo ciclo: escolha seu conteúdo do mês 📅" | removido, só texto |
| 🚀 | `sendNewContentEmail` — subject "Novo conteúdo disponível na Matriz Central 🚀" | removido, só texto |
| ⏳ | `sendExpiryEmail` — subject "Seu passe expira em {daysLeft} dia(s) ⏳" | removido, só texto |

E-mail é texto/HTML puro (sem SVG embutido de forma confiável entre clientes), então a
escolha ali foi sempre "remove o emoji, mantém o texto claro" — não faz sentido trocar
por ícone SVG num corpo de e-mail.

## Fora de escopo (não tocado nesta frente)

Emojis/glifos fora da lista de arquivos da Frente D (`src/lib/feed.ts`,
`src/data/badges.ts`, `src/components/auth/ContentGate.tsx`,
`src/components/content/CompleteContentButton.tsx`, `src/app/dashboard/**`,
`src/app/feed/page.tsx`, `src/lib/email.ts`) foram deixados como estão — por
exemplo `src/components/quiz/QuizValidacao.tsx`, `src/components/marketing/**`,
`src/components/dashboard/ChallengeWidget.tsx`, `src/components/dashboard/RoadmapCard.tsx`,
`src/components/dashboard/LeaderboardOptIn.tsx` e `src/app/certificado/[code]/page.tsx`.
Marketing/`/oferta` já usam um sistema de ícones próprio (`components/marketing/v2/icons`,
ver `src/lib/content-stats.ts`) fora do escopo desta frente (tema dark só na área logada).
Setas tipográficas (`→`) e checks (`✓`) usados como glifo decorativo dentro de frases
("Ler mais →", "Certificado válido ✓") não são emojis Unicode multicoloridos e não
entram nesta varredura — não estão na lista de arquivos da Frente D.
