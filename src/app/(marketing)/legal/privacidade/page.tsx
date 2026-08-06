import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import { pageMetadata } from "@/lib/seo";
import { SELLER } from "@/data/legal";
import SellerIdentityBlock from "@/components/legal/SellerIdentityBlock";

// Display/corpo já vêm de Outfit/Inter (--font-display/--font-body) do layout raiz.

export const metadata = {
  title: "Política de Privacidade",
  description: "Como a Matriz Central coleta, usa e protege seus dados.",
  ...pageMetadata({
    title: "Política de Privacidade",
    description: "Como a Matriz Central coleta, usa e protege seus dados.",
    path: "/legal/privacidade",
  }),
};

export default function PrivacidadePage() {
  return (
    <div className="mcv2">
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <article className="mc-container mc-legal">
          <h1 className="mc-display">Política de Privacidade</h1>
          <p className="mc-legal-updated mc-mono">Última atualização: agosto de 2026</p>

          <p>
            Esta Política descreve como a Matriz Central coleta, utiliza e
            protege as informações de quem usa a plataforma. Ao usar nossos
            serviços, você concorda com as práticas aqui descritas.
          </p>

          <h2>Quem é o controlador</h2>
          <p>
            A Matriz Central é o controlador dos dados tratados nesta
            plataforma, nos termos da LGPD (Lei 13.709/2018). O canal de
            contato para qualquer assunto sobre dados pessoais é{" "}
            <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>.
          </p>
          <SellerIdentityBlock variant="page" />

          <h2 id="bases">O que tratamos, para quê e com que base legal</h2>
          <p>
            Cada dado abaixo só é tratado para a finalidade indicada, com a
            base legal correspondente (LGPD, art. 7º):
          </p>
          <ul>
            <li>
              <strong>E-mail e dados da compra</strong> — finalidade: entregar
              o produto adquirido e liberar o acesso. Base legal:{" "}
              <strong>execução de contrato</strong> (art. 7º, V). Retenção:
              enquanto durar o acesso, mais o prazo legal de guarda de
              documentos fiscais e de defesa em juízo.
            </li>
            <li>
              <strong>E-mail da newsletter</strong> — finalidade: enviar
              novidades da plataforma. Base legal:{" "}
              <strong>consentimento</strong> (art. 7º, I). Retenção: até você
              revogar a inscrição.
            </li>
            <li>
              <strong>Mensagens de suporte</strong> — finalidade: responder o
              seu atendimento. Base legal: <strong>execução de contrato</strong>{" "}
              (art. 7º, V). Retenção: enquanto durar a relação com a
              plataforma.
            </li>
            <li>
              <strong>
                Identificador anônimo (<code>anon_id</code>) e eventos de funil
              </strong>{" "}
              — finalidade: medir conversão de forma agregada (visita, início
              de checkout, compra concluída, inscrição na newsletter, abertura
              de conteúdo). Base legal: <strong>legítimo interesse</strong>{" "}
              (art. 7º, IX). O <code>anon_id</code> é um identificador aleatório
              gravado em cookie, sem e-mail e sem URL com token de acesso
              associados.
            </li>
            <li>
              <strong>Progresso de leitura, XP e certificado</strong> —
              finalidade: operar a trilha de aprendizado e emitir o
              certificado de conclusão. Base legal:{" "}
              <strong>execução de contrato</strong> (art. 7º, V).
            </li>
            <li>
              <strong>Publicações no fórum e no feed da comunidade</strong> —
              finalidade: operar o espaço de troca entre alunos. O que você
              escreve num tópico, resposta ou publicação{" "}
              <strong>fica visível aos demais usuários da plataforma</strong>,
              junto do seu nome de exibição (ou de &quot;Aluno&quot;, se você
              não tiver definido um). Base legal:{" "}
              <strong>execução de contrato</strong> (art. 7º, V). Retenção:
              enquanto a publicação existir — você pode pedir a remoção pelo
              e-mail de contato.
            </li>
            <li>
              <strong>Nome de exibição no ranking</strong> — finalidade:
              publicar sua posição no ranking mensal de XP para os demais
              usuários. Base legal: <strong>consentimento</strong> (art. 7º, I),
              manifestado ao marcar a opção &quot;Aparecer no ranking
              público&quot; no painel. É <strong>revogável a qualquer
              momento</strong>: ao desmarcar a opção, o nome de exibição é
              apagado e você deixa de ser listado. Retenção: até a revogação.
            </li>
          </ul>

          <h2 id="operadores">Com quem compartilhamos</h2>
          <p>
            <strong>Nunca vendemos seus dados.</strong> Para operar a
            plataforma, alguns fornecedores tratam dados por nossa conta e sob
            nossa instrução, na condição de <strong>operadores</strong> (LGPD,
            art. 5º, VII) — nunca como donos desses dados:
          </p>
          <ul>
            <li>
              <strong>Stripe</strong> — processa o pagamento. Os dados do
              cartão vão direto para a Stripe; não passam pelo nosso servidor.
            </li>
            <li>
              <strong>Brevo</strong> — envia e-mail transacional (confirmação
              de compra, magic link de acesso, avisos de progresso). Recebe o
              endereço de e-mail do destinatário e o conteúdo da mensagem.
            </li>
            <li>
              <strong>Supabase</strong> — hospeda o banco de dados da
              plataforma.
            </li>
            <li>
              <strong>Vercel</strong> — hospeda a aplicação e mantém os
              registros técnicos de servidor da hospedagem.
            </li>
          </ul>
          <p>
            <strong>Com os demais usuários da plataforma.</strong> Além dos
            operadores acima, há um compartilhamento que acontece à vista do
            titular: o que você publica no <strong>fórum</strong> e no{" "}
            <strong>feed</strong> fica visível aos outros usuários, junto do seu
            nome de exibição (ou de &quot;Aluno&quot;, se não houver um
            definido); e, se você ativar a opção &quot;Aparecer no ranking
            público&quot;, seu <strong>nome de exibição</strong> passa a ser
            listado no ranking mensal de XP e no mural de conquistas. O ranking
            depende de consentimento e pode ser desativado a qualquer momento
            pelo painel; publicações já feitas podem ser removidas a pedido,
            pelo e-mail de contato.
          </p>

          <h2 id="internacional">Transferência internacional</h2>
          <p>
            Stripe, Brevo, Supabase e Vercel podem processar dados em
            servidores fora do Brasil. Essa transferência internacional se
            apoia nas hipóteses do art. 33 da LGPD, em especial no
            fornecimento de garantias contratuais e no consentimento/execução
            de contrato que justificam o próprio tratamento.
          </p>

          <h2 id="retencao">Por quanto tempo guardamos</h2>
          <p>
            Cada dado é guardado pelo prazo indicado na seção{" "}
            <a href="#bases">O que tratamos, para quê e com que base legal</a>.
            Em resumo:
          </p>
          <ul>
            <li>
              <strong>Cadastro, compra e acesso</strong> — enquanto a conta
              existir, mais o prazo legal de guarda de documentos fiscais e de
              defesa em juízo.
            </li>
            <li>
              <strong>E-mail da newsletter</strong> — até você revogar a
              inscrição.
            </li>
            <li>
              <strong>Mensagens de suporte</strong> — enquanto durar a relação
              com a plataforma.
            </li>
            <li>
              <strong>Progresso, XP, selos e certificados</strong> — enquanto a
              conta existir; o certificado já emitido continua verificável pelo
              código de verificação.
            </li>
            <li>
              <strong>Publicações no fórum e no feed</strong> — enquanto a
              publicação existir, ou até você pedir a remoção.
            </li>
            <li>
              <strong>Eventos de funil</strong> — mantidos de forma
              pseudonimizada, ligados apenas ao <code>anon_id</code>, sem
              vínculo com o seu e-mail.
            </li>
          </ul>
          <p>
            <strong>Não mantemos base própria de log de acesso.</strong> Os
            registros técnicos de servidor ficam com a Vercel, nossa
            hospedagem, sujeitos à política de retenção dela. Não operamos a
            plataforma como provedor de aplicação constituído em pessoa
            jurídica e, portanto, não guardamos registros de acesso na forma do
            art. 15 do Marco Civil da Internet.
          </p>

          <h2 id="direitos">Seus direitos</h2>
          <p>
            Nos termos do art. 18 da LGPD, você tem direito a:
          </p>
          <ul>
            <li>confirmação da existência de tratamento;</li>
            <li>acesso aos dados;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>
              anonimização, bloqueio ou eliminação de dado desnecessário ou
              excessivo;
            </li>
            <li>portabilidade dos dados a outro fornecedor;</li>
            <li>eliminação dos dados tratados com base no consentimento;</li>
            <li>informação sobre com quem compartilhamos seus dados;</li>
            <li>
              informação sobre a possibilidade de não fornecer consentimento e
              sobre as consequências dessa negativa;
            </li>
            <li>revogação do consentimento;</li>
            <li>revisão de decisões tomadas unicamente com base em tratamento
              automatizado.</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, entre em contato pelo
            e-mail <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>.
            Respondemos em até {SELLER.supportResponseDays} dias corridos.
          </p>

          <h2 id="cookies">Cookies</h2>
          <p>
            Utilizamos um cookie de sessão essencial para o funcionamento do
            site e a medição própria de funil descrita na seção{" "}
            <a href="#bases">O que tratamos, para quê e com que base legal</a>,
            que é pseudonimizada. Não usamos cookies de publicidade de
            terceiros.
          </p>

          <h2 id="lgpd">LGPD</h2>
          <p>
            Esta plataforma segue a Lei Geral de Proteção de Dados (Lei
            13.709/2018). Os dez direitos do titular estão detalhados na seção{" "}
            <a href="#direitos">Seus direitos</a>, os operadores que tratam
            dados por nossa conta estão na seção{" "}
            <a href="#operadores">Com quem compartilhamos</a>, e as bases
            legais de cada tratamento estão na seção{" "}
            <a href="#bases">O que tratamos, para quê e com que base legal</a>.
            As regras de uso da plataforma estão nos{" "}
            <a href="/legal/termos">Termos de Uso</a> e na{" "}
            <a href="/legal/uso-aceitavel">Política de Uso Aceitável</a>.
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
