"use client";

import { motion, type Variants } from "framer-motion";
import type { RankRow } from "@/lib/leaderboard";

export type RankingListProps = {
  rows: RankRow[];
};

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const row: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

/** 1º lugar em destaque dourado (`--mc-gold`, com fallback fora do escopo
 * `.mcv2`); 2º/3º em tons neutros decrescentes; demais posições neutras. */
function rankTone(rank: number): string {
  if (rank === 1) return "text-[color:var(--mc-gold,#e8b64c)]";
  if (rank === 2) return "text-foreground/70";
  if (rank === 3) return "text-foreground/50";
  return "text-muted-foreground";
}

/**
 * Ranking mensal de XP (modelo animated-list): itens entram com animação
 * staggered (framer-motion — container com `staggerChildren`, cada linha
 * spring de `x:12` → `x:0`). Server component (RightSidebar) passa `rows`
 * já ordenadas por `rankLeaderboard` (Task 1).
 */
export function RankingList({ rows }: RankingListProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Ninguém pontuou este mês ainda.</p>;
  }

  return (
    <motion.ol
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {rows.map((r) => (
        <motion.li
          key={r.rank}
          variants={row}
          className="flex items-center gap-3 rounded-xl px-2 py-1.5"
        >
          <span className={`w-6 shrink-0 text-right text-sm font-bold ${rankTone(r.rank)}`}>
            #{r.rank}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">{r.name}</span>
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">{r.xp} XP</span>
        </motion.li>
      ))}
    </motion.ol>
  );
}

export default RankingList;
