import type { Metadata } from "next";
import { Archivo_Black, Inter, Press_Start_2P } from "next/font/google";
import "./landing-v2.css";
import { SITE_URL, pageOpenGraph } from "@/lib/seo";

import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import SessionNav from "@/components/auth/SessionNav";
import FixedCta from "@/components/marketing/v2/FixedCta";
import HeroV2 from "@/components/marketing/v2/HeroV2";
import OpportunitySection from "@/components/marketing/v2/OpportunitySection";
import SystemSection from "@/components/marketing/v2/SystemSection";
import ContentLibrarySection from "@/components/marketing/v2/ContentLibrarySection";
import ProcessSteps from "@/components/marketing/v2/ProcessSteps";
import MomentSection from "@/components/marketing/v2/MomentSection";
import StrategySection from "@/components/marketing/v2/StrategySection";
import PricingV2 from "@/components/marketing/v2/PricingV2";
import FaqSection from "@/components/marketing/v2/FaqSection";
import ClosingSection from "@/components/marketing/v2/ClosingSection";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import TrackView from "@/components/analytics/TrackView";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mc-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mc-sans",
});

// Fonte pixel/16-bit para o texto animado do hero (teste).
const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mc-pixel",
});

const HOME_TITLE = "IA local, do diagnóstico ao domínio";
const HOME_DESCRIPTION =
  "Descubra qual IA roda no seu hardware, monte sua trilha e acompanhe relatórios, podcasts e pesquisas da comunidade. Sem mensalidade, sem enviar seus dados para fora.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: pageOpenGraph({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: SITE_URL,
  }),
};

export default function HomePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} ${pressStart2P.variable} mcv2`}>
      <TrackView event="landing_view" />
      <PixelGridBackground />
      <noscript>
        <style>{`.mcv2 [style*="opacity"], .mcv2 [style*="opacity:0"] { opacity: 1 !important; transform: none !important; filter: none !important; height: auto !important; overflow: visible !important; }`}</style>
      </noscript>
      <LandingHeader accountSlot={<SessionNav />} />
      <FixedCta />
      <div className="mc-canvas">
        <HeroV2 />
        <OpportunitySection />
        <SystemSection />
        <ContentLibrarySection />
        <ProcessSteps />
        <MomentSection />
        <StrategySection />
        <PricingV2 />
        <FaqSection />
        <ClosingSection />
      </div>
      <FooterV2 />
    </div>
  );
}
