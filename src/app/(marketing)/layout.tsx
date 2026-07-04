import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./landing-clone.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-marketing-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-marketing-mono",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={`${hankenGrotesk.variable} ${jetBrainsMono.variable} lp-guide`}>
      {children}
    </main>
  );
}
