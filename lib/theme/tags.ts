/*
 * The tag palette (SPEC § 4.7): eight user-chosen colours for leave types, attribute options and anything
 * else a person colours by hand. Each is a triplet — chip background, text, and the bar or dot — read
 * through the `tag-<name>-bg | -text | -bar` utilities. A tag is stored by its name, never by a HEX; the
 * backend's `TagColor` enum holds the same eight names.
 *
 * Never a status colour, never the accent, and the name is always shown beside the colour.
 */
export const TAG_COLORS = ["gray", "berry", "plum", "indigo", "ocean", "teal", "cocoa", "bronze"] as const;

export type TagColor = (typeof TAG_COLORS)[number];

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
} as const satisfies Record<TagColor, string>;

export const isTagColor = (value: unknown): value is TagColor =>
  typeof value === "string" && (TAG_COLORS as readonly string[]).includes(value);

/** A stored value the app does not know (an older row, a bad import) is shown in gray rather than failing. */
export const toTagColor = (value: string | null | undefined): TagColor => (isTagColor(value) ? value : DEFAULT_TAG_COLOR);

/*
 * Written out in full so Tailwind finds every class in the source; a class assembled from parts
 * (`bg-tag-${color}-bg`) is invisible to it and would produce no CSS.
 */
export const TAG_CLASSES: Record<TagColor, { chip: string; bar: string; dot: string; text: string; border: string }> = {
  gray: { chip: "bg-tag-gray-bg text-tag-gray-text", bar: "bg-tag-gray-bar", dot: "bg-tag-gray-bar", text: "text-tag-gray-text", border: "border-tag-gray-bar" },
  berry: { chip: "bg-tag-berry-bg text-tag-berry-text", bar: "bg-tag-berry-bar", dot: "bg-tag-berry-bar", text: "text-tag-berry-text", border: "border-tag-berry-bar" },
  plum: { chip: "bg-tag-plum-bg text-tag-plum-text", bar: "bg-tag-plum-bar", dot: "bg-tag-plum-bar", text: "text-tag-plum-text", border: "border-tag-plum-bar" },
  indigo: { chip: "bg-tag-indigo-bg text-tag-indigo-text", bar: "bg-tag-indigo-bar", dot: "bg-tag-indigo-bar", text: "text-tag-indigo-text", border: "border-tag-indigo-bar" },
  ocean: { chip: "bg-tag-ocean-bg text-tag-ocean-text", bar: "bg-tag-ocean-bar", dot: "bg-tag-ocean-bar", text: "text-tag-ocean-text", border: "border-tag-ocean-bar" },
  teal: { chip: "bg-tag-teal-bg text-tag-teal-text", bar: "bg-tag-teal-bar", dot: "bg-tag-teal-bar", text: "text-tag-teal-text", border: "border-tag-teal-bar" },
  cocoa: { chip: "bg-tag-cocoa-bg text-tag-cocoa-text", bar: "bg-tag-cocoa-bar", dot: "bg-tag-cocoa-bar", text: "text-tag-cocoa-text", border: "border-tag-cocoa-bar" },
  bronze: { chip: "bg-tag-bronze-bg text-tag-bronze-text", bar: "bg-tag-bronze-bar", dot: "bg-tag-bronze-bar", text: "text-tag-bronze-text", border: "border-tag-bronze-bar" },
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
  return TAG_COLORS[hash % TAG_COLORS.length];
}

/** The order new options take their colours in — the backend seeds in the same order (`TagColor.seededAt`). */
export const TAG_COLOR_SEQUENCE: readonly TagColor[] = ["ocean", "berry", "teal", "bronze", "plum", "indigo", "cocoa", "gray"];

/** The first colour of the sequence nobody uses yet; once all are taken, the sequence starts over. */
export function nextTagColor(used: readonly (string | null | undefined)[]): TagColor {
  const taken = new Set(used.map((c) => toTagColor(c)));
  return TAG_COLOR_SEQUENCE.find((c) => !taken.has(c)) ?? TAG_COLOR_SEQUENCE[used.length % TAG_COLOR_SEQUENCE.length];
}
