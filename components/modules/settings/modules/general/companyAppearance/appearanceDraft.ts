import { DEFAULT_ACCENT, isAccentPreset, isHexColor, resolveAccent } from "@/lib/theme/accent";
import type { CompanyAppearance, CompanyBackground } from "@/models/company/CompanyAppearance";

/*
 * The pure half of the Appearance page (sign-in-appearance): what a typed colour code means, when two accents are the
 * same choice, and when auto-Light offers itself. No React here, so each rule is tested on its own.
 */

/** A typed colour code, "#2f63c4" or "2F63C4", as the stored lowercase `#rrggbb`; null when it is not one. */
export const parseColorCode = (typed: string): string | null => {
  const trimmed = typed.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9a-f]{6}$/i.test(withHash) ? withHash.toLowerCase() : null;
};

/** One spelling per choice: a preset by its name, a custom colour as lowercase `#rrggbb`; nothing is Wine. */
export const accentKey = (accent: string | null | undefined): string => {
  const resolved = resolveAccent(accent);
  return resolved.kind === "preset" ? resolved.preset : resolved.hex.toLowerCase();
};

export const sameAccent = (a: string | null | undefined, b: string | null | undefined): boolean => accentKey(a) === accentKey(b);

/** What the save sends: Wine, the default, as nothing — as the page has always stored it. */
export const accentToSave = (accent: string | null): string | null => {
  const key = accentKey(accent);
  return key === DEFAULT_ACCENT ? null : key;
};

/** A custom colour (not one of the presets), lowercase; null for a preset. */
export const customOf = (accent: string | null | undefined): string | null =>
  accent && !isAccentPreset(accent.trim().toLowerCase()) && isHexColor(accent) ? accentKey(accent) : null;

/**
 * Auto-Light (sign-in-appearance § "Light"): a logo with two or three colours, in a company that has never chosen its
 * background, puts Light into the draft — saved only with Save. A background the company chose is never touched.
 */
export const autoLight = (appearance: Pick<CompanyAppearance, "backgroundChosen" | "logoColors" | "background">): boolean =>
  !appearance.backgroundChosen && appearance.logoColors.length >= 2 && appearance.background === "COLOR";

/** The background a draft opens with. */
export const startingBackground = (appearance: CompanyAppearance): CompanyBackground =>
  autoLight(appearance) ? "LIGHT" : appearance.background;

// ── HSV, for the picker's square and hue bar ──────────────────────────────────────────────────────────

export type Hsv = { h: number; s: number; v: number };

export const hexToHsv = (hex: string): Hsv => {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : d / max, v: max };
};

export const hsvToHex = ({ h, s, v }: Hsv): string => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return (
    "#" +
    [r, g, b]
      .map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
};

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
