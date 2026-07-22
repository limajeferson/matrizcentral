import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { getTopicWithReplies } from "@/lib/forum-data";
import { isSubscriber } from "@/lib/forum";
import { buildReplyTree } from "@/lib/forum-tree";
import { relativeTime } from "@/lib/relative-time";
import ContentGate from "@/components/auth/ContentGate";
import ResponderForm from "@/components/forum/ResponderForm";
import ReplyThread from "@/components/forum/ReplyThread";

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

  const replyCount = topic.replies.length;
  const replyCountLabel = replyCount === 1 ? "1 resposta" : `${replyCount} respostas`;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <article className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-bold text-foreground">{topic.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          por {topic.author} · {relativeTime(topic.created_at, new Date())}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-foreground">{topic.body}</p>
      </article>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{replyCountLabel}</h2>
        <ReplyThread nodes={buildReplyTree(topic.replies)} topicId={topic.id} />
      </section>

      <ResponderForm topicId={topic.id} />
    </div>
  );
}
