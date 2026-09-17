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
  /** Whether the uploaded image backs the login screen. Off until someone places it there. */
  useImageOnLogin: boolean;
  /** Whether the same image also backs the in-app dashboard. */
  useImageOnDashboard: boolean;
  /** True paints the sidebar in the brand colour instead of leaving it neutral. */
  sidebarContrast: boolean;
  /** Sent back by the appearance form. 0 while the company has no appearance row yet. */
  version?: number;
};
