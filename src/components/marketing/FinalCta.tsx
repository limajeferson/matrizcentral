import NetworkMotif from "@/components/marketing/NetworkMotif";

export default function FinalCta() {
  return (
    <div className="container">
      <div className="cta">
        <NetworkMotif className="cta-motif" />
        <h2>Comece Sua Trilha de Estudo</h2>
        <p>
          Descubra seu perfil, siga um roadmap sob medida e valide o que
          aprendeu com um certificado verificável.
        </p>
        <a className="btn btn-accent" href="/oferta">
          Quero por R$47
        </a>
      </div>
    </div>
  );
}
