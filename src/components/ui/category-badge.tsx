import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CategoryBadgeVariant = "ebook" | "quiz" | "roadmap" | "xp";

const VARIANT_CLASSES: Record<CategoryBadgeVariant, string> = {
  ebook: "bg-rose-100 text-rose-900",
  quiz: "bg-amber-100 text-amber-900",
  roadmap: "bg-violet-100 text-violet-900",
  xp: "bg-emerald-100 text-emerald-900",
};

interface CategoryBadgeProps {
  variant: CategoryBadgeVariant;
  children: ReactNode;
  className?: string;
}

export default function CategoryBadge({ variant, children, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
