import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/components/theme/theme-script";
import { SITE_URL } from "@/lib/seo";

// Identidade tipográfica aprovada (docs/frentes/lancamento-final/insumos/
// 2026-07-22-conceito-tipografico.md): Outfit para display/título, Inter
// para corpo/interface. Declaradas uma vez aqui e disponíveis em todo o app
// via CSS custom properties no <body> — nenhuma página precisa redeclarar.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const SITE_DESCRIPTION =
  "Plataforma de aprendizado sobre IA local: relatórios, podcasts, vídeos e pesquisas para rodar modelos no seu próprio hardware, com privacidade e sem mensalidade.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Matriz Central — IA local, do diagnóstico ao domínio",
    template: "%s · Matriz Central",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Matriz Central",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Matriz Central",
    url: SITE_URL,
    title: "Matriz Central — IA local, do diagnóstico ao domínio",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Matriz Central — IA local, do diagnóstico ao domínio",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${inter.variable}`}>
      {/* Variáveis de fonte no <html>, não no <body>: `html { @apply font-sans }`
          (globals.css) referencia var(--font-body) e custom properties só
          herdam para baixo — se a classe ficasse só no <body>, o <html> não
          enxergaria a variável, a declaração ficaria inválida e o texto caía
          para o serif padrão do navegador (bug real, pego na verificação). */}
      <body className="antialiased">
        {/* Script anti-flash: aplica .dark antes da pintura (default "dark"). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
        {/* Web Analytics da Vercel servido pela propria plataforma — sem dependencia
            npm (custo zero). So carrega em producao; exige "Web Analytics" ligado no
            painel do projeto na Vercel, senao o script simplesmente nao existe. */}
        {process.env.NODE_ENV === "production" && (
          <script defer src="/_vercel/insights/script.js" />
        )}
      </body>
    </html>
  );
}
