export type CompanyDTO = {
  id: string;
  name: string;
  subdomain: string;
  companyLogo: string | null;
  description: string | null;
  website: string | null;
};

export type CompanySettingsDTO = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
};

export type UpdateCompanyRequest = {
  name: string;
  description: string | null;
  website: string | null;
};

export type UpdateCompanySettingsRequest = {
  timezone: string;
  workingDays: string[];
  weekStartDay: string;
};
