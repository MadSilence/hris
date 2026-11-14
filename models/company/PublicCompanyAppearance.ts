import type { CompanyBackground } from "@/models/company/CompanyAppearance";

/**
 * What a company's login page shows before anybody signs in. The nullable fields mean the shipped default when
 * null. An address no company holds reads exactly like a company that configured nothing.
 */
export type PublicCompanyAppearance = {
  /** A preset's name or a custom `#rrggbb`; null is Wine. */
  accent: string | null;
  /** The login pane in the company's colour, or Light (Gray 50 with Gray 200 rings). */
  background: CompanyBackground;
  /** The logo's colours, for the nodding rings on a Light pane when there are several. */
  logoColors: string[];
  /** The company's logo, which heads its login screens (SPEC § 2). Absolute; null when none was uploaded. */
  logoUrl: string | null;
  /** The company's language, so its sign-in page speaks it; null on an address no company holds. */
  language: string | null;
  /** The company's name, for the login's pane and the root's remembered-company tile; null on an unknown address. */
  name: string | null;
};

export const DEFAULT_PUBLIC_COMPANY_APPEARANCE: PublicCompanyAppearance = {
  accent: null,
  background: "COLOR",
  logoColors: [],
  logoUrl: null,
  language: null,
  name: null,
};
