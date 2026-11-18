"use client";

import React, { useContext } from "react";
import useSWR from "swr";
import type { Company } from "@/models/company/Company";
import { CompanyDataContext } from "./companyDataContext";

const fetcher = async <T, >(url: string): Promise<T> => {
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
};

const CompanyDataProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: company,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Company>("/api/company", fetcher, {
    dedupingInterval: 0,
    revalidateOnFocus: false,
  });

  const refreshCompany = async () => {
    return mutate();
  };

  const clearCompanyCache = () => {
    mutate(undefined, false);
  };

  return (
    <CompanyDataContext.Provider
      value={{
        company,
        companyId: company?.id,

        error,
        isLoading,
        isValidating,

        refreshCompany,
        clearCompanyCache,
      }}
    >
      {children}
    </CompanyDataContext.Provider>
  );
};

export function useCompanyData() {
  const context = useContext(CompanyDataContext);

  if (!context) {
    throw new Error("useCompanyData must be used inside CompanyDataProvider");
  }

  return context;
}

export default CompanyDataProvider;
