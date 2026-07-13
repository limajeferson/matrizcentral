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
      <article className="rounded-xl border border-zinc-200 bg-white p-4">
        <h1 className="text-xl font-bold text-zinc-900">{topic.title}</h1>
        <p className="mt-1 text-xs text-zinc-500">por {topic.author}</p>
        <p className="mt-3 whitespace-pre-wrap text-zinc-700">{topic.body}</p>
      </article>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Respostas</h2>
        {topic.replies.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-200 bg-white/60 p-3">
            <p className="text-xs text-zinc-500">{r.author}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{r.body}</p>
          </div>
        ))}
        {topic.replies.length === 0 && <p className="text-sm text-zinc-500">Seja o primeiro a responder.</p>}
      </section>

      <ResponderForm topicId={topic.id} />
    </div>
  );
}
