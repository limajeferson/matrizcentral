import Link from "next/link";
import Markdown from "@/components/ui/Markdown";
import type { MdBlock } from "@/lib/markdown";
import { ReaderToc, type ReaderTocItem } from "@/components/reader/ReaderToc";
import Watermark from "@/components/reader/Watermark";
import { IconArrow } from "@/components/ui/icons";

export type ReaderShellProps = {
  docTitle: string;
  /** Usado só em `aria-label` (o título visível vem do heading dentro de `sectionBlocks`). */
  sectionTitle: string;
  /** Só os blocos da seção CORRENTE — nunca do documento inteiro. */
  sectionBlocks: MdBlock[];
  sectionIndex: number;
  totalSections: number;
  /** Lista para o sumário — só `{slug,title,index}`, nunca os blocos. */
  tocItems: ReaderTocItem[];
  currentSlug: string;
  /** Caminho base do leitor, ex.: `/biblioteca/guia-llm-local`. */
  basePath: string;
  prevSlug: string | null;
  nextSlug: string | null;
  reader: { email: string; userId: string };
};

/**
 * Shell do leitor: cabeçalho (título + progresso), sumário (desktop fixo /
 * mobile sheet), corpo com a seção corrente e navegação anterior/próxima via
 * `<Link>` real (funciona sem JS, fica no histórico do navegador).
 */
export function ReaderShell({
  docTitle,
  sectionTitle,
  sectionBlocks,
  sectionIndex,
  totalSections,
  tocItems,
  currentSlug,
  basePath,
  prevSlug,
  nextSlug,
  reader,
}: ReaderShellProps) {
  const progressPercent = totalSections > 0 ? ((sectionIndex + 1) / totalSections) * 100 : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
      {/*
        Sem <h1> aqui de propósito: `section.blocks` já inclui o próprio bloco
        do heading "##" da seção (ver `splitIntoSections` em `src/lib/reader.ts`,
        que empurra o heading como primeiro item de `blocks`), então o título
        visível da seção nasce do corpo renderizado pelo `<Markdown>` abaixo —
        duplicá-lo aqui repetiria o mesmo texto duas vezes na tela.
      */}
      <header className="mb-6">
        <p className="truncate text-sm font-semibold text-foreground">{docTitle}</p>

        <p className="mt-3 text-xs text-muted-foreground">
          Seção {sectionIndex + 1} de {totalSections}
        </p>
        <div
          role="progressbar"
          aria-valuenow={sectionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSections}
          aria-label={`Progresso: seção ${sectionIndex + 1} de ${totalSections}`}
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
        <ReaderToc items={tocItems} currentSlug={currentSlug} basePath={basePath} />

        <main aria-label={sectionTitle}>
          <article>
            <Markdown blocks={sectionBlocks} />
          </article>

          <Watermark email={reader.email} userId={reader.userId} />

          <nav
            aria-label="Navegação entre seções"
            className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-4"
          >
            {prevSlug ? (
              <Link
                href={`${basePath}?s=${prevSlug}`}
                className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                <IconArrow size={16} className="rotate-180" />
                Anterior
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground/50"
              >
                <IconArrow size={16} className="rotate-180" />
                Anterior
              </span>
            )}

            {nextSlug ? (
              <Link
                href={`${basePath}?s=${nextSlug}`}
                className="flex min-h-[44px] items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Próxima
                <IconArrow size={16} />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground/50"
              >
                Próxima
                <IconArrow size={16} />
              </span>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}

export default ReaderShell;
