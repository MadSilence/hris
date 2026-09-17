/** Where the company's setup stands. Mirrors `CompanySetupDTO` on the backend. */
export type CompanySetupStatus = "NOT_STARTED" | "RUNNING" | "COMPLETED" | "FAILED";

export type CompanySetupDataset = "SAMPLE" | "DEFAULT" | "EMPTY";

export type CompanySizeBand = "UNDER_10" | "TEN_TO_50" | "FIFTY_TO_200" | "OVER_200";

export type CompanySetupDTO = {
  status: CompanySetupStatus;
  industry: string | null;
  sizeBand: CompanySizeBand | null;
  countryCode: string | null;
  dataset: CompanySetupDataset;
  seededPeople: number;
  /** What is being built right now; null unless RUNNING. */
  step: string | null;
  /** Why it stopped; null unless FAILED. */
  errorDetail: string | null;
  completedAt: string | null;
};

export type CompanySetupSubmitRequest = {
  industry: string | null;
  sizeBand: CompanySizeBand | null;
  countryCode: string | null;
  dataset: CompanySetupDataset;
};

/** A country the setup can offer, with what choosing it would set. */
export type SetupCountryDTO = {
  code: string;
  name: string;
  timezone: string;
  weekStartDay: string;
};
