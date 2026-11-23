import fs from "fs";
import path from "path";
import { POLICY_COLORS, TAG_COLORS, type TagColor } from "@/lib/theme/tags";
import { LEAVE_CLASSES } from "@/lib/theme/leave";
import { contrast, distance, SIMULATIONS } from "./colourMaths";

/*
 * The leave palette (K01, 2026-11-19), read from `styles/globals.css`: twelve fill / edge / text triplets, apart from
 * the tags. The light values are the designers'; the dark ones are ours.
 *
 * - every text reads on its fill at 4.5 : 1, in both themes (an approved pill);
 * - dark: every edge stands off a dark card and off its own fill at 3 : 1 (a pending edge, the marker's dot);
 * - dark: every two edges a policy can take stay FLOOR_NORMAL apart for normal vision and FLOOR under protanopia,
 *   deuteranopia and tritanopia (OKLab × 100). The edge is what tells two policies apart — the fills are pale by
 *   design and are told apart by the dot and the name beside them (SPEC § 4.7), so they are not held to it.
 * - light: the designers' edges are reported, not changed — the pairs under the floor are KNOWN_WEAK.
 */

const ROOT = path.resolve(__dirname, "..");
const FLOOR = 2.5;
const FLOOR_NORMAL = 6;

type Triplet = { fill: string; edge: string; text: string };
type Theme = "light" | "dark";

function readLeave(): Record<Theme, Record<string, Partial<Triplet>>> {
  const css = fs.readFileSync(path.join(ROOT, "styles/globals.css"), "utf8");
  const out: Record<Theme, Record<string, Partial<Triplet>>> = { light: {}, dark: {} };
  for (const m of css.matchAll(/--leave-([a-z]+)-(fill|edge|text):\s*(#[0-9A-Fa-f]{6})/g)) {
    const [, name, part, hex] = m;
    const theme: Theme = out.light[name]?.[part as keyof Triplet] ? "dark" : "light";
    (out[theme][name] ??= {})[part as keyof Triplet] = hex;
  }
  return out;
}

const leave = readLeave();
const palette = (theme: Theme) => leave[theme] as Record<TagColor, Triplet>;
const DARK_CARD = /--dark-surface-1:\s*(#[0-9A-Fa-f]{6})/.exec(fs.readFileSync(path.join(ROOT, "styles/noddo/tokens.css"), "utf8"))![1];

/** The designers' light edges under the floor — reported to the owner (2026-11-20), not changed here. */
const KNOWN_WEAK: [string, TagColor, TagColor][] = [
  ["none", "plum", "indigo"],
  ["none", "mustard", "bronze"],
  ["none", "bronze", "orange"],
  ["protanopia", "olive", "bronze"],
  ["protanopia", "olive", "orange"],
  ["deuteranopia", "berry", "teal"],
  ["deuteranopia", "mustard", "bronze"],
  ["deuteranopia", "mustard", "orange"],
  ["deuteranopia", "bronze", "orange"],
];
const floorOf = (sim: string) => (sim === "none" ? FLOOR_NORMAL : FLOOR);

const closePairs = (theme: Theme, sim: string): string[] => {
  const p = palette(theme);
  const close: string[] = [];
  POLICY_COLORS.forEach((a, i) =>
    POLICY_COLORS.slice(i + 1).forEach((b) => {
      const d = distance(p[a].edge, p[b].edge, SIMULATIONS[sim]);
      if (d < floorOf(sim)) close.push(`${a}–${b}`);
    }),
  );
  return close;
};

describe("the leave palette", () => {
  it.each(["light", "dark"] as Theme[])("has a full triplet for each of the twelve names (%s)", (theme) => {
    const p = palette(theme);
    expect(TAG_COLORS.filter((c) => !(p[c]?.fill && p[c]?.edge && p[c]?.text))).toEqual([]);
  });

  it("keeps the designers' light values, as the spec's table has them", () => {
    const spec = fs.readFileSync(path.join(ROOT, "design/screens/leave-colours/spec.md"), "utf8");
    const rows = [...spec.matchAll(/^\| ([A-Z][a-z]+)[^|]*\| (#[0-9A-F]{6}) \| (#[0-9A-F]{6}) \| (#[0-9A-F]{6}) \|\r?$/gm)];
    expect(rows).toHaveLength(12);
    for (const [, name, fill, edge, text] of rows) {
      expect([name, palette("light")[name.toLowerCase() as TagColor]]).toEqual([name, { fill, edge, text }]);
    }
  });

  it.each(["light", "dark"] as Theme[])("reads a pill's text on its fill at 4.5 : 1 (%s)", (theme) => {
    const p = palette(theme);
    expect(TAG_COLORS.filter((c) => contrast(p[c].text, p[c].fill) < 4.5)).toEqual([]);
  });

  it("stands every dark edge off a dark card and off its own fill at 3 : 1", () => {
    const p = palette("dark");
    expect(TAG_COLORS.filter((c) => contrast(p[c].edge, DARK_CARD) < 3 || contrast(p[c].edge, p[c].fill) < 3)).toEqual([]);
  });

  it.each(Object.keys(SIMULATIONS))("keeps every two dark edges apart (%s)", (sim) => {
    expect(closePairs("dark", sim)).toEqual([]);
  });

  it.each(Object.keys(SIMULATIONS))("finds only the known weak pairs among the designers' light edges (%s)", (sim) => {
    const known = KNOWN_WEAK.filter(([s]) => s === sim).map(([, a, b]) => `${a}–${b}`);
    expect(closePairs("light", sim)).toEqual(known);
  });

  it("offers a policy eleven colours in K01's order, never gray", () => {
    expect(POLICY_COLORS).toEqual(["berry", "plum", "lilac", "indigo", "ocean", "teal", "olive", "mustard", "bronze", "orange", "cocoa"]);
  });

  it("draws leave from the leave tokens, never the tags", () => {
    expect(Object.values(LEAVE_CLASSES).flatMap((c) => Object.values(c)).filter((cls) => cls.includes("tag-"))).toEqual([]);
  });
});
