import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import { pageMetadata } from "@/lib/seo";

// Display/corpo já vêm de Outfit/Inter (--font-display/--font-body) do layout raiz.

export const metadata = {
  title: "Termos de Uso",
  description: "Termos e condições de uso da plataforma Matriz Central.",
  ...pageMetadata({
    title: "Termos de Uso",
    description: "Termos e condições de uso da plataforma Matriz Central.",
    path: "/legal/termos",
  }),
};

export default function TermosPage() {
  return (
    <div className="mcv2">
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
            <strong>Dias 1 a 7 — arrependimento (direito legal).</strong> Você
            pode desistir da compra em até 7 dias corridos contados da liberação
            do acesso, <strong>sem precisar justificar</strong> e sem qualquer
            análise da nossa parte. A devolução é integral. Este é o direito
            previsto no art. 49 do Código de Defesa do Consumidor e não depende
            de nenhuma condição.
          </p>
          <p>
            <strong>
              Dias 8 a 30 — garantia comercial (cortesia da Matriz Central).
            </strong>{" "}
            Depois do 7º dia, mantemos a possibilidade de devolução por mais 23
            dias como cortesia. Nessa janela, avaliamos o uso feito do material:
            a garantia comercial pressupõe que você estudou o conteúdo e ainda
            assim ele não serviu. Se não houver registro de consumo, o pedido
            continua coberto pela regra dos dias 1 a 7, e não por esta.
          </p>
          <p>
            <strong>A partir do dia 31</strong>, a garantia se encerra.
          </p>
          <p>
            Em qualquer das janelas, o pedido é feito pelo e-mail de suporte,
            informando o e-mail usado na compra.
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
