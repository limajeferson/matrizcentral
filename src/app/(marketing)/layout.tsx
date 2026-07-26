import { JetBrains_Mono } from "next/font/google";
import "./landing-clone.css";

// Hanken_Grotesk removida: o corpo/interface já usa Inter (--font-body),
// declarada uma vez no layout raiz (src/app/layout.tsx) e herdada aqui.
// JetBrains_Mono preservada de propósito — usada em toda a .mc-mono (rótulos
// em caixa alta, números de preço/estatística tabulares no design mcv2), não
// é decorativa substituível.
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-marketing-mono",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={`${jetBrainsMono.variable} lp-guide`}>
      {children}
    </main>
  );
}
