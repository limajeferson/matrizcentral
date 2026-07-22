import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { getTopicWithReplies } from "@/lib/forum-data";
import { isSubscriber } from "@/lib/forum";
import ContentGate from "@/components/auth/ContentGate";
import ResponderForm from "@/components/forum/ResponderForm";

export default async function TopicPage({ params }: { params: { id: string } }) {
  const topic = await getTopicWithReplies(params.id);
  if (!topic) notFound();

  const user = await getSessionUser();
  const access = user ? (await getAccessContext(user.id)).access : "view";

  if (!isSubscriber(access)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-xl font-bold">{topic.title}</h1>
        <ContentGate title="Leia e participe do fórum" nextPath={`/forum/${topic.id}`} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <article className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">por {topic.author}</p>
        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{topic.body}</p>
      </article>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Respostas</h2>
        {topic.replies.map((r) => (
          <div key={r.id} className="rounded-lg border border-border bg-card/60 p-3">
            <p className="text-xs text-muted-foreground">{r.author}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{r.body}</p>
          </div>
        ))}
        {topic.replies.length === 0 && <p className="text-sm text-muted-foreground">Seja o primeiro a responder.</p>}
      </section>

      <ResponderForm topicId={topic.id} />
    </div>
  );
}
