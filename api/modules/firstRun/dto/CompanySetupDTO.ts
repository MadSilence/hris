/** Where the company's setup stands. Mirrors `CompanySetupDTO` on the backend. */
export type CompanySetupStatus = "NOT_STARTED" | "RUNNING" | "COMPLETED" | "FAILED";

export type CompanySetupDataset = "SAMPLE" | "EMPTY";

export type CompanySizeBand = "UNDER_10" | "TEN_TO_50" | "FIFTY_TO_200" | "OVER_200";

export type CompanySetupDTO = {
  status: CompanySetupStatus;
  industry: string | null;
  sizeBand: CompanySizeBand | null;
  countryCode: string | null;
  dataset: CompanySetupDataset;
  /** The example people asked for while it runs; the people the company has once it completed. */
  seededPeople: number;
  /** What is being built right now (RUNNING), or the step it stopped on (FAILED); else null. */
  step: string | null;
  /** The same as a code — a `CompanySetupStep` name; absent from a backend that predates it. */
  stepCode?: string | null;
  /** Why it stopped; null unless FAILED. */
  errorDetail: string | null;
  completedAt: string | null;
};

export type CompanySetupSubmitRequest = {
  industry: string | null;
  sizeBand: CompanySizeBand | null;
  countryCode: string | null;
  dataset: CompanySetupDataset;
  /** A `Language` code; the application speaks it to the company from the first screen after setup. */
  language: string | null;
  /** How many example people — one of the slider's stops (8, 25, 60, 150); required with SAMPLE. */
  peopleCount: number | null;
};

/** A country the setup can offer, with what choosing it would set. */
export type SetupCountryDTO = {
  code: string;
  name: string;
  timezone: string;
  weekStartDay: string;
};
