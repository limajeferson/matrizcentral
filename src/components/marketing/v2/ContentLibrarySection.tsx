"use client";

import { CONTENT_HUB, type ContentType, type ContentItem } from "@/data/content-hub";
import { Reveal } from "./motion-primitives";
import { FormatIcon } from "./icons";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

const ACTION_LABEL: Record<ContentType, string> = {
  relatorio: "Abrir relatório",
  podcast: "Ouvir podcast",
  video: "Assistir vídeo",
  pesquisa: "Responder pesquisa",
};

/** "em breve" = mesma regra existente: mídia sem embedUrl. Relatório/pesquisa = disponível. */
function isComingSoon(item: ContentItem): boolean {
  return item.embedUrl === null && item.type !== "relatorio" && item.type !== "pesquisa";
}

export default function ContentLibrarySection() {
  // Disponíveis primeiro, "em breve" depois (sem mutar o array fonte).
  const ordered = [...CONTENT_HUB].sort(
    (a, b) => Number(isComingSoon(a)) - Number(isComingSoon(b))
  );

  return (
    <section className="mc-section" id="central">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">A central</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-library-heading">
            Não é um livro digital.
            <br />
            É uma central colaborativa.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-library-sub">
            A Matriz Central reúne diferentes formatos de conteúdo em um único
            ambiente. Escolha como aprender, continue exatamente de onde parou e
            descubra novos materiais conforme evolui — tudo organizado em um só
            lugar.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mc-library-living">
            <span className="mc-library-living-title mc-mono">Atualizado constantemente</span>
            <p>
              Novos conteúdos entram na plataforma conforme novas pesquisas,
              modelos e ferramentas surgem. Você sempre terá novos materiais
              para continuar evoluindo.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <span className="mc-library-latest-title mc-mono">Últimos conteúdos adicionados</span>
        </Reveal>

        <div className="mc-library-grid">
          {ordered.map((item, index) => {
            const soon = isComingSoon(item);
            return (
              <Reveal key={item.id} delay={0.04 * (index % 4)}>
                <article className="mc-library-card">
                  <div className="mc-library-card-head">
                    <span className="mc-library-badge mc-mono">
                      <FormatIcon type={item.type} className="mc-library-badge-icon" />{" "}
                      {TYPE_LABEL[item.type]}
                    </span>
                    {soon ? (
                      <span className="mc-library-soon mc-mono">em breve</span>
                    ) : (
                      <span className="mc-library-new mc-mono">novo</span>
                    )}
                  </div>
                  <h3 className="mc-library-card-title">{item.title}</h3>
                  <p className="mc-library-card-desc">{item.description}</p>
                  <span className="mc-library-meta mc-mono">
                    {item.durationMinutes} min · +{item.xpReward} XP
                  </span>
                  {!soon && (
                    <a className="mc-library-action mc-mono" href="/oferta">
                      {ACTION_LABEL[item.type]} →
                    </a>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <div className="mc-library-cta">
            <a className="mc-btn mc-btn-accent" href="/oferta">
              Quero acesso à central
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
