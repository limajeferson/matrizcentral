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
| 🔒 | `src/components/dashboard/RoadmapCard.tsx` — etapa bloqueada ("🔒 {label}") | `IconLock` (via `src/components/ui/icons`) |
| ✓ | `src/components/dashboard/RoadmapCard.tsx` — etapa concluída ("✓ {label}") | `IconCheck` |
| ✔ | `src/components/dashboard/ChallengeWidget.tsx` — "✔ Resgatado" | `IconCheck` + texto |
| ✔ | `src/components/dashboard/LeaderboardOptIn.tsx` — "✔ Preferência salva." | `IconCheck` + texto |
| 👋 | `src/components/quiz/DiagnosticoInline.tsx` — "Boas-vindas 👋" | removido, só texto |
| 🎉 | `src/components/quiz/QuizValidacao.tsx` — "Parabéns! 🎉" (tela de resultado) | removido, só texto (Trophy do lucide-react já ilustra o resultado acima) |
| ✅ | `src/components/quiz/QuizValidacao.tsx` — "Badge: Validador ✅" | ícone `CheckCircle` (lucide-react, já importado no arquivo) + texto |
| 🎓 | `src/components/quiz/QuizValidacao.tsx` — "Certificado 🎓" | ícone `GraduationCap` (lucide-react) + texto |
| 💡 | `src/components/quiz/QuizValidacao.tsx` — dica na revisão de erros | ícone `Lightbulb` (lucide-react, já usado no hint do quiz) |
| ✅/❌ | `src/components/quiz/QuizValidacao.tsx` — contador "corretas/erros" em tempo real | ícones `CheckCircle`/`XCircle` (lucide-react) |
| ✅/❌ | `src/components/quiz/QuizValidacao.tsx` — feedback "Correto!/Incorreto" após responder | ícones `CheckCircle`/`XCircle` (lucide-react) |
| 🏆 | `src/components/quiz/QuizValidacao.tsx` — botão "Ver Resultado Final 🏆" | ícone `Trophy` (lucide-react) ao lado do texto |
| ✕ / ☰ | `src/components/marketing/Header.tsx` — botão de menu mobile (abrir/fechar) | `IconMenu` / `IconClose` (novos, em `src/components/marketing/v2/icons.tsx`) |
| ✓ | `src/components/marketing/DemoWidget.tsx` — selo "✓ 120+ páginas..." (aba Ebook) | `IconCheck` (novo, em `marketing/v2/icons.tsx`) |
| ✓ | `src/components/marketing/v2/PricingV2.tsx` — 4 badges de preço (pagamento único, acesso imediato...) | `IconCheck` |
| ✓ | `src/components/marketing/v2/FooterNewsletter.tsx` — "✓ Pronto! Você vai receber..." | `IconCheck` |
| ✦ | `src/components/marketing/v2/HeroV2.tsx` — tag "✦ Para quem cansou de assinaturas..." | `IconSpark` (novo, sparkle 4 pontas) |
| ✦ | `src/app/(marketing)/oferta/page.tsx` — tag "✦ Escolha seu plano" | `IconSpark` |
| ✓ | `src/app/checkout/sucesso/AccessReveal.tsx` — "✓ Se este e-mail tiver uma compra..." | `IconCheck` (via `src/components/ui/icons`) |
| ✓ | `src/app/certificado/[code]/page.tsx` — "Certificado válido ✓" | `IconCheck` (via `src/components/ui/icons`) |

Ícones novos adicionados em `src/components/marketing/v2/icons.tsx` nesta varredura:
`IconCheck`, `IconSpark`, `IconMenu`, `IconClose` (mesmo estilo dos ícones já existentes no
arquivo — `viewBox="0 0 24 24"`, `stroke`/`fill` em `currentColor`, `aria-hidden="true"`).
Em `QuizValidacao.tsx` os emojis viraram ícones `lucide-react` (`GraduationCap` novo import;
`CheckCircle`, `XCircle`, `Lightbulb`, `Trophy` já eram usados no arquivo) — dependência já
existente no projeto, mantendo consistência com o restante do componente em vez de misturar
com o SVG set de `ui/icons`.

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

## Fora de escopo (intencional)

Após a segunda varredura (`src/components/**` + `src/app/**` completos), o único glifo que
permanece de propósito é a seta tipográfica `→` usada como sufixo decorativo de CTA/link
("Ler mais →", "Abrir relatório →", "Ver Meu Certificado →", "Entrar na minha conta →",
comparação "Hoje → Com Matriz Central"). Ocorre em `src/app/feed/page.tsx`,
`src/components/marketing/v2/ContentLibrarySection.tsx`,
`src/components/marketing/v2/OpportunitySection.tsx`, `src/components/quiz/QuizValidacao.tsx`
e `src/app/checkout/sucesso/AccessReveal.tsx`. `→` (U+2192) é um símbolo tipográfico
monocromático, não um emoji Unicode multicolorido, e é o mesmo padrão visual em todo o site —
mantido por consistência de design, não por lacuna de varredura.
