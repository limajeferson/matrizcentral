import { CONTENT_HUB } from "@/data/content-hub";
import { buildContentFeed, formatActivity } from "@/lib/feed";
import { CONTENT_ICON } from "@/lib/content-icons";
import { getCommunityActivity } from "@/lib/feed-data";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import ContentGate from "@/components/auth/ContentGate";
import DiagnosticoInline from "@/components/quiz/DiagnosticoInline";
import { BADGES } from "@/data/badges";
import { IconBadge } from "@/components/ui/icons";

async function resolveToken(userId: string): Promise<string | undefined> {
  const supabase = getSupabaseServerClient();
  const { data: p } = await supabase.from("purchases").select("id").eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!p) return undefined;
  const { data: t } = await supabase.from("tokens").select("token").eq("purchase_id", p.id).maybeSingle();
  return t?.token ?? undefined;
}

function badgeLabel(id: string): string {
  return BADGES.find((b) => b.id === id)?.name ?? id;
}

export default async function FeedPage() {
  const user = await getSessionUser();

  let profileId: string | null = null;
  if (user) {
    const sb = getSupabaseServerClient();
    const { data: urow } = await sb.from("users").select("profile_id").eq("id", user.id).maybeSingle();
    profileId = (urow?.profile_id as string | null) ?? null;
  }

  const token = user ? await resolveToken(user.id) : undefined;
  const access = user ? (await getAccessContext(user.id)).access : "view";

  const cards = buildContentFeed(CONTENT_HUB, token);

  let activity: { text: string; at: string }[] = [];
  if (access === "advanced") {
    activity = formatActivity(await getCommunityActivity(20), badgeLabel);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Feed</h1>

      {user && !profileId && <DiagnosticoInline />}

      {/* Atividade da comunidade — só Advanced */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Comunidade</h2>
        {access === "advanced" ? (
          activity.length > 0 ? (
            <ul className="space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/60 px-4 py-2 text-sm text-zinc-700">
                  <IconBadge size={16} className="shrink-0 text-violet-600" />
                  {a.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">Ainda sem atividade por aqui.</p>
          )
        ) : (
          <ContentGate title="Feed da comunidade" nextPath="/feed" />
        )}
      </section>

      {/* Cards de conteúdo — prévia para todos */}
      <section className="space-y-3">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Descubra</h2>
        {cards.map((c) => {
          const Icon = CONTENT_ICON[c.type];
          return (
            <article key={c.id} className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="mb-1 flex items-center gap-1.5 text-sm text-zinc-500">
                <Icon size={16} className="shrink-0" />
                {c.type}{c.emBreve ? " · em breve" : ""}
              </div>
              <h3 className="font-semibold text-zinc-900">{c.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{c.description}</p>
              {!c.emBreve && (
                <a href={c.href} className="mt-2 inline-block text-sm font-medium text-violet-600">
                  Ler mais →
                </a>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
