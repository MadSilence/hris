import { hexToOklch, isValidHex, oklchToHex } from "@/lib/theme/oklch";

/**
 * Derives the whole app palette from a single brand colour.
 *
 * The app does not use `--brown-*` as an accent — 48% of its ~1200 usages are surfaces and borders
 * (`bg-brown-50`, `border-brown-200`). Substituting a vivid brand colour one-for-one would repaint
 * every table border and every zebra row at 4-5x the designed saturation. So the generator keeps the
 * designed *structure* and swaps only the *identity*:
 *
 *   - lightness (L) is taken from the current brown ramp and never changes -> contrast for every
 *     existing usage is preserved by construction, no per-usage re-check needed;
 *   - hue (H) comes from the brand colour;
 *   - chroma (C) is a fraction of the brand's chroma, capped per step: near-grey at the surface end,
 *     full brand presence at the action end.
 *
 * Consequence worth knowing: the picked colour is an identity, not a literal value. `brown-600`
 * renders at the ramp's lightness, so it may read slightly darker or lighter than the swatch the user
 * picked. The settings preview shows the real result.
 */

export const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type BrandStep = (typeof BRAND_STEPS)[number];

/** The shipped brown scale. Source of the lightness ramp — edit here to reshape every brand. */
const BROWN_SCALE: Record<BrandStep, string> = {
  50: "#f6f2f0",
  100: "#f0ece9",
  200: "#e2d6d0",
  300: "#d1bfb6",
  400: "#b5978c",
  500: "#947068",
  600: "#7a5a54",
  700: "#664242",
  800: "#4d3232",
  900: "#3d2626",
};

/** Share of the brand's own chroma each step carries. A muted brand stays muted. */
const CHROMA_RATIO: Record<BrandStep, number> = {
  50: 0.06,
  100: 0.09,
  200: 0.16,
  300: 0.24,
  400: 0.5,
  500: 0.75,
  600: 1,
  700: 0.9,
  800: 0.7,
  900: 0.55,
};

/** Absolute ceiling per step, so a neon brand still cannot turn surfaces into neon. */
const CHROMA_CAP: Record<BrandStep, number> = {
  50: 0.012,
  100: 0.018,
  200: 0.032,
  300: 0.048,
  400: 0.1,
  500: 0.15,
  600: 0.19,
  700: 0.17,
  800: 0.13,
  900: 0.1,
};

/**
 * Warm greys that carry the brown hue but sit outside the `--brown-*` scale. They are re-hued with
 * lightness and chroma untouched, so a blue brand gets faintly cool greys instead of clashing with
 * leftover warm ones. `--color-bg-primary` (pure white) and `--color-text-inverse` are deliberately
 * absent: they have no hue to shift.
 */
const NEUTRAL_TOKENS: Record<string, string> = {
  "--color-text-primary": "#2c2420",
  "--color-text-secondary": "#544d47",
  "--color-text-tertiary": "#6b6058",
  "--color-text-quaternary": "#8a7f73",
  "--color-text-placeholder": "#b5a99c",
  "--color-text-disabled": "#d4cdc1",
  "--color-bg-secondary": "#faf9f7",
  "--color-bg-tertiary": "#f3f1ee",
  "--color-bg-quaternary": "#e8e4df",
  "--color-bg-active": "#faf9f7",
  "--color-bg-hover": "#fefefe",
  "--color-bg-disabled": "#faf9f7",
  "--color-border-secondary": "#b5a99c",
  "--color-border-disabled": "#f0ede8",
};

export type BrandPalette = {
  /** The 10-step scale that replaces `--brown-*`. */
  scale: Record<BrandStep, string>;
  /** Re-hued warm greys, keyed by CSS custom property name. */
  neutrals: Record<string, string>;
};

/** Null for an unparseable colour — callers fall back to the shipped brown scale. */
export const buildBrandPalette = (brandColor: string): BrandPalette | null => {
  const brand = hexToOklch(brandColor);
  if (!brand) return null;

  const scale = {} as Record<BrandStep, string>;

  for (const step of BRAND_STEPS) {
    const source = hexToOklch(BROWN_SCALE[step]);
    if (!source) continue;

    scale[step] = oklchToHex({
      l: source.l,
      c: Math.min(brand.c * CHROMA_RATIO[step], CHROMA_CAP[step]),
      h: brand.h,
    });
  }

  const neutrals: Record<string, string> = {};

  for (const [token, hex] of Object.entries(NEUTRAL_TOKENS)) {
    const source = hexToOklch(hex);
    if (!source) continue;

    neutrals[token] = oklchToHex({ l: source.l, c: source.c, h: brand.h });
  }

  return { scale, neutrals };
};

/**
 * The `<style>` body that rebrands the app, or an empty string to keep the shipped brown.
 *
 * `html:root` outranks the `:root` in globals.css, so the override wins no matter which order Next
 * emits the stylesheet and this tag in. One block covers everything: the app is single-theme (dark
 * mode was removed — see DECISIONS.md), so there is no second token set to guard against.
 */
export const buildBrandStyleSheet = (brandColor: string | null | undefined): string => {
  if (!brandColor || !isValidHex(brandColor)) return "";

  const palette = buildBrandPalette(brandColor);
  if (!palette) return "";

  const scale = BRAND_STEPS.map((step) => `--brown-${step}:${palette.scale[step]}`).join(";");

  const neutrals = Object.entries(palette.neutrals)
    .map(([token, value]) => `${token}:${value}`)
    .join(";");

  return `html:root{${scale}${neutrals ? ";" + neutrals : ""}}`;
};
