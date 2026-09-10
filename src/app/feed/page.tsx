import Link from "next/link";
import { CONTENT_HUB } from "@/data/content-hub";
import { buildContentFeed, formatActivity, type ActivityItem } from "@/lib/feed";
import { getCommunityActivity } from "@/lib/feed-data";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getMonthlyLeaderboard } from "@/lib/leaderboard-data";
import { getLevelProgress } from "@/lib/levels";
import { listTopics } from "@/lib/forum-data";
import { BADGES } from "@/data/badges";
import DiagnosticoInline from "@/components/quiz/DiagnosticoInline";
import { UserMenu } from "@/components/app/UserMenu";
import { AppShell } from "@/components/app/AppShell";
import { ProfileCard, type ProfileCardPlan } from "@/components/app/ProfileCard";
import { SeuCaminhoCard } from "@/components/app/SeuCaminhoCard";
import { toCapacityTier, type CapacityTier } from "@/lib/capacity";
import { LeftSidebar } from "@/components/app/feed/LeftSidebar";
import { CenterColumn } from "@/components/app/feed/CenterColumn";
import { resolveDashboardToken } from "@/lib/dashboard-token";
import { RightSidebar } from "@/components/app/feed/RightSidebar";
import { StoryBar } from "@/components/app/stories/StoryBar";
import { buildStories } from "@/lib/stories";
import { listPosts } from "@/lib/feed-posts";
import { buildFeedTimeline } from "@/lib/feed-timeline";
import type { AccessLevel } from "@/lib/entitlements";
import { NOINDEX_METADATA } from "@/lib/seo";
import { toContentType } from "@/lib/content-format";

// Explícito (como o /forum): sem isso, o Router Cache do client pode servir o
// RSC payload de uma visita anterior à mesma rota quando só o `?formato=`
// muda — o filtro fica "preso" na primeira variante visitada.
export const dynamic = "force-dynamic";

export const metadata = NOINDEX_METADATA;

const PLAN_LABEL: Record<AccessLevel, ProfileCardPlan> = {
  view: "Start",
  regular: "Regular",
  advanced: "Advanced",
};

function badgeLabel(id: string): string {
  return BADGES.find((b) => b.id === id)?.name ?? id;
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: { formato?: string };
}) {
  const user = await getSessionUser();
  const activeFormat = toContentType(searchParams.formato);

  let profileId: string | null = null;
  let totalXp = 0;
  let capacityTier: CapacityTier | null = null;
  if (user) {
    const sb = getSupabaseServerClient();
    const { data: urow } = await sb
      .from("users")
      .select("profile_id, total_xp, capacity_tier")
      .eq("id", user.id)
      .maybeSingle();
    profileId = (urow?.profile_id as string | null) ?? null;
    totalXp = (urow?.total_xp as number | null) ?? 0;
    // Nunca `as CapacityTier` cego: valor cru do banco passa pelo validador
    // — se vier fora dos 3 literais, degrada para null (card não renderiza)
    // em vez de derrubar a página inteira em CAPACITY_PATHS[tier].
    capacityTier = toCapacityTier(urow?.capacity_tier) ?? null;
  }

  const token = user ? (await resolveDashboardToken(getSupabaseServerClient(), user.id)) ?? undefined : undefined;
  const access = user ? (await getAccessContext(user.id)).access : "view";

  const allCards = buildContentFeed(CONTENT_HUB, token, capacityTier ?? undefined);
  const cards = activeFormat ? allCards.filter((c) => c.type === activeFormat) : allCards;
  const stories = buildStories(CONTENT_HUB, new Date(), token);
  const threads = await listTopics(50);

  // Timeline unificado (1ª página): posts do usuário + threads + conteúdo com
  // data. Posts são paginados (scroll infinito); threads/conteúdo vão inteiros.
  const posts = user ? await listPosts(15) : [];
  const cardById = new Map(cards.map((c) => [c.id, c]));
  const contentEntries = CONTENT_HUB.flatMap((item) => {
    const card = item.publishedAt ? cardById.get(item.id) : undefined;
    return card && item.publishedAt ? [{ card, at: item.publishedAt }] : [];
  });
  const timeline = buildFeedTimeline(posts, threads, contentEntries);
  const timelineCursor = posts.length === 15 ? posts[posts.length - 1].created_at : null;

  let activity: ActivityItem[] = [];
  if (access === "advanced") {
    activity = formatActivity(await getCommunityActivity(20), badgeLabel);
  }

  const ranking = user ? await getMonthlyLeaderboard(new Date()) : [];

  const level = getLevelProgress(totalXp);

  const userMenu = user ? (
    <UserMenu email={user.email} level={level.level} levelName={level.name} />
  ) : (
    <Link
      href="/entrar"
      className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
    >
      Entrar
    </Link>
  );

  return (
    <>
      <AppShell
        userMenu={userMenu}
        left={<LeftSidebar />}
        center={
          <>
            {user && !profileId && <DiagnosticoInline mode="completo" />}
            {user && profileId && !capacityTier && <DiagnosticoInline mode="capacidade" />}
            {user && capacityTier && <SeuCaminhoCard tier={capacityTier} />}
            {user && <StoryBar groups={stories} />}
            <CenterColumn
              cards={cards}
              activeFormat={activeFormat}
              timeline={timeline}
              timelineCursor={timelineCursor}
              access={access}
              canPost={!!user}
            />
          </>
        }
        right={<RightSidebar access={access} activity={activity} ranking={ranking} loggedIn={!!user} />}
      />
      {user && (
        <ProfileCard
          email={user.email}
          level={level.level}
          levelName={level.name}
          progressPercent={level.progressPercent}
          plan={PLAN_LABEL[access]}
        />
      )}
    </>
  );
}
