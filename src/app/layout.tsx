import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/components/theme/theme-script";
import { SITE_URL } from "@/lib/seo";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
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
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Script anti-flash: aplica .dark antes da pintura (default "dark"). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
