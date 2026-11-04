export type CompanyAppearanceDTO = {
  accent: string | null;
  loginImageUrl: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  /** Optional: a backend older than V23 does not send the placement flags at all. */
  useImageOnLogin?: boolean;
  useImageOnDashboard?: boolean;
  /** 0 for a company whose appearance row has not been written yet. */
  version?: number;
};

/** `GET /public/company-appearance/{subdomain}` — read without a session; nothing but the login page. */
export type PublicCompanyAppearanceDTO = {
  accent: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  loginImageUrl: string | null;
  logoUrl: string | null;
};

/** Null clears a field back to the shipped default. The login image has its own endpoints. */
export type UpdateCompanyAppearanceRequest = {
  /** A preset's name or a custom `#rrggbb`; null clears it back to Wine. */
  accent: string | null;
  loginHeadline: string | null;
  loginSubheadline: string | null;
  useImageOnLogin: boolean;
  useImageOnDashboard: boolean;
  /** The version the form was opened with; a stale one is refused with E00409. */
  version?: number;
};
