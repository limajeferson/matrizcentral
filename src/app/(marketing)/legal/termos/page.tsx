import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import { pageMetadata } from "@/lib/seo";
import { SELLER } from "@/data/legal";

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
          <p className="mc-legal-updated mc-mono">Última atualização: agosto de 2026</p>

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

          <h2 id="licenca-software">Licença de uso</h2>
          <p>
            A Matriz Central concede a você uma licença de uso{" "}
            <strong>
              não exclusiva, pessoal, intransferível e revogável
            </strong>{" "}
            de acesso à plataforma (software) e ao conteúdo nela
            disponibilizado, para uso próprio e não comercial. Esta é uma{" "}
            <strong>licença de uso, não uma venda</strong>: você não adquire
            titularidade sobre o software nem sobre o conteúdo, apenas o
            direito de acessá-los nas condições descritas aqui.
          </p>
          <p>
            <strong>Ebook.</strong> A licença do ebook vigora por{" "}
            <strong>prazo indeterminado</strong>: ele fica acessível pelo{" "}
            <strong>leitor da própria plataforma</strong>, bastando entrar com o{" "}
            <strong>e-mail usado na compra</strong>. A leitura não depende de
            download nem de arquivo salvo no seu computador — acontece dentro da
            plataforma, e por isso não há prazo para consumir o material.
          </p>
          <p>
            <strong>Passes Regular e Advanced.</strong> A licença dos conteúdos
            do passe acompanha o período de <strong>12 meses</strong>{" "}
            contratado. Encerrado esse período, o acesso aos conteúdos do passe
            se encerra; o ebook, quando incluído no passe, permanece acessível
            pela regra do parágrafo anterior.
          </p>

          <h2 id="uso-permitido">O que não é permitido</h2>
          <p>Ao usar a plataforma, você concorda em não:</p>
          <ul>
            <li>compartilhar suas credenciais de acesso ou dar acesso a terceiro;</li>
            <li>
              redistribuir, revender, publicar ou hospedar o material, no
              todo ou em parte;
            </li>
            <li>
              usar robô, scraper ou qualquer automação para baixar conteúdo em
              massa;
            </li>
            <li>
              fazer engenharia reversa, descompilar ou tentar contornar
              controles de acesso da plataforma;
            </li>
            <li>remover avisos de autoria do material;</li>
            <li>usar a plataforma para qualquer atividade ilícita.</li>
          </ul>
          <p>
            O descumprimento destas vedações pode levar à{" "}
            <strong>suspensão ou encerramento do acesso</strong> (ver seção{" "}
            <a href="#suspensao">Suspensão e encerramento</a>) e à
            responsabilização pelas perdas causadas.
          </p>

          <h2 id="conta">Sua conta</h2>
          <p>
            O acesso à plataforma é individual. O login é feito por{" "}
            <strong>link mágico</strong> enviado ao e-mail cadastrado na
            compra — não há senha para memorizar ou vazar. O titular da conta
            responde pelo que acontece nela e deve nos avisar, pelo e-mail{" "}
            <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>, em caso de
            uso não autorizado ou suspeita de acesso indevido.
          </p>

          <h2 id="disponibilidade">Disponibilidade e manutenção</h2>
          <p>
            Nos empenhamos para manter a plataforma no ar, mas o acesso pode
            ser interrompido para manutenção programada ou por causa alheia à
            nossa vontade — como falha de fornecedor de infraestrutura ou
            eventos de força maior. Não garantimos um percentual específico de
            disponibilidade (uptime).
          </p>
          <p>
            Se, num passe de 12 meses, a indisponibilidade for prolongada e
            decorrer de causa que nos seja imputável, o prazo do passe é
            estendido pelo período correspondente à indisponibilidade.
          </p>

          <h2 id="suspensao">Suspensão e encerramento</h2>
          <p>
            Podemos suspender o seu acesso em caso de violação das vedações
            descritas na seção{" "}
            <a href="#uso-permitido">O que não é permitido</a>, mediante
            aviso e oportunidade de correção sempre que a gravidade da
            violação permitir. Você pode encerrar o uso da plataforma quando
            quiser; o encerramento não afeta a garantia vigente na data do
            pedido (ver seção <a href="#garantia">Garantia</a>).
          </p>

          <h2 id="responsabilidade">Limites da nossa responsabilidade</h2>
          <p>
            O conteúdo da Matriz Central é <strong>educacional</strong> e não
            garante um resultado específico. A execução de ferramentas de IA
            local depende do hardware e do software do seu computador, fora do
            nosso controle. Por isso, não respondemos por decisões tomadas com
            base no material, nem por eventual dano ao seu equipamento
            decorrente de configuração feita por você.
          </p>
          <p>
            Nada nesta seção afasta ou reduz os direitos garantidos pelo
            Código de Defesa do Consumidor, em especial os relativos a vício
            do produto e à garantia tratada na seção{" "}
            <a href="#garantia">Garantia</a>.
          </p>

          <h2 id="foro">Lei aplicável e foro</h2>
          <p>
            Estes Termos são regidos pela lei brasileira. Fica assegurado o
            foro do domicílio do consumidor para dirimir qualquer controvérsia
            decorrente destes Termos, na forma do art. 101, I, do Código de
            Defesa do Consumidor.
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
            As condições da licença de uso do software e do conteúdo estão na
            seção <a href="#licenca-software">Licença de uso</a>, e o que não
            é permitido fazer com o acesso está na seção{" "}
            <a href="#uso-permitido">O que não é permitido</a>. Um resumo em
            linguagem direta dessas vedações, junto dos compromissos que
            assumimos na forma de comunicar o produto, está na{" "}
            <a href="/legal/uso-aceitavel">Política de Uso Aceitável</a>.
          </p>

          <h2 id="direitos">Direitos Autorais</h2>
          <p>
            Todo o conteúdo da Matriz Central — textos, materiais, marca e
            identidade visual — é protegido por direitos autorais e pertence à
            Matriz Central, salvo indicação em contrário.
          </p>

          <p className="mc-legal-note">
            Este documento pode ser atualizado periodicamente. Alterações
            relevantes são <strong>comunicadas por e-mail</strong> a quem tem
            acesso ativo, antes de passarem a valer, e{" "}
            <strong>não retroagem sobre contratações já feitas</strong>: para a
            sua compra continua valendo a versão vigente na data em que ela foi
            realizada.
          </p>
        </article>
      </div>
      <FooterV2 />
    </div>
  );
}
