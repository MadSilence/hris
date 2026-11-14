/*
 * The workspace accent (SPEC § 2, § 4.3, § 4.4; sign-in-appearance § "The presets").
 *
 * A company picks one of nine presets, or enters a custom HEX; Graphite stays a tenth value, off the grid. The
 * company colour changes everything accent — the primary and Approve buttons, links, focus, selection, the active
 * navigation item, the illustration ring — and nothing else: greys, text, status colours and the tag palette are
 * always noddo's.
 *
 * A preset the designers' package carries is just `data-accent="<name>"` on `<html>`; `styles/noddo/tokens.css`
 * holds its contrast-checked values and derives the rest with `color-mix()`. A custom HEX — and, until the package
 * catches up (SIGN_IN_PLAN A6), the presets it does not carry yet — has no rule in that file, so the few inputs that
 * depend on contrast are computed here — the package's `accent.js`, in TypeScript, with the same sRGB mixing and the
 * same percentages — and set as custom properties on the element; tokens.css derives the rest from them exactly as
 * it does for a preset. A light colour (Sunflower, a light custom one) writes Graphite on its fill and darker links:
 * decided by contrast, never by a list.
 *
 * The stored value is the preset's name or a lowercase `#rrggbb` (`company_appearance.accent`); null is Wine.
 */

export const ACCENT_PRESETS = {
  wine: "#6E1630",
  cherry: "#BE123C",
  tangerine: "#C7501E",
  sunflower: "#F5C518",
  basil: "#2E7D32",
  indigo: "#4338CA",
  ocean: "#0369A1",
  mulberry: "#5B2A6E",
  black: "#0B0B0C",
  graphite: "#2A2A2E",
} as const;

export type AccentPreset = keyof typeof ACCENT_PRESETS;

/** The nine on the Appearance page's grid, in their order; Graphite is a value, not a choice. */
export const ACCENT_GRID: readonly AccentPreset[] = [
  "wine", "cherry", "tangerine", "sunflower", "basil", "indigo", "ocean", "mulberry", "black",
];

/**
 * The presets `styles/noddo/tokens.css` has a `[data-accent]` block for. The others get their inputs derived here,
 * like a custom colour, beside their `data-accent` — `accent.test.ts` fails the day the package's list changes.
 */
export const PACKAGE_PRESETS: ReadonlySet<AccentPreset> = new Set<AccentPreset>(["wine", "graphite"]);

export const DEFAULT_ACCENT: AccentPreset = "wine";

/** The name shown for each preset — a `common` catalogue key, translated where it renders. */
export const ACCENT_PRESET_LABEL_KEYS = {
  wine: "accent.names.wine",
  cherry: "accent.names.cherry",
  tangerine: "accent.names.tangerine",
  sunflower: "accent.names.sunflower",
  basil: "accent.names.basil",
  indigo: "accent.names.indigo",
  ocean: "accent.names.ocean",
  mulberry: "accent.names.mulberry",
  black: "accent.names.black",
  graphite: "accent.names.graphite",
} as const satisfies Record<AccentPreset, string>;

export const isAccentPreset = (value: unknown): value is AccentPreset =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(ACCENT_PRESETS, value);

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isHexColor = (value: unknown): value is string => typeof value === "string" && HEX.test(value.trim());

/** What a stored accent means: a preset, or a custom colour. Anything unreadable is the default. */
export type ResolvedAccent = { kind: "preset"; preset: AccentPreset } | { kind: "custom"; hex: string };

export const resolveAccent = (stored: string | null | undefined): ResolvedAccent => {
  const value = stored?.trim().toLowerCase();
  if (isAccentPreset(value)) return { kind: "preset", preset: value };
  if (value && isHexColor(value)) return { kind: "custom", hex: toHex(toRgb(value)) };
  return { kind: "preset", preset: DEFAULT_ACCENT };
};

// ── the derivation, as in the package's accent.js ─────────────────────────────────────────────

/** The dark text on a light accent: Graphite, not Ink (sign-in-appearance § "Changes to SPEC"). */
const GRAPHITE = "#2A2A2E";
const WHITE = "#FFFFFF";
const DARK_SURFACE = "#17171A";

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
};

const toHex = (rgb: number[]): string =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();

/** Like CSS `color-mix(in srgb, a, b t)`: `t` is the share of `b`. */
export const mix = (a: string, b: string, t: number): string => {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v * (1 - t) + B[i] * t));
};

