/**
 * One colour per lane, so whose a task is reads at a glance: the lane's stripe and tint, its avatar, and
 * the accent on each of its blocks. By the lane's place on the canvas — the person the process is about
 * first, the manager second, then each named person — so a colour stays with a lane while the template is
 * edited. Colour here means "whose", nothing else: the tag palette of the design system (SPEC § 4.7), which no
 * status and no accent uses, so it never reads as one. Gray is left out: a gray lane would read as inactive.
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
  { tint: "bg-tag-ocean-bg/60", stripe: "bg-tag-ocean-bar", avatar: "bg-tag-ocean-bg text-tag-ocean-text", accent: "border-l-tag-ocean-bar" },
  { tint: "bg-tag-berry-bg/60", stripe: "bg-tag-berry-bar", avatar: "bg-tag-berry-bg text-tag-berry-text", accent: "border-l-tag-berry-bar" },
  { tint: "bg-tag-teal-bg/60", stripe: "bg-tag-teal-bar", avatar: "bg-tag-teal-bg text-tag-teal-text", accent: "border-l-tag-teal-bar" },
  { tint: "bg-tag-bronze-bg/60", stripe: "bg-tag-bronze-bar", avatar: "bg-tag-bronze-bg text-tag-bronze-text", accent: "border-l-tag-bronze-bar" },
  { tint: "bg-tag-plum-bg/60", stripe: "bg-tag-plum-bar", avatar: "bg-tag-plum-bg text-tag-plum-text", accent: "border-l-tag-plum-bar" },
  { tint: "bg-tag-indigo-bg/60", stripe: "bg-tag-indigo-bar", avatar: "bg-tag-indigo-bg text-tag-indigo-text", accent: "border-l-tag-indigo-bar" },
  { tint: "bg-tag-cocoa-bg/60", stripe: "bg-tag-cocoa-bar", avatar: "bg-tag-cocoa-bg text-tag-cocoa-text", accent: "border-l-tag-cocoa-bar" },
];

export const laneColor = (index: number): LaneColor => PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length];

/** "AL" for Ada Lovelace, "NP" for The New Person — two letters of the lane's own name. */
export const initialsOf = (label: string) => {
  const words = label.replace(/^the\s+/i, "").split(/\s+/).filter(Boolean);
  return (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
};
