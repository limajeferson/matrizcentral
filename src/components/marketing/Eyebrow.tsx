import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export default function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-zinc-600",
        className
      )}
    >
      <span className="text-violet-600">✦</span>
      {children}
    </span>
  );
}
