import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { findDoc } from "@/data/reader-docs";
import { canRead, getProgress } from "@/lib/reader-data";
import { parseMarkdown } from "@/lib/markdown";
import { splitIntoSections, findSection } from "@/lib/reader";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { IconLock } from "@/components/ui/icons";

// Depende de sessão (cookie) — nunca pode ser cacheado/prerenderizado.
export const dynamic = "force-dynamic";

type DenyReason = "revoked" | "cycle-used" | "gated" | "no-purchase" | "error";

const DENY_COPY: Record<DenyReason, { title: string; message: string; cta: { href: string; label: string } }> = {
  revoked: {
    title: "Acesso revogado",
    message:
      "O acesso a este conteúdo foi revogado nesta conta. Se você acredita que isso é um engano, fale com o suporte.",
    cta: { href: "/suporte", label: "Falar com o suporte" },
  },
  "cycle-used": {
    title: "Você já usou seu conteúdo deste mês",
    message: "Volte no próximo ciclo, ou passe para o Advanced para consumir sem limite.",
    cta: { href: "/oferta", label: "Fazer upgrade para o Advanced" },
  },
  gated: {
    title: "Fora do seu plano atual",
    message: "Este conteúdo não está incluído no seu plano. Faça upgrade para liberar o acesso.",
    cta: { href: "/oferta", label: "Ver planos" },
  },
  "no-purchase": {
    title: "Você ainda não tem acesso",
    message: "Este conteúdo faz parte de um dos nossos planos pagos.",
    cta: { href: "/oferta", label: "Adquirir acesso" },
  },
  error: {
    title: "Não foi possível confirmar seu acesso",
    message: "Algo deu errado ao verificar seu acesso. Tente novamente em instantes ou fale com o suporte.",
    cta: { href: "/suporte", label: "Falar com o suporte" },
  },
};

function denyCopy(reason: string) {
  return DENY_COPY[reason as DenyReason] ?? DENY_COPY.error;
}

export default async function BibliotecaLeitorPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { s?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(`/biblioteca/${params.slug}`)}`);

  const doc = findDoc(params.slug);
  if (!doc) notFound();

  const decision = await canRead(user.id, doc);
  if (!decision.allowed) {
    const copy = denyCopy(decision.reason);
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <IconLock size={22} />
        </div>
        <h1 className="text-lg font-bold text-foreground">{copy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.message}</p>
        <Link
          href={copy.cta.href}
          className="mt-6 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          {copy.cta.label}
        </Link>
      </div>
    );
  }

  const source = await readFile(path.join(process.cwd(), doc.bodyPath), "utf-8");
  const sections = splitIntoSections(parseMarkdown(source));
  if (sections.length === 0) notFound();

  const section = findSection(sections, searchParams.s);
  if (!section) notFound();

  const progress = await getProgress(user.id, doc.contentId);
  const resumeSection =
    progress && !searchParams.s
      ? sections.find((s) => s.slug === progress.slug && s.index !== 0)
      : undefined;

  const basePath = `/biblioteca/${doc.slug}`;
  const prevSlug = sections[section.index - 1]?.slug ?? null;
  const nextSlug = sections[section.index + 1]?.slug ?? null;
  const tocItems = sections.map((s) => ({ slug: s.slug, title: s.title, index: s.index }));

  return (
    <>
      {resumeSection && (
        <div className="mx-auto mt-6 max-w-5xl px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm">
            <span className="text-foreground">
              Você parou em <strong>{resumeSection.title}</strong>.
            </span>
            <span className="flex gap-4">
              <Link href={`${basePath}?s=${resumeSection.slug}`} className="font-semibold text-violet-600">
                Continuar
              </Link>
              <Link href={`${basePath}?s=${sections[0].slug}`} className="text-muted-foreground">
                Começar do início
              </Link>
            </span>
          </div>
        </div>
      )}

      <ReaderShell
        contentId={doc.contentId}
        docTitle={doc.title}
        sectionTitle={section.title}
        sectionBlocks={section.blocks}
        sectionIndex={section.index}
        totalSections={sections.length}
        tocItems={tocItems}
        currentSlug={section.slug}
        basePath={basePath}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        reader={{ email: user.email, userId: user.id }}
      />
    </>
  );
}
