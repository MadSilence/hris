export type CompanyAppearanceDTO = {
  brandColor: string | null;
  loginImageUrl: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
};

/** Null clears a field back to the shipped default. The login image has its own endpoints. */
export type UpdateCompanyAppearanceRequest = {
  brandColor: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
};
