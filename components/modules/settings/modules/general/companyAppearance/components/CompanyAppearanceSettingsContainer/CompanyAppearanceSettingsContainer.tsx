"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { AppearanceIntro, AppearancePage } from "@/components/modules/settings/modules/general/companyAppearance/components/AppearancePage";
import { STAGE_TABS, StageRings } from "@/components/modules/settings/modules/general/companyAppearance/components/AppearanceStage";
import { useAppFrame } from "@/components/layout/AppFrame";
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
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { companyHost } from "@/lib/companyAddress";
import { showError } from "@/lib/errors/errorToast";
import { ErrorState } from "@/components/feedback/ErrorState";

const bar = "shimmer rounded-pill bg-mist";

/** A step's label while loading: the number's circle and a bar. */
function StepBar({ width }: { width: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-6 shimmer rounded-pill bg-mist" />
      <span className={`h-3.5 ${width} ${bar}`} />
    </div>
  );
}

/**
 * Loading (L6-Loading): the real back button, heading and lead at once; skeletons shaped like the page — the step labels,
 * the drop zone, the ten rings on the 5-column grid, a full-width bar for the background — and the stage with its three
 * tab pills and one window, Mist with shimmer.
 */
export function AppearanceLoading({ companyName }: { companyName: string }) {
  const t = useTranslations("settings.appearance.stage");
  return (
    <div className="appearance-page" aria-busy="true">
      <div className="appearance-column">
        <div className="appearance-steps overflow-hidden">
          <AppearanceIntro companyName={companyName} />
          <div className="flex flex-col gap-3.5">
            <StepBar width="w-28" />
            <div className="h-[90px] shimmer rounded-card bg-mist" />
          </div>
          <div className="flex flex-col gap-3.5">
            <StepBar width="w-32" />
            <div className="appearance-rings">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="flex flex-col items-center gap-2">
                  <span className="size-11 shimmer rounded-pill bg-mist" />
                  <span className={`h-2.5 w-10 ${bar}`} />
                </span>
              ))}
            </div>
          </div>
          <div className="h-9 w-full shimmer rounded-pill bg-mist" />
        </div>
      </div>
      <section aria-label={t("region")} className="appearance-stage flex flex-col">
        <StageRings />
        <div className="relative flex gap-1.5 px-10 pt-7">
          {STAGE_TABS.map((key) => (
            <span key={key} className="appearance-stage-tab inline-flex items-center text-tertiary">{t(`tabs.${key}`)}</span>
          ))}
        </div>
        <div className="relative flex flex-1 items-center justify-center px-10 py-8">
          <div className="h-[402px] w-[604px] max-w-full shimmer rounded-tint bg-card" />
        </div>
      </section>
    </div>
  );
}

export default function CompanyAppearanceSettingsContainer() {
  const t = useTranslations("settings.appearance");
  const { data: appearance, isLoading, error, refetch } = useCompanyAppearance();
  const { company } = useCompanyData();
  const { user } = useCurrentUser();
  const web = useAppDataContext().envConfig?.web;
  const canEdit = useCanAccess("SETTINGS.GENERAL", "EDIT");
  const canChangeLogo = useCanAccess("SETTINGS.GENERAL", "MANAGE");

  const update = useUpdateCompanyAppearance();
  const upload = useUploadCompanyLogo();
  const remove = useDeleteCompanyLogo();
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [refused, setRefused] = React.useState(false);
  // The page runs edge to edge under the banners: the stage to the window's right and bottom (AP2).
  useAppFrame("full");

  if (isLoading || (!appearance && !error)) return <AppearanceLoading companyName={company?.name ?? ""} />;

  if (!appearance) {
    return (
      <div className="p-(--page-padding)">
        <ErrorState error={error} title={t("loadFailed.title")} message={t("loadFailed.body")} onRetry={() => void refetch()} />
      </div>
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
      viewerName={user?.firstName ?? undefined}
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
