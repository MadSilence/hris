import { hexToOklch, isValidHex, oklchToHex, parseHex } from "@/lib/theme/oklch";

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
 * **Except step 600, the action colour, which is the picked colour itself** whenever that stays safe:
 * white text on it reads at WCAG AA (4.5:1) and it sits between steps 500 and 700, so hover and
 * pressed states still move the right way. The swatch and the primary button used to disagree — the
 * button rendered at the ramp's lightness, a shade off what was picked. A colour that fails either
 * test (a light yellow, a near-black) still falls back to the ramp, and the settings screen says so.
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

/** WCAG relative luminance of an sRGB hex colour. */
const relativeLuminance = (hex: string): number | null => {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const MIN_WHITE_TEXT_CONTRAST = 4.5;

/**
 * Whether the picked colour can be the action colour as it is. False means step 600 is generated from
 * the ramp instead — see the header for the two conditions.
 */
export const isBrandColorUsedAsIs = (brandColor: string): boolean => {
  const brand = hexToOklch(brandColor);
  const luminance = relativeLuminance(brandColor);
  const lighter = hexToOklch(BROWN_SCALE[500]);
  const darker = hexToOklch(BROWN_SCALE[700]);
  if (!brand || luminance == null || !lighter || !darker) return false;

  const contrast = 1.05 / (luminance + 0.05);
  return contrast >= MIN_WHITE_TEXT_CONTRAST && brand.l < lighter.l && brand.l > darker.l;
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

  if (isBrandColorUsedAsIs(brandColor)) {
    const parsed = parseHex(brandColor);
    if (parsed) {
      scale[600] = `#${parsed.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    }
  }

  return { scale, neutrals };
};

/** The palette the app ships with, used as the explicit fallback inside a scoped preview. */
const SHIPPED_PALETTE: BrandPalette = { scale: BROWN_SCALE, neutrals: NEUTRAL_TOKENS };

const renderTokens = (palette: BrandPalette): string => {
  const scale = BRAND_STEPS.map((step) => `--brown-${step}:${palette.scale[step]}`).join(";");

  const neutrals = Object.entries(palette.neutrals)
    .map(([token, value]) => `${token}:${value}`)
    .join(";");

  return neutrals ? `${scale};${neutrals}` : scale;
};

/**
 * The contrast sidebar: the same brand, but the navigation is a dark brand surface instead of a
 * white one. Only the `--sidebar-*` tokens move — every sidebar colour is painted through them, so
 * nothing else in the app notices. Values mirror the Appearance preview.
 */
const SIDEBAR_CONTRAST_TOKENS = [
  "--sidebar:var(--brown-700)",
  "--sidebar-foreground:#ffffff",
  "--sidebar-border:rgba(255,255,255,0.18)",
  "--sidebar-accent:rgba(255,255,255,0.14)",
  "--sidebar-accent-foreground:#ffffff",
  "--sidebar-ring:rgba(255,255,255,0.5)",
  "--sidebar-item-hover-bg:rgba(255,255,255,0.12)",
  "--sidebar-item-hover-fg:#ffffff",
  "--sidebar-item-active-bg:rgba(255,255,255,0.2)",
  "--sidebar-item-active-fg:#ffffff",
  "--sidebar-item-icon:#ffffff",
  "--sidebar-badge-bg:#ffffff",
  "--sidebar-badge-fg:var(--brown-700)",
].join(";");

/**
 * The `<style>` body that rebrands the app, or an empty string to keep the shipped brown.
 *
 * `html:root` outranks the `:root` in globals.css, so the override wins no matter which order Next
 * emits the stylesheet and this tag in. One block covers everything: the app is single-theme (dark
 * mode was removed — see DECISIONS.md), so there is no second token set to guard against.
 *
 * The contrast sidebar rides along in the same block on purpose. It is a token swap like the palette
 * is, and keeping both in one server-rendered element means the sidebar is already dark on the first
 * paint instead of flashing white while a client query resolves.
 */
export const buildBrandStyleSheet = (
  brandColor: string | null | undefined,
  sidebarContrast = false,
): string => {
  const palette = brandColor && isValidHex(brandColor) ? buildBrandPalette(brandColor) : null;

  const blocks: string[] = [];
  if (palette) blocks.push(renderTokens(palette));
  if (sidebarContrast) blocks.push(SIDEBAR_CONTRAST_TOKENS);

  if (blocks.length === 0) return "";

  return `html:root{${blocks.join(";")}}`;
};

/**
 * The same palette, confined to one subtree — for the Appearance preview, which has to wear a colour
 * the rest of the app has not been saved into yet.
 *
 * Two differences from the global sheet. It never returns an empty string: clearing the draft has to
 * actively repaint the preview with the shipped brown, otherwise it would inherit whichever colour is
 * currently saved. And only `--brown-*` and the flat neutral tokens can travel this way — the aliases
 * in globals.css (`--primary: var(--brown-600)`) substitute against `:root`, so anything inside a
 * scoped preview must paint with `brown-*` utilities directly.
 */
export const buildScopedBrandStyleSheet = (
  selector: string,
  brandColor: string | null | undefined,
): string => {
  const drafted = brandColor && isValidHex(brandColor) ? buildBrandPalette(brandColor) : null;

  return `${selector}{${renderTokens(drafted ?? SHIPPED_PALETTE)}}`;
};
