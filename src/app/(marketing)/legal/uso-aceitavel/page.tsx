import "../../landing-v2.css";
import PixelGridBackground from "@/components/marketing/v2/PixelGridBackground";
import LandingHeader from "@/components/marketing/v2/LandingHeader";
import FooterV2 from "@/components/marketing/v2/FooterV2";
import { pageMetadata } from "@/lib/seo";

// Display/corpo já vêm de Outfit/Inter (--font-display/--font-body) do layout raiz.

export const metadata = {
  title: "Política de Uso Aceitável",
  description: "O que não é permitido fazer com o material da Matriz Central e os compromissos que assumimos na comunicação.",
  ...pageMetadata({
    title: "Política de Uso Aceitável",
    description: "O que não é permitido fazer com o material da Matriz Central e os compromissos que assumimos na comunicação.",
    path: "/legal/uso-aceitavel",
  }),
};

export default function UsoAceitavelPage() {
  return (
    <div className="mcv2">
      <PixelGridBackground />
      <LandingHeader />
      <div className="mc-canvas">
        <article className="mc-container mc-legal">
          <h1 className="mc-display">Política de Uso Aceitável</h1>
          <p className="mc-legal-updated mc-mono">Última atualização: agosto de 2026</p>

          <p>
            Esta Política resume, em linguagem direta, o que não é permitido
            fazer com o material da Matriz Central e detalha os compromissos
            que assumimos na forma como comunicamos o produto. Ela complementa
            os <a href="/legal/termos">Termos de Uso</a> e não os substitui.
          </p>

          <h2 id="o-que-nao-pode">O que você não pode fazer com o material</h2>
          <p>
            Resumo das vedações já previstas na seção{" "}
            <a href="/legal/termos#uso-permitido">O que não é permitido</a>{" "}
            dos Termos de Uso. Ao acessar a plataforma, você concorda em não:
          </p>
          <ul>
            <li>compartilhar suas credenciais de acesso ou dar acesso a terceiro;</li>
            <li>
              redistribuir, revender, publicar ou hospedar o material, no todo
              ou em parte, em qualquer canal (grupo, rede social, site,
              marketplace);
            </li>
            <li>
              usar robô, scraper ou qualquer automação para baixar conteúdo em
              massa;
            </li>
            <li>
              fazer engenharia reversa, descompilar ou tentar contornar
              controles de acesso da plataforma — a licença que você recebe é
              de uso, não de propriedade (ver{" "}
              <a href="/legal/termos#licenca-software">Licença de uso</a>);
            </li>
            <li>remover avisos de autoria do material;</li>
            <li>usar a plataforma para qualquer atividade ilícita.</li>
          </ul>
          <p>
            O descumprimento destas vedações segue o mesmo tratamento previsto
            nos Termos: pode levar à suspensão do acesso, conforme os limites
            descritos na seção{" "}
            <a href="/legal/termos#responsabilidade">
              Limites da nossa responsabilidade
            </a>
            .
          </p>

          <h2 id="compromissos-comunicacao">
            Os compromissos que assumimos na comunicação
          </h2>
          <p>
            Esta parte não é sobre o que você pode fazer — é sobre o que{" "}
            <strong>nós</strong> nos comprometemos a não fazer ao anunciar e
            descrever o produto:
          </p>
          <ul>
            <li>
              Não prometemos resultado financeiro, ganho rápido nem
              enriquecimento. A Matriz Central é conteúdo educacional sobre IA
              local — não é promessa de renda.
            </li>
            <li>
              Não prometemos desempenho de hardware que não tenha sido
              medido. Números de performance divulgados refletem testes
              reais, não estimativas apresentadas como garantia.
            </li>
            <li>
              Todo número de benchmark vindo de terceiro é{" "}
              <strong>atribuído à fonte</strong> — não apresentamos medição de
              outra empresa como se fosse nossa.
            </li>
            <li>
              Recurso ainda não publicado é marcado{" "}
              <strong>&quot;em breve&quot;</strong>, nunca anunciado como já
              disponível.
            </li>
            <li>
              Não alegamos parceria, patrocínio ou endosso de empresa alguma
              sem contrato que respalde essa afirmação.
            </li>
          </ul>

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
