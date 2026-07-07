import { Archivo_Black, Inter } from "next/font/google";
import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-mc-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mc-sans" });

export const metadata = {
  title: "Política de Privacidade — Matriz Central",
  description: "Como a Matriz Central coleta, usa e protege seus dados.",
};

export default function PrivacidadePage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <article className="mc-container mc-legal">
          <h1 className="mc-display">Política de Privacidade</h1>
          <p className="mc-legal-updated mc-mono">Última atualização: julho de 2025</p>

          <p>
            Esta Política descreve como a Matriz Central coleta, utiliza e
            protege as informações de quem usa a plataforma. Ao usar nossos
            serviços, você concorda com as práticas aqui descritas.
          </p>

          <h2>Dados que coletamos</h2>
          <p>
            Coletamos o e-mail que você fornece ao adquirir um produto, entrar
            em uma lista de espera ou assinar nossa newsletter. Dados de
            pagamento são processados diretamente pela Stripe — não armazenamos
            números de cartão em nossos servidores.
          </p>

          <h2>Como usamos os dados</h2>
          <ul>
            <li>Entregar o produto adquirido e liberar seu acesso.</li>
            <li>Enviar comunicações sobre sua compra e novidades da plataforma.</li>
            <li>Melhorar o conteúdo e a experiência de aprendizado.</li>
          </ul>

          <h2 id="cookies">Cookies</h2>
          <p>
            Utilizamos cookies essenciais para o funcionamento do site e,
            eventualmente, cookies de análise para entender de forma agregada
            como a plataforma é usada. Você pode desativar cookies não
            essenciais nas configurações do seu navegador.
          </p>

          <h2 id="lgpd">LGPD</h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (Lei
            13.709/2018), você tem direito a acessar, corrigir e solicitar a
            exclusão dos seus dados pessoais. Para exercer esses direitos,
            entre em contato pelo e-mail de suporte da plataforma. Não vendemos
            nem compartilhamos seus dados com terceiros para fins de marketing.
          </p>

          <p className="mc-legal-note">
            Este documento pode ser atualizado periodicamente. Recomendamos
            revisá-lo de tempos em tempos.
          </p>
        </article>
      </div>
      <FooterV2 />
    </div>
  );
}