const luminance = (hex: string): number => {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.x contrast ratio. */
export const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** White or Graphite, whichever passes 4.5:1 — white preferred. */
const pickOnColor = (fill: string): string => {
  if (contrast(WHITE, fill) >= 4.5) return WHITE;
  if (contrast(GRAPHITE, fill) >= 4.5) return GRAPHITE;
  return contrast(WHITE, fill) >= contrast(GRAPHITE, fill) ? WHITE : GRAPHITE;
};

/** Moves `color` toward `target` in 1 % steps until it reaches `min` contrast on every background. */
const shiftUntil = (color: string, target: string, backgrounds: string[], min = 4.5): string => {
  for (let i = 0; i <= 100; i++) {
    const c = mix(color, target, i / 100);
    if (backgrounds.every((bg) => contrast(c, bg) >= min)) return c;
  }
  return target;
};

/**
 * The inputs tokens.css reads for an accent (`--accent-base` and the contrast-dependent values beside it).
 * `adjusted` is true when the links had to be darkened to stay readable — Appearance says "Text and links a little
 * darker to stay readable".
 */
export type AccentInputs = {
  properties: Record<string, string>;
  adjusted: boolean;
};

export const deriveAccentInputs = (hex: string): AccentInputs => {
  const accent = toHex(toRgb(hex));

  const subtle = mix(WHITE, accent, 0.06);
  const muted = mix(WHITE, accent, 0.15);
  const onLight = pickOnColor(accent);
  const textLight = shiftUntil(accent, "#000000", [WHITE, subtle, muted]);

  const fillDark = shiftUntil(accent, WHITE, [DARK_SURFACE], 3);
  const darkSubtle = mix(DARK_SURFACE, fillDark, 0.12);
  const darkMuted = mix(DARK_SURFACE, fillDark, 0.24);

  return {
    properties: {
      "--accent-base": accent,
      "--accent-on-light": onLight,
      "--accent-text-light": textLight,
      "--accent-fill-dark": fillDark,
      "--accent-on-dark": pickOnColor(fillDark),
      "--accent-text-dark": shiftUntil(accent, WHITE, [DARK_SURFACE, "#1E1E22", darkSubtle, darkMuted]),
      "--sidebar-dark-bg": mix(DARK_SURFACE, accent, 0.16),
    },
    adjusted: textLight !== accent,
  };
};

/** The base HEX of a stored accent: a preset's, or the custom colour itself. */
export const accentHex = (stored: string | null | undefined): string => {
  const accent = resolveAccent(stored);
  return accent.kind === "preset" ? ACCENT_PRESETS[accent.preset] : accent.hex;
};

// ── a company colour close to a status colour (sign-in-appearance § "A colour close to a status colour") ─────

/** Hue in degrees, 0–360; null for a grey, which has none. */
export const hueOf = (hex: string): number | null => {
  const [r, g, b] = toRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.04) return null;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

/** The shorter way round the colour wheel between two hues. */
export const hueDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** "Close" is within this many degrees of hue… */
export const STATUS_HUE_MARGIN = 25;

/**
 * …at about the same lightness (HSL, 0–1). Hue alone would call Wine — a deep burgundy, 23° from Declined — a red
 * workspace; the designers name only Cherry and Tangerine (L8-Rules), which sit within this of Declined's lightness.
 */
export const STATUS_LIGHTNESS_MARGIN = 0.15;

const lightnessOf = (hex: string): number => {
  const rgb = toRgb(hex);
  return (Math.max(...rgb) + Math.min(...rgb)) / 510;
};

/** Declined (`--status-declined-fill`) and Approved (`--status-approved-fill`), as tokens.css writes them. */
const DECLINED = "#C42B1C";
const APPROVED = "#1E7A4F";

const within = (stored: string | null | undefined, status: string): boolean => {
  const hue = hueOf(accentHex(stored));
  const statusHue = hueOf(status);
  return (
    hue !== null &&
    statusHue !== null &&
    hueDistance(hue, statusHue) <= STATUS_HUE_MARGIN &&
    Math.abs(lightnessOf(accentHex(stored)) - lightnessOf(status)) <= STATUS_LIGHTNESS_MARGIN
  );
};

/**
 * A red workspace (Cherry, Tangerine, or a custom colour within 25° of Declined at about its lightness): the confirm dialog's destructive
 * button turns from a red fill into a red outline, so the two reds do not blur (rule 3). Product-wide, through
 * `data-accent-tone="red"` beside the accent (`styles/globals.css`).
 */
export const isRedAccent = (stored: string | null | undefined): boolean => within(stored, DECLINED);

/** Appearance's quiet line: the picked colour sits within 25° of the colour noddo uses for approvals. */
export const isCloseToApproved = (stored: string | null | undefined): boolean => within(stored, APPROVED);

// ── putting it on an element ────────────────────────────────────────────────────────────────────────────

export type AccentAttributes = {
  "data-accent"?: AccentPreset;
  "data-accent-tone"?: "red";
  style?: Record<string, string>;
};

/**
 * The attributes that put an accent on an element: `data-accent` for a preset (with the derived custom properties
 * when the package has no block for it), the derived custom properties for a custom colour, and the tone. The element
 * must also carry `data-theme` (tokens.css re-declares the accent roles on every element with either attribute, so an
 * island inside the page works too).
 */
export const accentAttributes = (stored: string | null | undefined): AccentAttributes => {
  const accent = resolveAccent(stored);
  const tone: Pick<AccentAttributes, "data-accent-tone"> = isRedAccent(stored) ? { "data-accent-tone": "red" } : {};
  if (accent.kind === "preset") {
    return PACKAGE_PRESETS.has(accent.preset)
      ? { "data-accent": accent.preset, ...tone }
      : { "data-accent": accent.preset, ...tone, style: deriveAccentInputs(ACCENT_PRESETS[accent.preset]).properties };
  }
  return { ...tone, style: deriveAccentInputs(accent.hex).properties };
};

const ACCENT_INPUTS = [
  "--accent-base", "--accent-on-light", "--accent-text-light", "--accent-fill-dark", "--accent-on-dark", "--accent-text-dark",
  "--sidebar-dark-bg",
];

/** Repaints the live page after a save, without asking the server to render the route again. */
export const applyAccent = (element: HTMLElement, stored: string | null | undefined): void => {
  const attributes = accentAttributes(stored);
  ACCENT_INPUTS.forEach((name) => element.style.removeProperty(name));

  if (attributes["data-accent"]) element.setAttribute("data-accent", attributes["data-accent"]);
  else element.removeAttribute("data-accent");
  if (attributes["data-accent-tone"]) element.setAttribute("data-accent-tone", attributes["data-accent-tone"]);
  else element.removeAttribute("data-accent-tone");
  Object.entries(attributes.style ?? {}).forEach(([name, value]) => element.style.setProperty(name, value));
};
