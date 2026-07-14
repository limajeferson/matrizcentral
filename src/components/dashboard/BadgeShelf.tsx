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
      <h2 className="mb-3 font-bold text-zinc-900">Conquistas</h2>
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
                  ? "border-violet-300 bg-violet-50"
                  : "border-zinc-200 bg-zinc-50 opacity-40 grayscale"
              )}
            >
              <Icon size={24} className={earned ? "text-violet-600" : "text-zinc-400"} />
              <span className="mt-1 text-xs font-semibold text-zinc-800">{badge.name}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
