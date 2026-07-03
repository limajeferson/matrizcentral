import Header from "@/components/marketing/Header";
import Hero from "@/components/marketing/Hero";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <FeaturesGrid />
      <PricingSection />
      <Footer />
    </>
  );
}
