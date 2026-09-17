/**
 * What a company's login page shows before anybody signs in. Every field is nullable, and null means
 * the shipped default. An address no company holds reads exactly like a company that configured nothing.
 */
export type PublicCompanyAppearance = {
  brandColor: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  /** Absolute, and present only when the company put its image on the login page. */
  loginImageUrl: string | null;
};

export const DEFAULT_PUBLIC_COMPANY_APPEARANCE: PublicCompanyAppearance = {
  brandColor: null,
  loginHeadline: null,
  loginSubheadline: null,
  loginImageUrl: null,
};
