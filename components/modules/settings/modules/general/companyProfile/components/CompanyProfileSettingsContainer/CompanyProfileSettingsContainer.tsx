"use client";

import React from "react";
import { CompanyProfileSettingsComponent } from "@/components/modules/settings/modules/general/companyProfile/components/CompanyProfileSettingsComponent";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import {
  useCompanySettings,
  useUpdateCompany,
  useUpdateCompanySettings,
} from "@/components/modules/settings/modules/general/companyProfile/hooks/useCompanySettings";
import type { UpdateCompanyRequest, UpdateCompanySettingsRequest } from "@/api/modules/company/dto/CompanyDTO";

export default function CompanyProfileSettingsContainer() {
  const { company, isLoading: companyLoading, refreshCompany } = useCompanyData();
  const { data: settings, isLoading: settingsLoading } = useCompanySettings();

  const updateCompany = useUpdateCompany();
  const updateSettings = useUpdateCompanySettings();

  const isLoading = companyLoading || settingsLoading;

  if (isLoading || !company || !settings) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6 py-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border border-brown-200 bg-brown-50" />
        ))}
      </div>
    );
  }

  const handleSaveProfile = async (body: UpdateCompanyRequest) => {
    await updateCompany.mutateAsync(body);
    await refreshCompany();
  };

  const handleSaveSettings = async (body: UpdateCompanySettingsRequest) => {
    await updateSettings.mutateAsync(body);
  };

  return (
    <CompanyProfileSettingsComponent
      company={company}
      settings={settings}
      onSaveProfile={handleSaveProfile}
      onSaveSettings={handleSaveSettings}
      savingProfile={updateCompany.isPending}
      savingSettings={updateSettings.isPending}
      profileError={updateCompany.error instanceof Error ? updateCompany.error.message : null}
      settingsError={updateSettings.error instanceof Error ? updateSettings.error.message : null}
    />
  );
}
