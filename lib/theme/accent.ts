/*
 * The workspace accent (SPEC § 2, § 4.3, § 4.4).
 *
 * A company picks one of ten presets, or enters a custom HEX. The company colour changes everything accent —
 * the primary and Approve buttons, links, focus, selection, the active navigation item, the illustration
 * ring — and nothing else: greys, text, status colours and the tag palette are always noddo's.
 *
 * A preset is just `data-accent="<name>"` on `<html>`; `styles/noddo/tokens.css` carries its contrast-checked
 * values and derives the rest with `color-mix()`. A custom HEX has no rule in that file, so the few inputs
 * that depend on contrast are computed here — the package's `accent.js`, in TypeScript, with the same sRGB
 * mixing and the same percentages — and set as custom properties on the element; tokens.css derives the
 * rest from them exactly as it does for a preset.
 *
 * The stored value is the preset's name or a lowercase `#rrggbb` (`company_appearance.accent`); null is Wine.
 */

export const ACCENT_PRESETS = {
  wine: "#6E1630",
  brick: "#C2413B",
  terracotta: "#C25423",
  sun: "#C48A08",
  forest: "#2E8055",
  teal: "#12807A",
  denim: "#2F63C4",
  iris: "#6A4FC7",
  raspberry: "#C23D74",
  graphite: "#2A2A2E",
} as const;

export type AccentPreset = keyof typeof ACCENT_PRESETS;

export const DEFAULT_ACCENT: AccentPreset = "wine";

/** The name shown for each preset — a `common` catalogue key, translated where it renders. */
export const ACCENT_PRESET_LABEL_KEYS = {
  wine: "accent.names.wine",
  brick: "accent.names.brick",
  terracotta: "accent.names.terracotta",
  sun: "accent.names.sun",
  forest: "accent.names.forest",
  teal: "accent.names.teal",
  denim: "accent.names.denim",
  iris: "accent.names.iris",
  raspberry: "accent.names.raspberry",
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

const INK = "#0B0B0C";
const WHITE = "#FFFFFF";
const DARK_SURFACE = "#17171A";

/** The documented exception (SPEC § 16): white semibold text on Sun, and darker links. */
const OVERRIDES: Record<string, { onAccent: string; accentText: string }> = {
  "#C48A08": { onAccent: WHITE, accentText: "#8C6000" },
};

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

/** White or Ink, whichever passes 4.5:1 — white preferred. */
const pickOnColor = (fill: string): string => {
  if (contrast(WHITE, fill) >= 4.5) return WHITE;
  if (contrast(INK, fill) >= 4.5) return INK;
  return contrast(WHITE, fill) >= contrast(INK, fill) ? WHITE : INK;
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
 * `adjusted` is true when the links had to be darkened to stay readable — the admin is told
 * "We adjusted your color for readability."
 */
export type AccentInputs = {
  properties: Record<string, string>;
  adjusted: boolean;
};

export const deriveAccentInputs = (hex: string): AccentInputs => {
  const accent = toHex(toRgb(hex));
  const override = OVERRIDES[accent];

  const subtle = mix(WHITE, accent, 0.06);
  const muted = mix(WHITE, accent, 0.15);
  const onLight = override?.onAccent ?? pickOnColor(accent);
  const textLight = override?.accentText ?? shiftUntil(accent, "#000000", [WHITE, subtle, muted]);

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

/**
 * The attributes that put an accent on an element: `data-accent` for a preset, the derived custom properties
 * for a custom colour. The element must also carry `data-theme` (tokens.css re-declares the accent roles on
 * every element with either attribute, so an island inside the page works too).
 */
export const accentAttributes = (
  stored: string | null | undefined,
): { "data-accent"?: AccentPreset; style?: Record<string, string> } => {
  const accent = resolveAccent(stored);
  if (accent.kind === "preset") return { "data-accent": accent.preset };
  return { style: deriveAccentInputs(accent.hex).properties };
};

/** Repaints the live page after a save, without asking the server to render the route again. */
export const applyAccent = (element: HTMLElement, stored: string | null | undefined): void => {
  const attributes = accentAttributes(stored);
  const inputs = ["--accent-base", "--accent-on-light", "--accent-text-light", "--accent-fill-dark", "--accent-on-dark", "--accent-text-dark", "--sidebar-dark-bg"];
  inputs.forEach((name) => element.style.removeProperty(name));

  if (attributes["data-accent"]) {
    element.setAttribute("data-accent", attributes["data-accent"]);
    return;
  }
  element.removeAttribute("data-accent");
  Object.entries(attributes.style ?? {}).forEach(([name, value]) => element.style.setProperty(name, value));
};
