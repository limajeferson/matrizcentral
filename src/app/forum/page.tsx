import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { listTopics } from "@/lib/forum-data";
import { isSubscriber } from "@/lib/forum";
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
        {topics.map((t) => (
          <li key={t.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            {sub ? (
              <a href={`/forum/${t.id}`} className="font-semibold text-zinc-900 hover:text-violet-600">{t.title}</a>
            ) : (
              <span className="font-semibold text-zinc-900">{t.title}</span>
            )}
            <p className="mt-1 text-xs text-zinc-500">por {t.author} · {t.replyCount} resposta(s)</p>
          </li>
        ))}
        {topics.length === 0 && <p className="text-sm text-zinc-500">Ainda não há tópicos. {sub ? "Crie o primeiro!" : ""}</p>}
      </ul>
    </div>
  );
}
