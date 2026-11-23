import fs from "fs";
import path from "path";
import { POLICY_COLORS, TAG_COLORS, type TagColor } from "@/lib/theme/tags";
import { contrast, distance, SIMULATIONS } from "./colourMaths";

/*
 * The tag palette, read from the stylesheets themselves: the package's eight in `styles/noddo/tokens.css`, the four the
 * designers added in `styles/globals.css` (2.1; their dark values are ours — D3, 2026-11-05).
 *
 * - every chip's text reads on its background at 4.5 : 1, in both themes;
 * - every bar stands off a dark card at 3 : 1;
 * - **colour-vision deficiency**: a policy picks from eleven colours, and the calendar tells policies apart by them. Each
 *   pair with a new colour is simulated for protanopia, deuteranopia and tritanopia (Machado, Oliveira & Fernandes 2009,
 *   severity 1) and must stay at least FLOOR apart in OKLab (×100). The package's own closest pair is 1.6 (ocean and
 *   teal, tritanopia, dark); the floor is stricter than that.
 *
 * The name is always shown beside the colour (SPEC § 4.7), so a pair under the floor is a weaker signal, not a lost one.
 * Two pairs of the designers' light values fall under it; they are listed in KNOWN_WEAK and reported to the owner rather
 * than changed here — the light values are the designers'.
 */

const ROOT = path.resolve(__dirname, "..");
const FLOOR = 2.5;
/** For normal vision the package's own closest pair (ocean and teal, dark) is 6.0 — a new colour may not come closer. */
const FLOOR_NORMAL = 6;
const NEW: TagColor[] = ["lilac", "orange", "mustard", "olive"];

type Triplet = { bg: string; text: string; bar: string };
type Theme = "light" | "dark";

/** Each `--tag-<name>-<part>: #hex` in file order — the first is the light value, the second the dark one. */
function readTags(file: string): Record<Theme, Partial<Record<string, Partial<Triplet>>>> {
  const css = fs.readFileSync(path.join(ROOT, file), "utf8");
  const out: Record<Theme, Partial<Record<string, Partial<Triplet>>>> = { light: {}, dark: {} };
  for (const m of css.matchAll(/--tag-([a-z]+)-(bg|text|bar):\s*(#[0-9A-Fa-f]{6})/g)) {
    const [, name, part, hex] = m;
    const theme: Theme = out.light[name]?.[part as keyof Triplet] ? "dark" : "light";
    (out[theme][name] ??= {})[part as keyof Triplet] = hex;
  }
  return out;
}

const pkg = readTags("styles/noddo/tokens.css");
const ours = readTags("styles/globals.css");
const palette = (theme: Theme): Record<TagColor, Triplet> =>
  Object.fromEntries(TAG_COLORS.map((c) => [c, { ...pkg[theme][c], ...ours[theme][c] } as Triplet])) as Record<TagColor, Triplet>;

const DARK_CARD = /--dark-surface-1:\s*(#[0-9A-Fa-f]{6})/.exec(fs.readFileSync(path.join(ROOT, "styles/noddo/tokens.css"), "utf8"))![1];


/** The designers' light values that fall under the floor — reported to the owner (2026-11-05), not changed here. */
const KNOWN_WEAK: [Theme, string, TagColor, TagColor][] = [
  ["light", "protanopia", "orange", "mustard"],
  ["light", "deuteranopia", "bronze", "olive"],
];
const isKnown = (theme: Theme, sim: string, a: TagColor, b: TagColor) =>
  KNOWN_WEAK.some(([t, s, x, y]) => t === theme && s === sim && ((x === a && y === b) || (x === b && y === a)));

describe("the tag palette", () => {
  it.each(["light", "dark"] as Theme[])("has a full triplet for each of the twelve colours (%s)", (theme) => {
    const p = palette(theme);
    for (const c of TAG_COLORS) {
      expect([c, p[c].bg, p[c].text, p[c].bar].every(Boolean)).toBe(true);
    }
  });

  it.each(["light", "dark"] as Theme[])("reads a chip's text on its background at 4.5 : 1 (%s)", (theme) => {
    const p = palette(theme);
    const low = TAG_COLORS.filter((c) => contrast(p[c].text, p[c].bg) < 4.5);
    expect(low).toEqual([]);
  });

  it("stands every bar off a dark card at 3 : 1", () => {
    const p = palette("dark");
    expect(TAG_COLORS.filter((c) => contrast(p[c].bar, DARK_CARD) < 3)).toEqual([]);
  });

  it.each(
    (["light", "dark"] as Theme[]).flatMap((theme) => Object.keys(SIMULATIONS).map((sim) => [theme, sim] as const)),
  )("keeps the new policy colours apart from every other (%s, %s)", (theme, sim) => {
    const p = palette(theme);
    const close: string[] = [];
    POLICY_COLORS.forEach((a, i) =>
      POLICY_COLORS.slice(i + 1).forEach((b) => {
        if (!NEW.includes(a) && !NEW.includes(b)) return;
        const d = distance(p[a].bar, p[b].bar, SIMULATIONS[sim]);
        const floor = sim === "none" ? FLOOR_NORMAL : FLOOR;
        if (d < floor && !isKnown(theme, sim, a, b)) close.push(`${a}–${b} ${d.toFixed(1)}`);
      }),
    );
    expect(close).toEqual([]);
  });

  it.each(KNOWN_WEAK)("still finds %s %s %s–%s weak (drop it from the list once the values change)", (theme, sim, a, b) => {
    const p = palette(theme);
    expect(distance(p[a].bar, p[b].bar, SIMULATIONS[sim])).toBeLessThan(FLOOR);
  });

  it("offers a policy every colour but gray", () => {
    expect(POLICY_COLORS).toHaveLength(11);
    expect(POLICY_COLORS).not.toContain("gray");
  });
});
