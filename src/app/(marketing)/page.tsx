import { Archivo_Black, Inter } from "next/font/google";
import "./landing-v2.css";

import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import AdvantagesSection from "@/components/marketing/AdvantagesSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
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
      <Header />
      <Hero />
      <AdvantagesSection />
      <FeaturesGrid />
      <PricingSection />
      <FinalCta />
      <Footer />
    </div>
  );
}
