import type { CompanyBackground } from "@/models/company/CompanyAppearance";

export type CompanyAppearanceDTO = {
  accent: string | null;
  background: CompanyBackground;
  backgroundChosen: boolean;
  logoColors: string[] | null;
  /** 0 for a company whose appearance row has not been written yet. */
  version?: number;
};

/** `GET /public/company-appearance/{subdomain}` — read without a session; nothing but the login page. */
export type PublicCompanyAppearanceDTO = {
  accent: string | null;
  background: CompanyBackground | null;
  logoColors: string[] | null;
  logoUrl: string | null;
  /** The company's language code; null on an address no company holds. */
  language: string | null;
  /** The company's name; null on an address no company holds. */
  name: string | null;
};

/** Appearance's one Save. The logo is not in it: it is uploaded and removed at once, through the company logo. */
export type UpdateCompanyAppearanceRequest = {
  /** A preset's name or a custom `#rrggbb`; null clears it back to Wine. */
  accent: string | null;
  /** Sent only when it changed; a save that carries it marks the background as chosen. */
  background?: CompanyBackground;
  /** The version the form was opened with; a stale one is refused with E00409. */
  version?: number;
};
