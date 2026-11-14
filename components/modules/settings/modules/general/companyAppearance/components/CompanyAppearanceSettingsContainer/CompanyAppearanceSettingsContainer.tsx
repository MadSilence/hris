"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { AppearancePage } from "@/components/modules/settings/modules/general/companyAppearance/components/AppearancePage";
import { acceptableLogo } from "@/components/modules/settings/modules/general/companyAppearance/components/LogoDropZone";
import {
  isRefusedFile,
  useCompanyAppearance,
  useDeleteCompanyLogo,
  useUpdateCompanyAppearance,
  useUploadCompanyLogo,
} from "@/components/modules/settings/modules/general/companyAppearance/hooks/useCompanyAppearance";
import { useCompanyData } from "@/components/providers/CompanyDataProvider/CompanyDataProvider";
import { useAppDataContext } from "@/components/providers/AppDataProvider";
import { useCanAccess } from "@/components/auth/useAccess";
import { companyHost } from "@/lib/companyAddress";
import { showError } from "@/lib/errors/errorToast";
import { ErrorState } from "@/components/feedback/ErrorState";

/** Loading (L6): skeletons with shimmer — the column, the ring grid, the stage window. */
function AppearanceLoading() {
  return (
    <div className="flex h-[calc(100svh-6rem)] gap-14 pl-12" aria-busy="true">
      <div className="flex w-[420px] shrink-0 flex-col gap-8 pt-14">
        <div className="h-24 shimmer rounded-card bg-subtle" />
        <div className="h-24 shimmer rounded-card bg-subtle" />
        <div className="h-40 shimmer rounded-card bg-subtle" />
      </div>
      <div className="appearance-stage flex-1 shimmer" />
    </div>
  );
}

export default function CompanyAppearanceSettingsContainer() {
  const t = useTranslations("settings.appearance");
  const { data: appearance, isLoading, error, refetch } = useCompanyAppearance();
  const { company } = useCompanyData();
  const web = useAppDataContext().envConfig?.web;
  const canEdit = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const canChangeLogo = useCanAccess("SETTINGS.GENERAL", "MANAGE");

  const update = useUpdateCompanyAppearance();
  const upload = useUploadCompanyLogo();
  const remove = useDeleteCompanyLogo();
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [refused, setRefused] = React.useState(false);

  if (isLoading || (!appearance && !error)) return <AppearanceLoading />;

  if (!appearance) {
    return (
      <ErrorState error={error} title={t("loadFailed.title")} message={t("loadFailed.body")} onRetry={() => void refetch()} />
    );
  }

  const companyName = company?.name ?? "";
  const subdomain = company?.subdomain ?? "";

  const onUploadLogo = async (file: File) => {
    setRefused(false);
    if (!acceptableLogo(file)) {
      setRefused(true);
      throw new Error("refused");
    }
    setUploading(file.name);
    try {
      await upload.mutateAsync(file);
    } catch (failure) {
      if (isRefusedFile(failure)) setRefused(true);
      else showError(failure);
      throw failure;
    } finally {
      setUploading(null);
    }
  };

  const onRemoveLogo = async () => {
    setRefused(false);
    try {
      await remove.mutateAsync();
    } catch (failure) {
      showError(failure);
      throw failure;
    }
  };

  return (
    <AppearancePage
      appearance={appearance}
      companyName={companyName}
      logoUrl={company?.companyLogo ?? null}
      address={web && subdomain ? companyHost(subdomain, web) : subdomain}
      canEdit={canEdit}
      canChangeLogo={canChangeLogo}
      onSave={(body) => update.mutateAsync(body)}
      saving={update.isPending}
      saveError={update.error}
      onUploadLogo={onUploadLogo}
      onRemoveLogo={onRemoveLogo}
      uploadingLogo={uploading}
      logoRefused={refused}
    />
  );
}
