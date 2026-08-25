"use client";

import React from "react";

import { CompanyAppearanceSettingsComponent } from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsComponent";
import {
  useCompanyAppearance,
  useDeleteLoginImage,
  useUpdateCompanyAppearance,
  useUploadLoginImage,
} from "@/components/modules/settings/modules/general/companyAppearance/hooks/useCompanyAppearance";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";

const errorMessageOf = (error: unknown) => (error instanceof Error ? error.message : null);

export default function CompanyAppearanceSettingsContainer() {
  const { data: appearance, isLoading, error } = useCompanyAppearance();
  const { company } = useCompanyData();

  const updateAppearance = useUpdateCompanyAppearance();
  const uploadLoginImage = useUploadLoginImage();
  const deleteLoginImage = useDeleteLoginImage();

  if (isLoading || (!appearance && !error)) {
    return (
      <div className="grid h-[calc(100svh-6rem)] grid-cols-2 gap-10 px-12">
        <div className="h-full animate-pulse rounded-xl bg-brown-50"/>
        <div className="h-full animate-pulse rounded-xl bg-brown-50"/>
      </div>
    );
  }

  if (!appearance) {
    return (
      <p className="text-sm text-destructive">
        {errorMessageOf(error) ?? "Failed to load appearance settings."}
      </p>
    );
  }

  const handleSave = async (body: UpdateCompanyAppearanceRequest) => {
    await updateAppearance.mutateAsync(body);
  };

  const handleUpload = async (file: File) => {
    await uploadLoginImage.mutateAsync(file);
  };

  const handleRemove = async () => {
    await deleteLoginImage.mutateAsync();
  };

  return (
    <CompanyAppearanceSettingsComponent
      // Remounts the form when the saved state changes, so its draft restarts from the new baseline.
      key={`${appearance.brandColor ?? "default"}|${appearance.loginImageUrl ?? ""}`}
      appearance={appearance}
      companyName={company?.name}
      onSave={handleSave}
      onUploadLoginImage={handleUpload}
      onRemoveLoginImage={handleRemove}
      saving={updateAppearance.isPending}
      uploadingImage={uploadLoginImage.isPending}
      removingImage={deleteLoginImage.isPending}
      saveError={errorMessageOf(updateAppearance.error)}
      imageError={errorMessageOf(uploadLoginImage.error) ?? errorMessageOf(deleteLoginImage.error)}
    />
  );
}
