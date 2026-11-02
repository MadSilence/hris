/**
 * One colour per lane, so whose a task is reads at a glance: the lane's stripe and tint, its avatar, and
 * the accent on each of its blocks. By the lane's place on the canvas — the person the process is about
 * first, the manager second, then each named person — so a colour stays with a lane while the template is
 * edited. Colour here means "whose", nothing else: a categorical palette, from hues no status uses, so it never
 * reads as one (`STATUS_AND_BADGES.md` § 3).
 */
export type LaneColor = {
  /** The lane's band behind its tasks. */
  tint: string;
  /** The thin bar at the lane's left edge, in the header. */
  stripe: string;
  /** Initials on the lane header. */
  avatar: string;
  /** The left edge of a block in the lane. */
  accent: string;
};

const PALETTE: LaneColor[] = [
  { tint: "bg-indigo-50/70", stripe: "bg-indigo-400", avatar: "bg-indigo-100 text-indigo-800", accent: "border-l-indigo-400" },
  { tint: "bg-fuchsia-50/70", stripe: "bg-fuchsia-400", avatar: "bg-fuchsia-100 text-fuchsia-800", accent: "border-l-fuchsia-400" },
  { tint: "bg-cyan-50/70", stripe: "bg-cyan-400", avatar: "bg-cyan-100 text-cyan-800", accent: "border-l-cyan-400" },
  { tint: "bg-violet-50/70", stripe: "bg-violet-400", avatar: "bg-violet-100 text-violet-800", accent: "border-l-violet-400" },
  { tint: "bg-pink-50/70", stripe: "bg-pink-400", avatar: "bg-pink-100 text-pink-800", accent: "border-l-pink-400" },
  { tint: "bg-purple-50/70", stripe: "bg-purple-400", avatar: "bg-purple-100 text-purple-800", accent: "border-l-purple-400" },
];

export const laneColor = (index: number): LaneColor => PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];

/** "AL" for Ada Lovelace, "NP" for The New Person — two letters of the lane's own name. */
export const initialsOf = (label: string) => {
  const words = label.replace(/^the\s+/i, "").split(/\s+/).filter(Boolean);
  return (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
};
