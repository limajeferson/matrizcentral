import Link from "next/link";
import { CONTENT_HUB } from "@/data/content-hub";
import { buildContentFeed, formatActivity, type ActivityItem } from "@/lib/feed";
import { getCommunityActivity } from "@/lib/feed-data";
import { getSessionUser } from "@/lib/auth-session";
import { getAccessContext } from "@/lib/entitlement-access";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLevelProgress } from "@/lib/levels";
import { listTopics } from "@/lib/forum-data";
import { BADGES } from "@/data/badges";
import DiagnosticoInline from "@/components/quiz/DiagnosticoInline";
import { UserMenu } from "@/components/app/UserMenu";
import { AppShell } from "@/components/app/AppShell";
import { ProfileCard, type ProfileCardPlan } from "@/components/app/ProfileCard";
import { LeftSidebar } from "@/components/app/feed/LeftSidebar";
import { CenterColumn } from "@/components/app/feed/CenterColumn";
import { RightSidebar } from "@/components/app/feed/RightSidebar";
import type { AccessLevel } from "@/lib/entitlements";

const PLAN_LABEL: Record<AccessLevel, ProfileCardPlan> = {
  view: "Start",
  regular: "Regular",
  advanced: "Advanced",
};

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
  let totalXp = 0;
  if (user) {
    const sb = getSupabaseServerClient();
    const { data: urow } = await sb
      .from("users")
      .select("profile_id, total_xp")
      .eq("id", user.id)
      .maybeSingle();
    profileId = (urow?.profile_id as string | null) ?? null;
    totalXp = (urow?.total_xp as number | null) ?? 0;
  }

  const token = user ? await resolveToken(user.id) : undefined;
  const access = user ? (await getAccessContext(user.id)).access : "view";

  const cards = buildContentFeed(CONTENT_HUB, token);
  const threads = await listTopics(10);

  let activity: ActivityItem[] = [];
  if (access === "advanced") {
    activity = formatActivity(await getCommunityActivity(20), badgeLabel);
  }

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
            {user && !profileId && <DiagnosticoInline />}
            <CenterColumn cards={cards} threads={threads} access={access} />
          </>
        }
        right={<RightSidebar access={access} activity={activity} />}
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
