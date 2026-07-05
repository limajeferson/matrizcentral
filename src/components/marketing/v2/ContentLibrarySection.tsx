"use client";

import { CONTENT_HUB, type ContentType } from "@/data/content-hub";
import { formatCounts } from "@/lib/content-stats";
import { Reveal } from "./motion-primitives";

const TYPE_LABEL: Record<ContentType, string> = {
  relatorio: "Relatório",
  podcast: "Podcast",
  video: "Vídeo",
  pesquisa: "Pesquisa",
};

const TYPE_ICON: Record<ContentType, string> = {
  relatorio: "📄",
  podcast: "🎙️",
  video: "🎬",
  pesquisa: "📊",
};

export default function ContentLibrarySection() {
  const stats = formatCounts();

  return (
    <section className="mc-section" id="central">
      <div className="mc-container">
        <Reveal>
          <span className="mc-tag">A central</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mc-display mc-library-heading">
            Não é um ebook.
            <br />
            É uma central.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mc-library-sub">
            Leia, ouça, assista — no formato que combina com você. Uma
            biblioteca de IA local sempre em expansão, com novos conteúdos
            com frequência.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mc-library-formats mc-mono">
            {stats.map((f) => (
              <span className="mc-library-format" key={f.type}>
                <span className="mc-library-format-icon" aria-hidden="true">{f.icon}</span>
                <b>{f.count}</b> · {f.label}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mc-library-grid">
          {CONTENT_HUB.map((item, index) => {
            const comingSoon =
              item.embedUrl === null &&
              item.type !== "relatorio" &&
              item.type !== "pesquisa";

            return (
              <Reveal key={item.id} delay={0.04 * (index % 4)}>
                <article className="mc-library-card">
                  <div className="mc-library-card-head">
                    <span className="mc-library-badge mc-mono">
                      <span aria-hidden="true">{TYPE_ICON[item.type]}</span> {TYPE_LABEL[item.type]}
                    </span>
                    {comingSoon && <span className="mc-library-soon mc-mono">em breve</span>}
                  </div>
                  <h3 className="mc-library-card-title">{item.title}</h3>
                  <p className="mc-library-card-desc">{item.description}</p>
                  <span className="mc-library-meta mc-mono">
                    {item.durationMinutes} min · +{item.xpReward} XP
                  </span>
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
