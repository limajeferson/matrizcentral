import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { listTopics } from "@/lib/forum-data";
import { isSubscriber } from "@/lib/forum";
import { relativeTime } from "@/lib/relative-time";
import ContentGate from "@/components/auth/ContentGate";
import NovoTopicoForm from "@/components/forum/NovoTopicoForm";

export default async function ForumPage() {
  const user = await getSessionUser();
  const access = user ? (await getAccessContext(user.id)).access : "view";
  const sub = isSubscriber(access);
  const topics = await listTopics(50);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Fórum</h1>

      {sub ? <NovoTopicoForm /> : <ContentGate title="Fórum da comunidade" nextPath="/forum" />}

      <ul className="space-y-2">
        {topics.map((t) => {
          const replyCountLabel = t.replyCount === 1 ? "1 resposta" : `${t.replyCount} respostas`;
          return (
            <li key={t.id} className="rounded-xl border border-border bg-card p-4">
              {sub ? (
                <a href={`/forum/${t.id}`} className="font-semibold text-foreground hover:text-violet-600">{t.title}</a>
              ) : (
                <span className="font-semibold text-foreground">{t.title}</span>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                por {t.author} · {replyCountLabel} · {relativeTime(t.created_at, new Date())}
              </p>
            </li>
          );
        })}
        {topics.length === 0 && <p className="text-sm text-muted-foreground">Ainda não há tópicos. {sub ? "Crie o primeiro!" : ""}</p>}
      </ul>
    </div>
  );
}
