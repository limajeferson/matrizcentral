import { IconBadge } from "@/components/ui/icons";
import ContentGate from "@/components/auth/ContentGate";
import type { ActivityItem } from "@/lib/feed";
import type { AccessLevel } from "@/lib/entitlements";

export type RightSidebarProps = {
  access: AccessLevel;
  /** `formatActivity(getCommunityActivity(20))`, já resolvido pelo server component. */
  activity: ActivityItem[];
};

/** "Comunidade": atividade recente (selos conquistados), gated a Advanced. */
export function RightSidebar({ access, activity }: RightSidebarProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comunidade</h2>
        {access === "advanced" ? (
          activity.length > 0 ? (
            <ul className="space-y-3">
              {activity.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <IconBadge size={16} className="mt-0.5 shrink-0 text-violet-600" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Ainda sem atividade por aqui.</p>
          )
        ) : (
          <ContentGate title="Atividade da comunidade" nextPath="/feed" />
        )}
      </section>
    </div>
  );
}

export default RightSidebar;
