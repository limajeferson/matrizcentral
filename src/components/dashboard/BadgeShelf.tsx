import { BADGES } from "@/data/badges";
import GlassCard from "@/components/ui/glass-card";
import { BADGE_ICONS } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface BadgeShelfProps {
  earnedBadgeIds: string[];
}

export default function BadgeShelf({ earnedBadgeIds }: BadgeShelfProps) {
  const earnedSet = new Set(earnedBadgeIds);

  return (
    <GlassCard className="p-6">
      <h2 className="mb-3 font-bold text-foreground">Conquistas</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {BADGES.map((badge) => {
          const earned = earnedSet.has(badge.id);
          const Icon = BADGE_ICONS[badge.icon];
          return (
            <div
              key={badge.id}
              title={badge.description}
              className={cn(
                "flex flex-col items-center rounded-xl border p-3 text-center",
                earned
                  ? "border-violet-300 bg-violet-500/10"
                  : "border-border bg-muted opacity-40 grayscale"
              )}
            >
              <Icon size={24} className={earned ? "text-violet-600" : "text-muted-foreground"} />
              <span className="mt-1 text-xs font-semibold text-foreground">{badge.name}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
