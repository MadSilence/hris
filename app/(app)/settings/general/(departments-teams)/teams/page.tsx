"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";

import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import PageDescription from "@/components/ui/PageDescription/PageDescription";
import TeamsContainer from "@/components/modules/settings/modules/teams/TeamsContainer";
import { PageGate } from "@/components/auth/PageGate";

export default function TeamsPage() {
  const t = useTranslations("structure.teams");
  // The page owns the viewport height so the canvas can fill what is left instead of pushing the
  // whole page into a scroll.
  return (
    <div className="flex h-[calc(100dvh-6rem)] flex-col gap-5 px-10">
      <div className="flex-none space-y-3">
        <SettingsPageHeader title={t("page.title")} backHref="/settings" />

        <PageDescription className="text-body text-tertiary/90">
          {t("page.description")}
        </PageDescription>
      </div>

      <div className="min-h-0 flex-1">
        <PageGate resource="ORG.TEAM" action="VIEW">
          <Suspense fallback={null}>
            <TeamsContainer />
          </Suspense>
        </PageGate>
      </div>
    </div>
  );
}
