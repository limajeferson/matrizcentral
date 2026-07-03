import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import AdvantagesSection from "@/components/marketing/AdvantagesSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
import FinalCta from "@/components/marketing/FinalCta";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <AdvantagesSection />
      <FeaturesGrid />
      <PricingSection />
      <FinalCta />
      <Footer />
    </>
  );
}
