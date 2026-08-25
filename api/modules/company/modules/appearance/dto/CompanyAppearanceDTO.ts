export type CompanyAppearanceDTO = {
  brandColor: string | null;
  loginImageUrl: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  /** Optional: a backend older than V23 does not send the placement flags at all. */
  useImageOnLogin?: boolean;
  useImageOnDashboard?: boolean;
  sidebarContrast?: boolean;
};

/** Null clears a field back to the shipped default. The login image has its own endpoints. */
export type UpdateCompanyAppearanceRequest = {
  brandColor: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  useImageOnLogin: boolean;
  useImageOnDashboard: boolean;
  sidebarContrast: boolean;
};
