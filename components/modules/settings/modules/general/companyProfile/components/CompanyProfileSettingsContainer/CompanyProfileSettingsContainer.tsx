"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const isLoading = companyLoading || settingsLoading;

  if (isLoading || !company || !settings) {
    return (
      <div className="grid h-[calc(100svh-6rem)] grid-cols-2 gap-16 px-12">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-full shimmer rounded-popover bg-subtle"/>
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
    const saved = await updateSettings.mutateAsync(body);
    // The language is decided on the server for the whole page (i18n/resolveLocale): a new one needs the
    // server components and the catalogue rendered again, which a client-side cache update cannot do.
    if (body.language && body.language !== settings.language) router.refresh();
    return saved;
  };

  return (
    <CompanyProfileSettingsComponent
      company={company}
      settings={settings}
      onSaveProfile={handleSaveProfile}
      onSaveSettings={handleSaveSettings}
      onLogoChanged={refreshCompany}
      savingProfile={updateCompany.isPending}
      savingSettings={updateSettings.isPending}
      profileError={updateCompany.error instanceof Error ? updateCompany.error.message : null}
      settingsError={updateSettings.error instanceof Error ? updateSettings.error.message : null}
    />
  );
}
