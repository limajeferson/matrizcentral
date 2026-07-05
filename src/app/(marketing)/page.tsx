import { Archivo_Black, Inter } from "next/font/google";
import "./landing-v2.css";

import AmbientNetwork from "@/components/marketing/v2/AmbientNetwork";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FixedCta from "@/components/marketing/v2/FixedCta";
import HeroV2 from "@/components/marketing/v2/HeroV2";
import OpportunitySection from "@/components/marketing/v2/OpportunitySection";
import SystemSection from "@/components/marketing/v2/SystemSection";
import ProcessSteps from "@/components/marketing/v2/ProcessSteps";
import PricingV2 from "@/components/marketing/v2/PricingV2";
import FaqSection from "@/components/marketing/v2/FaqSection";
import ClosingSection from "@/components/marketing/v2/ClosingSection";
import FooterV2 from "@/components/marketing/v2/FooterV2";

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

export default function HomePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <AmbientNetwork />
      <noscript>
        <style>{`.mcv2 [style*="opacity"], .mcv2 [style*="opacity:0"] { opacity: 1 !important; transform: none !important; filter: none !important; height: auto !important; overflow: visible !important; }`}</style>
      </noscript>
      <LandingHeader />
      <FixedCta />
      <div className="mc-canvas">
        <HeroV2 />
        <OpportunitySection />
        <SystemSection />
        <ProcessSteps />
        <PricingV2 />
        <FaqSection />
        <ClosingSection />
      </div>
      <FooterV2 />
    </div>
  );
}
