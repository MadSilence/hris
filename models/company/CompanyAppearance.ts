/**
 * What sits behind the company's logo where outsiders look (sign-in-appearance § "Light"): its colour, or Light —
 * Gray 50 with Gray 200 rings on the login pane and the email band. It is also the default of Home's own top.
 */
export type CompanyBackground = "COLOR" | "LIGHT";

/**
 * A company's visual identity (sign-in-appearance): its colour and its background. The logo is the company's own
 * (`company.companyLogo`), uploaded on the same page; the colours taken from it arrive here.
 *
 * `accent` is a preset's name or a custom `#rrggbb` (`lib/theme/accent.ts` derives every accent role from it); null
 * is Wine. It is the only colour a company chooses; everything else is noddo's.
 */
export type CompanyAppearance = {
  accent: string | null;
  background: CompanyBackground;
  /** Whether a save ever carried the background: auto-Light offers itself only while it has not. */
  backgroundChosen: boolean;
  /** Up to three `#rrggbb` taken from the logo on upload, most covered first; empty without a logo. */
  logoColors: string[];
  /** Sent back by the appearance form. 0 while the company has no appearance row yet. */
  version?: number;
};
