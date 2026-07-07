import { Archivo_Black, Inter } from "next/font/google";
import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";

const archivoBlack = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-mc-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mc-sans" });

export const metadata = {
  title: "Termos de Uso — Matriz Central",
  description: "Termos e condições de uso da plataforma Matriz Central.",
};

export default function TermosPage() {
  return (
    <div className={`${archivoBlack.variable} ${inter.variable} mcv2`}>
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <article className="mc-container mc-legal">
          <h1 className="mc-display">Termos de Uso</h1>
          <p className="mc-legal-updated mc-mono">Última atualização: julho de 2025</p>

          <p>
            Estes Termos regem o uso da plataforma Matriz Central. Ao adquirir
            ou acessar nossos conteúdos, você concorda com as condições abaixo.
          </p>

          <h2>Descrição do serviço</h2>
          <p>
            A Matriz Central oferece conteúdo educacional, ferramentas e
            trilhas de aprendizado voltadas ao uso de Inteligência Artificial
            executada localmente. Alguns recursos podem estar em
            desenvolvimento e são sinalizados como &quot;em breve&quot;.
          </p>

          <h2 id="garantia">Garantia</h2>
          <p>
            O produto de entrada (R$47) inclui garantia de 7 dias. Se, dentro
            desse prazo, você concluir que o conteúdo não atende às suas
            expectativas, devolvemos o valor pago.
          </p>

          <h2 id="reembolso">Política de Reembolso</h2>
          <p>
            Para solicitar reembolso dentro do período de garantia, entre em
            contato pelo e-mail de suporte informando o e-mail usado na compra.
            O estorno é processado pela Stripe e pode levar alguns dias úteis
            para aparecer na fatura, conforme o emissor do cartão.
          </p>

          <h2 id="licenciamento">Licenciamento</h2>
          <p>
            O acesso ao conteúdo é pessoal e intransferível. Você pode utilizar
            o material para seu próprio aprendizado, mas não pode redistribuir,
            revender ou publicar os conteúdos, no todo ou em parte, sem
            autorização por escrito.
          </p>

          <h2 id="direitos">Direitos Autorais</h2>
          <p>
            Todo o conteúdo da Matriz Central — textos, materiais, marca e
            identidade visual — é protegido por direitos autorais e pertence à
            Matriz Central, salvo indicação em contrário.
          </p>

          <p className="mc-legal-note">
            Este documento pode ser atualizado periodicamente. O uso continuado
            da plataforma após alterações implica concordância com os novos
            termos.
          </p>
        </article>
      </div>
      <FooterV2 />
    </div>
  );
}
