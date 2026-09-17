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
      <div className="grid h-[calc(100svh-6rem)] grid-cols-2 gap-16 px-12">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-full animate-pulse rounded-xl bg-brown-50"/>
        ))}
      </div>
    );
  }

  // Both hand back what was saved, so the form holds the version the save produced for its next save.
  const handleSaveProfile = async (body: UpdateCompanyRequest) => {
    const saved = await updateCompany.mutateAsync(body);
    await refreshCompany();
    return saved;
  };

  const handleSaveSettings = async (body: UpdateCompanySettingsRequest) => {
    return updateSettings.mutateAsync(body);
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
