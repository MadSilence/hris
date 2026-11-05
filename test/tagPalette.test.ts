import fs from "fs";
import path from "path";
import { POLICY_COLORS, TAG_COLORS, type TagColor } from "@/lib/theme/tags";

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

// ── colour maths ──
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
};

const SIMULATIONS: Record<string, number[][] | null> = {
  none: null,
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};

/** OKLab of the colour as seen under a simulation, from linear sRGB. */
function seen(hex: string, m: number[][] | null): number[] {
  let [r, g, b] = rgb(hex).map(lin);
  if (m) [r, g, b] = m.map((row) => Math.min(1, Math.max(0, row[0] * r + row[1] * g + row[2] * b)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mm = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * mm - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * mm + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * mm - 0.808675766 * s,
  ];
}
const distance = (a: string, b: string, m: number[][] | null) => 100 * Math.hypot(...seen(a, m).map((v, i) => v - seen(b, m)[i]));

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
