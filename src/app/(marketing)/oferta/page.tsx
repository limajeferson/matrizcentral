import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import OfferPricing from "@/components/marketing/OfferPricing";
import Starfield from "@/components/marketing/v2/Starfield";
import { IconSpark } from "@/components/marketing/v2/icons";
import "../landing-v2.css";

export default function OfertaPage() {
  return (
    <div className="mc-oferta-wrapper">
      <Starfield />
      <Header ctaLabel="Voltar para o início" ctaHref="/" />
      <section className="mc-oferta-intro">
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag mono">
                <i><IconSpark className="sec-tag-icon" /></i> Escolha seu plano
              </span>
              <h2>Deixe de alugar inteligência — comece a ser dono dela</h2>
            </div>
            <div className="aside">
              Por R$47, uma vez, você recebe um diagnóstico e um plano de ação — e
              para de pagar mensalidade. Sua IA roda no seu computador, offline,
              com privacidade e sem depender de modelos restritos.
            </div>
          </div>

          <OfferPricing />
        </div>
      </section>
      <Footer />
    </div>
  );
}
