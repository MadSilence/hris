/*
 * The tag palette (SPEC § 4.7) and the four colours the designers added (2.1, 2026-11-05 — Lilac, Orange, Mustard,
 * Olive; their tokens are in `styles/globals.css`): twelve user-chosen colours for time off policies, attribute options
 * and anything else a person colours by hand. Each is a triplet — chip background, text, and the bar — read through the
 * `tag-<name>-bg | -text | -bar` utilities. A tag is stored by its name, never by a HEX; the backend's `TagColor` enum
 * holds the same twelve names.
 *
 * Never a status colour, never the accent, and the name is always shown beside the colour.
 */
export const TAG_COLORS = [
  "gray", "berry", "plum", "indigo", "ocean", "teal", "cocoa", "bronze", "lilac", "orange", "mustard", "olive",
] as const;

export type TagColor = (typeof TAG_COLORS)[number];

/** The package's own eight — what initials are coloured from, so the package's `avatarColor()` stays the same. */
const PACKAGE_TAG_COLORS: readonly TagColor[] = ["gray", "berry", "plum", "indigo", "ocean", "teal", "cocoa", "bronze"];

/**
 * A time off policy's colours: every tag but gray, because a gray bar on the calendar is "Away" (the designers'
 * answer 2.2). Six to a row in the picker.
 */
export const POLICY_COLORS: readonly TagColor[] = TAG_COLORS.filter((c) => c !== "gray");

export const DEFAULT_TAG_COLOR: TagColor = "gray";

/** The name shown beside each colour — a `common` catalogue key, translated where it renders. */
export const TAG_COLOR_LABELS = {
  gray: "tagColor.names.gray",
  berry: "tagColor.names.berry",
  plum: "tagColor.names.plum",
  indigo: "tagColor.names.indigo",
  ocean: "tagColor.names.ocean",
  teal: "tagColor.names.teal",
  cocoa: "tagColor.names.cocoa",
  bronze: "tagColor.names.bronze",
  lilac: "tagColor.names.lilac",
  orange: "tagColor.names.orange",
  mustard: "tagColor.names.mustard",
  olive: "tagColor.names.olive",
} as const satisfies Record<TagColor, string>;

export const isTagColor = (value: unknown): value is TagColor =>
  typeof value === "string" && (TAG_COLORS as readonly string[]).includes(value);

/** A stored value the app does not know (an older row, a bad import) is shown in gray rather than failing. */
export const toTagColor = (value: string | null | undefined): TagColor => (isTagColor(value) ? value : DEFAULT_TAG_COLOR);

/*
 * Written out in full so Tailwind finds every class in the source; a class assembled from parts
 * (`bg-tag-${color}-bg`) is invisible to it and would produce no CSS.
 */
