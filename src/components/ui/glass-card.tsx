import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/40 bg-white/70 shadow-md backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  );
}
