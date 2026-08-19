/**
 * Seed colours offered on the Appearance page. Only the seed is stored — the ten-step scale and the
 * re-hued greys are generated from it, so a preset is one hex, not a palette.
 *
 * A null value means "no brand colour": the app keeps the brown it ships with.
 */
export type BrandPreset = {
  id: string;
  label: string;
  color: string | null;
};

export const BRAND_PRESETS: BrandPreset[] = [
  { id: "default", label: "Default", color: null },
  { id: "indigo", label: "Indigo", color: "#4f46e5" },
  { id: "blue", label: "Blue", color: "#2563eb" },
  { id: "teal", label: "Teal", color: "#0d9488" },
  { id: "green", label: "Green", color: "#16a34a" },
  { id: "amber", label: "Amber", color: "#d97706" },
  { id: "rose", label: "Rose", color: "#e11d48" },
  { id: "violet", label: "Violet", color: "#7c3aed" },
  { id: "slate", label: "Slate", color: "#475569" },
];

/** The shipped brown, shown as the Default swatch. Not stored — null is. */
export const DEFAULT_BRAND_SWATCH = "#7a5a54";