export const TAG_CLASSES: Record<TagColor, { chip: string; bar: string; dot: string; text: string; border: string; ring: string }> = {
  gray: { chip: "bg-tag-gray-bg text-tag-gray-text", bar: "bg-tag-gray-bar", dot: "bg-tag-gray-bar", text: "text-tag-gray-text", border: "border-tag-gray-bar", ring: "ring-tag-gray-bar" },
  berry: { chip: "bg-tag-berry-bg text-tag-berry-text", bar: "bg-tag-berry-bar", dot: "bg-tag-berry-bar", text: "text-tag-berry-text", border: "border-tag-berry-bar", ring: "ring-tag-berry-bar" },
  plum: { chip: "bg-tag-plum-bg text-tag-plum-text", bar: "bg-tag-plum-bar", dot: "bg-tag-plum-bar", text: "text-tag-plum-text", border: "border-tag-plum-bar", ring: "ring-tag-plum-bar" },
  indigo: { chip: "bg-tag-indigo-bg text-tag-indigo-text", bar: "bg-tag-indigo-bar", dot: "bg-tag-indigo-bar", text: "text-tag-indigo-text", border: "border-tag-indigo-bar", ring: "ring-tag-indigo-bar" },
  ocean: { chip: "bg-tag-ocean-bg text-tag-ocean-text", bar: "bg-tag-ocean-bar", dot: "bg-tag-ocean-bar", text: "text-tag-ocean-text", border: "border-tag-ocean-bar", ring: "ring-tag-ocean-bar" },
  teal: { chip: "bg-tag-teal-bg text-tag-teal-text", bar: "bg-tag-teal-bar", dot: "bg-tag-teal-bar", text: "text-tag-teal-text", border: "border-tag-teal-bar", ring: "ring-tag-teal-bar" },
  cocoa: { chip: "bg-tag-cocoa-bg text-tag-cocoa-text", bar: "bg-tag-cocoa-bar", dot: "bg-tag-cocoa-bar", text: "text-tag-cocoa-text", border: "border-tag-cocoa-bar", ring: "ring-tag-cocoa-bar" },
  bronze: { chip: "bg-tag-bronze-bg text-tag-bronze-text", bar: "bg-tag-bronze-bar", dot: "bg-tag-bronze-bar", text: "text-tag-bronze-text", border: "border-tag-bronze-bar", ring: "ring-tag-bronze-bar" },
  lilac: { chip: "bg-tag-lilac-bg text-tag-lilac-text", bar: "bg-tag-lilac-bar", dot: "bg-tag-lilac-bar", text: "text-tag-lilac-text", border: "border-tag-lilac-bar", ring: "ring-tag-lilac-bar" },
  orange: { chip: "bg-tag-orange-bg text-tag-orange-text", bar: "bg-tag-orange-bar", dot: "bg-tag-orange-bar", text: "text-tag-orange-text", border: "border-tag-orange-bar", ring: "ring-tag-orange-bar" },
  mustard: { chip: "bg-tag-mustard-bg text-tag-mustard-text", bar: "bg-tag-mustard-bar", dot: "bg-tag-mustard-bar", text: "text-tag-mustard-text", border: "border-tag-mustard-bar", ring: "ring-tag-mustard-bar" },
  olive: { chip: "bg-tag-olive-bg text-tag-olive-text", bar: "bg-tag-olive-bar", dot: "bg-tag-olive-bar", text: "text-tag-olive-text", border: "border-tag-olive-bar", ring: "ring-tag-olive-bar" },
};

/**
 * The colour of a person's initials when there is no photo (SPEC § 4.7): the soft tag colour chosen by a
 * stable hash of the name — the package's `avatarColor()`, unchanged, so the same name gets the same colour
 * in the app, in e-mail and in the package's own reference page.
 */
export function avatarColor(name: string): TagColor {
  let hash = 0;
  for (const ch of String(name)) {
    hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return PACKAGE_TAG_COLORS[hash % PACKAGE_TAG_COLORS.length];
}

/** The order new options take their colours in — the backend seeds in the same order (`TagColor.seededAt`). */
export const TAG_COLOR_SEQUENCE: readonly TagColor[] = ["ocean", "berry", "teal", "bronze", "plum", "indigo", "cocoa", "gray"];

/** The first colour of the sequence nobody uses yet; once all are taken, the sequence starts over. */
export function nextTagColor(used: readonly (string | null | undefined)[]): TagColor {
  const taken = new Set(used.map((c) => toTagColor(c)));
  return TAG_COLOR_SEQUENCE.find((c) => !taken.has(c)) ?? TAG_COLOR_SEQUENCE[used.length % TAG_COLOR_SEQUENCE.length];
}

/** A policy's colour, or the first free one when a stored value is unknown — never gray. */
export function toPolicyColor(value: string | null | undefined): TagColor {
  return isTagColor(value) && value !== "gray" ? value : POLICY_COLORS[0];
}

/** The first policy colour nobody uses yet; once all eleven are taken, the least used — the backend picks the same. */
export function nextPolicyColor(used: readonly (string | null | undefined)[]): TagColor {
  const counts = new Map<TagColor, number>();
  for (const c of used) if (isTagColor(c)) counts.set(c, (counts.get(c) ?? 0) + 1);
  let best = POLICY_COLORS[0];
  for (const c of POLICY_COLORS) if ((counts.get(c) ?? 0) < (counts.get(best) ?? 0)) best = c;
  return best;
}
