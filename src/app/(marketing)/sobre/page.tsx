import { Archivo_Black, Inter, Press_Start_2P } from "next/font/google";
import "../landing-v2.css";

import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import { Reveal } from "@/components/marketing/v2/motion-primitives";
import {
  IconChat, IconCompass, IconLock, IconBooks, IconTrophy, IconMonitor,
} from "@/components/marketing/v2/icons";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-mc-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mc-sans" });
const pressStart2P = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-mc-pixel" });

const VALORES = [
  { Icon: IconLock, title: "Autonomia", desc: "Você no controle da sua própria IA, do primeiro dia." },
  { Icon: IconBooks, title: "Conhecimento aplicado", desc: "Nada de teoria solta; tudo aponta para a prática." },
  { Icon: IconMonitor, title: "Privacidade", desc: "Seus dados no seu hardware, não na nuvem de terceiros." },
  { Icon: IconChat, title: "Transparência", desc: "Sem promessas infladas nem letra miúda." },
  { Icon: IconCompass, title: "Tecnologia acessível", desc: "Sem exigir que você seja programador." },
  { Icon: IconTrophy, title: "Evolução contínua", desc: "A plataforma cresce, e você cresce com ela." },
];

export const metadata = {
  title: "Sobre — Matriz Central",
  description:
    "Plataforma brasileira dedicada à autonomia em Inteligência Artificial. Nossa história, missão, visão e valores.",
};

export default function SobrePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} ${pressStart2P.variable} mcv2`}>
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <section className="mc-section">
          <div className="mc-container mc-about-hero">
            <Reveal>
              <span className="mc-tag">Institucional</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mc-display mc-about-title">Menos assinatura.<br />Mais autonomia.</h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mc-about-lead">
                A Matriz Central é uma plataforma brasileira dedicada ao
                desenvolvimento da autonomia em Inteligência Artificial,
                reunindo conteúdo, ferramentas e experiências de aprendizado
                para quem deseja utilizar IA com mais controle, privacidade e
                independência.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mc-section" id="historia">
          <div className="mc-container mc-about-block">
            <span className="mc-tag">Nossa História</span>
            <p className="mc-about-text">
              Desde 2025, a Matriz Central pesquisa, estrutura e ensina formas
              práticas de utilizar modelos de Inteligência Artificial
              localmente, reunindo conteúdo técnico, trilhas de aprendizado e
              ferramentas para quem deseja reduzir a dependência de serviços
              baseados em assinatura.
            </p>
          </div>
        </section>

        <section className="mc-section">
          <div className="mc-container mc-about-grid2">
            <div id="missao" className="mc-about-block">
              <span className="mc-tag">Missão</span>
              <p className="mc-about-text">
                Democratizar o acesso à IA local através de conteúdo
                organizado, objetivo e acessível para diferentes níveis de
                conhecimento.
              </p>
            </div>
            <div id="visao" className="mc-about-block">
              <span className="mc-tag">Visão</span>
              <p className="mc-about-text">
                Ser uma das principais referências em língua portuguesa para
                aprendizado, implantação e uso prático de Inteligência
                Artificial Local.
              </p>
            </div>
          </div>
        </section>

        <section className="mc-section" id="valores">
          <div className="mc-container">
            <Reveal>
              <span className="mc-tag">Valores</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mc-display mc-about-values-title">O que nos guia</h2>
            </Reveal>
            <div className="mc-strategy-grid">
              {VALORES.map((v, i) => (
                <Reveal key={v.title} delay={0.05 * i}>
                  <div className="mc-strategy-card">
                    <v.Icon className="mc-strategy-icon" />
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mc-section">
          <div className="mc-container mc-about-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">Começar por R$47</a>
          </div>
        </section>
      </div>
      <FooterV2 />
    </div>
  );
}
