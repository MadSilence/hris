/**
 * A company's visual identity. Every field is nullable and null means "use the shipped default":
 * the brown palette, no login splash, the app's own login wording.
 *
 * `brandColor` is a seed, not a palette — the ten-step scale the app actually paints with is derived
 * from it by `lib/theme/brandPalette.ts`.
 */
export type CompanyAppearance = {
  brandColor: string | null;
  loginImageUrl: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
};
