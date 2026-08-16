/**
 * The palette offered wherever a user picks a colour (attribute options, leave types).
 *
 * Muted, earth-toned to sit with the rest of the UI — the previous option palette was a separate
 * neon set, so the same product showed two unrelated colour languages depending on the page.
 * Kept in sync with the backend `ColorPalette` enum, which seeds demo option colours.
 */
export const PRESET_COLORS = [
  "#b08968",
  "#a8674f",
  "#c9a24b",
  "#6f8f6a",
  "#5b7fa6",
  "#9a6f9c",
  "#c07b7b",
  "#7c8590",
  "#8a9a5b",
  "#6f6f8f",
] as const;

export type PresetColor = typeof PRESET_COLORS[number];
