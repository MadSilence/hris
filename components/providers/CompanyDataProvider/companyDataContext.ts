"use client";

import { createContext, useContext } from "react";
import type { Company } from "@/models/company/Company";

/**
 * The app-shell company's context, apart from `CompanyDataProvider` so `lib/date` can read it without importing the
 * provider: the date order and the first day of the week are read in every component that formats a date, and a test
 * that mocks the provider must not take the formatter down with it.
 */
export type CompanyDataContextValue = {
  company: Company | undefined;
  companyId: string | undefined;

  error: unknown;
  isLoading: boolean;
  isValidating: boolean;

  refreshCompany: () => Promise<Company | undefined>;
  clearCompanyCache: () => void;
};

export const CompanyDataContext = createContext<CompanyDataContextValue | null>(null);

/**
 * The company, or null outside the provider — for the date formatter's hooks in `lib/date`, which also run on pages
 * with no company (a guest's signing page) and there fall back to the defaults.
 */
export function useOptionalCompanyData(): CompanyDataContextValue | null {
  return useContext(CompanyDataContext);
}
