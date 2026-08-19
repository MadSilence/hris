"use client";

import React from "react";

import { CompanyAppearanceSettingsComponent } from "@/components/modules/settings/modules/general/companyAppearance/components/CompanyAppearanceSettingsComponent";
import {
  useCompanyAppearance,
  useDeleteLoginImage,
  useUpdateCompanyAppearance,
  useUploadLoginImage,
} from "@/components/modules/settings/modules/general/companyAppearance/hooks/useCompanyAppearance";
import type { UpdateCompanyAppearanceRequest } from "@/api/modules/company/modules/appearance/dto";

const errorMessageOf = (error: unknown) => (error instanceof Error ? error.message : null);

export default function CompanyAppearanceSettingsContainer() {
  const { data: appearance, isLoading, error } = useCompanyAppearance();

  const updateAppearance = useUpdateCompanyAppearance();
  const uploadLoginImage = useUploadLoginImage();
  const deleteLoginImage = useDeleteLoginImage();

  if (isLoading || (!appearance && !error)) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-xl border border-brown-200 bg-brown-50"
          />
        ))}
      </div>
    );
  }

  if (!appearance) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-6">
        <p className="text-sm text-destructive">
          {errorMessageOf(error) ?? "Failed to load appearance settings."}
        </p>
      </div>
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
