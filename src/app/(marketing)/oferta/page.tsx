import Header from "@/components/marketing/Header";
import Footer from "@/components/marketing/Footer";
import OfferPricing from "@/components/marketing/OfferPricing";

export default function OfertaPage() {
  return (
    <>
      <Header />
      <section>
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag mono">
                <i>✦</i> Escolha seu plano
              </span>
              <h2>Quanto mais tempo, menor o custo por ebook</h2>
            </div>
            <div className="aside">
              Comece com 1 ebook avulso ou já entre direto no plano anual — o
              mesmo acesso completo à plataforma, pelo menor custo por
              conteúdo.
            </div>
          </div>

          <OfferPricing />
        </div>
      </section>
      <Footer />
    </>
  );
}
