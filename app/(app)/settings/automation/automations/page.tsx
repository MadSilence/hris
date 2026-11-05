"use client";

import React from "react";
import { useTranslations } from "next-intl";
import SettingsPageHeader from "@/components/layout/SettingsPageHeader/SettingsPageHeader";
import { PageGate } from "@/components/auth/PageGate";
import { PageDescription } from "@/components/ui/PageDescription/PageDescription";
import { AutomationsListContainer } from "@/components/modules/automations/list/AutomationsListContainer";

const AutomationsSettingsPage: React.FC = () => {
  const t = useTranslations("automations");
  return (
    <PageGate resource="SETTINGS.AUTOMATIONS" action="VIEW">
      <div className="flex h-[calc(100svh-6rem)] flex-col gap-6 overflow-hidden">
        <div className="shrink-0 space-y-2 px-8">
          <SettingsPageHeader title={t("listPage.title")} backHref="/settings"/>
          <PageDescription className="text-body text-tertiary/90">
            {t("listPage.description")}
          </PageDescription>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-8">
          <AutomationsListContainer/>
        </div>
      </div>
    </PageGate>
  );
};

export default AutomationsSettingsPage;
