/**
 * A company's visual identity. Every field is nullable and null means "use the shipped default":
 * the Wine accent, no login splash, the app's own login wording.
 *
 * `accent` is a preset's name or a custom `#rrggbb` (`lib/theme/accent.ts` derives every accent role
 * from it). It is the only colour a company chooses; everything else is noddo's.
 */
export type CompanyAppearance = {
  accent: string | null;
  loginImageUrl: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  /** Whether the uploaded image backs the login screen. Off until someone places it there. */
  useImageOnLogin: boolean;
  /** Whether the same image also backs the in-app dashboard. */
  useImageOnDashboard: boolean;
  /** Sent back by the appearance form. 0 while the company has no appearance row yet. */
  version?: number;
};
