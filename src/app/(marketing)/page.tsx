import { Archivo_Black, Inter } from "next/font/google";
import "./landing-v2.css";

import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FixedCta from "@/components/marketing/v2/FixedCta";
import HeroV2 from "@/components/marketing/v2/HeroV2";
import ProblemSection from "@/components/marketing/v2/ProblemSection";
import SystemSection from "@/components/marketing/v2/SystemSection";
import ProcessSteps from "@/components/marketing/v2/ProcessSteps";
import PricingV2 from "@/components/marketing/v2/PricingV2";
import FaqSection from "@/components/marketing/v2/FaqSection";
import FinalCta from "@/components/marketing/FinalCta";
import Footer from "@/components/marketing/Footer";

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
      <LandingHeader />
      <FixedCta />
      <HeroV2 />
      <ProblemSection />
      <SystemSection />
      <ProcessSteps />
      <PricingV2 />
      <FaqSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
